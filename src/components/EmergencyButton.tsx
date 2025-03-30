
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Shield, Stethoscope, BadgeAlert } from "lucide-react";
import { toast } from "sonner";

const COUNTDOWN_TIME = 5; // seconds

const EmergencyButton = () => {
  const [open, setOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get current location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Couldn't access your location. Please enable location services.");
        }
      );
    }
  }, []);

  useEffect(() => {
    let timer: number;
    if (isSending && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isSending && countdown === 0) {
      sendEmergencyRequest();
    }
    return () => clearTimeout(timer);
  }, [isSending, countdown]);

  const startCountdown = () => {
    if (!emergencyType) {
      toast.error("Please select an emergency type");
      return;
    }
    setIsSending(true);
  };

  const cancelRequest = () => {
    setIsSending(false);
    setCountdown(COUNTDOWN_TIME);
    toast.info("Emergency request canceled");
  };

  const sendEmergencyRequest = async () => {
    try {
      // In a real app, this would send the request to your backend
      console.log("Sending emergency request:", {
        type: emergencyType,
        location,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Emergency request sent! Help is on the way.");
      setOpen(false);
      setIsSending(false);
      setCountdown(COUNTDOWN_TIME);
      setEmergencyType(null);
    } catch (error) {
      console.error("Error sending emergency request:", error);
      toast.error("Failed to send emergency request. Please try again.");
      setIsSending(false);
      setCountdown(COUNTDOWN_TIME);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-10">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="lg"
            className="rounded-full h-16 w-16 animate-pulse-slow shadow-lg"
          >
            SOS
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-destructive">
              Emergency Assistance
            </DialogTitle>
          </DialogHeader>
          
          {!isSending ? (
            <div className="space-y-6">
              <div className="text-center text-sm text-muted-foreground">
                Select the type of emergency you're experiencing:
              </div>
              
              <RadioGroup value={emergencyType || ""} onValueChange={setEmergencyType} className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="security" id="security" />
                  <Label htmlFor="security" className="flex items-center cursor-pointer">
                    <Shield className="h-5 w-5 mr-2 text-destructive" /> 
                    Security Emergency
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="medical" id="medical" />
                  <Label htmlFor="medical" className="flex items-center cursor-pointer">
                    <Stethoscope className="h-5 w-5 mr-2 text-secondary" /> 
                    Medical Emergency
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="flex items-center cursor-pointer">
                    <BadgeAlert className="h-5 w-5 mr-2 text-amber-500" /> 
                    Other Emergency
                  </Label>
                </div>
              </RadioGroup>
              
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={startCountdown}
              >
                Request Help Now
              </Button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="text-2xl font-bold">{countdown}</div>
              <div className="text-muted-foreground">
                Help will be requested in {countdown} seconds
              </div>
              <div className="text-sm">
                Your current location will be shared with emergency responders
              </div>
              <Button variant="outline" onClick={cancelRequest} className="w-full">
                Cancel Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyButton;
