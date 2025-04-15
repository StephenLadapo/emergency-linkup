
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { dbService } from '@/services/databaseService';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendConfirmationEmail = async (email: string, fullName: string) => {
    // This is a placeholder for sending a confirmation email
    console.log(`Sending confirmation email to ${email}`);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, use an email service API or backend function
    return true;
  };

  const handleRegister = async (email: string, password: string, fullName?: string, studentNumber?: string) => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!fullName || !studentNumber) {
        throw new Error('Missing required fields');
      }
      
      // Register user in database
      const userData = {
        fullName,
        email,
        studentNumber
      };
      
      await dbService.registerUser(userData, password);
      
      // Send confirmation email
      const emailSent = await sendConfirmationEmail(email, fullName);
      
      if (emailSent) {
        toast.success('Registration successful! Confirmation email has been sent.');
      } else {
        toast.warning('Registration successful, but confirmation email could not be sent.');
      }
      
      // Store basic user info in localStorage (for now)
      localStorage.setItem('user', JSON.stringify({
        name: fullName,
        email,
        photoUrl: '',
      }));
      
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-amber-700/70 mix-blend-multiply"></div>
        <img 
          src="/lovable-uploads/5035b3d6-0fe7-4ccd-b109-16bb678bdc51.png" 
          alt="University of Limpopo Campus" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-amber-200 dark:border-amber-900/30">
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <Logo className="mb-4" />
            <h1 className="text-3xl font-bold text-gradient-primary">Create an Account</h1>
            <p className="text-muted-foreground">
              Sign up to use the University of Limpopo Emergency System
            </p>
          </div>
          
          <AuthForm mode="register" onSubmit={handleRegister} />
          
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="underline text-primary">
              Login here
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" asChild className="border-amber-500 text-amber-700 hover:bg-amber-50">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
