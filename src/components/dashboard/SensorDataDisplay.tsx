
import React from 'react';
import { SensorData } from '@/hooks/useSensorData';
import { CircleOff, Loader2 } from 'lucide-react';

interface SensorDataDisplayProps {
  sensorData: SensorData;
}

const SensorDataDisplay = ({ sensorData }: SensorDataDisplayProps) => {
  const hasNoData = 
    sensorData.steps === 0 && 
    sensorData.distance === 0 && 
    sensorData.calories === 0 && 
    sensorData.fitscore === 0;

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

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Steps</p>
        <p className="text-lg font-medium">{sensorData.steps.toLocaleString()}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Distance</p>
        <p className="text-lg font-medium">{sensorData.distance} km</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Calories</p>
        <p className="text-lg font-medium">{sensorData.calories}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Fitscore</p>
        <p className="text-lg font-medium">{sensorData.fitscore}</p>
      </div>
    </div>
  );
};

export default SensorDataDisplay;
