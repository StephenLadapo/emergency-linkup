import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Profile {
  id: string
  student_number: string
  email: string
  full_name: string
  phone: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string
  created_at: string
  updated_at: string
}

export interface EmergencyReport {
  id: string
  user_id: string
  type: 'security' | 'medical' | 'fire' | 'other'
  description: string
  location: string
  latitude?: number
  longitude?: number
  status: 'pending' | 'responded' | 'resolved'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  content: string
  type: 'emergency' | 'notification' | 'response'
  read: boolean
  created_at: string
}