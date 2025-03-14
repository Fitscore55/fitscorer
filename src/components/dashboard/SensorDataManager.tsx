
import React from 'react';
import { useSensorData } from '@/hooks/useSensorData';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, ActivitySquare, Shield } from 'lucide-react';
import { DialogTitle, DialogDescription, DialogContent, Dialog } from '@/components/ui/dialog';
import PermissionsManager from '@/components/permissions/PermissionsManager';

const SensorDataManager = () => {
  const { sensorData, isLoading, isRecording, startRecording, stopRecording } = useSensorData();
  const { permissions } = usePermissions();
  const [showPermissions, setShowPermissions] = React.useState(false);
  
  const hasRequiredPermissions = permissions.motion && permissions.location;
  
  const handleStartRecording = async () => {
    if (!hasRequiredPermissions) {
      setShowPermissions(true);
      return;
    }
    
    await startRecording();
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tracking Status</p>
                  <p className={`text-xs ${isRecording ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isRecording ? 'Active' : 'Inactive'}
                  </p>
                </div>
                {!hasRequiredPermissions && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                    onClick={() => setShowPermissions(true)}
                  >
                    <Shield className="h-3 w-3" />
                    Permissions Required
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="data" className="space-y-4 pt-4">
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {isRecording ? (
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
