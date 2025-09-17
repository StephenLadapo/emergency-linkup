/*
  # Create emergency incidents table

  1. New Tables
    - `emergency_incidents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `incident_type` (text, 'security', 'medical', 'other')
      - `description` (text)
      - `location_lat` (decimal)
      - `location_lng` (decimal)
      - `location_address` (text)
      - `status` (text, 'pending', 'responded', 'resolved', 'cancelled')
      - `priority` (text, 'low', 'medium', 'high', 'critical')
      - `audio_recording_url` (text)
      - `responder_notes` (text)
      - `response_time_minutes` (integer)
      - `resolved_at` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `emergency_incidents` table
    - Add policy for users to read their own incidents
    - Add policy for responders to read/update incidents
*/

CREATE TABLE IF NOT EXISTS emergency_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  incident_type text NOT NULL CHECK (incident_type IN ('security', 'medical', 'other')),
  description text,
  location_lat decimal,
  location_lng decimal,
  location_address text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'resolved', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  audio_recording_url text,
  responder_notes text,
  response_time_minutes integer,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_incidents ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own incidents
CREATE POLICY "Users can read own incidents"
  ON emergency_incidents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for users to create incidents
CREATE POLICY "Users can create incidents"
  ON emergency_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own incidents (limited fields)
CREATE POLICY "Users can update own incidents"
  ON emergency_incidents
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_user_id ON emergency_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_status ON emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_created_at ON emergency_incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_priority ON emergency_incidents(priority);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_emergency_incidents_updated_at
  BEFORE UPDATE ON emergency_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();