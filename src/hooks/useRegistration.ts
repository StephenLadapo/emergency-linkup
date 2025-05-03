
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Password requirements constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = [
  { check: (p: string) => p.length >= PASSWORD_MIN_LENGTH, text: "At least 8 characters" },
  { check: (p: string) => /[A-Z]/.test(p), text: "At least one uppercase letter" },
  { check: (p: string) => /[a-z]/.test(p), text: "At least one lowercase letter" },
  { check: (p: string) => /[0-9]/.test(p), text: "At least one number" },
  { check: (p: string) => /[^A-Za-z0-9]/.test(p), text: "At least one special character" }
];

export const useRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validatePassword = (password: string): boolean => {
    // Check if password meets all requirements
    const failedRequirements = PASSWORD_REQUIREMENTS.filter(req => !req.check(password));
    
    if (failedRequirements.length > 0) {
      setPasswordError(`Password does not meet requirements: ${failedRequirements.map(r => r.text).join(', ')}`);
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  const handleRegister = async (email: string, password: string, fullName?: string, studentNumber?: string, confirmPassword?: string) => {
    setLoading(true);
    
    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      toast.error('Password does not meet security requirements');
      setLoading(false);
      return;
    }
    
    // Check if email is from keyaka domain
    if (!email.endsWith('@keyaka.ul.ac.za')) {
      toast.error('Please use your University of Limpopo email address (@keyaka.ul.ac.za)');
      setLoading(false);
      return;
    }
    
    try {
      // Store user directly without verification step
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      users[email] = {
        name: fullName,
        email,
        studentNumber,
        password, // In a real app, this should be hashed
        createdAt: new Date().toISOString(),
        medicalInfo: {
          bloodType: '',
          allergies: '',
          conditions: '',
          medications: ''
        },
        emergencyContacts: []
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    passwordError, 
    handleRegister,
    validatePassword
  };
};
