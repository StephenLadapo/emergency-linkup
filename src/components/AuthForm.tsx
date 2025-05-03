
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface PasswordRequirement {
  check: (password: string) => boolean;
  text: string;
}

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (email: string, password: string, fullName?: string, studentNumber?: string, confirmPassword?: string) => void;
  showConfirmPassword?: boolean;
  passwordRequirements?: PasswordRequirement[];
  onPasswordChange?: (password: string) => void;
}

const AuthForm = ({ 
  mode, 
  onSubmit, 
  showConfirmPassword = false, 
  passwordRequirements = [],
  onPasswordChange
}: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (onPasswordChange) {
      onPasswordChange(newPassword);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@keyaka.ul.ac.za')) {
      toast.error('Please use your university email (@keyaka.ul.ac.za)');
      return;
    }
    
    if (showConfirmPassword && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      onSubmit(
        email, 
        password, 
        mode === 'register' ? fullName : undefined, 
        mode === 'register' ? studentNumber : undefined,
        showConfirmPassword ? confirmPassword : undefined
      );
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
            <Input 
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentNumber" className="text-foreground">Student Number</Label>
            <Input 
              id="studentNumber"
              type="text" 
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
              required
            />
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">University Email</Label>
        <Input 
          id="email"
          type="email" 
          placeholder="yourname@keyaka.ul.ac.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Input 
            id="password"
            type={showPassword ? "text" : "password"}
            value={password} 
            onChange={handlePasswordChange}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30 pr-10"
            required
          />
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {showConfirmPassword && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30 pr-10"
              required
            />
          </div>
          {password !== confirmPassword && confirmPassword !== "" && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>
      )}
      
      <Button 
        type="submit"
        className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" 
        disabled={loading}
      >
        {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
      </Button>
    </form>
  );
};

export default AuthForm;
