
import React from 'react';
import { SensorData } from '@/hooks/useSensorData';

interface SensorDataDisplayProps {
  sensorData: SensorData;
}

const SensorDataDisplay = ({ sensorData }: SensorDataDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Steps</p>
        <p className="text-lg font-medium">{sensorData.steps}</p>
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
