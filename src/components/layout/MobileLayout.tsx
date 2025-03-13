
import { ReactNode } from "react";
import BottomNavBar from "./BottomNavBar";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="mobile-container">
      <main className="page-container">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default MobileLayout;
