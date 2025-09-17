/*
  # Security Features Database Schema

  1. New Tables
    - `user_profiles` - Extended user profile information with security settings
    - `user_sessions` - Track active user sessions for timeout management
    - `two_factor_codes` - Store 2FA verification codes
    - `security_logs` - Log security events for audit trail

  2. Security Features
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add session management functions
    - Add cleanup functions for expired data

  3. Functions
    - Session management and cleanup
    - Failed login attempt tracking
    - Security event logging
*/

-- Create user_profiles table with security settings
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
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
  session_timeout_minutes integer DEFAULT 10,
  last_login_at timestamptz,
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  last_activity timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create two_factor_codes table
CREATE TABLE IF NOT EXISTS two_factor_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_description text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
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

CREATE POLICY "Users can insert own security logs"
  ON security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$;

-- Function to cleanup expired 2FA codes
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM two_factor_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET 
    failed_login_attempts = 0,
    account_locked_until = NULL,
    last_login_at = now(),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_description text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_expires ON two_factor_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();