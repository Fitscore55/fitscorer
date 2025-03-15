
import { useState, useRef, useEffect, useCallback } from 'react';
import * as Device from 'expo-device';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export const useMotionSensor = () => {
  const { permissions, checkPermissions, requestPermission } = usePermissions();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accelerometerSubscription = useRef<{ remove: () => void } | null>(null);
  const [isNative, setIsNative] = useState(false);
  const [lastAccelData, setLastAccelData] = useState<any>(null);
  
  // Check if running on a native platform
  useEffect(() => {
    const checkDeviceType = async () => {
      try {
        const deviceType = await Device.getDeviceTypeAsync();
        const isMobileDevice = 
          deviceType === Device.DeviceType.PHONE || 
          deviceType === Device.DeviceType.TABLET;
        
        setIsNative(isMobileDevice);
        console.log(`Motion sensor on ${isMobileDevice ? 'native' : 'web'} platform`);
      } catch (error) {
        console.error('Error detecting device type:', error);
        setIsNative(false);
      }
    };
    
    checkDeviceType();
    
    // Cleanup on unmount
    return () => {
      if (accelerometerSubscription.current) {
        try {
          accelerometerSubscription.current.remove();
          console.log('Motion listener removed on unmount');
        } catch (err) {
          console.error('Error removing motion listener on unmount:', err);
        }
      }
    };
  }, []);
  
  // Handle motion data
  const handleMotionData = useCallback((event: any) => {
    if (!event || !event.x) {
      console.warn('Received invalid motion data:', event);
      return;
    }
    
    // Add timestamp to the data for better tracking
    const timestampedData = {
      ...event,
      acceleration: {
        x: event.x,
        y: event.y,
        z: event.z
      },
      timestamp: Date.now()
    };
    
    // Store motion data for processing
    setLastAccelData(timestampedData);
    
    // Log occasionally for debugging
    if (Math.random() < 0.02) { // 2% chance to log to avoid console spam
      console.log('Motion data sample:', 
        JSON.stringify({
          x: event.x.toFixed(3),
          y: event.y.toFixed(3),
          z: event.z.toFixed(3),
          magnitude: Math.sqrt(
            event.x * event.x + 
            event.y * event.y + 
            event.z * event.z
          ).toFixed(3)
        })
      );
    }
  }, []);
  
  // Start listening to motion events
  const startListening = useCallback(async () => {
    // Ensure we have permission for motion
    if (!permissions.motion) {
      console.log('Motion permission not granted, requesting...');
      const granted = await requestPermission('motion');
      if (!granted) {
        console.error('Motion permission not granted');
        toast.error('Motion permission is required');
        return false;
      }
    }
    
    // Check if device is a mobile device
    const deviceType = await Device.getDeviceTypeAsync();
    const isMobileDevice = 
      deviceType === Device.DeviceType.PHONE || 
      deviceType === Device.DeviceType.TABLET;
      
    if (!isMobileDevice) {
      console.log('Cannot start motion sensor: Not on a mobile device');
      return false;
    }
    
    try {
      console.log('Starting motion sensor on native platform...');
      
      // Clean up any existing listener first
      if (accelerometerSubscription.current) {
        try {
          accelerometerSubscription.current.remove();
          console.log('Previous motion listener removed successfully');
        } catch (err) {
          console.error('Error removing previous motion listener:', err);
        }
        accelerometerSubscription.current = null;
      }
      
      // Attempt to set up a listener
      try {
        // Force checking permission state again
        await checkPermissions();
        
        // Set accelerometer update interval and start listening
        Accelerometer.setUpdateInterval(1000);
        accelerometerSubscription.current = Accelerometer.addListener(handleMotionData);
        
        console.log('Motion sensor listener registered successfully');
        setIsListening(true);
        setError(null);
        
        return true;
      } catch (error) {
        console.error('Failed to add motion listener:', error);
        setError('Failed to initialize motion sensor');
        setIsListening(false);
        return false;
      }
    } catch (err) {
      console.error('Error starting motion sensor:', err);
      setError('Failed to start motion sensor');
      return false;
    }
  }, [permissions.motion, handleMotionData, requestPermission, checkPermissions]);
  
  // Stop listening to motion events
  const stopListening = useCallback(async () => {
    try {
      console.log('Stopping motion sensor...');
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
        accelerometerSubscription.current = null;
        console.log('Motion listener removed successfully');
      }
      
      setIsListening(false);
      return true;
    } catch (err) {
      console.error('Error stopping motion sensor:', err);
      setError('Failed to stop motion sensor');
      return false;
    }
  }, []);
  
  return {
    isListening,
    error,
    isNative,
    lastAccelData,
    startListening,
    stopListening
  };
};
