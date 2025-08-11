
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/60 to-amber-700/80 mix-blend-multiply animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-amber-500/20 animate-fade-in"></div>
        <img 
          src="/lovable-uploads/IMG-20250506-WA0016.jpg" 
          alt="University of Limpopo Campus" 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/30 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-500"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header user={user} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-4xl text-center">
            <div className="mb-12 flex flex-col items-center animate-fade-in">
              <div className="relative mb-6 animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-blue-500/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-l from-purple-500/20 to-amber-400/20 rounded-full blur-xl animate-pulse delay-150"></div>
                <img 
                  src="/lovable-uploads/7045ddef-07b3-4dd8-9f65-31aa340fc9bf.png"
                  alt="University of Limpopo Logo"
                  className="h-32 w-32 object-contain relative z-10 hover-scale transition-all duration-500"
                />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white animate-fade-in delay-200 bg-gradient-to-r from-white via-amber-200 to-blue-200 bg-clip-text text-transparent">
                University of Limpopo <span className="block mt-2 animate-fade-in delay-300">Emergency System</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl animate-fade-in delay-400">
                Quick access to emergency services for University of Limpopo students
              </p>
              <div className="flex items-center justify-center gap-2 mb-8 bg-white/20 dark:bg-white/10 backdrop-blur-md py-3 px-6 rounded-full border border-white/30 hover-scale animate-fade-in delay-500 shadow-lg">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span className="text-sm text-white font-medium">Instant help when you need it most</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in delay-600">
              <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-amber-200/50 dark:border-amber-900/30 hover:shadow-3xl transition-all duration-500 hover-scale group animate-fade-in delay-700">
                <div className="mb-6 bg-gradient-to-br from-amber-500/20 to-amber-600/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-all duration-300">
                  <Shield className="h-10 w-10 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">Security Emergency</h2>
                <p className="mb-6 text-muted-foreground leading-relaxed">Get immediate assistance from campus security during emergency situations.</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    One-touch emergency button
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    GPS location tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    Immediate response team
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-blue-200/50 dark:border-blue-900/30 hover:shadow-3xl transition-all duration-500 hover-scale group animate-fade-in delay-800">
                <div className="mb-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-300">
                  <Stethoscope className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Medical Emergency</h2>
                <p className="mb-6 text-muted-foreground leading-relaxed">Access medical assistance for injuries or health emergencies on campus.</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    First aid assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Medical team dispatch
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Audio recording capability
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-green-200/50 dark:border-green-900/30 hover:shadow-3xl transition-all duration-500 hover-scale group animate-fade-in delay-900">
                <div className="mb-6 bg-gradient-to-br from-green-500/20 to-green-600/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:from-green-500/30 group-hover:to-green-600/20 transition-all duration-300">
                  <HandHelping className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">AI Assistant</h2>
                <p className="mb-6 text-muted-foreground leading-relaxed">Get immediate first aid guidance while waiting for emergency responders.</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    First aid instructions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Emergency procedures
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Safety guidance
                  </li>
                </ul>
              </div>
            </div>
            
        {/* CTA Section */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              See How It Works
            </h2>
            <p className="text-muted-foreground mb-8">
              Experience our emergency response system in action through an interactive demonstration.
            </p>
<Link to="/emergency-flow">
  <Button size="lg" className="animate-scale-in hover:animate-pulse">
    View Emergency Flow Demo
  </Button>
</Link>
          </div>
        </section>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in delay-1200">
              <Button size="lg" className="px-10 py-6 text-lg rounded-full shadow-2xl hover:shadow-3xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border border-amber-300/30 hover-scale transition-all duration-300 font-semibold" onClick={() => navigate('/register')}>
                Register with University Email
              </Button>
              <Button size="lg" className="px-10 py-6 text-lg rounded-full shadow-2xl hover:shadow-3xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border border-blue-300/30 hover-scale transition-all duration-300 font-semibold" onClick={() => navigate('/login')}>
                Login to Your Account
              </Button>
            </div>
            
            <div className="mb-16 bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl p-10 shadow-2xl border border-white/20 animate-fade-in delay-1100">
              <h2 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">Campus Safety Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-6 shadow-lg text-center hover-scale transition-all duration-300 group border border-blue-200/30">
                  <div className="mb-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-300">
                    <GraduationCap className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Student Support</h3>
                  <p className="text-muted-foreground">24/7 emergency assistance for all students on campus.</p>
                </div>
                
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-6 shadow-lg text-center hover-scale transition-all duration-300 group border border-green-200/30">
                  <div className="mb-4 bg-gradient-to-br from-green-500/20 to-green-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:from-green-500/30 group-hover:to-green-600/20 transition-all duration-300">
                    <Users className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Campus Security</h3>
                  <p className="text-muted-foreground">Trained security personnel available throughout campus.</p>
                </div>
                
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-6 shadow-lg text-center hover-scale transition-all duration-300 group border border-purple-200/30">
                  <div className="mb-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all duration-300">
                    <HeartPulse className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Health Services</h3>
                  <p className="text-muted-foreground">On-campus clinic with medical professionals.</p>
                </div>
                
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-6 shadow-lg text-center hover-scale transition-all duration-300 group border border-amber-200/30">
                  <div className="mb-4 bg-gradient-to-br from-amber-500/20 to-amber-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-all duration-300">
                    <CalendarDays className="h-8 w-8 text-amber-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">Safety Workshops</h3>
                  <p className="text-muted-foreground">Regular safety drills and emergency response training.</p>
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
