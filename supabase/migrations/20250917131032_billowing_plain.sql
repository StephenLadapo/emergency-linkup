/*
  # Create emergency messages table

  1. New Tables
    - `emergency_messages`
      - `id` (uuid, primary key)
      - `incident_id` (uuid, references emergency_incidents)
      - `sender_type` (text, 'student', 'responder', 'system')
      - `sender_id` (uuid, references user_profiles for students)
      - `message_text` (text, required)
      - `message_type` (text, 'text', 'audio', 'image')
      - `attachment_url` (text)
      - `read_at` (timestamptz)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `emergency_messages` table
    - Add policy for incident participants to read messages
    - Add policy for users to send messages in their incidents
*/

CREATE TABLE IF NOT EXISTS emergency_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES emergency_incidents(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('student', 'responder', 'system')),
  sender_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  message_text text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image')),
  attachment_url text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to read messages in their incidents
CREATE POLICY "Users can read messages in own incidents"
  ON emergency_messages
  FOR SELECT
  TO authenticated
  USING (
    incident_id IN (
      SELECT id FROM emergency_incidents WHERE user_id = auth.uid()
    )
  );

-- Policy for users to send messages in their incidents
CREATE POLICY "Users can send messages in own incidents"
  ON emergency_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    incident_id IN (
      SELECT id FROM emergency_incidents WHERE user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_messages_incident_id ON emergency_messages(incident_id);
CREATE INDEX IF NOT EXISTS idx_emergency_messages_sender_id ON emergency_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_emergency_messages_created_at ON emergency_messages(created_at);