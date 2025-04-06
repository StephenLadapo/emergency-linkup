
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith('@keyaka.ul.ac.za')) {
      toast.error('Please use your university email (@keyaka.ul.ac.za)');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="flex flex-col items-center space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground">
          Enter your university email to receive password reset instructions
        </p>
      </div>
      
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              We'll send a reset link to your university email
            </CardDescription>
          </CardHeader>
          
          {!submitted ? (
            <>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">University Email</Label>
                    <div className="flex">
                      <div className="relative flex-grow">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email"
                          type="email" 
                          placeholder="yourname@keyaka.ul.ac.za"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send Reset Link'}
                </Button>
              </CardFooter>
            </>
          ) : (
            <CardContent className="pt-6 pb-8 text-center space-y-4">
              <div className="mx-auto bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Check Your Email</h3>
              <p className="text-muted-foreground">
                We've sent reset instructions to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, please check your spam folder
              </p>
            </CardContent>
          )}
        </Card>
        
        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="underline text-primary">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
