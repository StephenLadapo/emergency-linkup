import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { registerUser, sendConfirmationEmail } from '@/services/api';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (email: string, password: string, fullName?: string, studentNumber?: string) => {
    setLoading(true);
    
    try {
      if (!fullName || !studentNumber) {
        throw new Error('Full name and student number are required');
      }
      
      // Register user with database
      await registerUser(email, password, fullName, studentNumber);
      
      // Send confirmation email
      const emailSent = await sendConfirmationEmail(email, fullName);
      
      if (emailSent) {
        toast.success('Registration successful! Confirmation email has been sent.');
      } else {
        toast.warning('Registration successful, but confirmation email could not be sent.');
      }
      
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="flex flex-col items-center space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground">
          Sign up to use the University of Limpopo Emergency System
        </p>
      </div>
      
      <div className="w-full max-w-md">
        <AuthForm mode="register" onSubmit={handleRegister} />
        
        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="underline text-primary">
            Login here
          </Link>
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
