
import React, { useState, useEffect } from 'react';
import { useSensorData } from '@/hooks/useSensorData';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, ActivitySquare, RefreshCw, Shield, Smartphone, Laptop } from 'lucide-react';
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
  const { permissions, checkPermissions, requestAllPermissions, isNative: isNativePermissions } = usePermissions();
  const [showPermissions, setShowPermissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("status");
  
  const hasRequiredPermissions = permissions.motion && permissions.location;
  const isMobileDevice = Capacitor.isNativePlatform();
  
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
  
  // Verify permissions before starting tracking
  const verifyPermissionsAndProceed = async (action: string) => {
    // If not on mobile, we'll use simulated data
    if (!isMobileDevice) {
      return true;
    }
    
    // Check current permission state
    await checkPermissions();
    
    // If permissions aren't granted, request them
    if (!permissions.motion || !permissions.location) {
      console.log("Missing required permissions, requesting...");
      const granted = await requestAllPermissions();
      
      if (!granted) {
        console.log("Permission request failed or denied");
        setShowPermissions(true);
        return false;
      }
    }
    
    return true;
  };
  
  const handleStartRecording = async () => {
    if (!user) {
      toast.error("You need to sign in to track fitness data");
      return;
    }
    
    // Verify permissions first
    const permissionsOk = await verifyPermissionsAndProceed('start');
    if (!permissionsOk && isMobileDevice) {
      console.log("Could not obtain required permissions");
      return;
    }
    
    toast.loading("Starting fitness tracking...");
    const success = await startRecording();
    toast.dismiss();
    
    if (success) {
      toast.success("Fitness tracking started successfully");
      setActiveTab("data"); // Switch to data tab to show real-time updates
    } else {
      toast.error("Failed to start fitness tracking");
      console.error("Failed to start recording");
    }
  };

  const handleToggleAutoTracking = async (checked: boolean) => {
    if (!user) {
      toast.error("You need to sign in to enable auto-tracking");
      return;
    }
    
    if (checked) {
      // Verify permissions first
      const permissionsOk = await verifyPermissionsAndProceed('auto-track');
      if (!permissionsOk && isMobileDevice) {
        console.log("Could not obtain required permissions for auto-tracking");
        return;
      }
    }
    
    console.log(`Attempting to ${checked ? 'enable' : 'disable'} auto-tracking...`);
    toast.loading(checked ? "Enabling auto-tracking..." : "Disabling auto-tracking...");
    const success = await toggleAutoTracking(checked);
    toast.dismiss();
    
    if (success) {
      console.log(`Auto-tracking ${checked ? 'enabled' : 'disabled'} successfully`);
      toast.success(checked ? "Auto-tracking enabled" : "Auto-tracking disabled");
      if (checked) {
        setActiveTab("data"); // Switch to data tab to show active tracking
      }
    } else {
      console.error(`Failed to ${checked ? 'enable' : 'disable'} auto-tracking`);
      toast.error(`Failed to ${checked ? 'enable' : 'disable'} auto-tracking`);
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
    const permissionsGranted = await checkPermissions();
    console.log("Permissions after check:", permissions);
    
    // If permissions are now granted, ask user if they want to start tracking
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
    // Initial data load on component mount
    if (user && !isLoading) {
      fetchLatestSensorData();
    }
  }, [user, isLoading, fetchLatestSensorData]);

  // Periodically check permissions
  useEffect(() => {
    const permissionInterval = setInterval(() => {
      if (isMobileDevice && (isRecording || isAutoTracking)) {
        checkPermissions();
      }
    }, 60 * 1000); // Check every minute
    
    return () => clearInterval(permissionInterval);
  }, [isMobileDevice, isRecording, isAutoTracking, checkPermissions]);
  
  // Auto-start tracking if permissions are granted on page load
  useEffect(() => {
    if (user && isMobileDevice && !isRecording && !isAutoTracking && hasRequiredPermissions) {
      const autoTrackingEnabled = localStorage.getItem('autoTrackingEnabled') === 'true';
      if (autoTrackingEnabled) {
        console.log("Auto-tracking was previously enabled, restarting...");
        toggleAutoTracking(true);
      }
    }
  }, [user, isMobileDevice, isRecording, isAutoTracking, hasRequiredPermissions, toggleAutoTracking]);

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
              "View your fitness data (tracking requires mobile app)"
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
              <SensorDataDisplay sensorData={sensorData} isLoading={isLoading} />
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
