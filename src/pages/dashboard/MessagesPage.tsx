
import MessageCenter from "@/components/MessageCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MessagesPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Message Center</h2>
      <p className="text-muted-foreground">
        View and manage your emergency communications and notifications.
      </p>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageCenter />
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesPage;
