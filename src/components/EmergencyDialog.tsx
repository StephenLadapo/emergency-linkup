
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";

interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendEmergency: (details: string) => void;
}

const EmergencyDialog = ({
  open,
  onOpenChange,
  onSendEmergency
}: EmergencyDialogProps) => {
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [emergencySent, setEmergencySent] = useState(false);

  const handleSend = () => {
    onSendEmergency(emergencyDetails);
    setEmergencySent(true);
    
    // Reset after a delay
    setTimeout(() => {
      setEmergencyDetails('');
      setEmergencySent(false);
      onOpenChange(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Send Emergency Location
          </DialogTitle>
        </DialogHeader>
        
        {!emergencySent ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="emergencyDetails">Emergency Details (Optional)</Label>
              <Input 
                id="emergencyDetails"
                placeholder="Briefly describe your emergency situation"
                value={emergencyDetails}
                onChange={(e) => setEmergencyDetails(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleSend} 
                className="w-full"
              >
                <Shield className="mr-2 h-4 w-4" />
                Send Emergency Location
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="font-medium text-green-700">
              Emergency location successfully sent!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Campus security has been notified.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyDialog;
