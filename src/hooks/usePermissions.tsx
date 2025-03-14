
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import { toast } from 'sonner';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    location: false,
    motion: false,
    notifications: false
  });
  const [isNative, setIsNative] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);
    
    // Initial permissions check
    if (isNativePlatform) {
      checkPermissions();
    } else {
      // For development purposes, fake permissions in web mode
      setPermissions({
        location: true,
        motion: true,
        notifications: true
      });
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, simulating permissions for development');
      setPermissions({
        location: true,
        motion: true,
        notifications: true
      });
      return true;
    }
    
    const now = Date.now();
    // Don't check too frequently (at most once per second)
    if (now - lastCheckTime < 1000) {
      console.log('Skipping permission check - checked too recently');
      return permissions.location && permissions.motion;
    }
    
    setLastCheckTime(now);
    console.log('Checking permissions...');

    let locationPermission = false;
    let motionPermission = false;
    let notificationsPermission = false;

    try {
      // Check location permissions
      try {
        const locationStatus = await Geolocation.checkPermissions();
        locationPermission = 
          locationStatus.location === 'granted' || 
          locationStatus.coarseLocation === 'granted';
        
        console.log(`Location permission status: ${locationPermission ? 'granted' : 'denied'}`);
        
        // If denied but not requested yet, try request
        if (!locationPermission) {
          console.log('Requesting location permission...');
          const locationRequest = await Geolocation.requestPermissions();
          locationPermission = 
            locationRequest.location === 'granted' || 
            locationRequest.coarseLocation === 'granted';
          console.log(`Location permission after request: ${locationPermission ? 'granted' : 'denied'}`);
        }
      } catch (err) {
        console.error('Error checking location permissions:', err);
        // Fallback to assuming permission granted for development
        locationPermission = true;
      }

      // Check motion permissions
      try {
        const motionStatus = await Motion.checkPermissions();
        motionPermission = motionStatus.accel === 'granted';
        console.log(`Motion permission status: ${motionPermission ? 'granted' : 'denied'}`);
        
        // If denied but not requested yet, try request
        if (!motionPermission) {
          console.log('Requesting motion permission...');
          const motionRequest = await Motion.requestPermissions();
          motionPermission = motionRequest.accel === 'granted';
          console.log(`Motion permission after request: ${motionPermission ? 'granted' : 'denied'}`);
        }
      } catch (err) {
        console.error('Error checking motion permissions:', err);
        // Fallback to assuming permission granted for development
        motionPermission = true;
      }

      setPermissions({
        location: locationPermission,
        motion: motionPermission,
        notifications: notificationsPermission
      });
      
      console.log('Updated permissions state:', {
        location: locationPermission,
        motion: motionPermission,
        notifications: notificationsPermission
      });
      
      return locationPermission && motionPermission;
    } catch (err) {
      console.error('Error checking permissions:', err);
      toast.error('Error checking permissions');
      return false;
    }
  }, [lastCheckTime, permissions.location, permissions.motion]);

  const requestAllPermissions = useCallback(async () => {
    try {
      let results = {
        location: false,
        motion: false
      };
      
      console.log('Requesting all permissions...');
      
      if (Capacitor.isNativePlatform()) {
        // Location permission
        try {
          console.log('Requesting location permission');
          const locationStatus = await Geolocation.requestPermissions();
          results.location = 
            locationStatus.location === 'granted' || 
            locationStatus.coarseLocation === 'granted';
          
          if (results.location) {
            console.log('Location permission granted');
            toast.success('Location permission granted');
          } else {
            console.warn('Location permission denied');
            toast.error('Location permission denied');
          }
        } catch (err) {
          console.error('Error requesting location permission:', err);
          toast.error('Failed to request location permission');
        }
        
        // Motion permission
        try {
          console.log('Requesting motion permission');
          const motionStatus = await Motion.requestPermissions();
          results.motion = motionStatus.accel === 'granted';
          
          if (results.motion) {
            console.log('Motion permission granted');
            toast.success('Motion permission granted');
          } else {
            console.warn('Motion permission denied');
            toast.error('Motion permission denied');
          }
        } catch (err) {
          console.error('Error requesting motion permission:', err);
          toast.error('Failed to request motion permission');
        }
        
        setPermissions(prev => ({
          ...prev,
          location: results.location,
          motion: results.motion
        }));
        
        console.log('Permission request results:', results);
        return results.location && results.motion;
      } else {
        // For web, simulate successful permission grants
        console.log('Not on native platform, simulating permission grant');
        setPermissions(prev => ({
          ...prev,
          location: true,
          motion: true
        }));
        return true;
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      toast.error('Error requesting permissions');
      return false;
    }
  }, []);

  return {
    permissions,
    isNative,
    checkPermissions,
    requestAllPermissions
  };
};
