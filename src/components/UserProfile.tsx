
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Phone, Shield, Heart, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  student_id: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface MedicalInfo {
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '', email: '' }
  ]);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: '',
    allergies: '',
    conditions: '',
    medications: ''
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
          }
          return;
        }

        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setStudentId(data.student_id || '');
        
        // Load saved emergency contacts and medical info from localStorage for now
        // In a full implementation, these would be separate tables
        const savedContacts = localStorage.getItem(`emergency_contacts_${user.id}`);
        if (savedContacts) {
          setEmergencyContacts(JSON.parse(savedContacts));
        }
        
        const savedMedical = localStorage.getItem(`medical_info_${user.id}`);
        if (savedMedical) {
          setMedicalInfo(JSON.parse(savedMedical));
        }
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          phone: phone,
          student_id: studentId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Save emergency contacts and medical info to localStorage
      // In a full implementation, these would be separate tables
      localStorage.setItem(`emergency_contacts_${user.id}`, JSON.stringify(emergencyContacts));
      localStorage.setItem(`medical_info_${user.id}`, JSON.stringify(medicalInfo));

      toast.success('Profile updated successfully!');
      
      // Refetch profile to get updated data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '', email: '' }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
              />
            </div>
          </div>
          
          {profile && (
            <div className="text-sm text-muted-foreground">
              <p>Role: <span className="font-medium capitalize">{profile.role}</span></p>
              <p>Account created: {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>
            Add people to contact in case of emergency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Contact {index + 1}</h4>
                {emergencyContacts.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Full Name"
                  value={contact.name}
                  onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Relationship"
                  value={contact.relationship}
                  onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                />
                <Input
                  placeholder="Phone Number"
                  value={contact.phone}
                  onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                />
                <Input
                  placeholder="Email (optional)"
                  value={contact.email}
                  onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
                />
              </div>
            </div>
          ))}
          <Button onClick={addEmergencyContact} variant="outline" className="w-full">
            Add Emergency Contact
          </Button>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Medical Information
          </CardTitle>
          <CardDescription>
            Important medical information for emergency responders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Input
                id="bloodType"
                value={medicalInfo.bloodType}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, bloodType: e.target.value })}
                placeholder="e.g., O+, A-, B+"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={medicalInfo.allergies}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, allergies: e.target.value })}
                placeholder="Food, drug, or other allergies"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="conditions">Medical Conditions</Label>
            <Textarea
              id="conditions"
              value={medicalInfo.conditions}
              onChange={(e) => setMedicalInfo({ ...medicalInfo, conditions: e.target.value })}
              placeholder="Any ongoing medical conditions"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              value={medicalInfo.medications}
              onChange={(e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value })}
              placeholder="List current medications and dosages"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
