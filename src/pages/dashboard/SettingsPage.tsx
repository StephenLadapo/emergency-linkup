import NotificationPreferences from "@/components/NotificationPreferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Shield, Clock, Eye, EyeOff } from "lucide-react";
import TwoFactorAuth from "@/components/TwoFactorAuth";
import { disable2FA } from "@/lib/auth";

const SettingsPage = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [screenshotProtection, setScreenshotProtection] = useState(userProfile?.screenshot_protection ?? true);
  const [sessionTimeout, setSessionTimeout] = useState(userProfile?.session_timeout_minutes ?? 10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update state when userProfile changes
    if (userProfile) {
      setScreenshotProtection(userProfile.screenshot_protection ?? true);
      setSessionTimeout(userProfile.session_timeout_minutes ?? 10);
    }
  }, [userProfile]);

  const handleToggle2FA = async () => {
    if (!user || !userProfile) return;

    if (userProfile.two_factor_enabled) {
      // Disable 2FA
      setLoading(true);
      try {
        await disable2FA(user.id);
        await updateProfile({ two_factor_enabled: false });
        toast.success('Two-factor authentication disabled');
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        toast.error('Failed to disable two-factor authentication');
      } finally {
        setLoading(false);
      }
    } else {
      // Enable 2FA
      setShow2FASetup(true);
    }
  };

  const handle2FASetupSuccess = async () => {
    setShow2FASetup(false);
    if (updateProfile) {
      await updateProfile({ two_factor_enabled: true });
    }
  };

  const handleScreenshotProtectionChange = (enabled: boolean) => {
    setScreenshotProtection(enabled);
    
    // Update in database
    if (updateProfile) {
      updateProfile({ screenshot_protection: enabled }).catch((error) => {
        console.error('Error updating screenshot protection:', error);
        toast.error('Failed to update screenshot protection setting');
      });
    }
    
    toast.success(`Screenshot protection ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleSessionTimeoutChange = (minutes: number) => {
    setSessionTimeout(minutes);
    
    // Update in database
    if (updateProfile) {
      updateProfile({ session_timeout_minutes: minutes }).catch((error) => {
        console.error('Error updating session timeout:', error);
        toast.error('Failed to update session timeout setting');
      });
    }
    
    toast.success(`Session timeout set to ${minutes} minutes`);
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-muted-foreground">
          Customize app settings, security preferences, and accessibility options.
        </p>
        
        {/* Security Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                {userProfile?.two_factor_enabled && (
                  <Badge variant="secondary" className="mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleToggle2FA}
                disabled={loading}
                variant={userProfile?.two_factor_enabled ? "destructive" : "default"}
              >
                {loading ? 'Processing...' : userProfile?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>

            {/* Session Timeout */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label className="text-base font-medium">Session Timeout</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically log out after inactivity (requires page refresh to take effect)
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={sessionTimeout}
                  onChange={(e) => handleSessionTimeoutChange(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value={3}>3 minutes</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </div>

            {/* Screenshot Protection */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {screenshotProtection ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Label className="text-base font-medium">Screenshot Protection</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prevent screenshots on sensitive pages
                </p>
              </div>
              <Switch
                checked={screenshotProtection}
                onCheckedChange={handleScreenshotProtectionChange}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationPreferences />
          </CardContent>
        </Card>
      </div>
      
      {/* Two-Factor Authentication Setup Modal */}
      {show2FASetup && user && (
        <TwoFactorAuth
          isOpen={show2FASetup}
          onClose={() => setShow2FASetup(false)}
          onSuccess={handle2FASetupSuccess}
          userId={user.id}
          mode="setup"
        />
      )}
    </>
  );
};

export default SettingsPage;