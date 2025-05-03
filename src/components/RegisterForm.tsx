
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthForm from '@/components/AuthForm';
import Logo from '@/components/Logo';
import PasswordRequirements from '@/components/PasswordRequirements';
import { useRegistration, PASSWORD_REQUIREMENTS } from '@/hooks/useRegistration';

const RegisterForm = () => {
  const { loading, passwordError, handleRegister } = useRegistration();

  return (
    <div className="z-10 w-full max-w-md">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-amber-200 dark:border-amber-900/30">
        <div className="flex flex-col items-center space-y-2 text-center mb-8">
          <Logo className="mb-4" />
          <h1 className="text-3xl font-bold text-gradient-primary">Create an Account</h1>
          <p className="text-muted-foreground">
            Sign up to use the University of Limpopo Emergency System
          </p>
        </div>
        
        <PasswordRequirements requirements={PASSWORD_REQUIREMENTS} password="" />
        
        <AuthForm 
          mode="register" 
          onSubmit={handleRegister} 
          showConfirmPassword={true} 
          passwordRequirements={PASSWORD_REQUIREMENTS} 
        />
        
        {passwordError && (
          <p className="mt-2 text-sm text-red-600">{passwordError}</p>
        )}
        
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
  );
};

export default RegisterForm;
