
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapVisualizerProps {
  mapboxToken: string;
  location: { lat: number; lng: number } | null;
}

const MapVisualizer = ({ mapboxToken, location }: MapVisualizerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!mapboxToken || !location || !mapContainer.current) return;
    
    if (!mapInitializedRef.current) {
      mapboxgl.accessToken = mapboxToken;
    
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [location.lng, location.lat],
        zoom: 15
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create a marker for the user's location
      marker.current = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current);

      mapInitializedRef.current = true;
    } else if (map.current && marker.current && location) {
      // Update marker position and map center
      marker.current.setLngLat([location.lng, location.lat]);
      map.current.setCenter([location.lng, location.lat]);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        mapInitializedRef.current = false;
      }
    };
  }, [location, mapboxToken]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

export default MapVisualizer;
