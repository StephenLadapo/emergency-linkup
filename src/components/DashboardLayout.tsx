
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, MapPin, Moon, Sun } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import EmergencyButton from "./EmergencyButton";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "./ui/use-toast";

const DashboardLayout = () => {
  const [unusualSoundDetected, setUnusualSoundDetected] = useState(false);
  const [countdownTime, setCountdownTime] = useState(160);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Redirect to profile page if on the base dashboard path
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/profile', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  // Set dark mode based on user preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-h-screen">
        <DashboardSidebar />
        <SidebarInset className="py-6 px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 lg:hidden" />
              <h1 className="text-2xl font-bold">Emergency Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-red-500">
                <LogOut className="h-5 w-5" />
              </Button>
              <div className="bg-muted/50 p-2 rounded-md text-sm flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Campus Location Active</span>
              </div>
            </div>
          </div>
          
          {unusualSoundDetected && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg animate-pulse mb-6">
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
          
          <Outlet />
          <EmergencyButton />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
