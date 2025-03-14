
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { toast } from 'sonner';
import { useMotionSensor } from './useMotionSensor';
import { useLocationSensor } from './useLocationSensor';
import { useFitnessData } from './useFitnessData';

export interface SensorData {
  steps: number;
  distance: number;
  calories: number;
  fitscore: number;
}

export const useSensorData = () => {
  const { user } = useAuth();
  const { permissions, checkPermissions } = usePermissions();
  const [sensorData, setSensorData] = useState<SensorData>({
    steps: 0,
    distance: 0,
    calories: 0,
    fitscore: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isAutoTracking, setIsAutoTracking] = useState(false);
  const autoTrackingIntervalRef = useRef<number | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  
  const { startListening: startMotion, stopListening: stopMotion } = useMotionSensor();
  const { startTracking: startLocation, stopTracking: stopLocation } = useLocationSensor();
  const { 
    isLoading, 
    error, 
    fetchLatestData, 
    saveData, 
    generateMockData 
  } = useFitnessData(user?.id);

  // Fetch the latest sensor data from the database
  const fetchLatestSensorData = useCallback(async () => {
    if (!user) return;
    
    const data = await fetchLatestData();
    if (data) {
      setSensorData(data);
    }
  }, [user, fetchLatestData]);

  // Start recording sensor data
  const startRecording = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('You must be logged in to record fitness data');
      return false;
    }
    
    // Check if we have the necessary permissions
    if (!permissions.motion || !permissions.location) {
      await checkPermissions();
      if (!permissions.motion || !permissions.location) {
        toast.error('Motion and location permissions are required');
        return false;
      }
    }

    try {
      // Start sensors
      await startMotion();
      await startLocation();
      
      setIsRecording(true);
      toast.success('Fitness tracking started');
      return true;
    } catch (err) {
      console.error('Error starting recording:', err);
      setIsRecording(false);
      toast.error('Failed to start fitness tracking');
      return false;
    }
  };

  // Stop recording sensor data and save the results
  const stopRecording = async () => {
    if (!isRecording) return true; // Already stopped
    
    try {
      // Stop sensors
      await stopMotion();
      await stopLocation();
      
      // In a real app, we would calculate the final values
      // Here we just simulate some data
      const newData = generateMockData(sensorData);
      
      setSensorData(newData);
      if (user) {
        await saveData(newData);
      }
      
      setIsRecording(false);
      toast.success('Fitness tracking stopped and data saved');
      return true;
    } catch (err) {
      console.error('Error stopping recording:', err);
      setIsRecording(false);
      toast.error('Failed to stop fitness tracking');
      return false;
    }
  };

  // Toggle automatic tracking
  const toggleAutoTracking = async (enable: boolean) => {
    try {
      if (enable) {
        // Check if user is logged in
        if (!user) {
          toast.error('You must be logged in to use auto-tracking');
          return false;
        }
        
        // Start automatic tracking
        if (!permissions.motion || !permissions.location) {
          await checkPermissions();
          if (!permissions.motion || !permissions.location) {
            toast.error('Motion and location permissions are required for automatic tracking');
            return false;
          }
        }
        
        // Start the recording process
        const started = await startRecording();
        if (!started) return false;
        
        // Set up interval to periodically save data
        if (autoTrackingIntervalRef.current) {
          clearInterval(autoTrackingIntervalRef.current);
        }
        
        // Using window.setInterval instead of setInterval to fix TypeScript issue
        autoTrackingIntervalRef.current = window.setInterval(async () => {
          try {
            if (!user) return; // Safety check
            
            const newData = generateMockData(sensorData);
            setSensorData(newData);
            
            // Only save if user is logged in and enough time has passed since last save
            const now = Date.now();
            if (now - lastSaveTimeRef.current >= 60000) { // At least 1 minute between saves
              await saveData(newData);
              lastSaveTimeRef.current = now;
              console.log('Auto-tracking data saved at', new Date().toISOString());
            }
          } catch (e) {
            console.error('Error in auto-tracking interval:', e);
          }
        }, 30 * 1000); // Update data every 30 seconds, save every minute
        
        setIsAutoTracking(true);
        toast.success('Automatic fitness tracking enabled');
        
        // Save user preference
        localStorage.setItem('autoTrackingEnabled', 'true');
        return true;
      } else {
        // Stop automatic tracking
        if (isRecording) {
          await stopRecording();
        }
        
        if (autoTrackingIntervalRef.current) {
          clearInterval(autoTrackingIntervalRef.current);
          autoTrackingIntervalRef.current = null;
        }
        
        setIsAutoTracking(false);
        toast.success('Automatic fitness tracking disabled');
        
        // Save user preference
        localStorage.setItem('autoTrackingEnabled', 'false');
        return true;
      }
    } catch (err) {
      console.error('Error toggling auto tracking:', err);
      setIsAutoTracking(false);
      toast.error('Failed to toggle automatic tracking');
      return false;
    }
  };

  // Check if auto-tracking was previously enabled and restore state
  useEffect(() => {
    // Auto restore tracking on component mount if previously enabled
    const autoRestoreTracking = async () => {
      try {
        const autoTrackingEnabled = localStorage.getItem('autoTrackingEnabled') === 'true';
        if (autoTrackingEnabled && user && !isRecording && !isAutoTracking) {
          console.log('Restoring auto-tracking state...');
          await checkPermissions();
          if (permissions.motion && permissions.location) {
            await toggleAutoTracking(true);
          }
        }
      } catch (e) {
        console.error('Error restoring auto-tracking:', e);
      }
    };
    
    // Only try to restore if user is logged in and not already tracking
    if (user && !isRecording && !isAutoTracking) {
      autoRestoreTracking();
    }
    
    return () => {
      // Clean up on unmount
      if (autoTrackingIntervalRef.current) {
        clearInterval(autoTrackingIntervalRef.current);
      }
      
      if (isRecording) {
        stopRecording();
      }
    };
  }, [user, permissions.motion, permissions.location]);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchLatestSensorData();
    }
  }, [user, fetchLatestSensorData]);

  // Refresh data periodically even when not tracking
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (user && !isLoading) {
        fetchLatestSensorData();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user, isLoading, fetchLatestSensorData]);

  return {
    sensorData,
    isLoading,
    isRecording,
    isAutoTracking,
    error,
    startRecording,
    stopRecording,
    toggleAutoTracking,
    fetchLatestSensorData
  };
};
