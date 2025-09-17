import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import TwoFactorAuth from '@/components/TwoFactorAuth';
import { getUserProfile, isAccountLocked, handleFailedLogin, handleSuccessfulLogin, logSecurityEvent } from '@/lib/auth';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle failed login if we have a user ID
        // Try to find user by email for failed login tracking
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
            .single();
          
          if (profileData?.id) {
            await handleFailedLogin(profileData.id);
          }
        } catch (profileError) {
          console.error('Error tracking failed login:', profileError);
        }
        throw error;
      }

      if (data.user) {
        // Check if account is locked
        const locked = await isAccountLocked(data.user.id);
        if (locked) {
          await supabase.auth.signOut();
          await logSecurityEvent(data.user.id, 'login_blocked', 'Login attempt on locked account');
          throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.');
        }

        // Handle successful login
        await handleSuccessfulLogin(data.user.id);
        
        // Check if user has 2FA enabled
        const profile = await getUserProfile(data.user.id);
        
        if (profile?.two_factor_enabled) {
          setPendingUserId(data.user.id);
          setShow2FA(true);
          await logSecurityEvent(data.user.id, '2fa_required', 'Two-factor authentication required');
          toast.info('Please complete two-factor authentication');
        } else {
          await logSecurityEvent(data.user.id, 'login_success', 'User logged in successfully');
          toast.success('Login successful!');
          navigate('/dashboard/profile');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Account is temporarily locked')) {
        toast.error(error.message);
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Please verify your email address before logging in. Check your inbox for the verification link.', {
          duration: 8000
        });
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials and try again.', {
          duration: 6000
        });
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.', {
          duration: 6000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = () => {
    setShow2FA(false);
    setPendingUserId(null);
    if (pendingUserId) {
      logSecurityEvent(pendingUserId, '2fa_success', 'Two-factor authentication completed');
    }
    toast.success('Login successful! Welcome to the Emergency System.', {
      duration: 5000
    });
    navigate('/dashboard/profile');
  };

  const handle2FAClose = () => {
    setShow2FA(false);
    if (pendingUserId) {
      logSecurityEvent(pendingUserId, '2fa_cancelled', 'Two-factor authentication cancelled');
    }
    setPendingUserId(null);
    // Sign out the user since 2FA was not completed
    supabase.auth.signOut();
    toast.info('Login cancelled. Two-factor authentication is required.', {
      duration: 5000
    });
  };

  return (
    <>
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-amber-700/70 mix-blend-multiply"></div>
          <img 
            src="/lovable-uploads/4b755f41-3d7d-4087-8826-24bfe295eccc.png" 
            alt="University of Limpopo Campus" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="z-10 w-full max-w-md">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-amber-200 dark:border-amber-900/30">
            <div className="flex flex-col items-center space-y-2 text-center mb-8">
              <Logo className="mb-4" />
              <h1 className="text-3xl font-bold text-gradient-primary">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to access the Emergency System
              </p>
            </div>
            
            <AuthForm mode="login" onSubmit={handleLogin} />
            
            <div className="mt-2 text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
            
            <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="underline text-primary">
                Register here
              </Link>
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="outline" asChild className="border-amber-500 text-amber-700 hover:bg-amber-50">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two-Factor Authentication Modal */}
      {show2FA && pendingUserId && (
        <TwoFactorAuth
          isOpen={show2FA}
          onClose={handle2FAClose}
          onSuccess={handle2FASuccess}
          userId={pendingUserId}
          mode="verify"
        />
      )}
    </>
  );
};

export default Login;