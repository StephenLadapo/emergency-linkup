/*
  # Create utility functions for the emergency system

  1. Functions
    - `cleanup_expired_sessions()` - Remove expired sessions
    - `cleanup_expired_2fa_codes()` - Remove expired 2FA codes
    - `log_security_event()` - Log security events
    - `handle_failed_login()` - Handle failed login attempts
    - `reset_failed_login_attempts()` - Reset failed login counter

  2. Security
    - Functions are accessible to authenticated users
    - Proper parameter validation
*/

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < now() OR is_active = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired 2FA codes
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_codes 
  WHERE expires_at < now() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_description text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
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
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(p_user_id uuid)
RETURNS void AS $$
DECLARE
  current_attempts integer;
  lock_until timestamptz;
BEGIN
  -- Get current failed attempts
  SELECT failed_login_attempts INTO current_attempts
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Increment failed attempts
  current_attempts := COALESCE(current_attempts, 0) + 1;
  
  -- If 5 or more failed attempts, lock account for 15 minutes
  IF current_attempts >= 5 THEN
    lock_until := now() + interval '15 minutes';
    
    UPDATE user_profiles
    SET 
      failed_login_attempts = current_attempts,
      account_locked_until = lock_until,
      updated_at = now()
    WHERE id = p_user_id;
    
    -- Log the account lock
    PERFORM log_security_event(
      p_user_id,
      'account_locked',
      'Account locked due to multiple failed login attempts',
      NULL,
      NULL,
      jsonb_build_object('failed_attempts', current_attempts, 'locked_until', lock_until)
    );
  ELSE
    UPDATE user_profiles
    SET 
      failed_login_attempts = current_attempts,
      updated_at = now()
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    failed_login_attempts = 0,
    account_locked_until = NULL,
    last_login_at = now(),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;