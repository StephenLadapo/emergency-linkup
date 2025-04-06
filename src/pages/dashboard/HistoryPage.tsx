
import UserHistory from "@/components/UserHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HistoryPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">History</h2>
      <p className="text-muted-foreground">
        View your emergency history and past interactions with the system.
      </p>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <UserHistory />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
