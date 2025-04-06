
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const NotificationPreferences = () => {
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertType, setAlertType] = useState('both');
  const [language, setLanguage] = useState('en');
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(false);
  
  const handleSavePreferences = () => {
    // In a real app, this would save to a backend or localStorage
    const preferences = {
      vibrationEnabled,
      soundEnabled,
      alertType,
      language,
      textToSpeechEnabled
    };
    
    console.log('Saving preferences:', preferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    toast.success('Preferences saved successfully!');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration" className="cursor-pointer">Vibration Alerts</Label>
              <Switch 
                id="vibration" 
                checked={vibrationEnabled}
                onCheckedChange={setVibrationEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="cursor-pointer">Sound Alerts</Label>
              <Switch 
                id="sound" 
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Alert Type</Label>
            <RadioGroup value={alertType} onValueChange={setAlertType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vibration" id="vibration-only" />
                <Label htmlFor="vibration-only">Vibration Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sound" id="sound-only" />
                <Label htmlFor="sound-only">Sound Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Vibration and Sound</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Language & Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="sw">Swahili</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="tts" className="cursor-pointer">Text-to-Speech</Label>
              <Switch 
                id="tts" 
                checked={textToSpeechEnabled}
                onCheckedChange={setTextToSpeechEnabled}
              />
            </div>
            {textToSpeechEnabled && (
              <p className="text-sm text-muted-foreground">
                Text-to-speech will read notifications aloud when they arrive.
              </p>
            )}
          </div>
          
          <Button onClick={handleSavePreferences} className="w-full">
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
