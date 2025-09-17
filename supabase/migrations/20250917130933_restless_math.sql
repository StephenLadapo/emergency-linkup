/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text, required)
      - `student_id` (text, unique)
      - `phone_number` (text)
      - `faculty` (text)
      - `year_of_study` (text)
      - `address` (text)
      - `emergency_contacts` (jsonb array)
      - `medical_info` (jsonb object)
      - `email_verified` (boolean, default false)
      - `two_factor_enabled` (boolean, default false)
      - `screenshot_protection` (boolean, default true)
      - `session_timeout_minutes` (integer, default 10)
      - `last_login_at` (timestamptz)
      - `failed_login_attempts` (integer, default 0)
      - `account_locked_until` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read/update their own profile
    - Add policy for authenticated users to read basic profile info
*/

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

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own profile
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for reading basic profile info (for emergency contacts, etc.)
CREATE POLICY "Users can read basic profile info"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_student_id ON user_profiles(student_id);

-- Create index on email_verified for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);

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