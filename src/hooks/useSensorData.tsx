
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

// Helper function to calculate steps from accelerometer data with improved sensitivity
const calculateStepsFromAccel = (accelData: any, previousData: any): number => {
  if (!accelData || !accelData.acceleration) return 0;
  
  // Enhanced algorithm for step detection
  const { x, y, z } = accelData.acceleration;
  const magnitude = Math.sqrt(x*x + y*y + z*z);
  
  // Check if we have a significant movement
  const threshold = 1.1; // Lower threshold for better sensitivity
  
  if (previousData && magnitude > threshold && previousData.magnitude < threshold) {
    // Detected a potential step
    
    // Calculate time difference for better accuracy
    const now = Date.now();
    const prevTime = previousData.timestamp || now;
    const timeDiff = now - prevTime;
    
    // Ignore if steps are detected too rapidly (less than 200ms apart)
    if (timeDiff < 200) {
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
  if (distance > 0.2) { // More than 200 meters in one update is likely an error
    console.log('Distance jump detected, ignoring:', distance);
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
  const [useDemoData, setUseDemoData] = useState(false);
  
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

  // When sensors aren't available and we need to test
  const generateDemoData = useCallback(() => {
    console.log("Generating demo data only for testing/development");
    let data = { ...sensorData };
    // Only generate small random increases
    const randomStep = Math.floor(Math.random() * 5) + 1;
    const randomDistance = +(Math.random() * 0.01).toFixed(2);
    
    data.steps += randomStep;
    data.distance = +(data.distance + randomDistance).toFixed(2);
    data.calories = Math.round(data.calories + randomStep * 0.04);
    data.fitscore = Math.round(data.steps / 20 + data.distance * 100);
    
    setSensorData(data);
  }, [sensorData]);

  // Process motion data for step counting
  useEffect(() => {
    if (!isRecording || !lastAccelData) return;
    
    if (useDemoData) return; // Skip processing if using demo data
    
    const stepsIncrement = calculateStepsFromAccel(lastAccelData, lastAccelDataRef.current);
    if (stepsIncrement > 0) {
      const now = Date.now();
      // Further filter steps - ensure they don't happen too rapidly
      if (now - lastStepTimeRef.current > 400) { // At least 400ms between steps
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
  }, [lastAccelData, isRecording, useDemoData]);

  // Process location data for distance calculation
  useEffect(() => {
    if (!isRecording || !lastPosition || useDemoData) return;
    
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
  }, [lastPosition, isRecording, useDemoData]);

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
        console.log('Auto-saving current sensor data...', sensorData);
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
      setUseDemoData(true); // Enable demo data for testing on non-mobile
      setIsRecording(true);
      return true;
    }
    
    // Check if we have the necessary permissions
    if (!permissions.motion || !permissions.location) {
      console.log('Missing permissions, checking again...');
      const permissionsGranted = await checkPermissions();
      if (!permissionsGranted) {
        console.error('Required permissions not granted');
        toast.error('Motion and location permissions are required');
        // Enable demo mode for testing but don't save to database
        setUseDemoData(true);
        setIsRecording(true);
        return true;
      }
    }

    try {
      console.log('Starting fitness tracking...');
      setUseDemoData(false); // Ensure demo data is off
      
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
        console.error('Failed to start motion sensor, using demo data');
        toast.error('Motion sensor failed, using simulated data');
        setUseDemoData(true);
      }
      
      console.log('Starting location sensor...');
      const locationStarted = await startLocation();
      if (!locationStarted) {
        console.error('Failed to start location sensor, location tracking will be limited');
        toast.error('Location tracking limited');
        // Continue anyway with just the motion sensor
      }
      
      console.log('Sensors started');
      setIsRecording(true);
      toast.success('Fitness tracking started');
      
      // Initialize last step time
      lastStepTimeRef.current = Date.now();

      // If using demo data, start the demo interval
      if (setUseDemoData) {
        const demoInterval = window.setInterval(() => {
          generateDemoData();
        }, 3000); // Generate data every 3 seconds
        
        // Store the interval ID for cleanup
        console.log("Demo mode active for testing");
      }
      
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
      
      // If not in demo mode, stop real sensors
      if (!useDemoData) {
        // Stop sensors
        const motionStopped = await stopMotion();
        if (!motionStopped) {
          console.error('Error stopping motion sensor');
        }
        
        const locationStopped = await stopLocation();
        if (!locationStopped) {
          console.error('Error stopping location sensor');
        }
      }
      
      // Save real data we've accumulated if not in demo mode or if explicitly allowed
      if (user && !useDemoData) {
        const newData = { ...sensorData };
        console.log('Saving sensor data:', newData);
        
        console.log('Saving fitness data to database...');
        await saveData(newData);
        console.log('Fitness data saved successfully');
      }
      
      setIsRecording(false);
      setUseDemoData(false);
      
      // If auto-tracking was enabled, also disable it
      if (isAutoTracking) {
        setIsAutoTracking(false);
        localStorage.setItem('autoTrackingEnabled', 'false');
        if (autoTrackingIntervalRef.current) {
          clearInterval(autoTrackingIntervalRef.current);
          autoTrackingIntervalRef.current = null;
        }
      }
      
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
      console.log(`toggleAutoTracking called with enable=${enable}`);
      
      if (enable) {
        // Check if user is logged in
        if (!user) {
          console.error('Cannot enable auto-tracking: User not logged in');
          toast.error('You must be logged in to use auto-tracking');
          return false;
        }
        
        // Check if running on mobile
        if (!Capacitor.isNativePlatform()) {
          console.error('Cannot enable auto-tracking: Not on a mobile device');
          toast.error('Auto-tracking is only available on mobile devices');
          // For development, enable anyway with demo data
          setUseDemoData(true);
          setIsAutoTracking(true);
          localStorage.setItem('autoTrackingEnabled', 'true');
          return true;
        }
        
        // Check if we have the necessary permissions
        if (!permissions.motion || !permissions.location) {
          console.log('Missing permissions for auto-tracking, checking...');
          const permissionsGranted = await checkPermissions();
          if (!permissionsGranted) {
            console.error('Required permissions not granted for auto-tracking');
            toast.error('Motion and location permissions are required for automatic tracking');
            
            // For testing purposes, enable auto-tracking with demo data
            setUseDemoData(true);
            setIsAutoTracking(true);
            setIsRecording(true);
            localStorage.setItem('autoTrackingEnabled', 'true');
            return true;
          }
        }
        
        setUseDemoData(false); // Use real data if permissions are granted
        
        // Start the recording process if not already recording
        if (!isRecording) {
          console.log('Starting recording for auto-tracking...');
          const started = await startRecording();
          if (!started) {
            console.error('Failed to start recording for auto-tracking');
            return false;
          }
        }
        
        // Set up interval to periodically save data
        if (autoTrackingIntervalRef.current) {
          clearInterval(autoTrackingIntervalRef.current);
        }
        
        // Using window.setInterval instead of setInterval to fix TypeScript issue
        console.log('Setting up auto-tracking interval');
        autoTrackingIntervalRef.current = window.setInterval(async () => {
          try {
            if (!user) return; // Safety check
            
            const newData = { ...sensorData };
            
            // Only save if user is logged in and enough time has passed since last save
            const now = Date.now();
            if (now - lastSaveTimeRef.current >= 60000 && !useDemoData) { // At least 1 minute between saves
              console.log('Auto-tracking interval save triggered');
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
        console.log('Auto-tracking enabled successfully');
        return true;
      } else {
        // Stop automatic tracking
        console.log('Disabling auto-tracking');
        
        if (isRecording) {
          console.log('Stopping recording for auto-tracking');
          await stopRecording();
        }
        
        if (autoTrackingIntervalRef.current) {
          console.log('Clearing auto-tracking interval');
          clearInterval(autoTrackingIntervalRef.current);
          autoTrackingIntervalRef.current = null;
        }
        
        setIsAutoTracking(false);
        setUseDemoData(false);
        toast.success('Automatic fitness tracking disabled');
        
        // Save user preference
        localStorage.setItem('autoTrackingEnabled', 'false');
        console.log('Auto-tracking disabled successfully');
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
        console.log(`Auto tracking was ${autoTrackingEnabled ? 'enabled' : 'disabled'} previously`);
        
        if (autoTrackingEnabled && user && !isRecording && !isAutoTracking) {
          console.log('Restoring auto-tracking state...');
          
          // First check permissions
          await checkPermissions();
          console.log('Permissions after check:', permissions);
          
          // Only restore with real sensors if we have permissions
          if (permissions.motion && permissions.location && Capacitor.isNativePlatform()) {
            setUseDemoData(false);
            console.log('Permissions granted, restoring auto-tracking...');
            
            setTimeout(async () => {
              await toggleAutoTracking(true);
            }, 1000);
          } else {
            // For testing/development, use demo data
            setUseDemoData(true);
            console.log('Using demo data for auto-tracking');
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
  }, [user, permissions.motion, permissions.location, checkPermissions, isRecording, isAutoTracking, toggleAutoTracking]);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchLatestSensorData();
    }
  }, [user, fetchLatestSensorData]);

  // Set up realtime subscription for updates from other devices
  useEffect(() => {
    if (!user) return;
    
    console.log(`Setting up realtime subscription for user ${user.id}`);
    
    // Subscribe to real-time updates for the current user's fitness data
    const channel = supabase
      .channel('fitness-data-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fitness_sensor_data',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Received realtime update for fitness data:', payload);
        fetchLatestSensorData();
      })
      .subscribe();
      
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, fetchLatestSensorData]);

  // Refresh data periodically even when not tracking
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (user && !isLoading) {
        console.log('Periodic refresh triggered');
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
