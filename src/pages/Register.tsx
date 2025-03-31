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
    console.log('Registration attempt with:', { email, fullName, studentNumber });
    
    try {
      if (!fullName || !studentNumber) {
        throw new Error('Full name and student number are required');
      }
      
      // Register user with database
      const registerResponse = await registerUser(email, password, fullName, studentNumber);
      console.log('Registration response:', registerResponse);
      
      // Send confirmation email
      const emailResponse = await sendConfirmationEmail(email, fullName);
      console.log('Email confirmation response:', emailResponse);
      
      if (emailResponse) {
        toast.success('Registration successful! Confirmation email has been sent.');
      } else {
        toast.warning('Registration successful, but confirmation email could not be sent.');
      }
      
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data?.message || 'Server error. Please try again.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection or if the server is running.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-12"
      style={{ 
        backgroundImage: `url('/lovable-uploads/967c8163-5646-46b6-86ff-822dce06a08a.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="z-10 flex flex-col items-center space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Create an Account</h1>
        <p className="text-white/90">
          Sign up to use the University of Limpopo Emergency System
        </p>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="glass-card p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <AuthForm mode="register" onSubmit={handleRegister} loading={loading} />
          
          <div className="mt-6 text-center text-sm text-white">
            Already have an account?{' '}
            <Link to="/login" className="underline text-amber-400 font-medium">
              Login here
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" asChild className="bg-white/90 hover:bg-white">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
