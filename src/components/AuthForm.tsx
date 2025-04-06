
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@keyaka.ul.ac.za')) {
      toast.error('Please use your university email (@keyaka.ul.ac.za)');
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
    <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white">{mode === 'login' ? 'Login' : 'Register'}</CardTitle>
        <CardDescription className="text-white/70">
          {mode === 'login' 
            ? 'Enter your credentials to access the emergency system.' 
            : 'Create an account using your university email.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name</Label>
                <Input 
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentNumber" className="text-white">Student Number</Label>
                <Input 
                  id="studentNumber"
                  type="text" 
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  required
                  className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">University Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="yourname@keyaka.ul.ac.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input 
              id="password"
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
