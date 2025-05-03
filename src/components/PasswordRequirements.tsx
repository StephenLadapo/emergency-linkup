
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
  return (
    <Alert className="mb-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30">
      <Shield className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
        For your security, we require a strong password with a mix of characters.
      </AlertDescription>
    </Alert>
  );
};

export default PasswordRequirements;
