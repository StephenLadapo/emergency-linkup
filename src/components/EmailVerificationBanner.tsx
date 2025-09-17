import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const EmailVerificationBanner = () => {
  const { user, userProfile } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if user is logged in but email is not verified
    if (user && !user.email_confirmed_at && userProfile && !userProfile.email_verified) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, userProfile]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/profile`
        }
      });

      if (error) throw error;

      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to prevent showing again this session
    localStorage.setItem('email_verification_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-amber-800 dark:text-amber-200">
            Please verify your email address
          </span>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Check your inbox for a verification link to secure your account.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            {isResending ? 'Sending...' : 'Resend'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-700"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;