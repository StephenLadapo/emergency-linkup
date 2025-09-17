import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  full_name: string;
  student_id?: string;
  phone_number?: string;
  faculty?: string;
  year_of_study?: string;
  address?: string;
  emergency_contacts: any[];
  medical_info: any;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  last_activity: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
}

export interface TwoFactorCode {
  id: string;
  user_id: string;
  code: string;
  type: 'email' | 'sms';
  expires_at: string;
  used: boolean;
  created_at: string;
}

// Session timeout in minutes
export const SESSION_TIMEOUT_MINUTES = 10;

// Generate a random 6-digit code for 2FA
export const generateTwoFactorCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create or update user profile
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null;
    }
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
};

// Create a new session
export const createSession = async (userId: string): Promise<UserSession> => {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_TIMEOUT_MINUTES);

  const sessionData = {
    user_id: userId,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
    last_activity: new Date().toISOString(),
    ip_address: await getClientIP(),
    user_agent: navigator.userAgent,
    is_active: true
  };

  const { data, error } = await supabase
    .from('user_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  // Store session token in localStorage for session management
  localStorage.setItem('session_token', sessionToken);
  localStorage.setItem('session_expires', expiresAt.toISOString());

  return data;
};

// Update session activity
export const updateSessionActivity = async (sessionToken: string) => {
  const { error } = await supabase
    .from('user_sessions')
    .update({
      last_activity: new Date().toISOString()
    })
    .eq('session_token', sessionToken)
    .eq('is_active', true);

  if (error) {
    console.error('Error updating session activity:', error);
  }
};

// Check if session is valid
export const isSessionValid = async (sessionToken: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('expires_at, is_active')
    .eq('session_token', sessionToken)
    .single();

  if (error || !data) {
    return false;
  }

  const now = new Date();
  const expiresAt = new Date(data.expires_at);

  return data.is_active && expiresAt > now;
};

// Invalidate session (logout)
export const invalidateSession = async (sessionToken: string) => {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('session_token', sessionToken);

  if (error) {
    console.error('Error invalidating session:', error);
  }

  // Clear local storage
  localStorage.removeItem('session_token');
  localStorage.removeItem('session_expires');
};

// Generate and send 2FA code
export const generateAndSend2FACode = async (userId: string, type: 'email' | 'sms' = 'email'): Promise<string> => {
  const code = generateTwoFactorCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

  // Store the code in database
  const { error } = await supabase
    .from('two_factor_codes')
    .insert({
      user_id: userId,
      code,
      type,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    console.error('Error storing 2FA code:', error);
    throw error;
  }

  // In a real app, you would send the code via email/SMS here
  // For demo purposes, we'll show it in a toast
  if (type === 'email') {
    toast.info(`2FA Code sent to your email: ${code}`, { duration: 10000 });
  }

  return code;
};

// Verify 2FA code
export const verify2FACode = async (userId: string, code: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('two_factor_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return false;
  }

  // Mark code as used
  await supabase
    .from('two_factor_codes')
    .update({ used: true })
    .eq('id', data.id);

  return true;
};

// Enable 2FA for user
export const enable2FA = async (userId: string) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ two_factor_enabled: true })
    .eq('id', userId);

  if (error) {
    console.error('Error enabling 2FA:', error);
    throw error;
  }
};

// Disable 2FA for user
export const disable2FA = async (userId: string) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ two_factor_enabled: false })
    .eq('id', userId);

  if (error) {
    console.error('Error disabling 2FA:', error);
    throw error;
  }
};

// Get client IP address (simplified)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
};

// Clean up expired sessions and codes
export const cleanupExpiredData = async () => {
  try {
    // Clean up expired sessions
    await supabase.rpc('cleanup_expired_sessions');
    
    // Clean up expired 2FA codes
    await supabase.rpc('cleanup_expired_2fa_codes');
  } catch (error) {
    console.error('Error cleaning up expired data:', error);
  }
};