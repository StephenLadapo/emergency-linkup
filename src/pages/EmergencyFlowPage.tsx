import React from 'react';
import EmergencyFlowShowcase from '@/components/EmergencyFlowShowcase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmergencyFlowPage = () => {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 relative"
      style={{
        backgroundImage: 'url(/lovable-uploads/59a036e2-bc00-4afc-be0e-ca4111d9d433.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-primary/20"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <EmergencyFlowShowcase />
      </div>
    </div>
  );
};

export default EmergencyFlowPage;