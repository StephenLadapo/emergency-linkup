import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Phone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const EmergencyRequestForm = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    emergency_type: '',
    title: '',
    description: '',
    priority_level: 3,
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location. Please enable location services.');
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to submit an emergency request');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast.error('Profile not found. Please contact support.');
        return;
      }

      const { error } = await supabase
        .from('emergency_requests')
        .insert({
          student_id: profile.id,
          emergency_type: formData.emergency_type as any,
          title: formData.title,
          description: formData.description,
          priority_level: formData.priority_level,
          location_lat: location?.lat,
          location_lng: location?.lng,
        });

      if (error) {
        console.error('Error submitting emergency request:', error);
        toast.error('Failed to submit emergency request');
      } else {
        toast.success('Emergency request submitted successfully! Help is on the way.');
        setFormData({
          emergency_type: '',
          title: '',
          description: '',
          priority_level: 3,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const emergencyTypes = [
    { value: 'medical', label: 'Medical Emergency', color: 'text-red-600' },
    { value: 'security', label: 'Security Issue', color: 'text-orange-600' },
    { value: 'fire', label: 'Fire Emergency', color: 'text-red-800' },
    { value: 'both', label: 'Medical & Security', color: 'text-purple-600' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-6 w-6" />
          Emergency Request
        </CardTitle>
        <CardDescription>
          Submit an emergency request for immediate assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Type *</label>
            <Select
              value={formData.emergency_type}
              onValueChange={(value) => setFormData({ ...formData, emergency_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                {emergencyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className={type.color}>{type.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brief Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Medical assistance needed"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide additional details about the emergency..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority Level</label>
            <Select
              value={formData.priority_level.toString()}
              onValueChange={(value) => setFormData({ ...formData, priority_level: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Low Priority</SelectItem>
                <SelectItem value="2">Medium-Low Priority</SelectItem>
                <SelectItem value="3">Medium Priority</SelectItem>
                <SelectItem value="4">High Priority</SelectItem>
                <SelectItem value="5">Critical Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {location 
                  ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                  : 'Getting location...'
                }
              </span>
            </div>
          </div>

          <Alert>
            <Phone className="h-4 w-4" />
            <AlertDescription>
              For immediate life-threatening emergencies, call 911 directly. This form is for campus-specific emergency response.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={loading || !location}
          >
            {loading ? 'Submitting...' : 'Submit Emergency Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmergencyRequestForm;