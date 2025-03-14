
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SensorData } from '@/types';

export const useFitnessData = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
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
        setLastUpdated(new Date(data[0].recorded_at));
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

  // Fetch historical data for charts
  const fetchHistoricalData = async (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    if (!userId) return [];
    
    try {
      setIsLoading(true);
      
      let timeFilter;
      const now = new Date();
      
      switch(period) {
        case 'daily':
          // Last 7 days
          timeFilter = new Date(now);
          timeFilter.setDate(now.getDate() - 7);
          break;
        case 'weekly':
          // Last 4 weeks
          timeFilter = new Date(now);
          timeFilter.setDate(now.getDate() - 28);
          break;
        case 'monthly':
          // Last 6 months
          timeFilter = new Date(now);
          timeFilter.setMonth(now.getMonth() - 6);
          break;
      }
      
      const { data, error } = await supabase
        .from('fitness_sensor_data')
        .select('recorded_at, steps, distance, calories, fitscore')
        .eq('user_id', userId)
        .gte('recorded_at', timeFilter.toISOString())
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Process data based on period
        if (period === 'daily') {
          // Return daily data directly
          return data.map(item => ({
            name: new Date(item.recorded_at).toLocaleDateString('en-US', { weekday: 'short' }),
            steps: item.steps,
            distance: item.distance,
            calories: item.calories,
            fitscore: item.fitscore
          }));
        } else if (period === 'weekly') {
          // Group by week
          const weeklyData: Record<string, any> = {};
          data.forEach(item => {
            const date = new Date(item.recorded_at);
            const weekNumber = Math.floor((date.getTime() - timeFilter.getTime()) / (7 * 24 * 60 * 60 * 1000));
            const weekLabel = `Week ${weekNumber + 1}`;
            
            if (!weeklyData[weekLabel]) {
              weeklyData[weekLabel] = { 
                steps: 0, 
                distance: 0, 
                calories: 0, 
                fitscore: 0, 
                count: 0 
              };
            }
            
            weeklyData[weekLabel].steps += item.steps;
            weeklyData[weekLabel].distance += item.distance;
            weeklyData[weekLabel].calories += item.calories;
            weeklyData[weekLabel].fitscore += item.fitscore;
            weeklyData[weekLabel].count += 1;
          });
          
          return Object.entries(weeklyData).map(([name, value]: [string, any]) => ({
            name,
            steps: Math.round(value.steps / value.count),
            distance: +(value.distance / value.count).toFixed(2),
            calories: Math.round(value.calories / value.count),
            fitscore: Math.round(value.fitscore / value.count)
          }));
        } else {
          // Group by month
          const monthlyData: Record<string, any> = {};
          data.forEach(item => {
            const date = new Date(item.recorded_at);
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
            
            if (!monthlyData[monthLabel]) {
              monthlyData[monthLabel] = { 
                steps: 0, 
                distance: 0, 
                calories: 0, 
                fitscore: 0, 
                count: 0 
              };
            }
            
            monthlyData[monthLabel].steps += item.steps;
            monthlyData[monthLabel].distance += item.distance;
            monthlyData[monthLabel].calories += item.calories;
            monthlyData[monthLabel].fitscore += item.fitscore;
            monthlyData[monthLabel].count += 1;
          });
          
          return Object.entries(monthlyData).map(([name, value]: [string, any]) => ({
            name,
            steps: Math.round(value.steps / value.count),
            distance: +(value.distance / value.count).toFixed(2),
            calories: Math.round(value.calories / value.count),
            fitscore: Math.round(value.fitscore / value.count)
          }));
        }
      }
      
      return [];
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to fetch fitness history');
      return [];
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
      
      setLastUpdated(new Date());
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
  
  // Setup subscription to real-time updates
  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to real-time updates for the current user's fitness data
    const channel = supabase
      .channel('fitness_data_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fitness_sensor_data',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('New fitness data:', payload);
        setLastUpdated(new Date());
        // We don't need to update state here as the component using this hook
        // should call fetchLatestData() when needed
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  return {
    isLoading,
    error,
    lastUpdated,
    fetchLatestData,
    fetchHistoricalData,
    saveData,
    generateMockData
  };
};
