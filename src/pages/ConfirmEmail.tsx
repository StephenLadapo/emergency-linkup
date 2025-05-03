
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';

const ConfirmEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      // Get the token from the URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setVerificationStatus('error');
        toast.error('Invalid verification link. No token provided.');
        return;
      }

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, this would validate the token against a database
        const pendingConfirmations = JSON.parse(localStorage.getItem('pendingConfirmations') || '{}');
        const confirmation = pendingConfirmations[token];

        if (!confirmation) {
          setVerificationStatus('error');
          toast.error('Invalid or expired confirmation link.');
          return;
        }

        // Check if the token is expired (24 hours)
        const createdAt = new Date(confirmation.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          setVerificationStatus('error');
          toast.error('Confirmation link has expired. Please register again.');
          return;
        }

        // Set the email for display
        setEmail(confirmation.email);

        // Update the user as verified
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '{}');
        if (pendingUsers[confirmation.email]) {
          pendingUsers[confirmation.email].isVerified = true;
          localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
          
          console.log('User verified:', confirmation.email);
          console.log('Updated pendingUsers:', pendingUsers);
        }

        // Remove the token
        delete pendingConfirmations[token];
        localStorage.setItem('pendingConfirmations', JSON.stringify(pendingConfirmations));

        setVerificationStatus('success');
        toast.success('Email verified successfully!');
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        toast.error('Email verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [location.search]);

  const handleContinue = () => {
    navigate('/login');
  };

  const handleResendConfirmation = () => {
    navigate('/register');
    toast.info('Please register again to receive a new confirmation email.');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
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
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <Logo className="mb-4" />
            <h1 className="text-3xl font-bold text-gradient-primary">Email Verification</h1>
          </div>
          
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-center">
                {verificationStatus === 'verifying' && 'Verifying Your Email'}
                {verificationStatus === 'success' && 'Email Verified!'}
                {verificationStatus === 'error' && 'Verification Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
              {verificationStatus === 'verifying' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-16 w-16 rounded-full border-4 border-t-amber-500 border-amber-200 animate-spin"></div>
                  <p className="text-muted-foreground">Please wait while we verify your email address...</p>
                </div>
              )}
              
              {verificationStatus === 'success' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium">Your email has been verified successfully</p>
                    <p className="text-muted-foreground mt-1">
                      {email && `${email} is now verified.`}
                    </p>
                  </div>
                  <Button 
                    onClick={handleContinue} 
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  >
                    Continue to Login
                  </Button>
                </div>
              )}
              
              {verificationStatus === 'error' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium">Verification failed</p>
                    <p className="text-muted-foreground mt-1">
                      Your email verification link is invalid or has expired.
                    </p>
                  </div>
                  <Button 
                    onClick={handleResendConfirmation} 
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  >
                    Register Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <Button variant="outline" asChild className="border-amber-500 text-amber-700 hover:bg-amber-50">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
