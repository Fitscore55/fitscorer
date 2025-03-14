
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { toast } from 'sonner';
import { useMotionSensor } from './useMotionSensor';
import { useLocationSensor } from './useLocationSensor';
import { useFitnessData } from './useFitnessData';
import { Capacitor } from '@capacitor/core';

export interface SensorData {
  steps: number;
  distance: number;
  calories: number;
  fitscore: number;
}

// Helper function to calculate steps from accelerometer data
const calculateStepsFromAccel = (accelData: any, previousData: any): number => {
  if (!accelData || !accelData.acceleration) return 0;
  
  // Algorithm for step detection
  const { x, y, z } = accelData.acceleration;
  const magnitude = Math.sqrt(x*x + y*y + z*z);
  
  // Check if we have a significant movement
  const threshold = 1.2; // Adjust based on testing
  
  if (previousData && magnitude > threshold && previousData.magnitude < threshold) {
    return 1; // One step detected
  }
  
  return 0;
};

// Helper function to calculate distance from GPS positions
const calculateDistance = (position: any, lastPosition: any): number => {
  if (!position || !lastPosition) return 0;
  
  // Haversine formula to calculate distance between GPS coordinates
  const R = 6371; // Earth radius in kilometers
  const dLat = (position.coords.latitude - lastPosition.coords.latitude) * (Math.PI / 180);
  const dLon = (position.coords.longitude - lastPosition.coords.longitude) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lastPosition.coords.latitude * (Math.PI / 180)) * 
    Math.cos(position.coords.latitude * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const useSensorData = () => {
  const { user } = useAuth();
  const { permissions, checkPermissions, isNative } = usePermissions();
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
  const lastAccelDataRef = useRef<any>(null);
  const lastPositionRef = useRef<any>(null);
  const sensorAccumulatorRef = useRef({
    steps: 0,
    distance: 0
  });
  
  const { 
    startListening: startMotion, 
    stopListening: stopMotion,
    lastAccelData,
    isNative: isNativeMotion
  } = useMotionSensor();
  
  const { 
    startTracking: startLocation, 
    stopTracking: stopLocation,
    lastPosition,
    isNative: isNativeLocation
  } = useLocationSensor();
  
  const { 
    isLoading, 
    error, 
    fetchLatestData, 
    saveData
  } = useFitnessData(user?.id);

  // Process motion data for step counting
  useEffect(() => {
    if (!isRecording || !lastAccelData) return;
    
    const stepsIncrement = calculateStepsFromAccel(lastAccelData, lastAccelDataRef.current);
    if (stepsIncrement > 0) {
      // Update accumulated steps
      sensorAccumulatorRef.current.steps += stepsIncrement;
      
      // Update sensor data
      setSensorData(prev => ({
        ...prev,
        steps: prev.steps + stepsIncrement,
        // Simple calorie calculation based on steps
        calories: Math.round(prev.calories + stepsIncrement * 0.04)
      }));
      
      console.log(`Step detected. Total steps: ${sensorAccumulatorRef.current.steps}`);
    }
    
    // Save the current data for next comparison
    lastAccelDataRef.current = {
      ...lastAccelData,
      magnitude: Math.sqrt(
        lastAccelData.acceleration.x * lastAccelData.acceleration.x + 
        lastAccelData.acceleration.y * lastAccelData.acceleration.y + 
        lastAccelData.acceleration.z * lastAccelData.acceleration.z
      )
    };
  }, [lastAccelData, isRecording]);

  // Process location data for distance calculation
  useEffect(() => {
    if (!isRecording || !lastPosition) return;
    
    const distanceIncrement = calculateDistance(lastPosition, lastPositionRef.current);
    if (distanceIncrement > 0) {
      // Update accumulated distance
      sensorAccumulatorRef.current.distance += distanceIncrement;
      
      // Update sensor data (round to 2 decimal places)
      setSensorData(prev => ({
        ...prev,
        distance: +(prev.distance + distanceIncrement).toFixed(2)
      }));
      
      console.log(`Distance update: +${distanceIncrement.toFixed(4)}km. Total: ${sensorAccumulatorRef.current.distance.toFixed(2)}km`);
    }
    
    // Save the current position for next comparison
    lastPositionRef.current = lastPosition;
  }, [lastPosition, isRecording]);

  // Update fitscore based on steps and distance
  useEffect(() => {
    if (!isRecording) return;
    
    // Fitscore calculation formula
    const newFitscore = Math.round(sensorData.steps / 20 + sensorData.distance * 100);
    
    setSensorData(prev => ({
      ...prev,
      fitscore: newFitscore
    }));
  }, [sensorData.steps, sensorData.distance, isRecording]);

  // Fetch the latest sensor data from the database
  const fetchLatestSensorData = useCallback(async () => {
    if (!user) return;
    
    const data = await fetchLatestData();
    if (data) {
      console.log('Loaded sensor data from database:', data);
      setSensorData(data);
      
      // Also update the accumulator with the latest values
      sensorAccumulatorRef.current = {
        steps: data.steps,
        distance: data.distance
      };
    } else {
      console.log('No sensor data found in database');
    }
  }, [user, fetchLatestData]);

  // Start recording sensor data
  const startRecording = async () => {
    // Check if user is logged in
    if (!user) {
      console.error('Cannot start recording: User not logged in');
      toast.error('You must be logged in to record fitness data');
      return false;
    }
    
    // Check if running on mobile
    if (!Capacitor.isNativePlatform()) {
      console.error('Cannot start recording: Not on a mobile device');
      toast.error('Real tracking is only available on mobile devices');
      return false;
    }
    
    // Check if we have the necessary permissions
    if (!permissions.motion || !permissions.location) {
      console.log('Missing permissions, checking...');
      await checkPermissions();
      if (!permissions.motion || !permissions.location) {
        console.error('Required permissions not granted');
        toast.error('Motion and location permissions are required');
        return false;
      }
    }

    try {
      console.log('Starting fitness tracking...');
      
      // Get the latest data first to ensure we start from the correct baseline
      await fetchLatestSensorData();
      
      // Reset the accumulator to the current data values
      sensorAccumulatorRef.current = {
        steps: sensorData.steps,
        distance: sensorData.distance
      };
      
      // Start sensors
      const motionStarted = await startMotion();
      const locationStarted = await startLocation();
      
      if (!motionStarted || !locationStarted) {
        console.error('Failed to start all sensors');
        toast.error('Failed to start one or more sensors');
        return false;
      }
      
      console.log('All sensors started successfully');
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
      console.log('Stopping fitness tracking...');
      
      // Stop sensors
      await stopMotion();
      await stopLocation();
      
      // Save real data we've accumulated
      const newData = { ...sensorData };
      console.log('Saving sensor data:', newData);
      
      if (user) {
        console.log('Saving fitness data to database...');
        await saveData(newData);
        console.log('Fitness data saved successfully');
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
        
        // Check if running on mobile
        if (!Capacitor.isNativePlatform()) {
          toast.error('Auto-tracking is only available on mobile devices');
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
        console.log('Starting auto-tracking...');
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
            
            const newData = { ...sensorData };
            
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
        if (autoTrackingEnabled && user && !isRecording && !isAutoTracking && Capacitor.isNativePlatform()) {
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
    isNative: Capacitor.isNativePlatform(),
    error,
    startRecording,
    stopRecording,
    toggleAutoTracking,
    fetchLatestSensorData
  };
};
