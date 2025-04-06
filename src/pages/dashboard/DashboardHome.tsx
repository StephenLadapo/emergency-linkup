
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Stethoscope, HandHelping } from "lucide-react";

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Welcome to the Emergency Dashboard</h2>
      <p className="text-muted-foreground">
        Access all emergency features from the sidebar. Here's a quick overview of available services:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="border border-amber-200 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="mb-4 bg-amber-500/10 w-12 h-12 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Security Emergency</h3>
            <p className="text-muted-foreground text-sm">
              Get immediate assistance from campus security during emergency situations.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-blue-200 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="mb-4 bg-secondary/10 w-12 h-12 rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Medical Emergency</h3>
            <p className="text-muted-foreground text-sm">
              Access medical assistance for injuries or health emergencies on campus.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-green-200 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="mb-4 bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center">
              <HandHelping className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
            <p className="text-muted-foreground text-sm">
              Get immediate first aid guidance while waiting for emergency responders.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
