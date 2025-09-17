import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createSession, getUserProfile, createUserProfile, UserProfile } from '@/lib/auth';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session timeout
  useSessionTimeout(10); // 10 minutes timeout

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Create session in database
          try {
            await createSession(session.user.id);
            
            // Load or create user profile
            let profile = await getUserProfile(session.user.id);
            if (!profile) {
              // Create profile if it doesn't exist
              profile = await createUserProfile(session.user.id, {
                full_name: session.user.user_metadata?.full_name || '',
                student_id: session.user.user_metadata?.student_id || '',
                email_verified: session.user.email_confirmed_at ? true : false
              });
            }
            setUserProfile(profile);
          } catch (error) {
            console.error('Error setting up user session/profile:', error);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Invalidate session in database
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
      try {
        const { invalidateSession } = await import('@/lib/auth');
        await invalidateSession(sessionToken);
      } catch (error) {
        console.error('Error invalidating session:', error);
      }
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    setUserProfile(data);
    return data;
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};