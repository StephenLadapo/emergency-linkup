
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Shield, Stethoscope, HandHelping } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<{name: string; email: string; photoUrl?: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/30">
      <Header user={user} onLogout={handleLogout} />
      
      {user ? (
        <Dashboard />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-4xl text-center">
            <div className="mb-12 flex flex-col items-center">
              <img 
                src="/ul-logo.png"
                alt="University of Limpopo Logo"
                className="h-24 w-24 object-contain mb-6"
              />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                University of Limpopo Emergency System
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Quick access to emergency services for University of Limpopo students
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-card rounded-xl p-6 shadow-lg border border-muted hover:shadow-xl transition-all">
                <div className="mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Security Emergency</h2>
                <p className="mb-4 text-muted-foreground">Get immediate assistance from campus security during emergency situations.</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>One-touch emergency button</li>
                  <li>GPS location tracking</li>
                  <li>Immediate response team</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-lg border border-muted hover:shadow-xl transition-all">
                <div className="mb-4 bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Stethoscope className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Medical Emergency</h2>
                <p className="mb-4 text-muted-foreground">Access medical assistance for injuries or health emergencies on campus.</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>First aid assistance</li>
                  <li>Medical team dispatch</li>
                  <li>Audio recording capability</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-lg border border-muted hover:shadow-xl transition-all">
                <div className="mb-4 bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <HandHelping className="h-8 w-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">AI Assistant</h2>
                <p className="mb-4 text-muted-foreground">Get immediate first aid guidance while waiting for emergency responders.</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>First aid instructions</li>
                  <li>Emergency procedures</li>
                  <li>Safety guidance</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl" onClick={() => navigate('/register')}>
                Register with University Email
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full shadow hover:shadow-md" onClick={() => navigate('/login')}>
                Login to Your Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
