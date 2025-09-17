import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Phone, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useEmergencyRequest, EmergencyRequest } from '@/hooks/useEmergencyRequest';
import { toast } from 'sonner';

const HistoryPage = () => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { getEmergencyRequests } = useEmergencyRequest();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getEmergencyRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load emergency history');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEmergencyTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'security':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'fire':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'both':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Emergency History</h2>
        <p className="text-muted-foreground">
          View your past emergency requests and their current status.
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Emergency History</h3>
            <p className="text-muted-foreground text-center">
              You haven't made any emergency requests yet. When you do, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(request.created_at!).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                    </Badge>
                    <Badge className={getEmergencyTypeColor(request.emergency_type)}>
                      <span className="capitalize">{request.emergency_type}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {request.description && (
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                  </div>
                )}
                
                {request.location_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-sm">Location</h4>
                      <p className="text-sm text-muted-foreground">{request.location_address}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Priority: {request.priority_level}/5</span>
                    {request.updated_at && request.updated_at !== request.created_at && (
                      <span>Updated: {new Date(request.updated_at).toLocaleString()}</span>
                    )}
                  </div>
                  
                  {request.status === 'resolved' && request.resolved_at && (
                    <div className="text-sm text-green-600">
                      Resolved: {new Date(request.resolved_at).toLocaleString()}
                    </div>
                  )}
                </div>
                
                {request.audio_transcription && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-1 text-sm">Audio Transcription</h4>
                      <p className="text-sm text-muted-foreground italic">
                        "{request.audio_transcription}"
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;