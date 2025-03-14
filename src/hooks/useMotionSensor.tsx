
import { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export const useMotionSensor = () => {
  const { permissions } = usePermissions();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Start listening to motion events
  const startListening = async () => {
    if (!permissions.motion) {
      toast.error('Motion permission is required');
      return false;
    }
    
    try {
      if (Capacitor.isNativePlatform()) {
        await Motion.addListener('accel', (event) => {
          // In a real app, you would process the accelerometer data
          // to calculate steps, etc.
          console.log('Motion data:', event);
        });
      } else {
        console.log('Motion sensor listening started (web simulation)');
      }
      
      setIsListening(true);
      return true;
    } catch (err) {
      console.error('Error starting motion sensor:', err);
      setError('Failed to start motion sensor');
      return false;
    }
  };
  
  // Stop listening to motion events
  const stopListening = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Motion.removeAllListeners();
      }
      
      setIsListening(false);
      return true;
    } catch (err) {
      console.error('Error stopping motion sensor:', err);
      setError('Failed to stop motion sensor');
      return false;
    }
  };
  
  return {
    isListening,
    error,
    startListening,
    stopListening
  };
};
