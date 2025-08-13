
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, X, Phone, Mail, UserPlus, Shield, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  is_primary?: boolean;
};

type MedicalInfo = {
  blood_type: string;
  allergies: string;
  conditions: string;
  medications: string;
  medical_aid_number?: string;
  medical_aid_provider?: string;
  doctor_name?: string;
  doctor_contact?: string;
};

type ProfileData = {
  id?: string;
  full_name: string;
  email?: string;
  student_id?: string;
  phone?: string;
  address?: string;
  faculty?: string;
  year_of_study?: string;
  medical_info?: MedicalInfo;
  emergency_contacts: EmergencyContact[];
};

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: '',
    relation: '',
    phone: '',
    email: '',
    is_primary: false
  });
  const [showAddContact, setShowAddContact] = useState(false);

  // Initialize medical info with default values
  const initializeMedicalInfo = (): MedicalInfo => ({
    blood_type: '',
    allergies: '',
    conditions: '',
    medications: '',
    medical_aid_number: '',
    medical_aid_provider: '',
    doctor_name: '',
    doctor_contact: ''
  });

  // Fetch profile data from Supabase
  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (!profileData) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || '',
            student_id: user.user_metadata?.student_id || '',
            role: 'student'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        setProfile({
          ...newProfile,
          email: user.email,
          medical_info: initializeMedicalInfo(),
          emergency_contacts: []
        });
      } else {
        setProfile({
          ...profileData,
          email: user.email,
          medical_info: initializeMedicalInfo(),
          emergency_contacts: []
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          student_id: profile.student_id,
          phone: profile.phone
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateMedical = async () => {
    toast.success('Medical information saved locally!');
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please provide at least a name and phone number.');
      return;
    }

    if (!profile) return;

    const newContactWithId = {
      ...newContact,
      id: Date.now().toString()
    };

    setProfile({
      ...profile,
      emergency_contacts: [...profile.emergency_contacts, newContactWithId]
    });

    setNewContact({
      name: '',
      relation: '',
      phone: '',
      email: '',
      is_primary: false
    });

    setShowAddContact(false);
    toast.success('Emergency contact added successfully!');
  };

  const handleRemoveContact = (id: string) => {
    if (!profile) return;

    setProfile({
      ...profile,
      emergency_contacts: profile.emergency_contacts.filter(contact => contact.id !== id)
    });

    toast.success('Contact removed successfully!');
  };

  const handleSetPrimaryContact = (id: string) => {
    if (!profile) return;

    setProfile({
      ...profile,
      emergency_contacts: profile.emergency_contacts.map(contact => ({
        ...contact,
        is_primary: contact.id === id
      }))
    });

    toast.success('Primary contact updated!');
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }
  
  if (!profile) {
    return <div className="text-center">Please login to view your profile.</div>;
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />Personal Info
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />Medical Info
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />Emergency Contacts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={profile?.full_name || ''} 
                    onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email || ''} 
                    readOnly 
                    className="bg-muted/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input 
                    id="studentId" 
                    value={profile?.student_id || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, student_id: e.target.value } : null)}
                    placeholder="Enter your student ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="address">Campus Address/Residence</Label>
                  <Input 
                    id="address" 
                    value={profile?.address || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                    placeholder="Enter your campus address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input 
                    id="faculty" 
                    value={profile?.faculty || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, faculty: e.target.value } : null)}
                    placeholder="Enter your faculty"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <Input 
                    id="yearOfStudy" 
                    value={profile?.year_of_study || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, year_of_study: e.target.value } : null)}
                    placeholder="Enter your year of study"
                  />
                </div>
              </div>
              
              <Button onClick={handleUpdateProfile} className="w-full">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input 
                    id="bloodType" 
                    value={profile?.medical_info?.blood_type || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, blood_type: e.target.value }
                    } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalAidNumber">Medical Aid Number</Label>
                  <Input 
                    id="medicalAidNumber" 
                    value={profile?.medical_info?.medical_aid_number || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, medical_aid_number: e.target.value }
                    } : null)}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalAidProvider">Medical Aid Provider</Label>
                  <Input 
                    id="medicalAidProvider" 
                    value={profile?.medical_info?.medical_aid_provider || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, medical_aid_provider: e.target.value }
                    } : null)}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea 
                    id="allergies" 
                    value={profile?.medical_info?.allergies || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, allergies: e.target.value }
                    } : null)}
                    placeholder="List any allergies, or write 'None' if not applicable"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Textarea 
                    id="conditions" 
                    value={profile?.medical_info?.conditions || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, conditions: e.target.value }
                    } : null)}
                    placeholder="List any medical conditions, or write 'None' if not applicable"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea 
                    id="medications" 
                    value={profile?.medical_info?.medications || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, medications: e.target.value }
                    } : null)}
                    placeholder="List any medications you are currently taking, or write 'None' if not applicable"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor's Name</Label>
                  <Input 
                    id="doctorName" 
                    value={profile?.medical_info?.doctor_name || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, doctor_name: e.target.value }
                    } : null)}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doctorContact">Doctor's Contact</Label>
                  <Input 
                    id="doctorContact" 
                    value={profile?.medical_info?.doctor_contact || ''} 
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev, 
                      medical_info: { ...prev.medical_info!, doctor_contact: e.target.value }
                    } : null)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <Button onClick={handleUpdateMedical} className="w-full">
                Update Medical Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Emergency Contacts</CardTitle>
              {!showAddContact && (
                <Button variant="outline" onClick={() => setShowAddContact(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddContact && (
                <Card className="border-dashed border-primary/50 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Name</Label>
                        <Input 
                          id="contactName" 
                          value={newContact.name} 
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          placeholder="Contact Name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactRelation">Relationship</Label>
                        <Input 
                          id="contactRelation" 
                          value={newContact.relation} 
                          onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                          placeholder="e.g. Parent, Sibling, Friend"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number</Label>
                        <Input 
                          id="contactPhone" 
                          value={newContact.phone} 
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          placeholder="Contact Phone Number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email (Optional)</Label>
                        <Input 
                          id="contactEmail" 
                          value={newContact.email || ''} 
                          onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                          placeholder="Contact Email"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button onClick={handleAddContact} className="flex-1">
                        Save Contact
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddContact(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-4">
                {profile && profile.emergency_contacts.length > 0 ? (
                  profile.emergency_contacts.map((contact) => (
                    <div key={contact.id} className="border p-4 rounded-md relative">
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => handleRemoveContact(contact.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="font-medium text-lg mb-1">{contact.name}</div>
                        <div>
                          {contact.is_primary ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900/20 dark:text-green-300">
                              Primary Contact
                            </span>
                          ) : (
                            <Button 
                              variant="link" 
                              size="sm" 
                              onClick={() => handleSetPrimaryContact(contact.id)} 
                              className="text-xs p-0 h-auto"
                            >
                              Set as primary
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-1">{contact.relation}</div>
                      
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>{contact.phone}</span>
                        </div>
                        
                        {contact.email && (
                          <div className="flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No emergency contacts added yet.</p>
                    <p className="text-sm">Add contacts who should be notified during emergencies.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
