
import { AlertCircle } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute w-10 h-10 bg-primary/20 rounded-full animate-pulse-slow"></div>
        <img 
          src="/ul-logo.png" 
          alt="University of Limpopo" 
          className="h-8 w-8 object-contain z-10"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">EmergencyLinkUp</span>
          <span className="text-xs text-muted-foreground leading-tight">University of Limpopo</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
