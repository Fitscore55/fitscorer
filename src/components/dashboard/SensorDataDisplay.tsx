
import React from 'react';
import { SensorData } from '@/hooks/useSensorData';
import { CircleOff, Loader2, Activity, BarChart2, Flame, Footprints } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SensorDataDisplayProps {
  sensorData: SensorData;
  isLoading?: boolean;
}

const SensorDataDisplay = ({ sensorData, isLoading = false }: SensorDataDisplayProps) => {
  const hasNoData = 
    sensorData.steps === 0 && 
    sensorData.distance === 0 && 
    sensorData.calories === 0 && 
    sensorData.fitscore === 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Loader2 className="h-8 w-8 text-gray-400 mb-2 animate-spin" />
        <p className="text-muted-foreground">Loading fitness data...</p>
      </div>
    );
  }

  if (hasNoData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CircleOff className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-muted-foreground">No fitness data recorded yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start tracking to collect fitness data
        </p>
      </div>
    );
  }

  // Calculate progress percentages for visualization
  const stepsGoal = 10000;
  const stepsProgress = Math.min(100, (sensorData.steps / stepsGoal) * 100);
  
  const distanceGoal = 5; // 5 km
  const distanceProgress = Math.min(100, (sensorData.distance / distanceGoal) * 100);
  
  const caloriesGoal = 500;
  const caloriesProgress = Math.min(100, (sensorData.calories / caloriesGoal) * 100);
  
  const fitscoreGoal = 500;
  const fitscoreProgress = Math.min(100, (sensorData.fitscore / fitscoreGoal) * 100);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Footprints className="h-5 w-5 text-fitscore-600" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Steps</h3>
                <span className="text-lg font-semibold">{sensorData.steps.toLocaleString()}</span>
              </div>
              <Progress className="h-2 mt-1" value={stepsProgress} />
              <p className="text-xs text-muted-foreground mt-1">Goal: 10,000 steps</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="h-5 w-5 text-fitscore-600" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Distance</h3>
                <span className="text-lg font-semibold">{sensorData.distance.toFixed(2)} km</span>
              </div>
              <Progress className="h-2 mt-1" value={distanceProgress} />
              <p className="text-xs text-muted-foreground mt-1">Goal: 5 km</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Flame className="h-5 w-5 text-fitscore-600" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Calories</h3>
                <span className="text-lg font-semibold">{sensorData.calories.toLocaleString()}</span>
              </div>
              <Progress className="h-2 mt-1" value={caloriesProgress} />
              <p className="text-xs text-muted-foreground mt-1">Goal: 500 calories</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart2 className="h-5 w-5 text-fitscore-600" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Fitscore</h3>
                <span className="text-lg font-semibold">{sensorData.fitscore.toLocaleString()}</span>
              </div>
              <Progress className="h-2 mt-1" value={fitscoreProgress} />
              <p className="text-xs text-muted-foreground mt-1">Goal: 500 points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorDataDisplay;
