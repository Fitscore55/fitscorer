
import React, { useState, useEffect } from 'react';
import { useSensorData } from '@/hooks/useSensorData';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, ActivitySquare, RefreshCw, BarChart, Shield, Smartphone, Laptop } from 'lucide-react';
import { DialogTitle, DialogDescription, DialogContent, Dialog } from '@/components/ui/dialog';
import PermissionsManager from '@/components/permissions/PermissionsManager';
import SensorStatusCard from './SensorStatusCard';
import SensorDataDisplay from './SensorDataDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

const SensorDataManager = () => {
  const { user } = useAuth();
  const { sensorData, isLoading, isRecording, isAutoTracking, isNative, startRecording, stopRecording, toggleAutoTracking, fetchLatestSensorData } = useSensorData();
  const { permissions, checkPermissions, isNative: isNativePermissions } = usePermissions();
  const [showPermissions, setShowPermissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("status");
  
  const hasRequiredPermissions = permissions.motion && permissions.location;
  
  useEffect(() => {
    // Check if this is the first time opening on a mobile device and show permissions dialog
    const mobileSetupDone = localStorage.getItem('mobileSetupDone');
    
    if (Capacitor.isNativePlatform() && !mobileSetupDone && user) {
      console.log('First time setup on mobile device');
      setTimeout(() => {
        setShowPermissions(true);
        localStorage.setItem('mobileSetupDone', 'true');
      }, 1000);
    }
  }, [user]);
  
  const handleStartRecording = async () => {
    if (!user) {
      toast.error("You need to sign in to track fitness data");
      return;
    }
    
    if (!hasRequiredPermissions) {
      setShowPermissions(true);
      return;
    }
    
    await startRecording();
  };

  const handleToggleAutoTracking = async (checked: boolean) => {
    if (!user) {
      toast.error("You need to sign in to enable auto-tracking");
      return;
    }
    
    if (checked && !hasRequiredPermissions) {
      setShowPermissions(true);
      return;
    }
    
    await toggleAutoTracking(checked);
  };

  const handleRefreshData = async () => {
    if (!user) {
      toast.error("You need to sign in to refresh fitness data");
      return;
    }
    
    setRefreshing(true);
    await fetchLatestSensorData();
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const handlePermissionsComplete = async () => {
    setShowPermissions(false);
    await checkPermissions();
    
    // If permissions are now granted, ask user if they want to start tracking
    if (permissions.motion && permissions.location) {
      toast.message("Permissions granted! Start tracking?", {
        action: {
          label: "Start",
          onClick: () => startRecording()
        }
      });
    }
  };
  
  useEffect(() => {
    // Initial data load on component mount
    if (user && !isLoading) {
      fetchLatestSensorData();
    }
  }, [user]);

  // Periodically check permissions
  useEffect(() => {
    const permissionInterval = setInterval(() => {
      checkPermissions();
    }, 30 * 1000); // Check every 30 seconds
    
    return () => clearInterval(permissionInterval);
  }, []);
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivitySquare className="h-5 w-5 text-fitscore-600" />
            Fitness Tracking
          </CardTitle>
          <CardDescription>
            Sign in to track your fitness activities
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            You need to be signed in to use fitness tracking features
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ActivitySquare className="h-5 w-5 text-fitscore-600" />
              Fitness Tracking
              {isNative ? 
                <Smartphone className="h-4 w-4 text-green-500 ml-2" /> : 
                <Laptop className="h-4 w-4 text-blue-500 ml-2" />
              }
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleRefreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh data</span>
            </Button>
          </div>
          <CardDescription>
            {isNative ? 
              "Track your fitness activities in real-time with your mobile device" : 
              "Track your fitness activities (Note: Web simulation mode)"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="space-y-4 pt-4">
              <SensorStatusCard
                isRecording={isRecording}
                isAutoTracking={isAutoTracking}
                isLoading={isLoading}
                isNative={isNative}
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
            To track your fitness activity on your mobile device, we need access to motion and location data
          </DialogDescription>
          <PermissionsManager onComplete={handlePermissionsComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SensorDataManager;
