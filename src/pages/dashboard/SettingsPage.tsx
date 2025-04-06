
import NotificationPreferences from "@/components/NotificationPreferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <p className="text-muted-foreground">
        Customize app settings, notification preferences, and accessibility options.
      </p>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationPreferences />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
