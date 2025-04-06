
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
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ul-campus min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center py-12">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="container flex flex-col items-center justify-center z-10">
        <div className="flex flex-col items-center space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/80">
            Sign in to access the University of Limpopo Emergency System
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <AuthForm mode="login" onSubmit={handleLogin} />
          
          <div className="mt-6 text-center text-sm text-white">
            Don't have an account?{' '}
            <Link to="/register" className="underline text-amber-400 hover:text-amber-300">
              Register here
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

export default Login;
