/*
  # Create users and sessions tables for enhanced security

  1. New Tables
    - `user_profiles` - Extended user information beyond Supabase auth
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `student_id` (text, unique)
      - `phone_number` (text)
      - `faculty` (text)
      - `year_of_study` (text)
      - `address` (text)
      - `emergency_contacts` (jsonb)
      - `medical_info` (jsonb)
      - `email_verified` (boolean)
      - `two_factor_enabled` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_sessions` - Track active sessions for timeout management
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_token` (text, unique)
      - `expires_at` (timestamp)
      - `last_activity` (timestamp)
      - `ip_address` (text)
      - `user_agent` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `two_factor_codes` - Store 2FA verification codes
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `code` (text)
      - `type` (text) - 'email' or 'sms'
      - `expires_at` (timestamp)
      - `used` (boolean)
      - `created_at` (timestamp)
    
    - `emergency_incidents` - Track emergency reports
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `incident_type` (text)
      - `description` (text)
      - `location` (jsonb)
      - `status` (text)
      - `priority` (text)
      - `created_at` (timestamp)
      - `resolved_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for emergency responders to access incident data
    - Add session management policies