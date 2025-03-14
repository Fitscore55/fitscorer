
import { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export const useLocationSensor = () => {
  const { permissions } = usePermissions();
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<string | null>(null);
  
  // Start tracking location
  const startTracking = async () => {
    if (!permissions.location) {
      toast.error('Location permission is required');
      return false;
    }
    
    try {
      if (Capacitor.isNativePlatform()) {
        watchIdRef.current = await Geolocation.watchPosition({
          enableHighAccuracy: true
        }, (position) => {
          // In a real app, you would calculate distance based on position changes
          console.log('Location update:', position);
        });
      } else {
        console.log('Location tracking started (web simulation)');
      }
      
      setIsTracking(true);
      return true;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setError('Failed to start location tracking');
      return false;
    }
  };
  
  // Stop tracking location
  const stopTracking = async () => {
    try {
      if (Capacitor.isNativePlatform() && watchIdRef.current) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
      }
      
      setIsTracking(false);
      return true;
    } catch (err) {
      console.error('Error stopping location tracking:', err);
      setError('Failed to stop location tracking');
      return false;
    }
  };
  
  return {
    isTracking,
    error,
    startTracking,
    stopTracking
  };
};
