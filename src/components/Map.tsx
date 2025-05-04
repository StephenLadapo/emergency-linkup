
import { useEffect, useRef, useState } from 'react';
import { MapPin, Share2, Shield, AlertTriangle, UserPlus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continuousTracking, setContinuousTracking] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [emergencySent, setEmergencySent] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  // Function to add events to user history
  const addToHistory = (type: string, description: string, status?: string) => {
    try {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const historyItem = {
        id: Date.now(),
        type,
        timestamp: formattedDate,
        description,
        status
      };
      
      const userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      userHistory.unshift(historyItem);
      localStorage.setItem('userHistory', JSON.stringify(userHistory));
    } catch (error) {
      console.error('Error adding history item:', error);
    }
  };

  // Check for previously saved consent
  useEffect(() => {
    const savedConsent = localStorage.getItem('locationConsentGiven');
    if (savedConsent !== null) {
      const consentValue = savedConsent === 'true';
      setConsentGiven(consentValue);
      
      if (consentValue) {
        startLocationTracking();
      }
    } else {
      // Show consent dialog only if consent hasn't been given before
      setShowConsentDialog(true);
    }
  }, []);

  // Handle consent decision
  const handleConsentDecision = (consent: boolean) => {
    setConsentGiven(consent);
    localStorage.setItem('locationConsentGiven', String(consent));
    setShowConsentDialog(false);
    
    if (consent) {
      startLocationTracking();
      addToHistory('consent', 'Location tracking consent given');
      toast.success('Location tracking enabled');
    } else {
      addToHistory('consent', 'Location tracking consent denied');
      toast.info('Location tracking disabled');
    }
  };

  // Initialize/cleanup location tracking
  useEffect(() => {
    if (consentGiven) {
      startLocationTracking();
    }
    
    return () => {
      // Clean up
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [consentGiven]);
  
  const startLocationTracking = () => {
    if (!consentGiven) return;
    
    setLoading(true);
    
    if (navigator.geolocation) {
      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          setAccuracy(position.coords.accuracy);
          setLastUpdate(new Date());
          fetchAddress(newLocation);
          setLoading(false);
          
          // Add to history
          addToHistory('location', 'Location tracked successfully');
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to access your location. Please enable location services.');
          setLoading(false);
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );

      // Start watching position for real-time updates
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          setAccuracy(position.coords.accuracy);
          setLastUpdate(new Date());
          fetchAddress(newLocation);
          setLoading(false);
        },
        (err) => {
          console.error('Error watching location:', err);
          setError('Location tracking error. Please try again.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );

      setWatchId(id);
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };
  
  const toggleContinuousTracking = (enabled: boolean) => {
    setContinuousTracking(enabled);
    
    if (enabled) {
      startLocationTracking();
      addToHistory('location', 'Continuous location tracking enabled');
      toast.success('Continuous location tracking enabled');
    } else {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      addToHistory('location', 'Continuous location tracking disabled');
      toast.info('Continuous location tracking disabled');
    }
  };

  // Fetch address from coordinates (now it will use a more realistic approach, though still mocked)
  const fetchAddress = async (location: {lat: number, lng: number}) => {
    try {
      // In a real app, this would use the Geocoding API
      // For now, we'll simulate it with a mock address based on coordinates
      setTimeout(() => {
        // Mocking different locations based on coordinates to make it more realistic
        const addresses = [
          "University of Limpopo, Sovenga, Polokwane",
          "Student Residence, University of Limpopo",
          "Science Building, University of Limpopo Campus",
          "Library Complex, University of Limpopo",
          "Sports Field, University of Limpopo"
        ];
        
        // Generate a pseudo-random index based on coordinates
        const index = Math.floor(
          ((location.lat * 10 + location.lng * 10) % 5 + 5) % 5
        );
        
        setAddress(addresses[index]);
      }, 500);
    } catch (err) {
      console.error('Error fetching address:', err);
    }
  };

  const shareLocation = async () => {
    if (!location) return;
    
    try {
      // In a real app, this would send the location to emergency contacts or services
      const shareText = `My current location: ${address || 'Unknown'}\nCoordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}\nhttps://maps.google.com/?q=${location.lat},${location.lng}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Emergency Location',
          text: shareText,
          url: `https://maps.google.com/?q=${location.lat},${location.lng}`
        });
        
        // Add to history
        addToHistory('location', 'Location shared via system share');
        
        toast.success('Location shared successfully!');
      } else {
        // Fallback for browsers without Web Share API
        await navigator.clipboard.writeText(shareText);
        
        // Add to history
        addToHistory('location', 'Location copied to clipboard');
        
        toast.success('Location copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing location:', err);
      toast.error('Failed to share location');
    }
  };
  
  const shareWithEmergencyContacts = () => {
    // Get emergency contacts from user profile
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const contacts = user.emergencyContacts || [];
      
      if (contacts.length === 0) {
        toast.error('No emergency contacts found. Please add contacts in your profile.');
        return;
      }
      
      // In a real app, this would send SMS, emails, or notifications to contacts
      toast.success(`Location shared with ${contacts.length} emergency contacts!`);
      
      // Add to history
      addToHistory('location', `Location shared with ${contacts.length} emergency contacts`);
    } catch (error) {
      console.error('Error accessing emergency contacts:', error);
      toast.error('Error accessing emergency contacts');
    }
  };
  
  const sendEmergencyLocation = () => {
    if (!location) return;
    
    // In a real app, this would send the location to campus security or emergency services
    
    try {
      // Simulate sending location to emergency services
      setTimeout(() => {
        setEmergencySent(true);
        
        // Add to history
        addToHistory('emergency', `Emergency location sent to campus security with details: ${emergencyDetails}`, 'pending');
        
        toast.success('Emergency location sent to campus security!', {
          duration: 5000,
        });
        
        // Reset after a delay
        setTimeout(() => {
          setShowEmergencyDialog(false);
          setEmergencyDetails('');
          setEmergencySent(false);
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Error sending emergency location:', error);
      toast.error('Failed to send emergency location');
    }
  };
  
  // Show consent dialog if consent hasn't been given yet
  if (consentGiven === null) {
    return (
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Tracking Permission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>EmergencyLinkUp needs your location to provide emergency services. Would you like to enable location tracking?</p>
            <p className="text-sm text-muted-foreground">You can change this setting later in your profile.</p>
            <img 
              src="/student-uploads/campus-map.jpg" 
              alt="University of Limpopo Campus Map" 
              className="w-full h-auto rounded-md border"
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => handleConsentDecision(false)}>
                Deny
              </Button>
              <Button onClick={() => handleConsentDecision(true)}>
                Allow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col items-center justify-center h-full">
        {/* Emergency Dialog */}
        <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Send Emergency Location
              </DialogTitle>
            </DialogHeader>
            
            {!emergencySent ? (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyDetails">Emergency Details (Optional)</Label>
                  <Input 
                    id="emergencyDetails"
                    placeholder="Briefly describe your emergency situation"
                    value={emergencyDetails}
                    onChange={(e) => setEmergencyDetails(e.target.value)}
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={sendEmergencyLocation} 
                    className="w-full"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Send Emergency Location
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="font-medium text-green-700">
                  Emergency location successfully sent!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Campus security has been notified.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {!consentGiven ? (
          <div className="text-center space-y-4">
            <div className="rounded-full bg-amber-100 p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <MapPin className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium">Location Tracking Disabled</h3>
            <p className="text-muted-foreground">
              You've chosen to disable location tracking. Your location will not be shared with emergency services.
            </p>
            <Button variant="outline" onClick={() => handleConsentDecision(true)}>
              Enable Location Tracking
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Getting your location...</p>
          </div>
        ) : error ? (
          <div className="text-center text-destructive">{error}</div>
        ) : (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Your Current Location</span>
              {accuracy && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Accuracy: ±{Math.round(accuracy)}m
                </span>
              )}
            </div>
            
            {address && (
              <div className="text-center p-3 bg-muted/20 rounded-md w-full">
                <p className="font-medium">{address}</p>
                {lastUpdate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
            
            {/* Location display area */}
            <div className="w-full h-64 rounded-md overflow-hidden border relative">
              <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <div className="text-center p-4">
                  <div className="animate-pulse mb-2">
                    <MapPin className="h-8 w-8 text-primary mx-auto" />
                  </div>
                  {location ? (
                    <p className="font-medium">
                      Location Active
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Waiting for location...
                    </p>
                  )}
                </div>
              </div>
              <img 
                src="/student-uploads/campus-map.jpg" 
                alt="University of Limpopo Campus Map" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Current coordinates:</p>
              <p className="font-mono mt-1">
                {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
              </p>
            </div>
            
            <div className="flex flex-col space-y-2 w-full">
              <Button 
                onClick={shareLocation} 
                variant="outline" 
                className="flex gap-2"
                disabled={!location}
              >
                <Share2 className="h-4 w-4" />
                Share Location
              </Button>
              
              <Button 
                onClick={shareWithEmergencyContacts} 
                variant="outline" 
                className="flex gap-2"
                disabled={!location}
              >
                <UserPlus className="h-4 w-4" />
                Share with Emergency Contacts
              </Button>
              
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex gap-2" 
                  disabled={!location}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Send Location to Campus Security
                </Button>
              </DialogTrigger>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch 
                id="continuous-tracking" 
                checked={continuousTracking}
                onCheckedChange={toggleContinuousTracking}
              />
              <Label htmlFor="continuous-tracking">Enable continuous tracking</Label>
            </div>
            
            <div className="text-xs text-muted-foreground text-center mt-2">
              {continuousTracking ? (
                <span>Your location is continuously tracked for emergency services</span>
              ) : (
                <span>Enable continuous tracking for real-time location updates</span>
              )}
            </div>
          </div>
        )}
        
        {/* Location Consent Controls at Bottom */}
        {consentGiven !== null && (
          <div className="mt-6 pt-4 border-t w-full">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Location Tracking:
              </p>
              <Button 
                variant={consentGiven ? "outline" : "default"} 
                size="sm"
                onClick={() => handleConsentDecision(!consentGiven)}
              >
                {consentGiven ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Map;
