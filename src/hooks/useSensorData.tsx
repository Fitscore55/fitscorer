import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { toast } from 'sonner';
import { useMotionSensor } from './useMotionSensor';
import { useLocationSensor } from './useLocationSensor';
import { useFitnessData } from './useFitnessData';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export interface SensorData {
  steps: number;
  distance: number;
  calories: number;
  fitscore: number;
}

// Helper function to calculate steps from accelerometer data
const calculateStepsFromAccel = (accelData: any, previousData: any): number => {
  if (!accelData || !accelData.acceleration) return 0;
  
  // Enhanced algorithm for step detection
  const { x, y, z } = accelData.acceleration;
  const magnitude = Math.sqrt(x*x + y*y + z*z);
  
  // Check if we have a significant movement
  const threshold = 1.2; // Adjust based on testing
  
  if (previousData && magnitude > threshold && previousData.magnitude < threshold) {
    // Detected a potential step
    
    // Calculate time difference for better accuracy
    const now = Date.now();
    const prevTime = previousData.timestamp || now;
    const timeDiff = now - prevTime;
    
    // Ignore if steps are detected too rapidly (less than 250ms apart)
    if (timeDiff < 250) {
      return 0;
    }
    
    // Consider this a valid step
    return 1;
  }
  
  return 0;
};

// Helper function to calculate distance from GPS positions
const calculateDistance = (position: any, lastPosition: any): number => {
  if (!position || !lastPosition || 
      !position.coords || !lastPosition.coords || 
      !position.coords.latitude || !lastPosition.coords.latitude) {
    return 0;
  }
  
  // Improved haversine formula to calculate distance between GPS coordinates
  const R = 6371; // Earth radius in kilometers
  const dLat = (position.coords.latitude - lastPosition.coords.latitude) * (Math.PI / 180);
  const dLon = (position.coords.longitude - lastPosition.coords.longitude) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lastPosition.coords.latitude * (Math.PI / 180)) * 
    Math.cos(position.coords.latitude * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  // Filter out GPS errors that cause jumps
  if (distance > 0.5) { // More than 500 meters in one update is likely an error
    console.warn('Distance jump detected, ignoring:', distance);
    return 0;
  }
  
  return distance;
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
  const lastStepTimeRef = useRef<number>(0);
  
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
      const now = Date.now();
      // Further filter steps - ensure they don't happen too rapidly
      if (now - lastStepTimeRef.current > 500) { // At least 500ms between steps
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
        lastStepTimeRef.current = now;
      }
    }
    
    // Save the current data for next comparison
    lastAccelDataRef.current = {
      ...lastAccelData,
      magnitude: Math.sqrt(
        lastAccelData.acceleration.x * lastAccelData.acceleration.x + 
        lastAccelData.acceleration.y * lastAccelData.acceleration.y + 
        lastAccelData.acceleration.z * lastAccelData.acceleration.z
      ),
      timestamp: Date.now()
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
    
    // Automatically save data periodically when recording
    const now = Date.now();
    if (now - lastSaveTimeRef.current >= 30000) { // Every 30 seconds
      if (user) {
        console.log('Auto-saving current sensor data...');
        saveData({...sensorData, fitscore: newFitscore}).catch(err => {
          console.error('Error auto-saving sensor data:', err);
        });
        lastSaveTimeRef.current = now;
      }
    }
  }, [sensorData.steps, sensorData.distance, isRecording, user, saveData, sensorData]);

  // Fetch the latest sensor data from the database
  const fetchLatestSensorData = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Fetching latest sensor data from database...');
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
    } catch (err) {
      console.error('Error fetching latest sensor data:', err);
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
      console.log('Starting motion sensor...');
      const motionStarted = await startMotion();
      if (!motionStarted) {
        console.error('Failed to start motion sensor');
        toast.error('Failed to start motion sensor');
        return false;
      }
      
      console.log('Starting location sensor...');
      const locationStarted = await startLocation();
      if (!locationStarted) {
        console.error('Failed to start location sensor');
        // Try to stop motion since location failed
        await stopMotion();
        toast.error('Failed to start location sensor');
        return false;
      }
      
      console.log('All sensors started successfully');
      setIsRecording(true);
      toast.success('Fitness tracking started');
      
      // Initialize last step time
      lastStepTimeRef.current = Date.now();
      
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
      const motionStopped = await stopMotion();
      if (!motionStopped) {
        console.error('Error stopping motion sensor');
      }
      
      const locationStopped = await stopLocation();
      if (!locationStopped) {
        console.error('Error stopping location sensor');
      }
      
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
        }, 60 * 1000); // Update data every minute
        
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
            // Add a small delay to ensure everything is initialized
            setTimeout(async () => {
              await toggleAutoTracking(true);
            }, 1000);
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

  // Set up realtime subscription for updates from other devices
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('fitness-data-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fitness_sensor_data',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('Received realtime update for fitness data');
        fetchLatestSensorData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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
