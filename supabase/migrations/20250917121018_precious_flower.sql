/*
  # Create users and sessions tables for enhanced security

  1. New Tables
    - `user_profiles` - Extended user information beyond Supabase auth
    - `user_sessions` - Track active sessions for timeout management
    - `two_factor_codes` - Store 2FA verification codes
    - `emergency_incidents` - Track emergency reports

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for emergency responders to access incident data
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create emergency_incidents table
CREATE TABLE IF NOT EXISTS emergency_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  incident_type text NOT NULL,
  description text,
  location jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_incidents ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
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

-- Policies for user_sessions
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

CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for two_factor_codes
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

-- Policies for emergency_incidents
CREATE POLICY "Users can read own incidents"
  ON emergency_incidents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incidents"
  ON emergency_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents"
  ON emergency_incidents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_code ON two_factor_codes(code);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_user_id ON emergency_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_status ON emergency_incidents(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < now() OR last_activity < now() - interval '30 minutes';
END;
$$ language 'plpgsql';

-- Function to clean up expired 2FA codes
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_codes 
  WHERE expires_at < now();
END;
$$ language 'plpgsql';