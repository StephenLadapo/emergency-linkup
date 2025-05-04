
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Share2, UserPlus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { addToHistory } from "@/utils/historyUtils";

interface LocationActionsProps {
  location: { lat: number; lng: number } | null;
  address: string | null;
  continuousTracking: boolean;
  onToggleTracking: (enabled: boolean) => void;
  onShowEmergencyDialog: () => void;
}

const LocationActions = ({
  location,
  address,
  continuousTracking,
  onToggleTracking,
  onShowEmergencyDialog
}: LocationActionsProps) => {

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

  return (
    <div className="flex flex-col space-y-4 w-full">
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
        
        <Button 
          onClick={onShowEmergencyDialog} 
          variant="destructive" 
          className="flex gap-2"
          disabled={!location}
        >
          <AlertTriangle className="h-4 w-4" />
          Send Location to Campus Security
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Switch 
          id="continuous-tracking" 
          checked={continuousTracking}
          onCheckedChange={onToggleTracking}
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
  );
};

export default LocationActions;
