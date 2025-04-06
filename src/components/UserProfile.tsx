
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock emergency contacts
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Emergency Contact 1', relation: 'Family', phone: '123-456-7890' },
    { id: 2, name: 'Campus Security', relation: 'University', phone: '098-765-4321' }
  ]);
  
  // Mock medical information
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: 'O+',
    allergies: 'None',
    conditions: 'None',
    medications: 'None'
  });
  
  useEffect(() => {
    // In a real app, this would fetch from a backend API
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  const handleUpdateProfile = () => {
    // In a real app, this would send to a backend API
    localStorage.setItem('user', JSON.stringify(user));
    toast.success('Profile updated successfully!');
  };
  
  const handleUpdateMedical = () => {
    // In a real app, this would send to a backend API
    toast.success('Medical information updated successfully!');
  };
  
  const handleAddContact = () => {
    // In a real app, this would send to a backend API
    const newContact = { 
      id: contacts.length + 1, 
      name: 'New Contact', 
      relation: 'Relation', 
      phone: '000-000-0000' 
    };
    setContacts([...contacts, newContact]);
    toast.success('Contact added successfully!');
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
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="Enter your student ID"
                />
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
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input 
                  id="bloodType" 
                  value={medicalInfo.bloodType} 
                  onChange={(e) => setMedicalInfo({...medicalInfo, bloodType: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input 
                  id="allergies" 
                  value={medicalInfo.allergies} 
                  onChange={(e) => setMedicalInfo({...medicalInfo, allergies: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conditions">Medical Conditions</Label>
                <Input 
                  id="conditions" 
                  value={medicalInfo.conditions} 
                  onChange={(e) => setMedicalInfo({...medicalInfo, conditions: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Input 
                  id="medications" 
                  value={medicalInfo.medications} 
                  onChange={(e) => setMedicalInfo({...medicalInfo, medications: e.target.value})}
                />
              </div>
              
              <Button onClick={handleUpdateMedical} className="w-full">
                Update Medical Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border p-3 rounded-md">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">{contact.relation}</div>
                  <div className="text-sm">{contact.phone}</div>
                </div>
              ))}
              
              <Button onClick={handleAddContact} variant="outline" className="w-full">
                Add New Contact
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
