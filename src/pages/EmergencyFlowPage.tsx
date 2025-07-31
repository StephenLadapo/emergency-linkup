import React from 'react';
import EmergencyFlowShowcase from '@/components/EmergencyFlowShowcase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmergencyFlowPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-8">
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