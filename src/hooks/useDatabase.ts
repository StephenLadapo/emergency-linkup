import { useState, useEffect } from 'react'
import { supabase, type Profile, type EmergencyReport, type Message } from '@/lib/supabase'
import { toast } from 'sonner'

export const useDatabase = () => {
  const [loading, setLoading] = useState(false)

  // User Profile operations
  const createProfile = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) throw error
      toast.success('Profile created successfully')
      return data
    } catch (error: any) {
      toast.error('Error creating profile: ' + error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      toast.success('Profile updated successfully')
      return data
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error: any) {
      console.error('Error fetching profile:', error.message)
      return null
    }
  }

  // Emergency Report operations
  const createEmergencyReport = async (reportData: Omit<EmergencyReport, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('emergency_reports')
        .insert([{ ...reportData, status: 'pending' }])
        .select()
        .single()

      if (error) throw error
      toast.success('Emergency report submitted successfully')
      return data
    } catch (error: any) {
      toast.error('Error submitting emergency report: ' + error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUserEmergencyReports = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('emergency_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error fetching emergency reports:', error.message)
      return []
    }
  }

  // Message operations
  const createMessage = async (messageData: Omit<Message, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ ...messageData, read: false }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating message:', error.message)
      throw error
    }
  }

  const getUserMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error fetching messages:', error.message)
      return []
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error marking message as read:', error.message)
      throw error
    }
  }

  return {
    loading,
    createProfile,
    updateProfile,
    getProfile,
    createEmergencyReport,
    getUserEmergencyReports,
    createMessage,
    getUserMessages,
    markMessageAsRead
  }
}