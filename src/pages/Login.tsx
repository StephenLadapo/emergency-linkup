import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { loginUser } from '@/services/api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    console.log('Login attempt with:', { email });
    
    try {
      // Login user with database
      const response = await loginUser(email, password);
      console.log('Login response:', response);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        name: response.user.fullName,
        email: response.user.email,
        studentNumber: response.user.studentNumber,
        photoUrl: '',
      }));
      
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data?.message || 'Server error. Please try again.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection or if the server is running.');
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
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
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-white/90">
          Sign in to access the University of Limpopo Emergency System
        </p>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="glass-card p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <AuthForm mode="login" onSubmit={handleLogin} loading={loading} />
          
          <div className="mt-6 text-center text-sm text-white">
            Don't have an account?{' '}
            <Link to="/register" className="underline text-amber-400 font-medium">
              Register here
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

export default Login;
