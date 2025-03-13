
import { ReactNode } from "react";
import BottomNavBar from "./BottomNavBar";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  // In a real app, this would be determined by auth state
  // For now we're checking if the user email matches our superuser
  const currentUserEmail = "fitscore55@gmail.com"; // In a real app, this would be fetched from auth state
  const isAdmin = currentUserEmail === "fitscore55@gmail.com";

  return (
    <div className="mobile-container relative">
      <div className="absolute inset-0 bg-gradient-to-br from-fitscore-100/20 to-background pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none z-0" />
      
      {isAdmin && (
        <Link 
          to="/admin" 
          className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-fitscore-50 transition-colors"
          title="Admin Panel"
        >
          <Shield className="h-5 w-5 text-fitscore-600" />
        </Link>
      )}
      
      <main className="page-container relative z-10">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default MobileLayout;
