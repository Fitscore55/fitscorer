
import { ReactNode } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Users, Trophy, Settings, Wallet } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "@/components/layout/MobileLayout";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-2">
              <Link to="/" className="flex items-center text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to App
              </Link>
            </div>
            <div className="px-3 py-2">
              <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-xs text-sidebar-foreground/70">
                Manage your fitness platform
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/dashboard"}
                  tooltip="Dashboard"
                >
                  <NavLink to="/admin/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/users"}
                  tooltip="Users"
                >
                  <NavLink to="/admin/users">
                    <Users className="h-4 w-4 mr-3" />
                    <span>Users</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/wallets"}
                  tooltip="Wallets"
                >
                  <NavLink to="/admin/wallets">
                    <Wallet className="h-4 w-4 mr-3" />
                    <span>Wallets</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/challenges"}
                  tooltip="Challenges"
                >
                  <NavLink to="/admin/challenges">
                    <Trophy className="h-4 w-4 mr-3" />
                    <span>Challenges</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/settings"}
                  tooltip="Settings"
                >
                  <NavLink to="/admin/settings">
                    <Settings className="h-4 w-4 mr-3" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-3 py-2">
              <p className="text-xs text-sidebar-foreground/70">v1.0.0</p>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="container mx-auto py-6 max-w-6xl">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
