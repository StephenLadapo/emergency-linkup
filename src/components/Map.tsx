
import { useEffect, useRef, useState } from 'react';
import { MapPin, Share2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Map = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          fetchAddress(newLocation);
          setLoading(false);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to access your location. Please enable location services.');
          setLoading(false);
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

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Mock function to fetch address from coordinates (would use a real geocoding service in production)
  const fetchAddress = async (location: {lat: number, lng: number}) => {
    try {
      // This would be a call to a geocoding API like Google Maps, Mapbox, etc.
      // For now, we'll simulate it with a mock address
      setTimeout(() => {
        setAddress("University of Limpopo, Sovenga, Polokwane");
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
        toast.success('Location shared successfully!');
      } else {
        // Fallback for browsers without Web Share API
        await navigator.clipboard.writeText(shareText);
        toast.success('Location copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing location:', err);
      toast.error('Failed to share location');
    }
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col items-center justify-center h-full">
        {loading ? (
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
              <span className="font-medium">Your Location</span>
            </div>
            
            {address && (
              <div className="text-center p-3 bg-muted/20 rounded-md w-full">
                <p className="font-medium">{address}</p>
              </div>
            )}
            
            <div className="text-center text-sm text-muted-foreground">
              <p>For a real implementation, this would show a map.</p>
              <p className="mt-2">Current coordinates:</p>
              <p className="font-mono mt-1">
                {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
              </p>
            </div>
            
            <Button onClick={shareLocation} variant="outline" className="flex gap-2">
              <Share2 className="h-4 w-4" />
              Share Location
            </Button>
            
            <div className="text-xs text-muted-foreground text-center mt-2">
              Your location is continuously tracked for emergency services
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Map;
