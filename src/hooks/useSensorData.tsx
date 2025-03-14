
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';
import { toast } from 'sonner';
import { Motion } from '@capacitor/motion';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isAutoTracking, setIsAutoTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTrackingIntervalRef = useRef<number | null>(null);
  const watchIdRef = useRef<string | null>(null);

  // Fetch the latest sensor data from the database
  const fetchLatestSensorData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fitness_sensor_data')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSensorData({
          steps: data[0].steps,
          distance: data[0].distance,
          calories: data[0].calories,
          fitscore: data[0].fitscore
        });
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to fetch your fitness data');
    } finally {
      setIsLoading(false);
    }
  };

  // Save sensor data to the database
  const saveSensorData = async (data: SensorData) => {
    if (!user) {
      toast.error('You must be logged in to save fitness data');
      return false;
    }

    try {
      const deviceType = Capacitor.getPlatform();
      
      const { error } = await supabase
        .from('fitness_sensor_data')
        .insert({
          user_id: user.id,
          steps: data.steps,
          distance: data.distance,
          calories: data.calories,
          fitscore: data.fitscore,
          device_type: deviceType,
          recorded_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      console.log('Fitness data saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving sensor data:', err);
      toast.error('Failed to save fitness data');
      return false;
    }
  };

  // Generate simulated fitness data
  const generateFitnessData = () => {
    // In a real app, we would calculate based on actual sensor data
    // Here we just simulate some increments
    return {
      steps: sensorData.steps + Math.floor(Math.random() * 100),
      distance: sensorData.distance + (Math.random() * 0.2).toFixed(2) as unknown as number,
      calories: sensorData.calories + Math.floor(Math.random() * 20),
      fitscore: sensorData.fitscore + Math.floor(Math.random() * 5)
    };
  };

  // Start recording sensor data
  const startRecording = async () => {
    // Check if we have the necessary permissions
    if (!permissions.motion || !permissions.location) {
      toast.error('Motion and location permissions are required');
      return false;
    }

    try {
      setIsRecording(true);
      
      if (Capacitor.isNativePlatform()) {
        // Subscribe to motion events
        await Motion.addListener('accel', (event) => {
          // In a real app, you would process the accelerometer data
          // to calculate steps, etc.
          console.log('Motion data:', event);
        });
        
        // Start tracking location
        watchIdRef.current = await Geolocation.watchPosition({
          enableHighAccuracy: true
        }, (position) => {
          // In a real app, you would calculate distance based on position changes
          console.log('Location update:', position);
        });
      } else {
        // For web, we would use a different approach or simulate data
        console.log('Recording started (web simulation)');
      }
      
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
      if (Capacitor.isNativePlatform()) {
        // Remove motion listeners
        await Motion.removeAllListeners();
        
        // Stop location tracking
        if (watchIdRef.current) {
          await Geolocation.clearWatch({ id: watchIdRef.current });
          watchIdRef.current = null;
        }
      }
      
      // In a real app, we would calculate the final values
      // Here we just simulate some data
      const newData = generateFitnessData();
      
      setSensorData(newData);
      await saveSensorData(newData);
      
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
          const newData = generateFitnessData();
          setSensorData(newData);
          await saveSensorData(newData);
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
