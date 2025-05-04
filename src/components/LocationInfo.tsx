
import { MapPin } from "lucide-react";

interface LocationInfoProps {
  address: string | null;
  accuracy: number | null;
  lastUpdate: Date | null;
  location: { lat: number; lng: number } | null;
}

const LocationInfo = ({ 
  address, 
  accuracy, 
  lastUpdate, 
  location 
}: LocationInfoProps) => {
  return (
    <>
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

      {location && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Current coordinates:</p>
          <p className="font-mono mt-1">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}
    </>
  );
};

export default LocationInfo;
