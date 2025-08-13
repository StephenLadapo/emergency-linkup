import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResendConfirmation = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith('@gmail.com')) {
      toast.error('Please use your Gmail email (@gmail.com)');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/profile`,
        }
      });

      if (error) throw error;

      toast.success('Confirmation email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast.error(error.message || 'Failed to resend confirmation email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-amber-200 dark:border-amber-900/30">
        <div className="flex flex-col items-center space-y-2 text-center mb-6">
          <Mail className="h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold">Resend Confirmation</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email to resend the confirmation link
          </p>
        </div>
        
        <form onSubmit={handleResend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Gmail Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-amber-200 dark:border-amber-900/30"
              required
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Resend Confirmation Email'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResendConfirmation;