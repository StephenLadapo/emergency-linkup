import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Mail, Smartphone, Clock } from 'lucide-react';
import { generateAndSend2FACode, verify2FACode, enable2FA } from '@/lib/auth';
import { send2FACode } from '@/lib/emailService';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  mode: 'setup' | 'verify';
}

const TwoFactorAuth = ({ isOpen, onClose, onSuccess, userId, mode }: TwoFactorAuthProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [codeType, setCodeType] = useState<'email' | 'sms'>('email');
  const [step, setStep] = useState<'send' | 'verify'>('send');

  useEffect(() => {
    if (isOpen && mode === 'verify') {
      setStep('send');
    }
  }, [isOpen, mode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (step === 'verify' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      toast.error('Verification code expired. Please request a new one.');
      setStep('send');
      setTimeLeft(600);
    }

    return () => clearTimeout(timer);
  }, [step, timeLeft]);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const code = await generateAndSend2FACode(userId, codeType);
      
      // Send actual email if email type is selected
      if (codeType === 'email') {
        try {
          // Get user info for email
          const { data: user } = await supabase.auth.getUser();
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', userId)
            .single();
          
          if (user.user?.email && profile?.full_name) {
            await send2FACode(user.user.email, profile.full_name, code);
          }
        } catch (emailError) {
          console.error('Error sending 2FA email:', emailError);
          // Don't fail the process if email fails
        }
      }
      
      setStep('verify');
      setTimeLeft(600); // Reset timer
      toast.success(`Verification code sent to your ${codeType === 'email' ? 'email' : 'phone'}`);
    } catch (error) {
      console.error('Error sending 2FA code:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verify2FACode(userId, code);
      
      if (isValid) {
        if (mode === 'setup') {
          await enable2FA(userId);
          const { logSecurityEvent } = await import('@/lib/auth');
          await logSecurityEvent(userId, '2fa_enabled', 'Two-factor authentication enabled');
          toast.success('Two-factor authentication enabled successfully!');
        } else {
          const { logSecurityEvent } = await import('@/lib/auth');
          await logSecurityEvent(userId, '2fa_verified', 'Two-factor authentication verified');
          toast.success('Code verified successfully!');
        }
        onSuccess();
        onClose();
      } else {
        const { logSecurityEvent } = await import('@/lib/auth');
        await logSecurityEvent(userId, '2fa_failed', 'Two-factor authentication failed');
        toast.error('Invalid or expired code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setCode('');
    setStep('send');
    setTimeLeft(600);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {mode === 'setup' ? 'Setup Two-Factor Authentication' : 'Two-Factor Verification'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'send' ? (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {mode === 'setup' 
                    ? 'Choose how you want to receive your verification codes:'
                    : 'We need to verify your identity. Choose how to receive your code:'
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={codeType === 'email' ? 'default' : 'outline'}
                  onClick={() => setCodeType('email')}
                  className="flex flex-col h-20 gap-2"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button
                  variant={codeType === 'sms' ? 'default' : 'outline'}
                  onClick={() => setCodeType('sms')}
                  className="flex flex-col h-20 gap-2"
                  disabled
                  title="SMS verification coming soon"
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="text-xs">SMS (Soon)</span>
                </Button>
              </div>

              <Button 
                onClick={handleSendCode} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : `Send Code via ${codeType === 'email' ? 'Email' : 'SMS'}`}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to your {codeType === 'email' ? 'email' : 'phone'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Expires in {formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('send');
                    setCode('');
                  }}
                  className="flex-1"
                >
                  Resend Code
                </Button>
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={loading || code.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuth;