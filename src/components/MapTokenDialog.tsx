
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MapTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  onSubmit: () => void;
}

const MapTokenDialog = ({
  open,
  onOpenChange,
  mapboxToken,
  setMapboxToken,
  onSubmit
}: MapTokenDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Mapbox Access Token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="mapboxToken">Mapbox Access Token</Label>
            <Input 
              id="mapboxToken"
              placeholder="Enter your Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You can find your public token at 
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                mapbox.com
              </a>
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={onSubmit} 
              className="w-full"
            >
              Save Token
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapTokenDialog;
