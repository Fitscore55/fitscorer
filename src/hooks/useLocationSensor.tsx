
import { useState, useRef, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export const useLocationSensor = () => {
  const { permissions } = usePermissions();
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<string | null>(null);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);
  const [isNative, setIsNative] = useState(false);
  const simulationIntervalRef = useRef<number | null>(null);
  const errorCountRef = useRef(0);
  
  // Check if running on a native platform
  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);
    console.log(`Location sensor on ${isNativePlatform ? 'native' : 'web'} platform`);
    
    // Cleanup on unmount
    return () => {
      if (watchIdRef.current) {
        try {
          Geolocation.clearWatch({ id: watchIdRef.current });
          console.log('Location watch cleared on unmount');
        } catch (err) {
          console.error('Error clearing location watch on unmount:', err);
        }
      }
      
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        console.log('Location simulation stopped on unmount');
      }
    };
  }, []);
  
  // Handle position updates
  const handlePositionUpdate = useCallback((position: Position) => {
    setLastPosition(position);
    errorCountRef.current = 0; // Reset error count on successful position update
    console.log('Location update:', position);
  }, []);
  
  // Start tracking location
  const startTracking = async () => {
    if (!permissions.location) {
      console.error('Location permission not granted');
      toast.error('Location permission is required');
      return false;
    }
    
    try {
      if (Capacitor.isNativePlatform()) {
        console.log('Starting location tracking on native platform...');
        
        // Get current position first
        try {
          const currentPosition = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
          });
          handlePositionUpdate(currentPosition);
          console.log('Initial position obtained successfully:', currentPosition);
        } catch (err) {
          console.warn('Could not get initial position:', err);
          toast.error('Could not determine your initial location');
        }
        
        // Clean up any existing watch
        if (watchIdRef.current) {
          try {
            await Geolocation.clearWatch({ id: watchIdRef.current });
            console.log('Previous location watch cleared successfully');
          } catch (err) {
            console.error('Error clearing previous location watch:', err);
          }
          watchIdRef.current = null;
        }
        
        // Start watching position with error handling
        try {
          watchIdRef.current = await Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 10000
          }, (position, err) => {
            if (err) {
              console.error('Error in location watch callback:', err);
              errorCountRef.current += 1;
              
              // If we get too many consecutive errors, try restarting the watch
              if (errorCountRef.current > 3) {
                console.warn('Too many location errors, restarting watch');
                restartLocationWatch();
              }
              return;
            }
            
            handlePositionUpdate(position);
          });
          
          console.log('Location tracking started with watch ID:', watchIdRef.current);
        } catch (error) {
          console.error('Failed to start location watch:', error);
          toast.error('Failed to track location');
          return false;
        }
      } else {
        console.log('Location tracking started (web simulation)');
        
        // For web testing, we'll simulate location data
        let lat = 37.7749;
        let lng = -122.4194;
        
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
        }
        
        simulationIntervalRef.current = window.setInterval(() => {
          // Slightly change position to simulate movement
          lat += (Math.random() - 0.5) * 0.001;
          lng += (Math.random() - 0.5) * 0.001;
          
          const simulatedPosition: Position = {
            coords: {
              latitude: lat,
              longitude: lng,
              accuracy: 10 + Math.random() * 5,
              altitude: 50 + Math.random() * 10,
              altitudeAccuracy: 5,
              heading: Math.random() * 360,
              speed: 1 + Math.random() * 2
            },
            timestamp: Date.now()
          };
          
          handlePositionUpdate(simulatedPosition);
        }, 5000);
      }
      
      setIsTracking(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setError('Failed to start location tracking');
      toast.error('Failed to start location tracking');
      return false;
    }
  };
  
  // Restart location watch if it fails
  const restartLocationWatch = async () => {
    if (!Capacitor.isNativePlatform() || !permissions.location) return;
    
    try {
      if (watchIdRef.current) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
      }
      
      watchIdRef.current = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000
      }, handlePositionUpdate);
      
      errorCountRef.current = 0;
      console.log('Location watch restarted with new ID:', watchIdRef.current);
    } catch (error) {
      console.error('Failed to restart location watch:', error);
    }
  };
  
  // Stop tracking location
  const stopTracking = async () => {
    try {
      console.log('Stopping location tracking...');
      
      if (Capacitor.isNativePlatform() && watchIdRef.current) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
        console.log('Location watch cleared successfully');
      }
      
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
        console.log('Location simulation stopped');
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
    lastPosition,
    isNative,
    startTracking,
    stopTracking
  };
};
