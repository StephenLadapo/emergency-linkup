
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import 'mapbox-gl/dist/mapbox-gl.css';

// Import our new components and hooks
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { addToHistory } from "@/utils/historyUtils";
import { fetchAddressFromCoordinates } from "@/utils/geocodingUtils";
import MapTokenDialog from "@/components/MapTokenDialog";
import MapVisualizer from "@/components/MapVisualizer";
import LocationInfo from "@/components/LocationInfo";
import LocationActions from "@/components/LocationActions";
import EmergencyDialog from "@/components/EmergencyDialog";

const Map = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showMapTokenDialog, setShowMapTokenDialog] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  
  // Use our custom hook for location tracking
  const { 
    location,
    accuracy,
    loading,
    error,
    lastUpdate,
    continuousTracking,
    startLocationTracking,
    toggleContinuousTracking
  } = useLocationTracking({
    onLocationUpdate: (newLocation) => {
      // Fetch address whenever location updates
      fetchAddress(newLocation);
    },
    addToHistory
  });

  // Try to retrieve the Mapbox token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapboxToken');
    if (savedToken) {
      setMapboxToken(savedToken);
    } else {
      setShowMapTokenDialog(true);
    }
  }, []);

  // Start location tracking when mapboxToken is available
  useEffect(() => {
    if (mapboxToken) {
      startLocationTracking();
    }
  }, [mapboxToken]);

  // Handle submitting the Mapbox token
  const handleTokenSubmit = () => {
    if (mapboxToken) {
      localStorage.setItem('mapboxToken', mapboxToken);
      setShowMapTokenDialog(false);
      startLocationTracking();
    } else {
      toast.error('Please enter a valid Mapbox token');
    }
  };

  // Fetch address from coordinates
  const fetchAddress = async (location: { lat: number, lng: number }) => {
    try {
      const address = await fetchAddressFromCoordinates(location);
      setAddress(address);
    } catch (err) {
      console.error('Error fetching address:', err);
    }
  };

  // Send emergency location
  const sendEmergencyLocation = (details: string) => {
    if (!location) return;
    
    try {
      // Simulate sending location to emergency services
      setTimeout(() => {
        // Add to history
        addToHistory('emergency', `Emergency location sent to campus security with details: ${details}`, 'pending');
        
        toast.success('Emergency location sent to campus security!', {
          duration: 5000,
        });
      }, 1500);
    } catch (error) {
      console.error('Error sending emergency location:', error);
      toast.error('Failed to send emergency location');
    }
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col items-center justify-center h-full">
        {/* MapBox Token Input Dialog */}
        <MapTokenDialog
          open={showMapTokenDialog}
          onOpenChange={setShowMapTokenDialog}
          mapboxToken={mapboxToken}
          setMapboxToken={setMapboxToken}
          onSubmit={handleTokenSubmit}
        />

        {/* Emergency Dialog */}
        <EmergencyDialog
          open={showEmergencyDialog}
          onOpenChange={setShowEmergencyDialog}
          onSendEmergency={sendEmergencyLocation}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Getting your location...</p>
          </div>
        ) : error ? (
          <div className="text-center text-destructive">{error}</div>
        ) : (
          <div className="flex flex-col items-center space-y-4 w-full">
            {/* Location Information */}
            <LocationInfo 
              address={address} 
              accuracy={accuracy} 
              lastUpdate={lastUpdate}
              location={location}
            />
            
            {/* Map container */}
            <div className="w-full h-64 rounded-md overflow-hidden border">
              {mapboxToken ? (
                <MapVisualizer mapboxToken={mapboxToken} location={location} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                  <Button onClick={() => setShowMapTokenDialog(true)}>
                    Set Mapbox Token to Display Map
                  </Button>
                </div>
              )}
            </div>
            
            {/* Location Actions */}
            <LocationActions
              location={location}
              address={address}
              continuousTracking={continuousTracking}
              onToggleTracking={toggleContinuousTracking}
              onShowEmergencyDialog={() => setShowEmergencyDialog(true)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Map;
