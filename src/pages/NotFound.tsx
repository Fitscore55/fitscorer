
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-fitscore-100/30 to-transparent" />
      
      <div className="text-center space-y-6 max-w-md relative z-10">
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fitscore-600 to-fitscore-400 inline-block">404</div>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-fitscore-600 to-fitscore-500 text-white hover:opacity-90 transition-opacity"
        >
          Return to Dashboard
        </Button>
        
        <div className="mt-8 relative">
          <div className="absolute inset-0 blur-sm bg-fitscore-100 rounded-full"></div>
          <div className="relative bg-white rounded-lg px-6 py-4 shadow-lg transform hover:-translate-y-1 transition-transform">
            <p className="text-sm text-fitscore-600">Lost? Don't worry, we'll get you back on track!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
