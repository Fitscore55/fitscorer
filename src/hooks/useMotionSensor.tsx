
import { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export const useMotionSensor = () => {
  const { permissions } = usePermissions();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<any>(null);
  const [isNative, setIsNative] = useState(false);
  const [lastAccelData, setLastAccelData] = useState<any>(null);
  
  // Check if running on a native platform
  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    console.log(`Motion sensor on ${Capacitor.isNativePlatform() ? 'native' : 'web'} platform`);
    
    // Cleanup on unmount
    return () => {
      if (listenerRef.current) {
        try {
          listenerRef.current.remove();
        } catch (err) {
          console.error('Error removing motion listener on unmount:', err);
        }
      }
    };
  }, []);
  
  // Handle motion data
  const handleMotionData = (event: any) => {
    // Simple example of processing accelerometer data
    setLastAccelData(event);
    console.log('Motion data received:', event);
  };
  
  // Start listening to motion events
  const startListening = async () => {
    if (!permissions.motion) {
      console.error('Motion permission not granted');
      toast.error('Motion permission is required');
      return false;
    }
    
    try {
      if (Capacitor.isNativePlatform()) {
        console.log('Starting motion sensor on native platform...');
        
        // Clean up any existing listener first
        if (listenerRef.current) {
          try {
            listenerRef.current.remove();
          } catch (err) {
            console.error('Error removing previous motion listener:', err);
          }
        }
        
        // Create new listener
        listenerRef.current = await Motion.addListener('accel', handleMotionData);
        console.log('Motion sensor listener registered successfully');
      } else {
        console.log('Motion sensor listening started (web simulation)');
        // For web testing, we'll simulate motion data
        const webSimInterval = setInterval(() => {
          const simulatedData = {
            acceleration: {
              x: Math.random() * 10 - 5,
              y: Math.random() * 10 - 5,
              z: Math.random() * 10 - 5
            },
            accelerationIncludingGravity: {
              x: Math.random() * 10 - 5,
              y: Math.random() * 10 - 5,
              z: Math.random() * 10 + 9.8 // Add gravity
            },
            timestamp: Date.now()
          };
          handleMotionData(simulatedData);
        }, 1000);
        
        listenerRef.current = {
          remove: () => clearInterval(webSimInterval)
        };
      }
      
      setIsListening(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error starting motion sensor:', err);
      setError('Failed to start motion sensor');
      toast.error('Failed to start motion sensor');
      return false;
    }
  };
  
  // Stop listening to motion events
  const stopListening = async () => {
    try {
      console.log('Stopping motion sensor...');
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
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
    isNative,
    lastAccelData,
    startListening,
    stopListening
  };
};
