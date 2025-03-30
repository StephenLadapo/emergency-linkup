
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Logo from './Logo';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    photoUrl?: string;
  } | null;
  onLogout?: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const [notifications] = useState([
    { id: 1, text: "Security team has been dispatched", type: "security", read: false },
    { id: 2, text: "First aid team responding", type: "medical", read: false },
  ]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="mt-8">
                <nav className="space-y-2">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/">Home</Link>
                  </Button>
                  {user && (
                    <>
                      <Button asChild variant="ghost" className="w-full justify-start">
                        <Link to="/profile">My Profile</Link>
                      </Button>
                      <Button onClick={onLogout} variant="ghost" className="w-full justify-start text-destructive">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </>
                  )}
                  {!user && (
                    <>
                      <Button asChild variant="ghost" className="w-full justify-start">
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full justify-start">
                        <Link to="/register">Register</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Button asChild variant="ghost">
            <Link to="/">Home</Link>
          </Button>
          {user ? (
            <Button asChild variant="ghost">
              <Link to="/profile">My Profile</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
        
        <div className="flex items-center gap-2">
          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-medium">Notifications</span>
                    <span className="text-xs text-muted-foreground">Mark all as read</span>
                  </div>
                  
                  {notifications.map(notification => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div className={`w-full p-3 ${!notification.read ? 'bg-muted/50' : ''}`}>
                        <div className="flex items-start gap-2">
                          <span className={`h-2 w-2 mt-2 rounded-full ${notification.type === 'security' ? 'bg-destructive' : 'bg-secondary'}`} />
                          <div>
                            <p className="text-sm">{notification.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">Just now</p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
