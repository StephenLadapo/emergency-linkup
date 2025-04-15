
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (email: string, password: string, fullName?: string, studentNumber?: string) => void;
}

const AuthForm = ({ mode, onSubmit }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const validateUniversityEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@keyaka\.ul\.ac\.za$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUniversityEmail(email)) {
      toast.error('Please use your university email (@keyaka.ul.ac.za)');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      onSubmit(email, password, mode === 'register' ? fullName : undefined, mode === 'register' ? studentNumber : undefined);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <p className="text-xs text-muted-foreground">Must use @keyaka.ul.ac.za university email</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <Input 
          id="password"
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">Password must be at least 8 characters</p>
      </div>
      
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
