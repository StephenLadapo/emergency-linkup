
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
    
    try {
      // Login user with database
      const response = await loginUser(email, password);
      
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
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-12 bg-cover bg-center"
      style={{ backgroundImage: "url('/lovable-uploads/86b185de-b530-40c7-a4cc-e02de30ff0ea.png')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <div className="z-10 flex flex-col items-center space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-white/90">
          Sign in to access the University of Limpopo Emergency System
        </p>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="glass-card p-6 rounded-lg">
          <AuthForm mode="login" onSubmit={handleLogin} />
          
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
