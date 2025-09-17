import { supabase } from '@/integrations/supabase/client';
import { initializeDatabase } from './supabase';

// Initialize the database when the app starts
export const setupDatabase = async () => {
  console.log('Setting up EmergencyLinkUp database...');
  
  try {
    // Test connection and initialize
    const success = await initializeDatabase();
    
    if (success) {
      console.log('✅ Database setup completed successfully');
      console.log('📊 Available tables:');
      console.log('  - user_profiles (user information and settings)');
      console.log('  - user_sessions (session management)');
      console.log('  - two_factor_codes (2FA security)');
      console.log('  - emergency_incidents (emergency reports)');
      console.log('  - emergency_contacts (emergency contact list)');
      console.log('  - emergency_messages (incident communications)');
      console.log('  - audio_recordings (voice recordings and patterns)');
      console.log('  - notification_preferences (user notification settings)');
      console.log('  - security_logs (security event tracking)');
      
      return true;
    } else {
      console.error('❌ Database setup failed');
      return false;
    }
  } catch (error) {
    console.error('Database setup error:', error);
    return false;
  }
};

// Export commonly used database functions
export * from './supabase';