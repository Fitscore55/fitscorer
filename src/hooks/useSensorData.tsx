
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { toast } from 'sonner';
import { useMotionSensor } from './useMotionSensor';
import { useLocationSensor } from './useLocationSensor';
import { useFitnessData } from './useFitnessData';
import { useDeviceDetection } from './useDeviceDetection';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateStepsFromAccel, 
  calculateDistance, 
  calculateFitscore,
  calculateCalories
} from '@/utils/sensorCalculations';

export interface SensorData {
  steps: number;
  distance: number;
  calories: number;
  fitscore: number;
}

export const useSensorData = () => {
  const { user } = useAuth();
  const { permissions, checkPermissions, requestPermission } = usePermissions();
  const { isNative, isMobileDevice } = useDeviceDetection();
  
  const [sensorData, setSensorData] = useState<SensorData>({
    steps: 0,
    distance: 0,
    calories: 0,
    fitscore: 0
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const lastSaveTimeRef = useRef<number>(Date.now());
  const lastAccelDataRef = useRef<any>(null);
  const lastPositionRef = useRef<any>(null);
  const sensorAccumulatorRef = useRef({
    steps: 0,
    distance: 0
  });
  const lastStepTimeRef = useRef<number>(0);
  const stepCounterRef = useRef<number>(0); // For filtering out spurious steps
  const permissionCheckTimestampRef = useRef<number>(0);
  
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
      if (now - lastStepTimeRef.current > 400) { // At least 400ms between steps
        // Increment our counter, but only add a real step after
        // a few consistent detections to filter out random movements
        stepCounterRef.current += 1;
        
        if (stepCounterRef.current >= 2) { // Require at least 2 consecutive detections
          // Update accumulated steps
          sensorAccumulatorRef.current.steps += 1; // Only add one step regardless
          stepCounterRef.current = 0; // Reset counter
          
          // Update sensor data
          setSensorData(prev => ({
            ...prev,
            steps: prev.steps + 1,
            // Calculate calories based on steps
            calories: calculateCalories(prev.steps + 1)
          }));
          
          console.log(`Step detected. Total steps: ${sensorAccumulatorRef.current.steps}`);
        }
        
        lastStepTimeRef.current = now;
      }
    } else {
      // Gradually reduce step counter if no steps detected
      if (stepCounterRef.current > 0 && Math.random() > 0.5) {
        stepCounterRef.current -= 1;
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
    const newFitscore = calculateFitscore(sensorData.steps, sensorData.distance);
    
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
    
    setIsLoading(true);
    
    try {
      console.log('Fetching latest sensor data from database...');
      const data = await fetchLatestData();
      if (data) {
        console.log('Loaded sensor data from database:', data);
        
        // Only update if we're not currently recording to avoid overwriting
        // active tracking data with potentially older saved data
        if (!isRecording) {
          setSensorData(data);
          
          // Also update the accumulator with the latest values
          sensorAccumulatorRef.current = {
            steps: data.steps,
            distance: data.distance
          };
        } else {
          console.log('Not updating sensor data display because recording is active');
        }
      } else {
        console.log('No sensor data found in database');
      }
    } catch (err) {
      console.error('Error fetching latest sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchLatestData, isRecording]);

  // Start recording sensor data with improved initialization and error handling
  const startRecording = async () => {
    // Check if user is logged in
    if (!user) {
      console.error('Cannot start recording: User not logged in');
      toast.error('You must be logged in to record fitness data');
      return false;
    }
    
    // Check if running on mobile
    if (!isMobileDevice()) {
      console.error('Cannot start recording: Not on a mobile device');
      toast.error('Real tracking is only available on mobile devices');
      return false;
    }
    
    // Check if we have the necessary permissions
    if (!permissions.motion || !permissions.location) {
      console.log('Missing permissions, checking again...');
      const hasMotion = await requestPermission('motion');
      const hasLocation = await requestPermission('location');
      
      if (!hasMotion || !hasLocation) {
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
        toast.error('Motion sensor failed');
        return false;
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
      
      // Save accumulated data
      if (user) {
        const newData = { ...sensorData };
        console.log('Saving sensor data:', newData);
        
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

  // Setup effects for data fetch and real-time updates
  useEffect(() => {
    if (user) {
      fetchLatestSensorData();
      
      // Set up realtime subscription for updates from other devices
      console.log(`Setting up realtime subscription for user ${user.id}`);
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
      
      // Refresh data periodically even when not tracking
      const refreshInterval = setInterval(() => {
        if (!isLoading) {
          console.log('Periodic refresh triggered');
          fetchLatestSensorData();
        }
      }, 5 * 60 * 1000); // Refresh every 5 minutes
      
      return () => {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channel);
        clearInterval(refreshInterval);
        
        // Stop recording if active when component unmounts
        if (isRecording) {
          stopRecording();
        }
      };
    }
  }, [user, isLoading, fetchLatestSensorData, isRecording, stopRecording]);

  return {
    sensorData,
    isLoading,
    isRecording,
    isAutoTracking: false, // Keep for compatibility but always false
    isNative,
    error,
    startRecording,
    stopRecording,
    toggleAutoTracking: () => Promise.resolve(false), // Dummy function for compatibility
    fetchLatestSensorData
  };
};
