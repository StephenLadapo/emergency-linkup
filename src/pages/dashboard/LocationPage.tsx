
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
          <div className="h-[450px] rounded-md overflow-hidden border">
            <Map />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPage;
