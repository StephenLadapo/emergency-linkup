import { useEffect, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { updateSessionActivity, isSessionValid, invalidateSession } from '@/lib/auth';
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
    updateSessionActivity(sessionToken);

    // Set warning timeout (2 minutes before logout)
    warningRef.current = setTimeout(() => {
      toast.warning('Your session will expire in 2 minutes due to inactivity', {
        duration: 10000,
        action: {
          label: 'Stay logged in',
          onClick: () => resetTimeout()
        }
      });
    }, (timeoutMinutes - 2) * 60 * 1000);

    // Set logout timeout
    timeoutRef.current = setTimeout(async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        await invalidateSession(sessionToken);
      }
      
      await signOut();
      toast.error('Session expired due to inactivity. Please log in again.');
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
      await signOut();
      toast.error('Your session has expired. Please log in again.');
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
      // Only reset if more than 30 seconds have passed since last activity
      if (now - lastActivityRef.current > 30000) {
        resetTimeout();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check session validity every 5 minutes
    const validityInterval = setInterval(checkSessionValidity, 5 * 60 * 1000);

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