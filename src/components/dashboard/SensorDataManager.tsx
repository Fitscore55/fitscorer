
import React, { useState } from 'react';
import { useSensorData } from '@/hooks/useSensorData';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, ActivitySquare } from 'lucide-react';
import { DialogTitle, DialogDescription, DialogContent, Dialog } from '@/components/ui/dialog';
import PermissionsManager from '@/components/permissions/PermissionsManager';
import SensorStatusCard from './SensorStatusCard';
import SensorDataDisplay from './SensorDataDisplay';

const SensorDataManager = () => {
  const { sensorData, isLoading, isRecording, isAutoTracking, startRecording, stopRecording, toggleAutoTracking } = useSensorData();
  const { permissions } = usePermissions();
  const [showPermissions, setShowPermissions] = useState(false);
  
  const hasRequiredPermissions = permissions.motion && permissions.location;
  
  const handleStartRecording = async () => {
    if (!hasRequiredPermissions) {
      setShowPermissions(true);
      return;
    }
    
    await startRecording();
  };

  const handleToggleAutoTracking = async (checked: boolean) => {
    if (checked && !hasRequiredPermissions) {
      setShowPermissions(true);
      return;
    }
    
    await toggleAutoTracking(checked);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivitySquare className="h-5 w-5 text-fitscore-600" />
            Fitness Tracking
          </CardTitle>
          <CardDescription>
            Track your fitness activities in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="space-y-4 pt-4">
              <SensorStatusCard
                isRecording={isRecording}
                isAutoTracking={isAutoTracking}
                isLoading={isLoading}
                hasRequiredPermissions={hasRequiredPermissions}
                onToggleAutoTracking={handleToggleAutoTracking}
                onRequestPermissions={() => setShowPermissions(true)}
              />
            </TabsContent>
            <TabsContent value="data" className="space-y-4 pt-4">
              <SensorDataDisplay sensorData={sensorData} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {isAutoTracking ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => toggleAutoTracking(false)}
              disabled={isLoading}
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Auto Tracking
            </Button>
          ) : isRecording ? (
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={stopRecording}
              disabled={isLoading}
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Tracking
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="w-full" 
              onClick={handleStartRecording}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="max-w-xs rounded-lg p-4">
          <DialogTitle>Required Permissions</DialogTitle>
          <DialogDescription>
            To track your fitness activity, we need access to motion and location data
          </DialogDescription>
          <PermissionsManager onComplete={() => setShowPermissions(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SensorDataManager;
