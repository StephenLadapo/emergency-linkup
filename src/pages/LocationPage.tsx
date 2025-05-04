
import Map from "@/components/Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LocationPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-muted-foreground">
        View your current location and share it with emergency services or contacts.
      </p>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Current Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md overflow-hidden border">
            <Map />
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Map image provided by University of Limpopo Student</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPage;
