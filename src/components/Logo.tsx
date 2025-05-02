
import { AlertCircle } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute w-12 h-12 bg-amber-500/20 rounded-full animate-pulse-slow"></div>
        <img 
          src="/lovable-uploads/7045ddef-07b3-4dd8-9f65-31aa340fc9bf.png" 
          alt="University of Limpopo" 
          className="h-10 w-10 object-contain z-10"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight text-gradient">EmergencyLinkUp</span>
          <span className="text-xs text-muted-foreground leading-tight">University of Limpopo</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
