import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Shield, 
  Heart, 
  CheckCircle, 
  AlertTriangle,
  Mic,
  Navigation,
  Ambulance,
  Clock,
  Star
} from 'lucide-react';

const EmergencyFlowShowcase = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);

  const scenes = [
    {
      id: 1,
      title: "Welcome & Registration",
      description: "Secure student onboarding with university credentials",
      duration: 3000,
      color: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      title: "Emergency Detection", 
      description: "Instant emergency reporting with smart categorization",
      duration: 4000,
      color: "from-orange-500 to-red-600"
    },
    {
      id: 3,
      title: "AI Assistant Response",
      description: "Real-time guidance and voice-activated assistance", 
      duration: 4000,
      color: "from-green-500 to-teal-600"
    },
    {
      id: 4,
      title: "Live Help Tracking",
      description: "Real-time emergency response coordination",
      duration: 3500,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 5,
      title: "Recovery & Support",
      description: "Post-emergency care and follow-up assistance",
      duration: 3000,
      color: "from-emerald-500 to-cyan-600"
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setSceneProgress(prev => {
          const newProgress = prev + (100 / (scenes[currentScene].duration / 100));
          
          if (newProgress >= 100) {
            if (currentScene < scenes.length - 1) {
              setCurrentScene(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentScene, scenes]);

  const startDemo = () => {
    setCurrentScene(0);
    setSceneProgress(0);
    setIsPlaying(true);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentScene(0);
    setSceneProgress(0);
  };

  const SceneOne = () => (
    <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transform transition-all duration-1000 ${sceneProgress > 20 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Student Registration</h3>
                <p className="text-sm text-muted-foreground">keyaka@ul.ac.za</p>
              </div>
            </div>
            <div className={`transition-all duration-500 ${sceneProgress > 60 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Verified University Student</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse transition-all duration-2000 ${
              sceneProgress > 30 ? 'opacity-60' : 'opacity-0'
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + Math.sin(i) * 20}%`,
              animationDelay: `${i * 200}ms`
            }}
          />
        ))}
      </div>
    </div>
  );

  const SceneTwo = () => (
    <div className="relative h-64 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transform transition-all duration-1000 ${sceneProgress > 20 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <div className="text-center mb-4">
              <AlertTriangle className={`w-12 h-12 mx-auto mb-2 text-red-600 ${sceneProgress > 40 ? 'animate-pulse' : ''}`} />
              <h3 className="font-semibold text-red-700">Emergency Detected</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Heart, label: "Medical", active: sceneProgress > 60 },
                { icon: Shield, label: "Security", active: false },
                { icon: Phone, label: "Emergency", active: false }
              ].map((item, i) => (
                <Button
                  key={i}
                  variant={item.active ? "default" : "outline"}
                  size="sm"
                  className={`flex flex-col h-16 ${item.active ? 'bg-red-600 text-white animate-pulse' : ''}`}
                >
                  <item.icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pulsing location indicator */}
      <div className={`absolute bottom-4 right-4 transition-all duration-1000 ${sceneProgress > 70 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative">
          <MapPin className="w-6 h-6 text-red-600" />
          <div className="absolute inset-0 animate-ping">
            <MapPin className="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const SceneThree = () => (
    <div className="relative h-64 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transform transition-all duration-1000 ${sceneProgress > 20 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <MessageCircle className="w-8 h-8 text-green-600" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ${sceneProgress > 40 ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Emergency Guidance</p>
              </div>
            </div>
            
            <div className={`transition-all duration-500 ${sceneProgress > 60 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <p className="text-sm">"I'm here to help. Stay calm and follow my instructions."</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mic className={`w-4 h-4 text-green-600 ${sceneProgress > 80 ? 'animate-pulse' : ''}`} />
                <span className="text-xs text-muted-foreground">Voice guidance active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio visualization */}
      <div className={`absolute top-4 left-4 transition-all duration-1000 ${sceneProgress > 50 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-green-600 rounded-full ${sceneProgress > 60 ? 'animate-pulse' : ''}`}
              style={{
                height: `${12 + Math.random() * 16}px`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const SceneFour = () => (
    <div className="relative h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transform transition-all duration-1000 ${sceneProgress > 20 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <Ambulance className="w-12 h-12 text-purple-600" />
                <Navigation className={`absolute -top-1 -right-1 w-4 h-4 text-purple-400 ${sceneProgress > 40 ? 'animate-spin' : ''}`} />
              </div>
              <h3 className="font-semibold mt-2">Help En Route</h3>
            </div>
            
            <div className={`transition-all duration-500 ${sceneProgress > 60 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm">ETA:</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">3 min</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(sceneProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moving help indicator */}
      <div className={`absolute transition-all duration-2000 ${sceneProgress > 30 ? 'opacity-100' : 'opacity-0'}`}
           style={{ 
             left: `${10 + (sceneProgress * 0.6)}%`, 
             top: `${20 + Math.sin(sceneProgress * 0.1) * 10}%` 
           }}>
        <div className="relative">
          <div className="w-3 h-3 bg-purple-600 rounded-full" />
          <div className="absolute inset-0 animate-ping">
            <div className="w-3 h-3 bg-purple-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const SceneFive = () => (
    <div className="relative h-64 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transform transition-all duration-1000 ${sceneProgress > 20 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
            <div className="mb-4">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-600 mb-2" />
              <h3 className="font-semibold text-emerald-700">You're Safe Now</h3>
              <p className="text-sm text-muted-foreground">Emergency response completed</p>
            </div>
            
            <div className={`transition-all duration-500 ${sceneProgress > 60 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex justify-center space-x-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 text-yellow-400 ${sceneProgress > 70 + i * 5 ? 'animate-pulse' : ''}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Follow-up care available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration particles */}
      {sceneProgress > 50 && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
              style={{
                left: `${20 + i * 10}%`,
                top: `${20 + Math.random() * 40}%`,
                animationDelay: `${i * 150}ms`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderCurrentScene = () => {
    switch (currentScene) {
      case 0: return <SceneOne />;
      case 1: return <SceneTwo />;
      case 2: return <SceneThree />;
      case 3: return <SceneFour />;
      case 4: return <SceneFive />;
      default: return <SceneOne />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Emergency Response Flow
        </h2>
        <p className="text-muted-foreground mb-6">
          Experience how our emergency system protects University of Limpopo students
        </p>
        
        <div className="flex justify-center space-x-4 mb-6">
          <Button onClick={startDemo} disabled={isPlaying} className="px-8">
            {isPlaying ? 'Demo Playing...' : 'Start Demo'}
          </Button>
          <Button onClick={resetDemo} variant="outline">
            Reset
          </Button>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
              <div 
                className={`h-full transition-all duration-100 bg-gradient-to-r ${scenes[currentScene].color}`}
                style={{ width: `${sceneProgress}%` }}
              />
            </div>
            
            {/* Scene container */}
            <div className="p-6">
              {renderCurrentScene()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scene navigation */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {scenes.map((scene, index) => (
          <Card 
            key={scene.id}
            className={`cursor-pointer transition-all duration-300 ${
              index === currentScene 
                ? 'ring-2 ring-primary shadow-lg scale-105' 
                : 'hover:shadow-md hover:scale-102'
            }`}
            onClick={() => {
              setCurrentScene(index);
              setSceneProgress(0);
              setIsPlaying(false);
            }}
          >
            <CardContent className="p-4 text-center">
              <Badge 
                variant={index === currentScene ? "default" : "secondary"}
                className="mb-2"
              >
                {scene.id}
              </Badge>
              <h4 className="font-semibold text-sm mb-1">{scene.title}</h4>
              <p className="text-xs text-muted-foreground">{scene.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmergencyFlowShowcase;