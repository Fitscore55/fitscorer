
import { useState, useRef, useEffect, useCallback } from 'react';
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
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);
    console.log(`Motion sensor on ${isNativePlatform ? 'native' : 'web'} platform`);
    
    // Cleanup on unmount
    return () => {
      if (listenerRef.current) {
        try {
          listenerRef.current.remove();
          console.log('Motion listener removed on unmount');
        } catch (err) {
          console.error('Error removing motion listener on unmount:', err);
        }
      }
    };
  }, []);
  
  // Handle motion data
  const handleMotionData = useCallback((event: any) => {
    setLastAccelData(event);
    console.log('Motion data received:', event);
  }, []);
  
  // Start listening to motion events
  const startListening = async () => {
    if (!permissions.motion) {
      console.error('Motion permission not granted');
      toast.error('Motion permission is required');
      return false;
    }
    
    if (!Capacitor.isNativePlatform()) {
      console.error('Cannot start motion sensor: Not on a mobile device');
      toast.error('Motion sensor is only available on mobile devices');
      return false;
    }
    
    try {
      console.log('Starting motion sensor on native platform...');
      
      // Clean up any existing listener first
      if (listenerRef.current) {
        try {
          await listenerRef.current.remove();
          console.log('Previous motion listener removed successfully');
        } catch (err) {
          console.error('Error removing previous motion listener:', err);
        }
        listenerRef.current = null;
      }
      
      // Create new listener with explicit error handling
      try {
        listenerRef.current = await Motion.addListener('accel', handleMotionData);
        console.log('Motion sensor listener registered successfully', listenerRef.current);
        
        // Test if listener is working by checking if we receive data after a short delay
        setTimeout(async () => {
          if (!lastAccelData) {
            console.warn('No motion data received after initialization, attempting to restart');
            try {
              if (listenerRef.current) {
                await listenerRef.current.remove();
              }
              listenerRef.current = await Motion.addListener('accel', handleMotionData);
              console.log('Motion sensor listener restarted');
            } catch (e) {
              console.error('Failed to restart motion sensor:', e);
            }
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to add motion listener:', error);
        toast.error('Failed to initialize motion sensor');
        return false;
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
        console.log('Motion listener removed successfully');
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
