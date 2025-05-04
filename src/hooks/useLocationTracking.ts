
import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface LocationTrackingOptions {
  onLocationUpdate?: (location: Location, accuracy: number) => void;
  onError?: (error: string) => void;
  addToHistory?: (type: string, description: string, status?: string) => void;
}

export const useLocationTracking = ({ 
  onLocationUpdate,
  onError,
  addToHistory
}: LocationTrackingOptions = {}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [continuousTracking, setContinuousTracking] = useState(false);

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setLoading(false);
      return;
    }

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
        setLoading(false);
        
        if (onLocationUpdate) {
          onLocationUpdate(newLocation, position.coords.accuracy);
        }
        
        if (addToHistory) {
          addToHistory('location', 'Location tracked successfully');
        }
      },
      (err) => {
        console.error('Error getting location:', err);
        const errorMsg = 'Unable to access your location. Please enable location services.';
        setError(errorMsg);
        if (onError) onError(errorMsg);
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
        setLoading(false);
        
        if (onLocationUpdate) {
          onLocationUpdate(newLocation, position.coords.accuracy);
        }
      },
      (err) => {
        console.error('Error watching location:', err);
        const errorMsg = 'Location tracking error. Please try again.';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    setWatchId(id);
  };

  const toggleContinuousTracking = (enabled: boolean) => {
    setContinuousTracking(enabled);
    
    if (enabled) {
      startLocationTracking();
      if (addToHistory) {
        addToHistory('location', 'Continuous location tracking enabled');
      }
    } else if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      if (addToHistory) {
        addToHistory('location', 'Continuous location tracking disabled');
      }
    }

    return enabled;
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return { 
    location,
    accuracy,
    loading,
    error,
    lastUpdate,
    continuousTracking,
    startLocationTracking,
    toggleContinuousTracking
  };
};
