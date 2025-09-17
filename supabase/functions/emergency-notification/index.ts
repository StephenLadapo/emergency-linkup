import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmergencyNotificationData {
  emergencyId: string;
  emergencyType: string;
  title: string;
  description?: string;
  location?: string;
  priority: number;
  studentName: string;
  studentEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { emergencyId, emergencyType, title, description, location, priority, studentName, studentEmail }: EmergencyNotificationData = await req.json();

    console.log('Processing emergency notification:', { emergencyId, emergencyType, title, priority });

    // Get appropriate staff based on emergency type
    let staffRoles: string[] = [];
    
    switch (emergencyType) {
      case 'medical':
        staffRoles = ['medical_staff', 'admin'];
        break;
      case 'security':
        staffRoles = ['security_staff', 'admin'];
        break;
      case 'fire':
        staffRoles = ['medical_staff', 'security_staff', 'admin'];
        break;
      case 'both':
        staffRoles = ['medical_staff', 'security_staff', 'admin'];
        break;
      default:
        staffRoles = ['admin'];
    }

    // Get staff members to notify
    const { data: staffMembers, error: staffError } = await supabaseClient
      .from('profiles')
      .select('user_id, full_name')
      .in('role', staffRoles);

    if (staffError) {
      console.error('Error fetching staff members:', staffError);
      throw staffError;
    }

    console.log(`Found ${staffMembers?.length || 0} staff members to notify`);

    // Create notification records for each staff member
    if (staffMembers && staffMembers.length > 0) {
      const notifications = staffMembers.map(staff => ({
        recipient_id: staff.user_id,
        emergency_id: emergencyId,
        title: `${emergencyType.toUpperCase()} Emergency Alert`,
        message: `Emergency reported by ${studentName}: ${title}${location ? ` at ${location}` : ''}`,
        type: 'emergency_alert',
        priority: priority,
        is_read: false,
      }));

      // In a real implementation, you would insert these into a notifications table
      console.log('Notifications to send:', notifications);

      // For now, we'll just log the notifications
      // In production, you might:
      // 1. Insert into a notifications table
      // 2. Send push notifications
      // 3. Send SMS alerts for high priority emergencies
      // 4. Send emails to staff
    }

    // Update the emergency request to mark as notified
    const { error: updateError } = await supabaseClient
      .from('emergency_requests')
      .update({ 
        updated_at: new Date().toISOString(),
        // Add a custom field if needed: notified_at: new Date().toISOString()
      })
      .eq('id', emergencyId);

    if (updateError) {
      console.error('Error updating emergency request:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emergency notifications sent successfully',
        notified_count: staffMembers?.length || 0
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in emergency-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    );
  }
});