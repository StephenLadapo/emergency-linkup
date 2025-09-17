/*
  # Security and Session Management Tables

  1. New Tables
    - `user_profiles` - Extended user profile information with security settings
    - `user_sessions` - Active user sessions for timeout management
    - `two_factor_codes` - Two-factor authentication codes
    - `security_logs` - Security event logging

  2. Security Features
    - Session timeout management with configurable duration
    - Screenshot protection toggle per user
    - Two-factor authentication support
    - Security event logging for audit trails
    - Account lockout protection

  3. Row Level Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Secure session management
*/

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  student_id text,
  phone_number text,
  faculty text,
  year_of_study text,
  address text,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  medical_info jsonb DEFAULT '{}'::jsonb,
  email_verified boolean DEFAULT false,
  two_factor_enabled boolean DEFAULT false,
  screenshot_protection boolean DEFAULT true,
  session_timeout_minutes integer DEFAULT 10 CHECK (session_timeout_minutes >= 1 AND session_timeout_minutes <= 120),
  last_login_at timestamptz,
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_activity timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create two_factor_codes table for 2FA
CREATE TABLE IF NOT EXISTS two_factor_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create security_logs table for audit trail
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_description text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for two_factor_codes
CREATE POLICY "Users can read own 2FA codes"
  ON two_factor_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own 2FA codes"
  ON two_factor_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA codes"
  ON two_factor_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for security_logs
CREATE POLICY "Users can read own security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert security logs"
  ON security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow service to log events

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_code ON two_factor_codes(code);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_expires ON two_factor_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup expired 2FA codes
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_codes 
  WHERE expires_at < now() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(p_user_id uuid)
RETURNS void AS $$
DECLARE
  current_attempts integer;
BEGIN
  -- Get current failed attempts
  SELECT failed_login_attempts INTO current_attempts
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Increment failed attempts
  UPDATE user_profiles
  SET 
    failed_login_attempts = COALESCE(current_attempts, 0) + 1,
    account_locked_until = CASE 
      WHEN COALESCE(current_attempts, 0) + 1 >= 5 
      THEN now() + interval '15 minutes'
      ELSE account_locked_until
    END,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    failed_login_attempts = 0,
    account_locked_until = NULL,
    last_login_at = now(),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_description text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO security_logs (
    user_id,
    event_type,
    event_description,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_description,
    p_ip_address,
    p_user_agent,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check session validity
CREATE OR REPLACE FUNCTION is_session_valid(p_session_token text)
RETURNS boolean AS $$
DECLARE
  session_record user_sessions%ROWTYPE;
BEGIN
  SELECT * INTO session_record
  FROM user_sessions
  WHERE session_token = p_session_token
    AND is_active = true
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to extend session
CREATE OR REPLACE FUNCTION extend_session(
  p_session_token text,
  p_timeout_minutes integer DEFAULT 10
)
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET 
    expires_at = now() + (p_timeout_minutes || ' minutes')::interval,
    last_activity = now()
  WHERE session_token = p_session_token
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user profile if needed (for testing)
DO $$
BEGIN
  -- This will only run if there are no profiles yet
  IF NOT EXISTS (SELECT 1 FROM user_profiles LIMIT 1) THEN
    -- Note: In production, this should be handled by the application
    -- when users sign up through Supabase Auth
    NULL; -- Placeholder for potential default data
  END IF;
END $$;