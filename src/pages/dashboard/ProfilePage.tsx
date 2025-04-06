
import UserProfile from "@/components/UserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">User Profile</h2>
      <p className="text-muted-foreground">
        Manage your personal information, emergency contacts, and medical history.
      </p>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfile />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
