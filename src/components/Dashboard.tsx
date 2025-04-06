
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Mic, MessagesSquare, User, Bell, History, Settings } from 'lucide-react';
import Map from './Map';
import AudioRecorder from './AudioRecorder';
import ChatBot from './ChatBot';
import MessageCenter from './MessageCenter';
import EmergencyButton from './EmergencyButton';
import UserProfile from './UserProfile';
import NotificationPreferences from './NotificationPreferences';
import UserHistory from './UserHistory';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [unusualSoundDetected, setUnusualSoundDetected] = useState(false);
  const [countdownTime, setCountdownTime] = useState(160);
  const [isSoundDetectionActive, setIsSoundDetectionActive] = useState(false);
  
  // Simulate countdown when unusual sound is detected
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (unusualSoundDetected && countdownTime > 0) {
      timer = setTimeout(() => {
        setCountdownTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (countdownTime === 0) {
      // Here you would trigger emergency protocols
      console.log('Emergency protocol initiated');
      setUnusualSoundDetected(false);
      setCountdownTime(160);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [unusualSoundDetected, countdownTime]);

  const handleSoundDetection = (isActive: boolean) => {
    setIsSoundDetectionActive(isActive);
    
    // For demonstration purposes, simulate unusual sound detection after 5 seconds
    if (isActive) {
      setTimeout(() => {
        setUnusualSoundDetected(true);
      }, 5000);
    } else {
      setUnusualSoundDetected(false);
      setCountdownTime(160);
    }
  };
  
  const confirmEmergency = () => {
    console.log('Emergency confirmed by user');
    // Here you would implement the actual emergency protocol
    setUnusualSoundDetected(false);
    setCountdownTime(160);
  };
  
  const cancelEmergency = () => {
    console.log('Emergency cancelled by user - false alarm');
    setUnusualSoundDetected(false);
    setCountdownTime(160);
  };
  
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Emergency Dashboard</h1>
        <div className="bg-muted/50 p-2 rounded-md text-sm flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          <span>Campus Location Active</span>
        </div>
      </div>
      
      {unusualSoundDetected && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg animate-pulse">
          <CardContent className="p-4 flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Unusual Sound Detected!</h2>
            <p className="mb-4">Emergency services will be contacted in {countdownTime} seconds if not cancelled.</p>
            <div className="flex space-x-4">
              <button 
                onClick={cancelEmergency}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                False Alarm
              </button>
              <button 
                onClick={confirmEmergency}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                I Need Help
              </button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border shadow-md rounded-xl overflow-hidden">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardContent className="p-4">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" /> Record Audio
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4" /> AI Assistant
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile
                </TabsTrigger>
              </TabsList>
              <div className="mt-4 h-[450px] rounded-md overflow-hidden border">
                <TabsContent value="map" className="h-full m-0 p-0">
                  <Map />
                </TabsContent>
                <TabsContent value="audio" className="h-full m-0 p-4 bg-muted/20">
                  <AudioRecorder onSoundDetectionChange={handleSoundDetection} />
                  {isSoundDetectionActive && (
                    <div className="bg-amber-100 p-2 rounded mt-4 text-sm text-center">
                      Sound detection is active. Unusual sounds will trigger an emergency alert.
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="chat" className="h-full m-0 p-0">
                  <ChatBot />
                </TabsContent>
                <TabsContent value="profile" className="h-full m-0 p-4 overflow-y-auto">
                  <UserProfile />
                </TabsContent>
              </div>
            </CardContent>
          </Tabs>
        </Card>
        
        <Card className="shadow-md rounded-xl overflow-hidden border">
          <CardContent className="p-0">
            <Tabs defaultValue="messages">
              <div className="bg-secondary/10 p-2 border-b">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="messages" className="text-xs">
                    <MessagesSquare className="h-3 w-3 mr-1" /> Messages
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">
                    <History className="h-3 w-3 mr-1" /> History
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" /> Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="h-[450px] overflow-y-auto">
                <TabsContent value="messages" className="m-0 p-0 h-full">
                  <div className="p-4">
                    <MessageCenter />
                  </div>
                </TabsContent>
                <TabsContent value="history" className="m-0 p-0 h-full">
                  <div className="p-4">
                    <UserHistory />
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="m-0 p-0 h-full">
                  <div className="p-4">
                    <NotificationPreferences />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <EmergencyButton />
    </div>
  );
};

export default Dashboard;
