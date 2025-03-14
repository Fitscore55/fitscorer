
import { useState, useEffect } from "react";
import { Activity, BarChart, Coins, Footprints } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import StatCard from "@/components/dashboard/StatCard";
import FitscoreCard from "@/components/dashboard/FitscoreCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import SensorDataManager from "@/components/dashboard/SensorDataManager";
import ActivityTips from "@/components/dashboard/ActivityTips";
import PermissionsManager from "@/components/permissions/PermissionsManager";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdSlot from "@/components/ads/AdSlot";
import { useAuth } from "@/contexts/AuthContext";
import { useSensorData } from "@/hooks/useSensorData";
import { supabase } from "@/integrations/supabase/client";
import { FitnessData } from "@/types";

const Index = () => {
  const [fitnessData, setFitnessData] = useState<FitnessData>({
    steps: 0,
    distance: 0,
    fitscore: 0,
    calories: 0,
    date: new Date().toISOString()
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPermissions, setShowPermissions] = useState(false);
  const { user } = useAuth();
  const { sensorData } = useSensorData();
  const [loading, setLoading] = useState(true);

  // Fetch wallet balance when user is available
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          // If no wallet found, create one with zero balance
          if (error.code === 'PGRST116') {
            // No rows returned, create a new wallet
            const { data: newWallet, error: insertError } = await supabase
              .from('wallets')
              .insert({ user_id: user.id, balance: 0 })
              .select('balance')
              .single();
              
            if (insertError) {
              console.error('Error creating wallet:', insertError);
              return;
            }
            
            if (newWallet) {
              setWalletBalance(newWallet.balance);
            }
          } else {
            console.error('Error fetching wallet balance:', error);
          }
          return;
        }
        
        if (data) {
          setWalletBalance(data.balance);
        }
      } catch (err) {
        console.error('Error in wallet balance fetch:', err);
      }
    };
    
    fetchWalletBalance();
  }, [user]);

  // Update fitness data when sensor data changes
  useEffect(() => {
    if (sensorData && Object.keys(sensorData).length > 0) {
      setFitnessData(prev => ({
        ...prev,
        steps: sensorData.steps,
        distance: sensorData.distance,
        fitscore: sensorData.fitscore,
        calories: sensorData.calories || prev.calories
      }));
      setLoading(false);
    }
  }, [sensorData]);

  useEffect(() => {
    // Check if permissions have been requested before
    const permissionsRequested = localStorage.getItem('permissionsRequested');
    if (!permissionsRequested) {
      // Show permissions dialog on first visit
      setTimeout(() => {
        setShowPermissions(true);
      }, 500); // Add a slight delay to ensure UI is ready
    }
  }, []);

  const handlePermissionsComplete = () => {
    localStorage.setItem('permissionsRequested', 'true');
    setShowPermissions(false);
    toast.success("Setup complete! Welcome to Fitscorer");
  };

  // Ensure dialog can be closed even if permissions aren't granted
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      handlePermissionsComplete();
    }
    setShowPermissions(open);
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-fitscore-600 to-fitscore-500 bg-clip-text text-transparent">Dashboard</h1>
          <div className="text-sm px-2 py-1 rounded-md bg-fitscore-50 text-fitscore-600 font-medium flex items-center">
            <Coins className="h-4 w-4 mr-1" />
            {walletBalance} coins
          </div>
        </div>

        <AdSlot slotId="home-top" className="mx-auto" />

        <FitscoreCard 
          score={fitnessData.fitscore}
        />

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Steps"
            value={fitnessData.steps.toLocaleString()}
            icon={<Footprints className="h-5 w-5" />}
            trend={{ value: 12, direction: "up" }}
            highlight={fitnessData.steps > 8000}
          />
          <StatCard
            title="Distance"
            value={`${fitnessData.distance} km`}
            icon={<Activity className="h-5 w-5" />}
            trend={{ value: 8, direction: "up" }}
          />
        </div>

        {user && <SensorDataManager />}

        <ActivityChart />
        
        <ActivityTips />
      </div>

      <Dialog 
        open={showPermissions} 
        onOpenChange={handleDialogChange}
      >
        <DialogContent className="max-w-xs rounded-lg p-4">
          <PermissionsManager onComplete={handlePermissionsComplete} />
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Index;
