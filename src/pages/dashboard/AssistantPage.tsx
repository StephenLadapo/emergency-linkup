
import ChatBot from "@/components/ChatBot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const AssistantPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">AI Assistant</h2>
      <p className="text-muted-foreground">
        Get emergency guidance and first aid instructions from our AI assistant.
      </p>
      
      <Card className={`mt-6 ${isMobile ? 'p-0' : ''}`}>
        <CardHeader className={isMobile ? 'py-3 px-3' : ''}>
          <CardTitle>Chat with Assistant</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={`${isMobile ? 'h-[400px]' : 'h-[450px]'} rounded-md overflow-hidden`}>
            <ChatBot />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantPage;
