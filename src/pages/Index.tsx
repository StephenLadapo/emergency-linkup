
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      
      {user ? (
        <Dashboard />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-3xl text-center">
            <div className="mb-8">
              <AlertCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">University of Limpopo Emergency System</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Quick access to emergency services for University of Limpopo students
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-2">Emergency Help</h2>
                <p className="mb-4">Get immediate assistance from campus security and medical teams during emergency situations.</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>One-touch emergency button</li>
                  <li>GPS location tracking</li>
                  <li>Audio recording capability</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-2">AI Assistant</h2>
                <p className="mb-4">Get immediate first aid guidance while waiting for emergency responders.</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>First aid instructions</li>
                  <li>Emergency procedures</li>
                  <li>Safety guidance</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                Register with University Email
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
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
