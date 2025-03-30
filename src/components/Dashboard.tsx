
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Mic, MessagesSquare } from 'lucide-react';
import Map from './Map';
import AudioRecorder from './AudioRecorder';
import ChatBot from './ChatBot';
import MessageCenter from './MessageCenter';
import EmergencyButton from './EmergencyButton';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Emergency Dashboard</h1>
        <div className="bg-muted/50 p-2 rounded-md text-sm flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          <span>Campus Location Active</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border shadow-md rounded-xl overflow-hidden">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardContent className="p-4">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" /> Record Audio
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4" /> AI Assistant
                </TabsTrigger>
              </TabsList>
              <div className="mt-4 h-[450px] rounded-md overflow-hidden border">
                <TabsContent value="map" className="h-full m-0 p-0">
                  <Map />
                </TabsContent>
                <TabsContent value="audio" className="h-full m-0 p-4 bg-muted/20">
                  <AudioRecorder />
                </TabsContent>
                <TabsContent value="chat" className="h-full m-0 p-0">
                  <ChatBot />
                </TabsContent>
              </div>
            </CardContent>
          </Tabs>
        </Card>
        
        <Card className="shadow-md rounded-xl overflow-hidden border">
          <CardContent className="p-0">
            <div className="bg-secondary/10 p-4 border-b">
              <h2 className="font-semibold flex items-center">
                <MessagesSquare className="h-4 w-4 mr-2" /> 
                Message Center
              </h2>
            </div>
            <div className="p-4 h-[450px]">
              <MessageCenter />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EmergencyButton />
    </div>
  );
};

export default Dashboard;
