
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendConfirmationEmail = async (email: string, fullName: string) => {
    // In a real implementation, this would call a backend service
    console.log(`Sending confirmation email to ${email}`);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, use an email service API or backend function
    return true;
  };

  const handleRegister = async (email: string, password: string, fullName?: string, studentNumber?: string) => {
    setLoading(true);
    
    try {
      // In a real app, this would connect to an authentication service
      console.log('Registration with:', { email, fullName, studentNumber });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send confirmation email if name is provided
      if (fullName) {
        const emailSent = await sendConfirmationEmail(email, fullName);
        if (emailSent) {
          toast.success('Registration successful! Confirmation email has been sent.');
        } else {
          toast.warning('Registration successful, but confirmation email could not be sent.');
        }
      } else {
        toast.success('Registration successful! Please log in.');
      }
      
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ul-campus min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center py-12">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="container flex flex-col items-center justify-center z-10">
        <div className="flex flex-col items-center space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create an Account</h1>
          <p className="text-white/80">
            Sign up to use the University of Limpopo Emergency System
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <AuthForm mode="register" onSubmit={handleRegister} />
          
          <div className="mt-6 text-center text-sm text-white">
            Already have an account?{' '}
            <Link to="/login" className="underline text-amber-400 hover:text-amber-300">
              Login here
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/20">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
