
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Bandage } from 'lucide-react';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your emergency assistant. How can I help you today? Ask me about first aid or emergency procedures.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Enhanced first aid responses with more detailed instructions
  const firstAidResponses: Record<string, string> = {
    'bleeding': "For bleeding: 1) Apply firm, direct pressure with a clean cloth or bandage. 2) If blood soaks through, add another layer without removing the first. 3) Keep pressing for at least 15 minutes. 4) Elevate the injured area above heart level if possible. 5) For severe bleeding, lie the person down to prevent shock and call emergency services immediately.",
    'burn': "For burns: 1) Run cool (not cold) water over the burn for 10-15 minutes. 2) Never use ice, butter, or ointments on fresh burns. 3) Don't break blisters. 4) Cover with a clean, non-stick bandage. 5) For chemical burns, rinse with water for 20 minutes. 6) Seek medical help for burns larger than 3 inches, or on face, hands, feet, genitals, or major joints.",
    'choking': "For choking: 1) Ask 'Are you choking?' If they can't speak, breathe or cough, act immediately. 2) Stand behind them and give 5 back blows between their shoulder blades with the heel of your hand. 3) If unsuccessful, perform 5 abdominal thrusts (Heimlich maneuver): place your fist above their navel and pull inward and upward sharply. 4) Alternate 5 back blows and 5 abdominal thrusts until the object is expelled or help arrives.",
    'heart attack': "For heart attack: 1) Have the person sit or lie down in a comfortable position. 2) Loosen any tight clothing. 3) Give aspirin if available and not allergic. 4) If the person has nitroglycerin, help them take it. 5) Begin CPR if they become unconscious and aren't breathing normally. 6) Call emergency services immediately. Warning signs include: chest pain/pressure, pain radiating to arm/jaw/back, shortness of breath, cold sweat, nausea.",
    'fracture': "For fractures: 1) Don't move the injured area unless absolutely necessary. 2) Stabilize the injury in the position found using rolled towels, pillows or clothing. 3) Apply ice wrapped in cloth for 20 minutes to reduce swelling and pain. 4) For open fractures (bone visible), cover the wound with a clean cloth but don't push bone back in. 5) Monitor for shock symptoms. 6) Seek immediate medical help - proper alignment is crucial for healing.",
    'seizure': "For seizures: 1) Ease the person to the floor and clear the area of anything hazardous. 2) Place something soft under their head. 3) Turn them gently onto their side to prevent choking. 4) NEVER put anything in their mouth or try to restrain them. 5) Time the seizure - call emergency services if it lasts more than 5 minutes or they don't regain consciousness. 6) Stay with them as they regain awareness and reassure them.",
    'snake bite': "For snake bites: 1) Move the person away from the snake's striking distance. 2) Keep the bitten area below heart level if possible. 3) Remove any rings or tight items as swelling may occur. 4) Clean the wound gently, but don't flush with water. 5) Cover with a clean, dry bandage. 6) Keep the person calm and still to slow venom spread. 7) DO NOT: cut the wound, apply a tourniquet, suck out venom, apply ice or immerse in water. 8) Get medical help immediately.",
    'unconscious': "For unconsciousness: 1) Check responsiveness by tapping shoulders and asking loudly if they're okay. 2) If no response, check for breathing (look, listen, feel). 3) If breathing, place in recovery position: roll onto side, bottom arm extended, top knee bent, top arm supporting head. 4) If not breathing normally, begin CPR immediately if trained. 5) Call emergency services. 6) Monitor breathing and pulse until help arrives. 7) Note time when unconsciousness began.",
    'shock': "For shock: 1) Have the person lie flat on their back with feet elevated about 12 inches (unless head, neck, back injuries or broken bones in legs). 2) Keep them warm with blankets or coats. 3) Loosen tight clothing. 4) Don't give anything to eat or drink. 5) If they vomit, turn their head to the side. 6) Seek immediate medical attention. Signs of shock: rapid breathing, weak pulse, pale clammy skin, dizziness, confusion.",
    'asthma': "For asthma attack: 1) Help the person sit upright in a comfortable position - leaning slightly forward often helps breathing. 2) Assist with their prescribed rescue inhaler: shake it, remove cap, have them exhale fully, place mouthpiece in mouth, inhale deeply while pressing canister, hold breath 10 seconds. 3) Encourage slow, deep breathing. 4) If no improvement after 2 puffs, they may repeat after 20 minutes. 5) Call emergency services if symptoms worsen or don't improve quickly.",
    'allergic reaction': "For severe allergic reaction: 1) Ask if they have an epinephrine auto-injector (EpiPen). 2) Help them use it: remove safety cap, hold against outer thigh mid-way between hip and knee, press firmly until you hear a click, hold for 10 seconds. 3) Call emergency services immediately even if symptoms improve - effects of epinephrine are temporary. 4) Have them lie on their back with legs elevated unless they have breathing difficulties. 5) A second dose may be given after 5-15 minutes if symptoms persist.",
    'drowning': "For drowning: 1) Ensure your safety first - don't become a victim yourself. 2) Call for emergency services. 3) If safely possible, remove person from water. 4) Check for breathing. If not breathing, begin CPR immediately. 5) If breathing, place in recovery position (on their side) to prevent choking if they vomit. 6) Remove wet clothes and keep them warm. 7) ALL drowning victims need medical evaluation, even if they seem recovered.",
    'heatstroke': "For heatstroke: 1) Move to a cool, shaded area immediately. 2) Call emergency services. 3) Remove excess clothing. 4) Cool the body quickly: place ice packs on neck, armpits, groin; spray with cool water; fan continuously. 5) If conscious and alert, give small sips of cool water (not cold). 6) Monitor body temperature if possible. 7) Signs of heatstroke: high body temperature, altered mental state, hot/dry skin, rapid strong pulse."
  };

  // Injury options for interactive responses
  const injuryOptions = [
    "Bleeding/Cuts", "Burns", "Choking", "Heart Attack", 
    "Fracture/Broken Bone", "Seizure", "Snake Bite", 
    "Unconscious Person", "Shock", "Asthma Attack", 
    "Allergic Reaction", "Drowning", "Heatstroke"
  ];

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    
    // Map the selected option to first aid topic
    const topicMap: Record<string, string> = {
      "Bleeding/Cuts": "bleeding",
      "Burns": "burn",
      "Choking": "choking",
      "Heart Attack": "heart attack",
      "Fracture/Broken Bone": "fracture",
      "Seizure": "seizure",
      "Snake Bite": "snake bite",
      "Unconscious Person": "unconscious",
      "Shock": "shock",
      "Asthma Attack": "asthma",
      "Allergic Reaction": "allergic reaction",
      "Drowning": "drowning",
      "Heatstroke": "heatstroke"
    };
    
    const selectedTopic = topicMap[option] || option.toLowerCase();
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: option,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add bot response
    setTimeout(() => {
      const botResponse = firstAidResponses[selectedTopic] || 
        "I don't have specific information about that injury. Please describe your situation in more detail so I can provide appropriate guidance.";
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  // Enhanced message processing system with improved matching
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
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const lowercaseMsg = newMessage.toLowerCase();
      let botResponse = "I'm here to help in emergencies. Can you provide more details about your situation?";
      let options: string[] = [];
      
      // Check for first aid related keywords with improved matching
      const foundFirstAidTopic = Object.keys(firstAidResponses).find(topic => 
        lowercaseMsg.includes(topic)
      );
      
      if (foundFirstAidTopic) {
        botResponse = firstAidResponses[foundFirstAidTopic];
      }
      // Check for injury or help related terms
      else if (
        lowercaseMsg.includes('injury') || 
        lowercaseMsg.includes('hurt') || 
        lowercaseMsg.includes('pain') ||
        lowercaseMsg.includes('wound') ||
        lowercaseMsg.includes('injured') ||
        lowercaseMsg.includes('emergency') ||
        lowercaseMsg.includes('accident') ||
        lowercaseMsg.includes('first aid')
      ) {
        botResponse = "I can provide first aid guidance. What type of injury are you dealing with?";
        options = injuryOptions;
      }
      // Enhanced emergency keyword recognition with more patterns
      else if (
        lowercaseMsg.includes('help') || 
        lowercaseMsg.includes('emergency') ||
        lowercaseMsg.includes('blood') ||
        lowercaseMsg.includes('fell') ||
        lowercaseMsg.includes('fall') ||
        lowercaseMsg.includes('cut') ||
        lowercaseMsg.includes('medical')
      ) {
        botResponse = "I understand you need urgent help. Please tell me:\n\n1. What type of injury/emergency?\n2. Is the person conscious and breathing?\n3. Is there severe bleeding?\n\nI can provide first aid guidance while you call emergency services at 10111 (national emergency) or campus security.";
      }
      // Handle greetings and common questions with broader pattern matching
      else if (
        lowercaseMsg.includes('hi') || 
        lowercaseMsg.includes('hello') || 
        lowercaseMsg.includes('hey') ||
        lowercaseMsg.includes('morning') ||
        lowercaseMsg.includes('evening') ||
        lowercaseMsg.includes('afternoon')
      ) {
        botResponse = "Hello! I'm the University of Limpopo Emergency Assistant. I can provide first aid guidance and emergency information. How can I help you today?";
      }
      else if (lowercaseMsg.includes('thank')) {
        botResponse = "You're welcome! Remember, for real emergencies, always call professional help while administering first aid. Is there anything else I can assist with?";
      }
      else if (
        lowercaseMsg.includes('campus security') || 
        lowercaseMsg.includes('security number') ||
        lowercaseMsg.includes('emergency number') ||
        lowercaseMsg.includes('call') ||
        lowercaseMsg.includes('contact') ||
        lowercaseMsg.includes('help line')
      ) {
        botResponse = "University of Limpopo Campus Security can be reached at 015-268-XXXX (replace with actual number). For national emergencies, call 10111. Save these numbers in your phone for quick access.";
      }
      else if (
        lowercaseMsg.includes('what can you do') ||
        lowercaseMsg.includes('how do you help') ||
        lowercaseMsg.includes('your purpose')
      ) {
        botResponse = "I can provide first aid guidance for emergencies like bleeding, burns, fractures, choking, and more. I can also give you campus emergency contact information and help you understand what to do in various emergency situations while waiting for professional help.";
      }
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        options: options.length > 0 ? options : undefined
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
    <Card className={`flex flex-col h-full shadow-lg border-amber-200 ${isMobile ? 'w-full' : ''}`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-900/20 dark:to-blue-900/20">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-amber-500" />
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
                      ? 'bg-amber-500 text-white' 
                      : 'bg-blue-100 text-foreground dark:bg-blue-900/30'
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
                  <p className="whitespace-pre-line">{message.text}</p>
                  
                  {/* Render options if available */}
                  {message.options && message.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option) => (
                        <Button
                          key={option}
                          size="sm"
                          variant="secondary"
                          className="text-xs py-1 px-2 h-auto flex items-center bg-white/90 dark:bg-gray-800/90 text-black dark:text-white"
                          onClick={() => handleOptionSelect(option)}
                        >
                          <Bandage className="h-3 w-3 mr-1" />
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
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
            placeholder="Ask about first aid or emergencies..."
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
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatBot;
