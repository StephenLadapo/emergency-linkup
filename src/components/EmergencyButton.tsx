import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, MapPin, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { useEmergencyRequest } from '@/hooks/useEmergencyRequest';

const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState<'medical' | 'security' | 'fire' | 'both'>('medical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const { createEmergencyRequest, loading } = useEmergencyRequest();

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          toast.success('Location captured successfully');
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to get location. Please enter manually.');
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
      setIsGettingLocation(false);
    }
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false);
      toast.success('Voice recording stopped');
    } else {
      // Start recording logic would go here
      setIsRecording(true);
      toast.success('Voice recording started');
      
      // Simulate stopping after 10 seconds
      setTimeout(() => {
        setIsRecording(false);
        toast.success('Voice recording completed');
      }, 10000);
    }
  };

  const handleSubmitEmergency = async () => {
    if (!title.trim()) {
      toast.error('Please provide a title for the emergency');
      return;
    }

    const locationData = location.includes('Lat:') && location.includes('Lng:') 
      ? {
          location_lat: parseFloat(location.split('Lat: ')[1].split(',')[0]),
          location_lng: parseFloat(location.split('Lng: ')[1]),
          location_address: location
        }
      : {
          location_address: location || 'Location not provided'
        };

    const requestData = {
      emergency_type: emergencyType,
      title: title.trim(),
      description: description.trim() || undefined,
      ...locationData,
      priority_level: priority,
    };

    const result = await createEmergencyRequest(requestData);
    
    if (result) {
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setPriority(3);
      setEmergencyType('medical');
      setIsOpen(false);
      
      toast.success('Emergency request submitted! Help is on the way.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse"
          >
            <AlertTriangle className="h-8 w-8" />
          </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency Request
          </DialogTitle>
          <DialogDescription>
            Fill out the details below to request emergency assistance. Help will be dispatched immediately.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyType">Emergency Type</Label>
            <Select value={emergencyType} onValueChange={(value: any) => setEmergencyType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="security">Security Emergency</SelectItem>
                <SelectItem value="fire">Fire Emergency</SelectItem>
                <SelectItem value="both">Medical & Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Emergency Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the emergency"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about the situation..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location or use GPS"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="shrink-0"
              >
                <MapPin className="h-4 w-4" />
                {isGettingLocation ? 'Getting...' : 'GPS'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level (1-5)</Label>
            <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Low Priority</SelectItem>
                <SelectItem value="2">2 - Below Normal</SelectItem>
                <SelectItem value="3">3 - Normal</SelectItem>
                <SelectItem value="4">4 - High Priority</SelectItem>
                <SelectItem value="5">5 - Critical Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Voice Message</h4>
                  <p className="text-sm text-muted-foreground">
                    Record a voice message for additional context
                  </p>
                </div>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleVoiceRecording}
                  className="shrink-0"
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitEmergency}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Submitting...' : 'Submit Emergency Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyButton;