
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SensorData } from '@/types';

export const useFitnessData = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the latest sensor data from the database
  const fetchLatestData = async () => {
    if (!userId) return null;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fitness_sensor_data')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          steps: data[0].steps,
          distance: data[0].distance,
          calories: data[0].calories,
          fitscore: data[0].fitscore
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to fetch your fitness data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Save sensor data to the database
  const saveData = async (data: SensorData) => {
    if (!userId) {
      toast.error('You must be logged in to save fitness data');
      return false;
    }

    try {
      const deviceType = window.navigator.userAgent;
      
      const { error } = await supabase
        .from('fitness_sensor_data')
        .insert({
          user_id: userId,
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
  const generateMockData = (currentData: SensorData): SensorData => {
    return {
      steps: currentData.steps + Math.floor(Math.random() * 100),
      distance: +(currentData.distance + parseFloat((Math.random() * 0.2).toFixed(2))),
      calories: currentData.calories + Math.floor(Math.random() * 20),
      fitscore: currentData.fitscore + Math.floor(Math.random() * 5)
    };
  };
  
  return {
    isLoading,
    error,
    fetchLatestData,
    saveData,
    generateMockData
  };
};
