
import { ReactNode } from "react";
import BottomNavBar from "./BottomNavBar";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="mobile-container relative">
      <div className="absolute inset-0 bg-gradient-to-br from-fitscore-100/20 to-background pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none z-0" />
      
      <main className="page-container relative z-10">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default MobileLayout;
