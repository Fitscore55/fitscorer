
import { useState, useEffect, useCallback, useRef } from 'react';
import WebSensorSdk from '../plugins/web-sensor-sdk';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export interface SensorData {
  steps: number;
  distance: number;
  calories: number;
  fitscore: number;
}

export const useSensorSdk = () => {
  const { permissions, requestAllPermissions } = usePermissions();
  const [sensorData, setSensorData] = useState<SensorData>({
    steps: 0,
    distance: 0,
    calories: 0,
    fitscore: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);
  
  const listenerRef = useRef<string | null>(null);
  
  useEffect(() => {
    // For web, we're not on a native platform
    setIsNative(false);
    console.log('Sensor SDK initialized on web platform');

    // Check if we're already recording when the hook loads
    checkRecordingStatus();
    
    return () => {
      removeListeners();
    };
  }, []);
  
  // Calculate calories based on steps
  const calculateCalories = (steps: number): number => {
    return Math.round(steps * 0.04);
  };
  
  // Calculate fitscore based on steps and distance
  const calculateFitscore = (steps: number, distance: number): number => {
    return Math.round(steps / 20 + distance * 100);
  };
  
  const checkRecordingStatus = async () => {
    try {
      const result = await WebSensorSdk.isRecording();
      setIsRecording(result.value);
      console.log(`Sensor recording status: ${result.value ? 'active' : 'inactive'}`);
      
      if (result.value) {
        // If we're already recording, get current data
        await updateSensorData();
        setupListeners();
      }
      
      setIsLoading(false);
      return result.value;
    } catch (err) {
      console.error('Error checking recording status:', err);
      setIsLoading(false);
      return false;
    }
  };
  
  const updateSensorData = async () => {
    try {
      const stepsResult = await WebSensorSdk.getSteps();
      const distanceResult = await WebSensorSdk.getDistance();
      
      const steps = stepsResult.value;
      const distance = distanceResult.value;
      const calories = calculateCalories(steps);
      const fitscore = calculateFitscore(steps, distance);
      
      setSensorData({
        steps,
        distance,
        calories,
        fitscore
      });
      
      console.log(`Updated sensor data: ${steps} steps, ${distance.toFixed(2)}km`);
    } catch (err) {
      console.error('Error updating sensor data:', err);
    }
  };
  
  const setupListeners = async () => {
    try {
      // Remove any existing listeners first
      await removeListeners();
      
      // Add new listener for sensor updates
      const result = await WebSensorSdk.addListener('sensorUpdate', (data) => {
        console.log('Sensor update received:', data);
        if (data && typeof data === 'object') {
          const steps = typeof data.steps === 'number' ? data.steps : sensorData.steps;
          const distance = typeof data.distance === 'number' ? data.distance : sensorData.distance;
          const calories = calculateCalories(steps);
          const fitscore = calculateFitscore(steps, distance);
          
          setSensorData({
            steps,
            distance,
            calories,
            fitscore
          });
        }
      });
      
      listenerRef.current = result.value;
      console.log('Sensor update listener registered with ID:', result.value);
      
    } catch (err) {
      console.error('Error setting up listeners:', err);
    }
  };
  
  const removeListeners = async () => {
    try {
      await WebSensorSdk.removeAllListeners();
      listenerRef.current = null;
      console.log('All sensor listeners removed');
    } catch (err) {
      console.error('Error removing listeners:', err);
    }
  };
  
  const startRecording = async () => {
    try {
      setIsLoading(true);
      const result = await WebSensorSdk.start();
      
      if (result.value) {
        setIsRecording(true);
        await setupListeners();
        await updateSensorData();
        toast.success('Fitness tracking started');
        console.log('Sensor tracking started successfully');
      } else {
        toast.error('Failed to start fitness tracking');
        console.error('Start returned false');
      }
      
      setIsLoading(false);
      return result.value;
    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error('Error starting fitness tracking');
      setIsLoading(false);
      return false;
    }
  };
  
  const stopRecording = async () => {
    try {
      setIsLoading(true);
      const result = await WebSensorSdk.stop();
      
      if (result.value) {
        setIsRecording(false);
        await removeListeners();
        await updateSensorData(); // Get final data
        toast.success('Fitness tracking stopped');
        console.log('Sensor tracking stopped successfully');
      } else {
        toast.error('Failed to stop fitness tracking');
        console.error('Stop returned false');
      }
      
      setIsLoading(false);
      return result.value;
    } catch (err) {
      console.error('Error stopping recording:', err);
      toast.error('Error stopping fitness tracking');
      setIsLoading(false);
      return false;
    }
  };
  
  const fetchLatestSensorData = async () => {
    await updateSensorData();
    return true;
  };
  
  return {
    sensorData,
    isLoading,
    isRecording,
    isNative,
    error,
    startRecording,
    stopRecording,
    fetchLatestSensorData
  };
};
