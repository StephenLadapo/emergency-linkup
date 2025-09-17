/*
  # Create two-factor authentication codes table

  1. New Tables
    - `two_factor_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `code` (text, 6-digit code)
      - `type` (text, 'email' or 'sms')
      - `expires_at` (timestamptz)
      - `used` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `two_factor_codes` table
    - Add policy for users to access their own codes
*/

CREATE TABLE IF NOT EXISTS two_factor_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own 2FA codes
CREATE POLICY "Users can access own 2FA codes"
  ON two_factor_codes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_code ON two_factor_codes(code);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_expires_at ON two_factor_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_used ON two_factor_codes(used);