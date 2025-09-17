import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Initialize database connection and run migrations
export const initializeDatabase = async () => {
  try {
    console.log('Testing database connection...');
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      toast.success('Database connected successfully!');
      console.log('EmergencyLinkUp database is ready');
      return true;
    } else {
      toast.error('Failed to connect to database');
      return false;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    toast.error('Database initialization failed');
    return false;
  }
};

// Emergency incident functions
export const createEmergencyIncident = async (incidentData: {
  incident_type: 'security' | 'medical' | 'other';
  description?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}) => {
  const { data, error } = await supabase
    .from('emergency_incidents')
    .insert(incidentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating emergency incident:', error);
    throw error;
  }

  return data;
};

export const getUserIncidents = async (userId: string) => {
  const { data, error } = await supabase
    .from('emergency_incidents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user incidents:', error);
    throw error;
  }

  return data;
};

// Emergency contacts functions
export const createEmergencyContact = async (contactData: {
  name: string;
  relationship: string;
  phone_number: string;
  email?: string;
  is_primary?: boolean;
}) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert(contactData)
    .select()
    .single();

  if (error) {
    console.error('Error creating emergency contact:', error);
    throw error;
  }

  return data;
};

export const getUserEmergencyContacts = async (userId: string) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });

  if (error) {
    console.error('Error fetching emergency contacts:', error);
    throw error;
  }

  return data;
};

// Audio recordings functions
export const saveAudioRecording = async (recordingData: {
  recording_name?: string;
  description?: string;
  file_url: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  recording_type?: 'emergency_pattern' | 'incident_audio' | 'voice_note';
  is_emergency_pattern?: boolean;
  incident_id?: string;
}) => {
  const { data, error } = await supabase
    .from('audio_recordings')
    .insert(recordingData)
    .select()
    .single();

  if (error) {
    console.error('Error saving audio recording:', error);
    throw error;
  }

  return data;
};

export const getUserAudioRecordings = async (userId: string) => {
  const { data, error } = await supabase
    .from('audio_recordings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audio recordings:', error);
    throw error;
  }

  return data;
};

// Notification preferences functions
export const getUserNotificationPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }

  return data;
};

export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<{
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    emergency_alerts: boolean;
    system_updates: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    notification_language: string;
  }>
) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }

  return data;
};