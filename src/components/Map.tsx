
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const Map = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
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
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
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

  // In a real app, we would use a mapping library like Mapbox or Google Maps
  // For now, we're just displaying coordinates
  
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
            <div className="text-center text-sm text-muted-foreground">
              <p>For a real implementation, this would show a map.</p>
              <p className="mt-2">Current coordinates:</p>
              <p className="font-mono mt-1">
                {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
              </p>
            </div>
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
