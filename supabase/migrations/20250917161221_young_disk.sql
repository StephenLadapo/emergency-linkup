/*
  # Create user profiles and security tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `student_id` (text, unique)
      - `phone_number` (text)
      - `faculty` (text)
      - `year_of_study` (text)
      - `address` (text)
      - `emergency_contacts` (jsonb)
      - `medical_info` (jsonb)
      - `email_verified` (boolean, default false)
      - `two_factor_enabled` (boolean, default false)
      - `screenshot_protection` (boolean, default true)
      - `session_timeout_minutes` (integer, default 10)
      - `last_login_at` (timestamptz)
      - `failed_login_attempts` (integer, default 0)
      - `account_locked_until` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `session_token` (text, unique)
      - `expires_at` (timestamptz)
      - `last_activity` (timestamptz)
      - `ip_address` (text)
      - `user_agent` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())

    - `two_factor_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `code` (text)
      - `type` (text, 'email' or 'sms')
      - `expires_at` (timestamptz)
      - `used` (boolean, default false)
      - `created_at` (timestamptz, default now())

    - `security_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `event_type` (text)
      - `event_description` (text)
      - `ip_address` (text)
      - `user_agent` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for security logging

  3. Functions
    - Cleanup expired sessions and 2FA codes
    - Handle failed login attempts
    - Reset failed login attempts
    - Log security events
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  student_id text UNIQUE,
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

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
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
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
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

-- Create policies for user_profiles
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

-- Create policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for two_factor_codes
CREATE POLICY "Users can read own 2FA codes"
  ON two_factor_codes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own 2FA codes"
  ON two_factor_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own 2FA codes"
  ON two_factor_codes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for security_logs
CREATE POLICY "Users can read own security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert security logs"
  ON security_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_code ON two_factor_codes(code);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);

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
  WHERE expires_at < now();
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

-- Function to update user profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    full_name,
    student_id,
    email_verified,
    two_factor_enabled,
    screenshot_protection,
    session_timeout_minutes
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'student_id', ''),
    false,
    false,
    true,
    10
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();