
import { useState, useRef, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export const useLocationSensor = () => {
  const { permissions } = usePermissions();
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);
  const watchIdRef = useRef<string | null>(null);
  const [isNative, setIsNative] = useState(false);
  
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
    };
  }, []);
  
  // Handle location update
  const handleLocationUpdate = useCallback((position: Position) => {
    if (!position || !position.coords) {
      console.warn('Received invalid position data:', position);
      return;
    }
    
    setLastPosition(position);
    // Log occasionally to avoid console spam
    if (Math.random() < 0.2) {
      console.log('Location update:', 
        JSON.stringify({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy?.toFixed(2) || 'unknown'
        })
      );
    }
  }, []);
  
  // Start tracking location
  const startTracking = async () => {
    if (!permissions.location) {
      console.error('Location permission not granted');
      toast.error('Location permission is required');
      return false;
    }
    
    if (!Capacitor.isNativePlatform()) {
      console.error('Cannot start location tracking: Not on a mobile device');
      toast.error('Location tracking is only available on mobile devices');
      return false;
    }
    
    try {
      console.log('Starting location tracking...');
      
      // Clear any existing watch first
      if (watchIdRef.current) {
        try {
          await Geolocation.clearWatch({ id: watchIdRef.current });
          console.log('Previous location watch cleared successfully');
        } catch (err) {
          console.error('Error clearing previous location watch:', err);
        }
        watchIdRef.current = null;
      }
      
      // Get current position first
      try {
        const currentPosition = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000, // 15 second timeout
          maximumAge: 10000 // 10 second cache
        });
        
        handleLocationUpdate(currentPosition);
        console.log('Current position obtained:', 
          JSON.stringify({
            lat: currentPosition.coords.latitude.toFixed(6),
            lng: currentPosition.coords.longitude.toFixed(6)
          })
        );
      } catch (posErr) {
        console.error('Error getting current position:', posErr);
        // Continue anyway, the watch might still work
      }
      
      // Set up position watch with options for better accuracy
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      };
      
      watchIdRef.current = await Geolocation.watchPosition(options, (position, err) => {
        if (err) {
          console.error('Error from location watch:', err);
          return;
        }
        
        handleLocationUpdate(position);
      });
      
      console.log('Location watch started with ID:', watchIdRef.current);
      
      // Set a failsafe - if we don't get location updates, restart the watch
      const locationCheckTimer = setTimeout(() => {
        if (!lastPosition && isTracking) {
          console.warn('No location updates received, attempting to restart tracking');
          stopTracking().then(() => startTracking());
        }
      }, 15000);
      
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
  
  // Stop tracking location
  const stopTracking = async () => {
    try {
      console.log('Stopping location tracking...');
      if (watchIdRef.current) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
        console.log('Location watch cleared successfully');
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
