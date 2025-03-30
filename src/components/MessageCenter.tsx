
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: number;
  text: string;
  sender: 'student' | 'responder';
  timestamp: Date;
  read: boolean;
};

const MessageCenter = () => {
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    security: [
      {
        id: 1,
        text: "Hello, we've received your emergency alert. A security team has been dispatched to your location.",
        sender: 'responder',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
      }
    ],
    medical: [
      {
        id: 1,
        text: "Hi there, this is the medical response team. We're on our way. Please stay calm and follow any first aid instructions from the AI assistant.",
        sender: 'responder',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        read: false,
      }
    ]
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('security');
  const [unreadCounts, setUnreadCounts] = useState({ security: 1, medical: 1 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Mark messages as read when tab is selected
  useEffect(() => {
    if (activeTab && messages[activeTab]) {
      const updatedMessages = messages[activeTab].map(msg => ({
        ...msg,
        read: true
      }));
      
      setMessages(prev => ({
        ...prev,
        [activeTab]: updatedMessages
      }));
      
      // Update unread counts
      setUnreadCounts(prev => ({
        ...prev,
        [activeTab]: 0
      }));
    }
  }, [activeTab]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeTab) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'student',
      timestamp: new Date(),
      read: true
    };
    
    setMessages(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), userMessage]
    }));
    
    setNewMessage('');
    
    // Simulate response (in a real app, this would come from a server)
    setTimeout(() => {
      let responseText = '';
      
      if (activeTab === 'security') {
        responseText = "Thank you for the update. The security team is still en route to your location. Please stay where you are if it's safe to do so.";
      } else if (activeTab === 'medical') {
        responseText = "The medical team is about 2 minutes away. Please continue any first aid measures as directed by the AI assistant.";
      }
      
      if (responseText) {
        const responderMessage: Message = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'responder',
          timestamp: new Date(),
          read: activeTab === activeTab // Only mark as read if on current tab
        };
        
        setMessages(prev => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), responderMessage]
        }));
        
        // Update unread count if not on this tab
        if (activeTab !== activeTab) {
          setUnreadCounts(prev => ({
            ...prev,
            [activeTab]: prev[activeTab] + 1
          }));
        }
      }
    }, 3000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Message Center
        </CardTitle>
        <CardDescription>
          Communicate with emergency responders
        </CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow">
        <div className="px-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="security" className="relative">
              Security
              {unreadCounts.security > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadCounts.security}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="medical" className="relative">
              Medical
              {unreadCounts.medical > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadCounts.medical}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="security" className="flex-grow flex flex-col mt-0 overflow-hidden">
          <ScrollArea className="flex-grow px-4 py-2">
            <div className="space-y-4">
              {messages.security && messages.security.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[80%] rounded-lg px-4 py-2 
                      ${message.sender === 'student' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'student' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.sender === 'student' ? 'You' : 'Security Team'}
                      </span>
                      <span className="text-xs opacity-50 ml-auto">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="medical" className="flex-grow flex flex-col mt-0 overflow-hidden">
          <ScrollArea className="flex-grow px-4 py-2">
            <div className="space-y-4">
              {messages.medical && messages.medical.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[80%] rounded-lg px-4 py-2 
                      ${message.sender === 'student' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'student' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.sender === 'student' ? 'You' : 'Medical Team'}
                      </span>
                      <span className="text-xs opacity-50 ml-auto">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </TabsContent>
        
        <div className="p-4 pt-0 border-t mt-auto">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>
    </Card>
  );
};

export default MessageCenter;
