
import { ReactNode } from "react";
import BottomNavBar from "./BottomNavBar";
import { Link, useLocation } from "react-router-dom";
import { Shield, Settings, ArrowLeft, LayoutDashboard, Users, Wallet, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="mobile-container relative">
      <div className="absolute inset-0 bg-gradient-to-br from-fitscore-100/20 to-background pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none z-0" />
      
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        {isAdminPage ? (
          <Link 
            to="/" 
            className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-fitscore-50 transition-colors"
            title="Back to App"
          >
            <ArrowLeft className="h-5 w-5 text-fitscore-600" />
          </Link>
        ) : (
          <>
            <Link 
              to="/settings" 
              className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-fitscore-50 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5 text-fitscore-600" />
            </Link>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-fitscore-50 transition-colors"
                title="Admin Panel"
              >
                <Shield className="h-5 w-5 text-fitscore-600" />
              </Link>
            )}
          </>
        )}
      </div>
      
      {isAdminPage && (
        <div className="fixed top-[60px] left-0 right-0 z-20 bg-white/90 dark:bg-gray-800/90 shadow-sm overflow-x-auto">
          <div className="flex p-2 gap-2 justify-center">
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center px-3 py-1.5 rounded-full text-sm ${location.pathname === "/admin/dashboard" ? "bg-fitscore-100 text-fitscore-700" : "text-gray-600"}`}
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/admin/users" 
              className={`flex items-center px-3 py-1.5 rounded-full text-sm ${location.pathname === "/admin/users" ? "bg-fitscore-100 text-fitscore-700" : "text-gray-600"}`}
            >
              <Users className="h-4 w-4 mr-1" />
              <span>Users</span>
            </Link>
            <Link 
              to="/admin/wallets" 
              className={`flex items-center px-3 py-1.5 rounded-full text-sm ${location.pathname === "/admin/wallets" ? "bg-fitscore-100 text-fitscore-700" : "text-gray-600"}`}
            >
              <Wallet className="h-4 w-4 mr-1" />
              <span>Wallets</span>
            </Link>
            <Link 
              to="/admin/challenges" 
              className={`flex items-center px-3 py-1.5 rounded-full text-sm ${location.pathname === "/admin/challenges" ? "bg-fitscore-100 text-fitscore-700" : "text-gray-600"}`}
            >
              <Trophy className="h-4 w-4 mr-1" />
              <span>Challenges</span>
            </Link>
          </div>
        </div>
      )}
      
      <main className={`page-container relative z-10 ${isAdminPage ? "pt-[50px]" : ""}`}>
        {children}
      </main>
      {!isAdminPage && <BottomNavBar />}
    </div>
  );
};

export default MobileLayout;
