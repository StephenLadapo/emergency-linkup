
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, Calendar, MapPin, Mic, Shield, Clock, History } from "lucide-react";
import { Button } from "./ui/button";

type HistoryItem = {
  id: number;
  type: 'emergency' | 'login' | 'location' | 'audio' | 'profile' | 'contact';
  timestamp: string;
  description: string;
  status?: 'resolved' | 'cancelled' | 'pending';
};

const UserHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  useEffect(() => {
    // Load history from localStorage
    const loadHistory = () => {
      try {
        const storedHistory = localStorage.getItem('userHistory');
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    
    loadHistory();
    
    // Set up event listener for history updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userHistory') {
        loadHistory();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
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
    const icons: Record<string, JSX.Element> = {
      'emergency': <AlertTriangle className="h-5 w-5 text-red-500" />,
      'login': <Shield className="h-5 w-5 text-blue-500" />,
      'location': <MapPin className="h-5 w-5 text-green-500" />,
      'audio': <Mic className="h-5 w-5 text-purple-500" />,
      'profile': <Shield className="h-5 w-5 text-amber-500" />,
      'contact': <Bell className="h-5 w-5 text-cyan-500" />
    };
    
    return icons[type] || <History className="h-5 w-5 text-gray-500" />;
  };
  
  const clearHistory = () => {
    localStorage.setItem('userHistory', JSON.stringify([]));
    setHistory([]);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" /> Activity History
          </CardTitle>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              Clear History
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 border-b last:border-b-0">
                  <div className="mt-1">{getTypeIcon(item.type)}</div>
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
              <div className="text-center text-muted-foreground py-10">
                <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No activity history available</p>
                <p className="text-sm">Your emergency system activity will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserHistory;
