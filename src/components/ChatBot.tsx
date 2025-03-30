
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from 'lucide-react';
import { toast } from "sonner";

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your emergency assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock first aid responses - in a real app, this would use a proper AI service
  const firstAidResponses: Record<string, string> = {
    'bleeding': "Apply direct pressure to the wound using a clean cloth or bandage. Keep the pressure on until help arrives. If the wound is severe, lie down and elevate the injured area above heart level if possible.",
    'burn': "Run cool (not cold) water over the burn for about 10 minutes. Don't use ice. Cover the burn with a clean, dry bandage. Don't apply ointments unless directed by medical professionals.",
    'choking': "If someone is choking and cannot speak, breathe, or cough, stand behind them and give 5 back blows between their shoulder blades with the heel of your hand. If that doesn't work, give 5 abdominal thrusts (Heimlich maneuver).",
    'heart attack': "Have the person sit down, rest, and try to keep calm. Loosen any tight clothing. If the person takes medication for a heart condition, such as nitroglycerin, have them take it. Call for emergency medical help immediately.",
    'fracture': "Don't move the injured area. Keep it stable and supported. Apply ice wrapped in a cloth to reduce swelling. Wait for medical help.",
    'seizure': "Move furniture or other objects away from the person. Gently roll them onto their side if possible. Don't restrain them or put anything in their mouth. Time the seizure if possible.",
    'snake bite': "Keep the bite victim calm and still. The affected limb should be kept below heart level. Remove any jewelry or tight clothing near the bite. Do not apply a tourniquet or try to suck out the venom.",
    'unconscious': "Check their breathing. If they're not breathing, begin CPR if you're trained. If they are breathing, place them in the recovery position (on their side). Call emergency services immediately.",
    'shock': "Have the person lie down. Keep them warm with a blanket. Elevate their feet about 12 inches unless you suspect head, neck, back injuries or broken bones. Do not give them anything to eat or drink.",
    'asthma': "Help the person sit in an upright position. Assist them in using their rescue inhaler if available. Encourage slow, deep breathing. If symptoms worsen or don't improve quickly, seek emergency help.",
    'allergic reaction': "If the person has an epinephrine auto-injector (like an EpiPen), help them use it according to instructions. Even if symptoms improve, medical attention is still needed. Help them sit or lie in a comfortable position.",
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate response based on user message
      let botResponse = "I'm here to help in emergencies. Can you tell me what's happening?";
      
      // Check for keywords in the user message
      const lowercaseMsg = newMessage.toLowerCase();
      
      // Check for first aid related keywords
      const foundFirstAidTopic = Object.keys(firstAidResponses).find(topic => 
        lowercaseMsg.includes(topic)
      );
      
      if (foundFirstAidTopic) {
        botResponse = firstAidResponses[foundFirstAidTopic];
      } 
      // Check for emergency keywords
      else if (
        lowercaseMsg.includes('help') || 
        lowercaseMsg.includes('emergency') ||
        lowercaseMsg.includes('hurt') ||
        lowercaseMsg.includes('pain')
      ) {
        botResponse = "I understand you need help. Can you tell me more about what's happening? I can provide first aid guidance while you wait for emergency services.";
      }
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-secondary" />
          Emergency Assistant
        </CardTitle>
        <CardDescription>
          Get first aid guidance while waiting for help
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-4 pt-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] rounded-lg px-4 py-2 
                    ${message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary/20 text-foreground'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'bot' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.sender === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask for first aid help..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={isLoading || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatBot;
