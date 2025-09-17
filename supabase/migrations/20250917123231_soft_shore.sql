/*
  # Enhanced Security Features

  1. New Tables
    - `user_sessions` - Track user sessions with timeout functionality
    - `two_factor_codes` - Store 2FA verification codes
    - `security_logs` - Log security events and activities
    - Enhanced `user_profiles` with security fields

  2. Security Features
    - Session timeout management
    - Two-factor authentication
    - Email verification tracking
    - Security event logging
    - Screenshot protection settings

  3. Functions
    - Cleanup expired sessions and codes
    - Session validation
    - Security event logging
*/

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  last_activity timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

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

-- Create indexes for 2FA codes
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_code ON two_factor_codes(code);

-- Create security_logs table for audit trail
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_description text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create index for security logs
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- Add security fields to user_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'screenshot_protection'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN screenshot_protection boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'session_timeout_minutes'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN session_timeout_minutes integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_login_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'failed_login_attempts'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN failed_login_attempts integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'account_locked_until'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN account_locked_until timestamptz;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_sessions
CREATE POLICY "Users can insert own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for two_factor_codes
CREATE POLICY "Users can insert own 2FA codes"
  ON two_factor_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own 2FA codes"
  ON two_factor_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA codes"
  ON two_factor_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for security_logs
CREATE POLICY "Users can read own security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert security logs"
  ON security_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

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
  
  DELETE FROM user_sessions 
  WHERE expires_at < now() - interval '7 days';
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

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_description text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
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

-- Function to validate session
CREATE OR REPLACE FUNCTION validate_session(p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record user_sessions%ROWTYPE;
BEGIN
  SELECT * INTO session_record
  FROM user_sessions
  WHERE session_token = p_session_token
    AND is_active = true
    AND expires_at > now();
  
  IF FOUND THEN
    -- Update last activity
    UPDATE user_sessions
    SET last_activity = now()
    WHERE session_token = p_session_token;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
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
  -- Increment failed attempts
  UPDATE user_profiles
  SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1
  WHERE id = p_user_id
  RETURNING failed_login_attempts INTO current_attempts;
  
  -- Lock account if too many failed attempts (5 attempts = 15 minute lock)
  IF current_attempts >= 5 THEN
    UPDATE user_profiles
    SET account_locked_until = now() + interval '15 minutes'
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- Function to reset failed login attempts on successful login
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
    last_login_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Create a trigger to automatically cleanup expired data daily
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only run cleanup once per day
  IF random() < 0.01 THEN -- 1% chance on each insert
    PERFORM cleanup_expired_sessions();
    PERFORM cleanup_expired_2fa_codes();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_sessions to occasionally cleanup
DROP TRIGGER IF EXISTS cleanup_expired_data_trigger ON user_sessions;
CREATE TRIGGER cleanup_expired_data_trigger
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_expired_data();