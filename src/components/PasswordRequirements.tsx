
import { Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface PasswordRequirement {
  check: (password: string) => boolean;
  text: string;
}

interface PasswordRequirementsProps {
  requirements: PasswordRequirement[];
  password: string;
}

const PasswordRequirements = ({ requirements, password }: PasswordRequirementsProps) => {
  const allMet = password.length > 0 && requirements.every(req => req.check(password));
  const anyMet = password.length > 0 && requirements.some(req => req.check(password));
  
  return (
    <Alert className={`mb-4 ${allMet ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30'}`}>
      <Shield className={`h-4 w-4 ${allMet ? 'text-green-500' : 'text-amber-500'}`} />
      <AlertDescription className={`text-sm ${allMet ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
        {password.length === 0 && (
          "For your security, we require a strong password with a mix of characters."
        )}
        
        {password.length > 0 && !allMet && (
          <div className="space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {requirements.map((req, index) => (
                <li key={index} className={req.check(password) ? 'text-green-600 dark:text-green-400' : ''}>
                  {req.text} {req.check(password) && '✓'}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {allMet && (
          <p>All password requirements met! ✓</p>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default PasswordRequirements;
