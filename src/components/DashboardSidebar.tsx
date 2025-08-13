
import {
  MapPin,
  Mic,
  MessagesSquare,
  User,
  Bell,
  History,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Dashboard menu items
const menuItems = [
  {
    title: "Profile",
    icon: User,
    path: "/dashboard/profile",
  },
  {
    title: "Location",
    icon: MapPin,
    path: "/dashboard/location",
  },
  {
    title: "Audio Recording",
    icon: Mic,
    path: "/dashboard/audio",
  },
  {
    title: "AI Assistant",
    icon: MessagesSquare,
    path: "/dashboard/assistant",
  },
  {
    title: "Messages",
    icon: Bell,
    path: "/dashboard/messages",
  },
  {
    title: "History",
    icon: History,
    path: "/dashboard/history",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center p-2">
          <img 
            src="/lovable-uploads/7045ddef-07b3-4dd8-9f65-31aa340fc9bf.png"
            alt="University of Limpopo Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="ml-2 font-semibold">UL Emergency</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 text-xs text-center text-muted-foreground">
        University of Limpopo Emergency System © {new Date().getFullYear()}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
