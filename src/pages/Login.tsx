
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // In a real app, this would connect to an authentication service
      console.log('Login attempt with:', { email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      localStorage.setItem('user', JSON.stringify({
        name: 'Test Student',
        email,
        photoUrl: '',
      }));
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="flex flex-col items-center space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">
          Sign in to access the University of Limpopo Emergency System
        </p>
      </div>
      
      <div className="w-full max-w-md">
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
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
