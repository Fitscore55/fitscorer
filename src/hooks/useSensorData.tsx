
import { useState, useEffect, useRef } from 'react';
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
  const { permissions } = usePermissions();
  const [sensorData, setSensorData] = useState<SensorData>({
    steps: 0,
    distance: 0,
    calories: 0,
    fitscore: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isAutoTracking, setIsAutoTracking] = useState(false);
  const autoTrackingIntervalRef = useRef<number | null>(null);
  
  const { startListening: startMotion, stopListening: stopMotion } = useMotionSensor();
  const { startTracking: startLocation, stopTracking: stopLocation } = useLocationSensor();
  const { isLoading, error, fetchLatestData, saveData, generateMockData } = useFitnessData(user?.id);

  // Fetch the latest sensor data from the database
  const fetchLatestSensorData = async () => {
    const data = await fetchLatestData();
    if (data) {
      setSensorData(data);
    }
  };

  // Start recording sensor data
  const startRecording = async () => {
    // Check if we have the necessary permissions
    if (!permissions.motion || !permissions.location) {
      toast.error('Motion and location permissions are required');
      return false;
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
    try {
      // Stop sensors
      await stopMotion();
      await stopLocation();
      
      // In a real app, we would calculate the final values
      // Here we just simulate some data
      const newData = generateMockData(sensorData);
      
      setSensorData(newData);
      await saveData(newData);
      
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
        // Start automatic tracking
        if (!permissions.motion || !permissions.location) {
          toast.error('Motion and location permissions are required for automatic tracking');
          return false;
        }
        
        // Start the recording process
        await startRecording();
        
        // Set up interval to periodically save data
        autoTrackingIntervalRef.current = window.setInterval(async () => {
          const newData = generateMockData(sensorData);
          setSensorData(newData);
          await saveData(newData);
          console.log('Auto-tracking data saved');
        }, 5 * 60 * 1000); // Save data every 5 minutes
        
        setIsAutoTracking(true);
        toast.success('Automatic fitness tracking enabled');
        
        // Save user preference
        localStorage.setItem('autoTrackingEnabled', 'true');
        return true;
      } else {
        // Stop automatic tracking
        await stopRecording();
        
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

  // Check if auto-tracking was previously enabled
  useEffect(() => {
    const checkAutoTrackingPreference = async () => {
      const autoTrackingEnabled = localStorage.getItem('autoTrackingEnabled') === 'true';
      if (autoTrackingEnabled && user && permissions.motion && permissions.location) {
        await toggleAutoTracking(true);
      }
    };
    
    checkAutoTrackingPreference();
    
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

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchLatestSensorData();
    }
  }, [user]);

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
