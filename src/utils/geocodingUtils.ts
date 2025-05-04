
interface Location {
  lat: number;
  lng: number;
}

// Mock function to simulate address lookup from coordinates
export const fetchAddressFromCoordinates = async (location: Location): Promise<string> => {
  // In a real app, this would use the Mapbox Geocoding API
  // For now, we'll simulate it with a mock address based on coordinates
  return new Promise((resolve) => {
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
      
      resolve(addresses[index]);
    }, 500);
  });
};
