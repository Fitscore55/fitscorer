
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Shield, Users, Award, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin?tab=users" },
    { icon: Award, label: "Challenges", href: "/admin?tab=challenges" },
    { icon: Settings, label: "Settings", href: "/admin?tab=settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full min-h-screen">
          <Sidebar>
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
          <div className="flex-1 p-6 md:p-8 overflow-auto">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
