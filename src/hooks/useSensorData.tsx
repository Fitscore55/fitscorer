
import { useState, useEffect } from 'react';
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
  const [error, setError] = useState<string | null>(null);

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
      
      toast.success('Fitness data saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving sensor data:', err);
      toast.error('Failed to save fitness data');
      return false;
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
      setIsRecording(true);
      
      if (Capacitor.isNativePlatform()) {
        // Subscribe to motion events
        await Motion.addListener('accel', (event) => {
          // In a real app, you would process the accelerometer data
          // to calculate steps, etc.
          console.log('Motion data:', event);
        });
        
        // Start tracking location
        await Geolocation.watchPosition({
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
        const listeners = await Motion.removeAllListeners();
        
        // Stop location tracking
        await Geolocation.clearWatch({ id: '' });
      }
      
      // In a real app, we would calculate the final values
      // Here we just simulate some data
      const newData = {
        steps: sensorData.steps + Math.floor(Math.random() * 1000),
        distance: sensorData.distance + (Math.random() * 2).toFixed(2) as unknown as number,
        calories: sensorData.calories + Math.floor(Math.random() * 200),
        fitscore: sensorData.fitscore + Math.floor(Math.random() * 50)
      };
      
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
    error,
    startRecording,
    stopRecording,
    fetchLatestSensorData
  };
};
