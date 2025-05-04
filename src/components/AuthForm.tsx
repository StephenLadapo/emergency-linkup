
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export interface PasswordRequirement {
  check: (password: string) => boolean;
  text: string;
}

export interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (email: string, password: string, fullName?: string, studentNumber?: string, confirmPassword?: string) => void;
  showConfirmPassword?: boolean;
  passwordRequirements?: PasswordRequirement[];
  loading?: boolean;  // Add loading prop for the Register page
}

const AuthForm = ({ 
  mode, 
  onSubmit, 
  showConfirmPassword = false,
  passwordRequirements = [],
  loading = false  // Default to false if not provided
}: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, fullName, studentNumber, confirmPassword);
  };
  
  // Check if password meets all requirements
  const passwordMeetsRequirements = () => {
    if (!passwordRequirements.length) return true;
    return passwordRequirements.every(req => req.check(password));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* For register mode only */}
      {mode === "register" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentNumber">Student Number</Label>
            <Input 
              id="studentNumber"
              placeholder="Enter your student number"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              required
            />
          </div>
        </>
      )}
      
      {/* Email field for both modes */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder={mode === "register" ? "yourname@keyaka.ul.ac.za" : "Enter your email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {/* Password field for both modes */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password
          {mode === "login" && (
            <a href="/forgot-password" className="float-right text-sm text-primary hover:underline">
              Forgot password?
            </a>
          )}
        </Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="Enter your password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setShowPasswordRequirements(true)}
          required
        />
        
        {/* Password requirements for register mode */}
        {mode === "register" && showPasswordRequirements && passwordRequirements.length > 0 && (
          <div className="mt-2 text-sm space-y-1">
            <p className="font-medium">Password requirements:</p>
            <ul className="space-y-1 pl-5 list-disc">
              {passwordRequirements.map((req, index) => (
                <li 
                  key={index}
                  className={req.check(password) ? "text-green-600" : "text-muted-foreground"}
                >
                  {req.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Confirm Password for register mode */}
      {mode === "register" && showConfirmPassword && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="Confirm your password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
          )}
        </div>
      )}
      
      {/* Submit button for both modes */}
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={
          mode === "register" 
            ? (loading || !passwordMeetsRequirements() || (showConfirmPassword && password !== confirmPassword))
            : loading
        }
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === "login" ? "Logging in..." : "Registering..."}
          </>
        ) : (
          mode === "login" ? "Login" : "Create Account"
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
