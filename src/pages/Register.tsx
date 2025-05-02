
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateConfirmationToken = (email: string): string => {
    // In a real app, this would use a secure method to generate tokens
    // For demonstration purposes, we're using a simple method
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomString}-${email.replace('@', '-at-')}`;
  };

  const sendConfirmationEmail = async (email: string, fullName: string): Promise<boolean> => {
    // In a real implementation, this would call a backend service
    console.log(`Sending confirmation email to ${email}`);
    
    try {
      // Generate a confirmation token
      const token = generateConfirmationToken(email);
      
      // Store the token and email in localStorage for demo purposes
      // In a real app, this would be stored in a database
      const pendingConfirmations = JSON.parse(localStorage.getItem('pendingConfirmations') || '{}');
      pendingConfirmations[token] = {
        email,
        fullName,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('pendingConfirmations', JSON.stringify(pendingConfirmations));
      
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we'll log the confirmation link
      const confirmationUrl = `/confirm-email?token=${token}`;
      console.log(`Confirmation link: ${window.location.origin}${confirmationUrl}`);
      
      // In production, use an email service API or backend function
      return true;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
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
          // Store the user data in temporary storage
          const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '{}');
          pendingUsers[email] = {
            name: fullName,
            email,
            studentNumber,
            password, // In a real app, never store plain text passwords!
            createdAt: new Date().toISOString(),
            isVerified: false
          };
          localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
          
          toast.success('Registration successful! Please check your email for a confirmation link.');
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
