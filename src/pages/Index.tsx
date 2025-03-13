
import { useState } from "react";
import { Activity, BarChart, Footprints } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import StatCard from "@/components/dashboard/StatCard";
import FitscoreCard from "@/components/dashboard/FitscoreCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { mockFitnessData } from "@/utils/mockData";

const Index = () => {
  // In a real app, this would come from backend APIs and device sensors
  const [fitnessData, setFitnessData] = useState(mockFitnessData);

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <FitscoreCard 
          score={fitnessData.fitscore}
          level={7}
          nextLevelScore={1000}
          currentLevelScore={500}
        />

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Steps"
            value={fitnessData.steps.toLocaleString()}
            icon={<Footprints className="h-5 w-5" />}
            trend={{ value: 12, direction: "up" }}
          />
          <StatCard
            title="Distance"
            value={`${fitnessData.distance} km`}
            icon={<Activity className="h-5 w-5" />}
            trend={{ value: 8, direction: "up" }}
          />
        </div>

        <ActivityChart />
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-3">Activity Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>You're just 1,258 steps away from your daily goal!</li>
            <li>Try taking a 10-minute walk after each meal.</li>
            <li>Join the "10K Steps Challenge" to compete with friends.</li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Index;
