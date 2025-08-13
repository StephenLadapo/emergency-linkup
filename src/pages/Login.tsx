
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import ResendConfirmation from '@/components/ResendConfirmation';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('signup_disabled')) {
          toast.error('New signups are currently disabled.');
        } else {
          toast.error(error.message || 'Login failed. Please try again.');
        }
        return;
      }

      if (data.user) {
        console.log('Login successful for:', data.user.email);
        console.log('User confirmed:', data.user.email_confirmed_at);
        
        // Check if user email is confirmed
        if (!data.user.email_confirmed_at) {
          toast.error('Please check your email and click the confirmation link to activate your account.');
          return;
        }
        
        toast.success('Login successful!');
        navigate('/dashboard/profile');
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-amber-700/70 mix-blend-multiply"></div>
        <img 
          src="/lovable-uploads/4b755f41-3d7d-4087-8826-24bfe295eccc.png" 
          alt="University of Limpopo Campus" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-amber-200 dark:border-amber-900/30">
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <Logo className="mb-4" />
            <h1 className="text-3xl font-bold text-gradient-primary">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access the Emergency System
            </p>
          </div>
          
          <AuthForm mode="login" onSubmit={handleLogin} />
          
          <div className="mt-2 text-center">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
          
          <div className="mt-2 text-center">
            <button 
              type="button"
              onClick={() => setShowResendConfirmation(!showResendConfirmation)} 
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Need to resend confirmation email?
            </button>
          </div>
          
          {showResendConfirmation && (
            <div className="mt-4">
              <ResendConfirmation />
            </div>
          )}
          
          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="underline text-primary">
              Register here
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

export default Login;
