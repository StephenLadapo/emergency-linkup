/*
  # Create audio recordings table

  1. New Tables
    - `audio_recordings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `incident_id` (uuid, references emergency_incidents, optional)
      - `recording_name` (text)
      - `description` (text)
      - `file_url` (text, required)
      - `file_size_bytes` (bigint)
      - `duration_seconds` (decimal)
      - `recording_type` (text, 'emergency_pattern', 'incident_audio', 'voice_note')
      - `is_emergency_pattern` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `audio_recordings` table
    - Add policy for users to manage their own recordings
*/

CREATE TABLE IF NOT EXISTS audio_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  incident_id uuid REFERENCES emergency_incidents(id) ON DELETE SET NULL,
  recording_name text,
  description text,
  file_url text NOT NULL,
  file_size_bytes bigint,
  duration_seconds decimal,
  recording_type text DEFAULT 'voice_note' CHECK (recording_type IN ('emergency_pattern', 'incident_audio', 'voice_note')),
  is_emergency_pattern boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own audio recordings
CREATE POLICY "Users can manage own audio recordings"
  ON audio_recordings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_recordings_user_id ON audio_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_incident_id ON audio_recordings(incident_id);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_type ON audio_recordings(recording_type);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_emergency_pattern ON audio_recordings(is_emergency_pattern);