
import React, { useState, useEffect } from 'react';
import { useSensorSdk } from '@/hooks/useSensorSdk';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, ActivitySquare, RefreshCw, Smartphone, Laptop, Settings } from 'lucide-react';
import { DialogTitle, DialogDescription, DialogContent, Dialog } from '@/components/ui/dialog';
import PermissionsManager from '@/components/permissions/PermissionsManager';
import SensorStatusCard from './SensorStatusCard';
import SensorDataDisplay from './SensorDataDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Platform } from 'react-native';

const SensorDataManager = () => {
  const { user } = useAuth();
  const { sensorData, isLoading, isRecording, isNative, startRecording, stopRecording, fetchLatestSensorData } = useSensorSdk();
  const { permissions, checkPermissions, requestAllPermissions } = usePermissions();
  const [showPermissions, setShowPermissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("status");
  const [permissionCheckTimestamp, setPermissionCheckTimestamp] = useState(0);
  
  const hasRequiredPermissions = permissions.motion && permissions.location;
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // No mobile detection for now - using web only
  useEffect(() => {
    setIsMobileDevice(false);
    console.log('Running on web platform');
  }, []);
  
  // Add app state change listener for permission rechecking
  useEffect(() => {
    if (isMobileDevice) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('App became active, rechecking permissions...');
          checkPermissionsWithDebounce();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isMobileDevice]);
  
  const checkPermissionsWithDebounce = async () => {
    const now = Date.now();
    if (now - permissionCheckTimestamp < 2000) {
      console.log('Skipping permission check (too frequent)');
      return permissions.motion && permissions.location;
    }
    
    setPermissionCheckTimestamp(now);
    return await checkPermissions();
  };
  
  useEffect(() => {
    const mobileSetupDone = localStorage.getItem('mobileSetupDone');
    
    if (isMobileDevice && !mobileSetupDone && user) {
      console.log('First time setup on mobile device');
      setTimeout(() => {
        setShowPermissions(true);
        localStorage.setItem('mobileSetupDone', 'true');
      }, 1000);
    }
  }, [user, isMobileDevice]);
  
  // Deep permission check when component loads
  useEffect(() => {
    if (isMobileDevice) {
      // More aggressive permission checking on initial load
      const timer = setTimeout(() => {
        checkPermissions();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isMobileDevice, checkPermissions]);
  
  const handleStartRecording = async () => {
    if (!user) {
      toast.error("You need to sign in to track fitness data");
      return;
    }
    
    await checkPermissionsWithDebounce();
    
    if (!permissions.motion || !permissions.location) {
      console.log("Missing required permissions, requesting...");
      setShowPermissions(true);
      return;
    }
    
    toast.loading("Starting fitness tracking...");
    const success = await startRecording();
    toast.dismiss();
    
    if (success) {
      toast.success("Fitness tracking started successfully");
      setActiveTab("data");
    } else {
      toast.error("Failed to start fitness tracking");
      console.error("Failed to start recording");
      
      // If we failed to start recording, double-check permissions
      const permissionsValid = await checkPermissions();
      if (!permissionsValid) {
        setShowPermissions(true);
      }
    }
  };

  const handleRefreshData = async () => {
    if (!user) {
      toast.error("You need to sign in to refresh fitness data");
      return;
    }
    
    setRefreshing(true);
    toast.loading("Refreshing fitness data...");
    await fetchLatestSensorData();
    toast.dismiss();
    toast.success("Fitness data refreshed");
    setTimeout(() => setRefreshing(false), 500);
  };
  
  const handlePermissionsComplete = async () => {
    setShowPermissions(false);
    const permissionsGranted = await checkPermissionsWithDebounce();
    console.log("Permissions after check:", permissions);
    
    if (permissions.motion && permissions.location) {
      toast.message("Permissions granted! Start tracking?", {
        action: {
          label: "Start",
          onClick: () => handleStartRecording()
        }
      });
    }
  };
  
  useEffect(() => {
    if (user && !isLoading) {
      fetchLatestSensorData();
    }
  }, [user, isLoading, fetchLatestSensorData]);

  useEffect(() => {
    const permissionInterval = setInterval(() => {
      if (isMobileDevice && isRecording) {
        checkPermissionsWithDebounce();
      }
    }, 60 * 1000);
    
    return () => clearInterval(permissionInterval);
  }, [isMobileDevice, isRecording]);

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
              {isMobileDevice ? 
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
            {isMobileDevice ? 
              "Track your fitness activities in real-time with your mobile device" : 
              "Using simulated fitness data for demonstration"
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
                isLoading={isLoading}
                isNative={isNative}
                hasRequiredPermissions={hasRequiredPermissions}
                onRequestPermissions={() => setShowPermissions(true)}
              />
            </TabsContent>
            <TabsContent value="data" className="space-y-4 pt-4">
              <SensorDataDisplay sensorData={sensorData} isLoading={isLoading} />
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
          <PermissionsManager onComplete={handlePermissionsComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SensorDataManager;
