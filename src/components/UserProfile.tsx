
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlusCircle, X, Phone, Mail, MapPin, UserPlus, Shield, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type EmergencyContact = {
  id: number;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
};

type MedicalInfo = {
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
  medicalAidNumber?: string;
  medicalAidProvider?: string;
  doctorName?: string;
  doctorContact?: string;
};

type UserData = {
  name: string;
  email: string;
  studentNumber?: string;
  phoneNumber?: string;
  address?: string;
  faculty?: string;
  yearOfStudy?: string;
  medicalInfo: MedicalInfo;
  emergencyContacts: EmergencyContact[];
};

const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState<EmergencyContact>({
    id: 0,
    name: '',
    relation: '',
    phone: '',
    email: '',
    isPrimary: false
  });
  const [showAddContact, setShowAddContact] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch from a backend API
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Initialize medical info if not present
      if (!userData.medicalInfo) {
        userData.medicalInfo = {
          bloodType: '',
          allergies: '',
          conditions: '',
          medications: '',
          medicalAidNumber: '',
          medicalAidProvider: '',
          doctorName: '',
          doctorContact: ''
        };
      }
      
      // Initialize emergency contacts if not present
      if (!userData.emergencyContacts) {
        userData.emergencyContacts = [];
      }
      
      setUser(userData);
    }
    setLoading(false);
  }, []);
  
  const handleUpdateProfile = () => {
    // In a real app, this would send to a backend API
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      
      // Add to history
      addToHistory('profile', 'Profile information updated');
      
      toast.success('Profile updated successfully!');
    }
  };
  
  const handleUpdateMedical = () => {
    // In a real app, this would send to a backend API
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      
      // Add to history
      addToHistory('profile', 'Medical information updated');
      
      toast.success('Medical information updated successfully!');
    }
  };
  
  const handleAddContact = () => {
    if (!user) return;
    
    if (!newContact.name || !newContact.phone) {
      toast.error('Please provide at least a name and phone number.');
      return;
    }
    
    const updatedContacts = [
      ...user.emergencyContacts,
      {
        ...newContact,
        id: user.emergencyContacts.length + 1
      }
    ];
    
    setUser({
      ...user,
      emergencyContacts: updatedContacts
    });
    
    localStorage.setItem('user', JSON.stringify({
      ...user,
      emergencyContacts: updatedContacts
    }));
    
    // Add to history
    addToHistory('contact', `Emergency contact ${newContact.name} added`);
    
    setNewContact({
      id: 0,
      name: '',
      relation: '',
      phone: '',
      email: '',
      isPrimary: false
    });
    
    setShowAddContact(false);
    
    toast.success('Emergency contact added successfully!');
  };
  
  const handleRemoveContact = (id: number) => {
    if (!user) return;
    
    const contactToRemove = user.emergencyContacts.find(c => c.id === id);
    const updatedContacts = user.emergencyContacts.filter(contact => contact.id !== id);
    
    setUser({
      ...user,
      emergencyContacts: updatedContacts
    });
    
    localStorage.setItem('user', JSON.stringify({
      ...user,
      emergencyContacts: updatedContacts
    }));
    
    // Add to history
    if (contactToRemove) {
      addToHistory('contact', `Emergency contact ${contactToRemove.name} removed`);
    }
    
    toast.success('Contact removed successfully!');
  };
  
  const handleSetPrimaryContact = (id: number) => {
    if (!user) return;
    
    const updatedContacts = user.emergencyContacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === id
    }));
    
    setUser({
      ...user,
      emergencyContacts: updatedContacts
    });
    
    localStorage.setItem('user', JSON.stringify({
      ...user,
      emergencyContacts: updatedContacts
    }));
    
    const primaryContact = updatedContacts.find(c => c.id === id);
    
    // Add to history
    if (primaryContact) {
      addToHistory('contact', `Set ${primaryContact.name} as primary emergency contact`);
    }
    
    toast.success('Primary contact updated!');
  };
  
  // Function to add events to user history
  const addToHistory = (type: string, description: string) => {
    try {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const historyItem = {
        id: Date.now(),
        type,
        timestamp: formattedDate,
        description
      };
      
      const userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      userHistory.unshift(historyItem);
      localStorage.setItem('userHistory', JSON.stringify(userHistory));
    } catch (error) {
      console.error('Error adding history item:', error);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }
  
  if (!user) {
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
                    value={user.name} 
                    onChange={(e) => setUser({...user, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user.email} 
                    readOnly 
                    className="bg-muted/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input 
                    id="studentId" 
                    value={user.studentNumber || ''}
                    onChange={(e) => setUser({...user, studentNumber: e.target.value})}
                    placeholder="Enter your student ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    value={user.phoneNumber || ''}
                    onChange={(e) => setUser({...user, phoneNumber: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="address">Campus Address/Residence</Label>
                  <Input 
                    id="address" 
                    value={user.address || ''}
                    onChange={(e) => setUser({...user, address: e.target.value})}
                    placeholder="Enter your campus address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input 
                    id="faculty" 
                    value={user.faculty || ''}
                    onChange={(e) => setUser({...user, faculty: e.target.value})}
                    placeholder="Enter your faculty"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <Input 
                    id="yearOfStudy" 
                    value={user.yearOfStudy || ''}
                    onChange={(e) => setUser({...user, yearOfStudy: e.target.value})}
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
                    value={user.medicalInfo.bloodType} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, bloodType: e.target.value}
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalAidNumber">Medical Aid Number</Label>
                  <Input 
                    id="medicalAidNumber" 
                    value={user.medicalInfo.medicalAidNumber || ''} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, medicalAidNumber: e.target.value}
                    })}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalAidProvider">Medical Aid Provider</Label>
                  <Input 
                    id="medicalAidProvider" 
                    value={user.medicalInfo.medicalAidProvider || ''} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, medicalAidProvider: e.target.value}
                    })}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea 
                    id="allergies" 
                    value={user.medicalInfo.allergies} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, allergies: e.target.value}
                    })}
                    placeholder="List any allergies, or write 'None' if not applicable"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Textarea 
                    id="conditions" 
                    value={user.medicalInfo.conditions} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, conditions: e.target.value}
                    })}
                    placeholder="List any medical conditions, or write 'None' if not applicable"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea 
                    id="medications" 
                    value={user.medicalInfo.medications} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, medications: e.target.value}
                    })}
                    placeholder="List any medications you are currently taking, or write 'None' if not applicable"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor's Name</Label>
                  <Input 
                    id="doctorName" 
                    value={user.medicalInfo.doctorName || ''} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, doctorName: e.target.value}
                    })}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doctorContact">Doctor's Contact</Label>
                  <Input 
                    id="doctorContact" 
                    value={user.medicalInfo.doctorContact || ''} 
                    onChange={(e) => setUser({
                      ...user, 
                      medicalInfo: {...user.medicalInfo, doctorContact: e.target.value}
                    })}
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
                {user.emergencyContacts.length > 0 ? (
                  user.emergencyContacts.map((contact) => (
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
                          {contact.isPrimary ? (
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
