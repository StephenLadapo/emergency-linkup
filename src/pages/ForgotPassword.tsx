import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import emailjs from '@emailjs/browser';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeInput, setCodeInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith('@myturf.ul.ac.za')) {
      toast.error('Please use your university email (@myturf.ul.ac.za)');
      return;
    }

    setLoading(true);

    try {
      // Generate 5 different 6-digit codes and pick one randomly
      const codes = Array.from({ length: 5 }, () => Math.floor(100000 + Math.random() * 900000).toString());
      const selected = codes[Math.floor(Math.random() * codes.length)];
      setVerificationCode(selected);

      // Send verification code via EmailJS (IDs provided by you)
      const templateParams = {
        to_email: email,
        to_name: 'Student',
        message: `Your password reset verification code is ${selected}. It expires in 10 minutes.`,
        verification_code: selected,
      } as Record<string, any>;

      await emailjs.send(
        'service_nxrtqmg',
        'template_ul3y2jg',
        templateParams,
        'HKBvKEggaLSqOOTUt'
      );

      setCodeSent(true);
      toast.success('Verification code sent to your email');
    } catch (error) {
      console.error('EmailJS send error:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    if (!verificationCode || codeInput.trim() !== verificationCode) {
      toast.error('Incorrect verification code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Verified! Password reset link sent to your email');

      // Optional: notify user via EmailJS that a reset link has been sent
      try {
        await emailjs.send(
          'service_nxrtqmg',
          'template_ul3y2jg',
          {
            to_email: email,
            to_name: 'Student',
            message: 'Your verification was successful. A password reset link has been sent to your university email.',
          },
          'HKBvKEggaLSqOOTUt'
        );
      } catch (notifyErr) {
        console.warn('Optional notification email failed:', notifyErr);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-amber-700/70 mix-blend-multiply"></div>
        <img 
          src="/lovable-uploads/5035b3d6-0fe7-4ccd-b109-16bb678bdc51.png" 
          alt="University of Limpopo Campus" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-amber-200 dark:border-amber-900/30">
          {/* Header */}
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <Logo className="mb-4" />
            <h1 className="text-3xl font-bold text-gradient-primary">Forgot Password</h1>
            <p className="text-muted-foreground">
              Enter your university email to receive password reset instructions
            </p>
          </div>

          {/* Content */}
          {!submitted ? (
            !codeSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">University Email</Label>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="yourstudentnumber@myturf.ul.ac.za"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Enter Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
                    required
                  />
                </div>
                <Button 
                  onClick={handleVerifyAndReset}
                  className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  disabled={loading || codeInput.length < 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Send Reset Link'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  A 6-digit code was sent to <span className="font-medium">{email}</span>.
                </p>
              </div>
            )
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
                If you don't see the email, please check your spam folder
              </p>
            </div>
          )}

          {/* Footer */}
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
