
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, BookOpen, Stethoscope, HandHelping, Sparkles, School, GraduationCap, Phone, Mail, Facebook, Instagram, Linkedin, Users, CalendarDays, HeartPulse } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<{name: string; email: string; photoUrl?: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Redirect to dashboard if logged in
      navigate('/dashboard/profile');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-amber-700/70 mix-blend-multiply"></div>
        <img 
          src="/lovable-uploads/4b755f41-3d7d-4087-8826-24bfe295eccc.png" 
          alt="University of Limpopo Campus" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header user={user} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-4xl text-center">
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
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Quick access to emergency services for University of Limpopo students
              </p>
              <div className="flex items-center justify-center gap-2 mb-8 bg-white/20 dark:bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-sm text-white">Instant help when you need it most</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-amber-200 dark:border-amber-900/30 hover:shadow-xl transition-all card-hover">
                <div className="mb-4 bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Security Emergency</h2>
                <p className="mb-4 text-muted-foreground">Get immediate assistance from campus security during emergency situations.</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>One-touch emergency button</li>
                  <li>GPS location tracking</li>
                  <li>Immediate response team</li>
                </ul>
              </div>
              
              <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-900/30 hover:shadow-xl transition-all card-hover">
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
              
              <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-green-200 dark:border-green-900/30 hover:shadow-xl transition-all card-hover">
                <div className="mb-4 bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <HandHelping className="h-8 w-8 text-green-500" />
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
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl bg-amber-500 hover:bg-amber-600" onClick={() => navigate('/register')}>
                Register with University Email
              </Button>
              <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl bg-amber-500 hover:bg-amber-600" onClick={() => navigate('/login')}>
                Login to Your Account
              </Button>
            </div>
            
            <div className="mb-16 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-8 text-center">Campus Safety Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-6 shadow-md text-center">
                  <div className="mb-4 bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Student Support</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">24/7 emergency assistance for all students on campus.</p>
                </div>
                
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-6 shadow-md text-center">
                  <div className="mb-4 bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Campus Security</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Trained security personnel available throughout campus.</p>
                </div>
                
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-6 shadow-md text-center">
                  <div className="mb-4 bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <HeartPulse className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Health Services</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">On-campus clinic with medical professionals.</p>
                </div>
                
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-6 shadow-md text-center">
                  <div className="mb-4 bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <CalendarDays className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Safety Workshops</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Regular safety drills and emergency response training.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-8 shadow-lg mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <School className="h-6 w-6 text-amber-500" />
                    About University of Limpopo
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    The University of Limpopo is committed to providing a safe and secure environment for all students, 
                    faculty, and staff. Our emergency response system ensures that help is always available when needed.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Established with the mission to empower students through education, we prioritize the wellbeing 
                    and safety of our campus community through innovative technology solutions.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-amber-500 mt-1" />
                      <div>
                        <p className="font-medium">Emergency Hotline</p>
                        <p className="text-gray-700 dark:text-gray-300">+27 15 268 9111</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-amber-500 mt-1" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-700 dark:text-gray-300">emergency@ul.ac.za</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <School className="h-5 w-5 text-amber-500 mt-1" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          University of Limpopo, Sovenga, 0727, Limpopo, South Africa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-center space-x-6 mb-8">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                   className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                   className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                   className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-800 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
              
              <Separator className="mb-8" />
              
              <div className="text-center text-sm text-gray-500 mb-8">
                <p>© {new Date().getFullYear()} University of Limpopo. All rights reserved.</p>
                <p className="mt-2">
                  This emergency system is designed to provide immediate assistance to UL students and staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
