
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Check if the user exists in our users storage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const user = users[email];
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user && user.password === password) {
        // Create a logged in user in localStorage
        localStorage.setItem('user', JSON.stringify({
          name: user.name,
          email,
          studentNumber: user.studentNumber
        }));
        
        toast.success('Login successful!');
        navigate('/dashboard/profile');
        return;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
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
              Sign in to access the University of Limpopo Emergency System
            </p>
          </div>
          
          <AuthForm mode="login" onSubmit={handleLogin} />
          
          <div className="mt-2 text-center">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
          
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
