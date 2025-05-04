import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import Logo from '@/components/Logo';
import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init("ZVJqFtna5EaBhHwj4");

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
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (!users[email]) {
        toast.error('No account found with this email address');
        setLoading(false);
        return;
      }

      // Generate reset token (simple version for demo)
      const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
      users[email].resetToken = resetToken;
      users[email].resetTokenExpires = Date.now() + 3600000; // 1 hour expiration
      localStorage.setItem('users', JSON.stringify(users));

      // Send password reset email using EmailJS
      await emailjs.send(
        "service_fprjlcl", // Your EmailJS service ID
        "template_Acoirqf", // Your EmailJS template ID
        {
          to_email: email,
          reset_link: `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
          user_name: users[email].name || 'User'
        }
      );

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-amber-700/70 mix-blend-multiply"></div>
        <img 
          src="/images/campus-bg.jpg" 
          alt="University of Limpopo Campus" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-amber-200 dark:border-amber-900/30">
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <Logo className="mb-4" />
            <h1 className="text-3xl font-bold text-gradient-primary">Forgot Password</h1>
            <p className="text-muted-foreground">
              Enter your university email to receive password reset instructions
            </p>
          </div>
          
          {!submitted ? (
            <>
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
                        className="pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="pt-6 pb-8 text-center space-y-4">
              <div className="mx-auto bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Check Your Email</h3>
              <p className="text-muted-foreground">
                We've sent reset instructions to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                The link in the email will expire in 1 hour
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, please check your spam folder
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="underline text-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
