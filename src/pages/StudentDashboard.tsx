import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import EmergencyRequestForm from '@/components/EmergencyRequestForm';
import { formatDistanceToNow } from 'date-fns';

interface MyEmergencyRequest {
  id: string;
  emergency_type: string;
  status: string;
  title: string;
  description: string;
  priority_level: number;
  created_at: string;
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

const StudentDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [myRequests, setMyRequests] = useState<MyEmergencyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [responses, setResponses] = useState<EmergencyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRequests();
    setupRealtime();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('emergency_requests')
        .select('id, emergency_type, status, title, description, priority_level, created_at')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setMyRequests(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('my-emergency-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_requests'
        },
        () => {
          fetchMyRequests();
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
          if (selectedRequest) {
            fetchResponses(selectedRequest);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchResponses = async (requestId: string) => {
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
      .eq('emergency_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching responses:', error);
    } else {
      setResponses(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Student Emergency Dashboard</h1>
            <p className="text-muted-foreground">Submit and track your emergency requests</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {showForm ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Submit Emergency Request</h2>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Back to Dashboard
              </Button>
            </div>
            <EmergencyRequestForm />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Actions</CardTitle>
                <CardDescription>Quick access to emergency services</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Emergency Request
                </Button>
              </CardContent>
            </Card>

            {/* My Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">My Emergency Requests</h2>
                {myRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">No emergency requests</p>
                        <p className="text-sm text-muted-foreground">You haven't submitted any emergency requests yet.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  myRequests.map((request) => (
                    <Card 
                      key={request.id}
                      className={`cursor-pointer transition-colors ${
                        selectedRequest === request.id ? 'border-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedRequest(request.id);
                        fetchResponses(request.id);
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(request.priority_level)}>
                              Priority {request.priority_level}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Responses */}
              <div className="space-y-4">
                {selectedRequest ? (
                  <>
                    <h2 className="text-xl font-semibold">Response Updates</h2>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Staff Responses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {responses.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            No responses yet. Emergency staff will respond shortly.
                          </p>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {responses.map((response) => (
                              <div key={response.id} className="border-l-2 border-primary pl-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="font-medium">{response.profiles?.full_name}</span>
                                  <span>•</span>
                                  <span>{response.profiles?.role?.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span>{formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}</span>
                                </div>
                                <p className="mt-1">{response.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Select an emergency request to view staff responses
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;