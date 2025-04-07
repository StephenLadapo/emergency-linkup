
import UserHistory from "@/components/UserHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const HistoryPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">History</h2>
      <p className="text-muted-foreground">
        View your emergency history and past interactions with the system.
      </p>
      
      <Card className={`mt-6 ${isMobile ? 'p-2' : ''}`}>
        <CardHeader className={isMobile ? 'py-3 px-3' : ''}>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'p-3' : ''}>
          <UserHistory />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
