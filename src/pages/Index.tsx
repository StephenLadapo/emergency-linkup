
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Shield, BookOpen, Stethoscope, HandHelping, Sparkles } from 'lucide-react';

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
    <div className={`min-h-screen flex flex-col ${user ? 'bg-gradient-to-br from-background to-amber-50/30 dark:to-blue-950/30 ul-pattern' : 'bg-ul-sports-ground'}`}>
      {!user && <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"></div>}
      <Header user={user} onLogout={handleLogout} />
      
      {user ? (
        <Dashboard />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-4xl text-center backdrop-blur-sm bg-black/30 p-8 rounded-xl border border-white/10">
            <div className="mb-12 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                <img 
                  src="/lovable-uploads/7045ddef-07b3-4dd8-9f65-31aa340fc9bf.png"
                  alt="University of Limpopo Logo"
                  className="h-32 w-32 object-contain relative z-10"
                />
              </div>
              <h1 className="text-5xl font-bold mb-4 text-white">
                University of Limpopo <span className="block mt-2">Emergency System</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl">
                Quick access to emergency services for University of Limpopo students
              </p>
              <div className="flex items-center justify-center gap-2 mb-8 bg-amber-100/20 dark:bg-amber-900/20 py-2 px-4 rounded-full">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-white">Instant help when you need it most</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all card-hover">
                <div className="mb-4 bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-3 text-white">Security Emergency</h2>
                <p className="mb-4 text-white/70">Get immediate assistance from campus security during emergency situations.</p>
                <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
                  <li>One-touch emergency button</li>
                  <li>GPS location tracking</li>
                  <li>Immediate response team</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all card-hover">
                <div className="mb-4 bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Stethoscope className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="text-2xl font-semibold mb-3 text-white">Medical Emergency</h2>
                <p className="mb-4 text-white/70">Access medical assistance for injuries or health emergencies on campus.</p>
                <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
                  <li>First aid assistance</li>
                  <li>Medical team dispatch</li>
                  <li>Audio recording capability</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all card-hover">
                <div className="mb-4 bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <HandHelping className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-3 text-white">AI Assistant</h2>
                <p className="mb-4 text-white/70">Get immediate first aid guidance while waiting for emergency responders.</p>
                <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
                  <li>First aid instructions</li>
                  <li>Emergency procedures</li>
                  <li>Safety guidance</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl bg-amber-500 hover:bg-amber-600" onClick={() => navigate('/register')}>
                Register with University Email
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full shadow hover:shadow-md border-amber-200 text-white hover:bg-white/10" onClick={() => navigate('/login')}>
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
