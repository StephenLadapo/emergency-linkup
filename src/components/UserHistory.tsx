
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type HistoryItem = {
  id: number;
  type: 'emergency' | 'login' | 'location' | 'audio';
  timestamp: string;
  description: string;
  status?: 'resolved' | 'cancelled' | 'pending';
};

const UserHistory = () => {
  // Mock history data
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 1,
      type: 'emergency',
      timestamp: '2023-08-15 14:30',
      description: 'Emergency alert triggered',
      status: 'resolved'
    },
    {
      id: 2,
      type: 'login',
      timestamp: '2023-08-15 10:15',
      description: 'Logged in from campus wifi'
    },
    {
      id: 3,
      type: 'location',
      timestamp: '2023-08-14 16:45',
      description: 'Location shared with campus security'
    },
    {
      id: 4,
      type: 'audio',
      timestamp: '2023-08-13 20:10',
      description: 'Unusual sound detected',
      status: 'cancelled'
    },
    {
      id: 5,
      type: 'emergency',
      timestamp: '2023-08-10 08:23',
      description: 'Emergency button pressed',
      status: 'resolved'
    }
  ]);
  
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, string> = {
      'resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
      'pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
    };
    
    return (
      <Badge className={variants[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'emergency': '🚨',
      'login': '🔑',
      'location': '📍',
      'audio': '🔊'
    };
    
    return icons[type] || '📝';
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 border-b last:border-b-0">
                  <div className="text-xl">{getTypeIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{item.description}</p>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No history available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserHistory;
