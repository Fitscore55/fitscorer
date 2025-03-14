
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
  
  // Handle motion data with improved sensitivity
  const handleMotionData = useCallback((event: any) => {
    if (!event || !event.acceleration) {
      console.warn('Received invalid motion data:', event);
      return;
    }
    
    // Store motion data for processing
    setLastAccelData(event);
    
    // Log occasionally for debugging
    if (Math.random() < 0.02) { // 2% chance to log to avoid console spam
      console.log('Motion data sample:', 
        JSON.stringify({
          x: event.acceleration.x.toFixed(3),
          y: event.acceleration.y.toFixed(3),
          z: event.acceleration.z.toFixed(3),
          magnitude: Math.sqrt(
            event.acceleration.x * event.acceleration.x + 
            event.acceleration.y * event.acceleration.y + 
            event.acceleration.z * event.acceleration.z
          ).toFixed(3)
        })
      );
    }
  }, []);
  
  // Start listening to motion events with improved reliability
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
      
      // Attempt to set up a listener with increased sampling rate
      try {
        // Configure motion sensor with higher frequency (100ms interval)
        await Motion.addListener('accel', handleMotionData);
        console.log('Motion sensor listener registered successfully');
        setIsListening(true);
        setError(null);
        
        // Test if listener is working after short delay
        setTimeout(async () => {
          if (!lastAccelData) {
            console.warn('No motion data received after initialization, attempting restart');
            
            // Try again with explicit listener assignment
            try {
              if (listenerRef.current) {
                await listenerRef.current.remove();
              }
              
              listenerRef.current = await Motion.addListener('accel', handleMotionData);
              console.log('Motion sensor listener restarted');
            } catch (e) {
              console.error('Failed to restart motion sensor:', e);
              toast.error('Motion sensor not responding, please restart app');
            }
          } else {
            console.log('Motion sensor confirmed working');
          }
        }, 2000);
        
        return true;
      } catch (error) {
        console.error('Failed to add motion listener:', error);
        
        // Try alternative approach
        try {
          console.log('Trying alternative approach for motion sensor...');
          // Attempt to register with explicit listener assignment
          listenerRef.current = await Motion.addListener('accel', handleMotionData);
          console.log('Alternative motion sensor listener registered');
          setIsListening(true);
          setError(null);
          return true;
        } catch (fallbackError) {
          console.error('All motion listener approaches failed:', fallbackError);
          setError('Failed to initialize motion sensor');
          toast.error('Motion sensor initialization failed');
          return false;
        }
      }
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
