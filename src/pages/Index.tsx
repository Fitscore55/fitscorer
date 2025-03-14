
import { useState, useEffect } from "react";
import { Activity, BarChart, Coins, Footprints } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import StatCard from "@/components/dashboard/StatCard";
import FitscoreCard from "@/components/dashboard/FitscoreCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { mockFitnessData, mockWallet } from "@/utils/mockData";

const Index = () => {
  // In a real app, this would come from backend APIs and device sensors
  const [fitnessData, setFitnessData] = useState(mockFitnessData);
  const [wallet] = useState(mockWallet);

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-fitscore-600 to-fitscore-500 bg-clip-text text-transparent">Dashboard</h1>
          <div className="text-sm px-2 py-1 rounded-md bg-fitscore-50 text-fitscore-600 font-medium flex items-center">
            <Coins className="h-4 w-4 mr-1" />
            {wallet.balance} coins
          </div>
        </div>

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

        <ActivityChart />
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fitscore-100/50 dark:bg-fitscore-900/20 rounded-bl-3xl" />
          <h3 className="text-lg font-semibold mb-3 relative">Activity Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-sm relative">
            <li className="transition-all hover:translate-x-1 hover:text-fitscore-600">You're just 1,258 steps away from your daily goal!</li>
            <li className="transition-all hover:translate-x-1 hover:text-fitscore-600">Try taking a 10-minute walk after each meal.</li>
            <li className="transition-all hover:translate-x-1 hover:text-fitscore-600">Join the "10K Steps Challenge" to compete with friends.</li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Index;
