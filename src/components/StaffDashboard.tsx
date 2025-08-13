import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, User, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyRequest {
  id: string;
  emergency_type: string;
  status: string;
  title: string;
  description: string;
  location_lat: number;
  location_lng: number;
  priority_level: number;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
  } | null;
}

interface EmergencyResponse {
  id: string;
  message: string;
  created_at: string;
  profiles: {
    full_name: string;
    role: string;
  };
}

const StaffDashboard = () => {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [responses, setResponses] = useState<EmergencyResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchUserRole();
    fetchEmergencies();
    setupRealtime();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.role);
      }
    }
  };

  const fetchEmergencies = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_requests')
        .select(`
          id,
          emergency_type,
          status,
          title,
          description,
          location_lat,
          location_lng,
          priority_level,
          created_at,
          profiles:student_id (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching emergencies:', error);
        toast.error('Failed to fetch emergency requests');
      } else {
        // Type the data properly to match our interface
        const typedData: EmergencyRequest[] = (data || []).map(item => ({
          ...item,
          profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) && 'full_name' in item.profiles
            ? item.profiles as { full_name: string; phone: string }
            : null
        }));
        setEmergencies(typedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('emergency-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_requests'
        },
        () => {
          fetchEmergencies();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_responses'
        },
        () => {
          if (selectedEmergency) {
            fetchResponses(selectedEmergency);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchResponses = async (emergencyId: string) => {
    const { data, error } = await supabase
      .from('emergency_responses')
      .select(`
        id,
        message,
        created_at,
        profiles:responder_id (
          full_name,
          role
        )
      `)
      .eq('emergency_id', emergencyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching responses:', error);
    } else {
      setResponses(data || []);
    }
  };

  const updateEmergencyStatus = async (emergencyId: string, newStatus: 'pending' | 'in_progress' | 'resolved' | 'cancelled') => {
    const { error } = await supabase
      .from('emergency_requests')
      .update({ 
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
      })
      .eq('id', emergencyId);

    if (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update emergency status');
    } else {
      toast.success(`Emergency status updated to ${newStatus}`);
      fetchEmergencies();
    }
  };

  const sendResponse = async () => {
    if (!newResponse.trim() || !selectedEmergency) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('emergency_responses')
        .insert({
          emergency_id: selectedEmergency,
          responder_id: profile.id,
          message: newResponse,
        });

      if (error) {
        console.error('Error sending response:', error);
        toast.error('Failed to send response');
      } else {
        setNewResponse('');
        toast.success('Response sent successfully');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAccessEmergency = (emergencyType: string) => {
    if (userRole === 'admin') return true;
    if (userRole === 'medical_staff' && (emergencyType === 'medical' || emergencyType === 'fire' || emergencyType === 'both')) return true;
    if (userRole === 'security_staff' && (emergencyType === 'security' || emergencyType === 'fire' || emergencyType === 'both')) return true;
    return false;
  };

  const filteredEmergencies = emergencies.filter(emergency => canAccessEmergency(emergency.emergency_type));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading emergency requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emergency Response Dashboard</h1>
          <p className="text-muted-foreground">
            Role: {userRole.replace('_', ' ').toUpperCase()} | Active Emergencies: {filteredEmergencies.filter(e => e.status !== 'resolved').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Emergency Requests</h2>
          {filteredEmergencies.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No emergency requests at this time</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredEmergencies.map((emergency) => (
              <Card 
                key={emergency.id}
                className={`cursor-pointer transition-colors ${
                  selectedEmergency === emergency.id ? 'border-primary' : ''
                }`}
                onClick={() => {
                  setSelectedEmergency(emergency.id);
                  fetchResponses(emergency.id);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{emergency.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(emergency.priority_level)}>
                        Priority {emergency.priority_level}
                      </Badge>
                      <Badge className={getStatusColor(emergency.status)}>
                        {emergency.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {emergency.profiles?.full_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(emergency.created_at), { addSuffix: true })}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{emergency.description}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {emergency.location_lat?.toFixed(6)}, {emergency.location_lng?.toFixed(6)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Emergency Details */}
        <div className="space-y-4">
          {selectedEmergency ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Emergency Response</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEmergencyStatus(selectedEmergency, 'in_progress')}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEmergencyStatus(selectedEmergency, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>

              {/* Responses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Response History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {responses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No responses yet. Be the first to respond.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {responses.map((response) => (
                        <div key={response.id} className="border-l-2 border-primary pl-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">{response.profiles?.full_name}</span>
                            <span>•</span>
                            <span>{response.profiles?.role}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}</span>
                          </div>
                          <p className="mt-1">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your response..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={sendResponse} disabled={!newResponse.trim()}>
                      Send Response
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select an emergency request to view details and respond
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;