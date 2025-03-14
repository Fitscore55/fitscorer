
import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Shield, Users, Award, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
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
} from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Update sidebar open state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/admin?tab=dashboard" },
    { icon: Users, label: "Users", href: "/admin?tab=users" },
    { icon: Award, label: "Challenges", href: "/admin?tab=challenges" },
    { icon: Settings, label: "Settings", href: "/admin?tab=settings" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex w-full min-h-screen">
          <Sidebar className={cn("transition-all duration-300", 
            isMobile && !sidebarOpen ? "w-0 opacity-0 -translate-x-full" : "")}>
            <SidebarHeader className="pb-4">
              <div className="flex items-center gap-2 px-2">
                <Shield className="h-6 w-6 text-fitscore-600" />
                <span className="text-lg font-bold text-foreground">FitScore Admin</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          <Link to={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  asChild
                >
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to App
                  </Link>
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
          <div className="flex-1 overflow-auto">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-3 flex justify-between items-center">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-fitscore-600" />
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-fitscore-600 to-fitscore-500 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs" 
                asChild
              >
                <Link to="/">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <div className="p-4 md:p-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
