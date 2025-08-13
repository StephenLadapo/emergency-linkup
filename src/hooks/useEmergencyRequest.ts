import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmergencyRequest {
  id?: string;
  student_id: string;
  emergency_type: 'medical' | 'security' | 'fire' | 'both';
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  title: string;
  description?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  audio_url?: string;
  audio_transcription?: string;
  priority_level: number;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
}

export const useEmergencyRequest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createEmergencyRequest = async (requestData: Omit<EmergencyRequest, 'id' | 'student_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('You must be logged in to create an emergency request');
      return null;
    }

    setLoading(true);
    
    try {
      // First get the user's profile to get the profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        toast.error('Failed to find user profile');
        return null;
      }

      const { data, error } = await supabase
        .from('emergency_requests')
        .insert({
          student_id: profile.id,
          emergency_type: requestData.emergency_type,
          status: 'pending',
          title: requestData.title,
          description: requestData.description,
          location_lat: requestData.location_lat,
          location_lng: requestData.location_lng,
          location_address: requestData.location_address,
          audio_url: requestData.audio_url,
          audio_transcription: requestData.audio_transcription,
          priority_level: requestData.priority_level,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating emergency request:', error);
        toast.error('Failed to create emergency request');
        return null;
      }

      toast.success('Emergency request created successfully');
      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getEmergencyRequests = async () => {
    if (!user) return [];

    try {
      // Get the user's profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        return [];
      }

      const { data, error } = await supabase
        .from('emergency_requests')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching emergency requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  };

  const updateEmergencyRequest = async (id: string, updates: Partial<EmergencyRequest>) => {
    if (!user) {
      toast.error('You must be logged in to update emergency requests');
      return null;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('emergency_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating emergency request:', error);
        toast.error('Failed to update emergency request');
        return null;
      }

      toast.success('Emergency request updated successfully');
      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEmergencyRequest,
    getEmergencyRequests,
    updateEmergencyRequest,
    loading
  };
};