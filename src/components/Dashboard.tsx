
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map from './Map';
import AudioRecorder from './AudioRecorder';
import ChatBot from './ChatBot';
import MessageCenter from './MessageCenter';
import EmergencyButton from './EmergencyButton';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  
  return (
    <div className="container py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardContent className="p-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="map">Location</TabsTrigger>
                <TabsTrigger value="audio">Record Audio</TabsTrigger>
                <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              </TabsList>
              <div className="mt-4 h-[400px]">
                <TabsContent value="map" className="h-full m-0">
                  <Map />
                </TabsContent>
                <TabsContent value="audio" className="h-full m-0">
                  <AudioRecorder />
                </TabsContent>
                <TabsContent value="chat" className="h-full m-0">
                  <ChatBot />
                </TabsContent>
              </div>
            </CardContent>
          </Tabs>
        </Card>
        
        <Card className="h-[492px]"> {/* Match height with the tabs card */}
          <CardContent className="p-4 h-full">
            <MessageCenter />
          </CardContent>
        </Card>
      </div>
      
      <EmergencyButton />
    </div>
  );
};

export default Dashboard;
