import { useEffect, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { updateSessionActivity, isSessionValid, invalidateSession, logSecurityEvent } from '@/lib/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useSessionTimeout = (
  timeoutMinutes: number = 10,
  user: User | null,
  signOut: () => Promise<void>
) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (!user) return;

    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) return;

    // Update last activity
    lastActivityRef.current = Date.now();
    updateSessionActivity(sessionToken).catch(console.error);

    // Set warning timeout (2 minutes before logout) - only if timeout is more than 2 minutes
    if (timeoutMinutes > 2) {
    warningRef.current = setTimeout(() => {
        toast.warning(`Your session will expire in 2 minutes due to inactivity`, {
          duration: 15000,
          position: 'top-center',
        action: {
          label: 'Stay logged in',
          onClick: () => resetTimeout()
        }
      });
      }, Math.max(0, (timeoutMinutes - 2) * 60 * 1000));
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        try {
          await invalidateSession(sessionToken);
          await logSecurityEvent(user.id, 'session_timeout', 'Session expired due to inactivity');
        } catch (error) {
          console.error('Error during session timeout:', error);
        }
      }
      
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
      
      toast.error('Session expired due to inactivity. Please log in again.', {
        duration: 8000,
        position: 'top-center'
      });
      navigate('/login');
    }, timeoutMinutes * 60 * 1000);
  }, [user, timeoutMinutes, signOut, navigate]);

  const checkSessionValidity = useCallback(async () => {
    if (!user) return;

    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      await signOut();
      navigate('/login');
      return;
    }

    const isValid = await isSessionValid(sessionToken);
    if (!isValid) {
      try {
        await logSecurityEvent(user.id, 'session_invalid', 'Invalid session detected');
        await signOut();
      } catch (error) {
        console.error('Error during session validation:', error);
      }
      
      toast.error('Your session has expired. Please log in again.', {
        duration: 8000,
        position: 'top-center'
      });
      navigate('/login');
    }
  }, [user, signOut, navigate]);

  useEffect(() => {
    if (!user) return;

    // Check session validity on mount
    checkSessionValidity();

    // Reset timeout on mount
    resetTimeout();

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only reset if more than 1 minute has passed since last activity to reduce server calls
      if (now - lastActivityRef.current > 60000) {
        resetTimeout();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check session validity every 2 minutes
    const validityInterval = setInterval(checkSessionValidity, 2 * 60 * 1000);

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      clearInterval(validityInterval);
    };
  }, [user, resetTimeout, checkSessionValidity]);

  return { resetTimeout };
};