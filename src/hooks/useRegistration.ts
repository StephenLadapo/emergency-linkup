
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import emailjs from 'emailjs-com';
import { v4 as uuidv4 } from 'uuid';

// Password requirements constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = [
  { check: (p: string) => p.length >= PASSWORD_MIN_LENGTH, text: "At least 8 characters" },
  { check: (p: string) => /[A-Z]/.test(p), text: "At least one uppercase letter" },
  { check: (p: string) => /[a-z]/.test(p), text: "At least one lowercase letter" },
  { check: (p: string) => /[0-9]/.test(p), text: "At least one number" },
  { check: (p: string) => /[^A-Za-z0-9]/.test(p), text: "At least one special character" }
];

// EmailJS configuration
const EMAILJS_SERVICE_ID = "service_fprjlcl";
const EMAILJS_TEMPLATE_ID = "template_gu18aiq";
const EMAILJS_USER_ID = "ZVJqFtna5EaBhHwj4";

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

  const sendConfirmationEmail = async (email: string, fullName: string, token: string) => {
    try {
      const confirmationLink = `${window.location.origin}/confirm-email?token=${token}`;
      
      const templateParams = {
        to_name: fullName,
        to_email: email,
        confirmation_link: confirmationLink,
        from_name: "University of Limpopo Emergency System"
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );

      console.log("Confirmation email sent to:", email);
      return true;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      return false;
    }
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
      // Generate confirmation token (UUID)
      const confirmationToken = uuidv4();
      
      // Store pending user in localStorage
      const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '{}');
      pendingUsers[email] = {
        name: fullName,
        email,
        studentNumber,
        password, // In a real app, this should be hashed
        createdAt: new Date().toISOString(),
        isVerified: false,
        medicalInfo: {
          bloodType: '',
          allergies: '',
          conditions: '',
          medications: ''
        },
        emergencyContacts: []
      };
      localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
      
      // Store confirmation token
      const pendingConfirmations = JSON.parse(localStorage.getItem('pendingConfirmations') || '{}');
      pendingConfirmations[confirmationToken] = {
        email,
        fullName,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('pendingConfirmations', JSON.stringify(pendingConfirmations));
      
      // Send confirmation email
      const emailSent = await sendConfirmationEmail(email, fullName || '', confirmationToken);
      
      if (emailSent) {
        toast.success('Registration successful! Please check your email to verify your account.');
      } else {
        toast.warning('Account created but we could not send verification email. Please try to login and request a new verification email.');
      }
      
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
