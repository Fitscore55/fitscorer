
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import { toast } from 'sonner';

// Define and export the PermissionType type
export type PermissionType = 'location' | 'motion' | 'notifications';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    location: false,
    motion: false,
    notifications: false
  });
  const [isNative, setIsNative] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

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
    setIsChecking(true);
    
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, simulating permissions for development');
      setPermissions({
        location: true,
        motion: true,
        notifications: true
      });
      setIsChecking(false);
      return true;
    }
    
    const now = Date.now();
    // Don't check too frequently (at most once per second)
    if (now - lastCheckTime < 1000) {
      console.log('Skipping permission check - checked too recently');
      setIsChecking(false);
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
      } catch (err) {
        console.error('Error checking location permissions:', err);
        // Fallback to assuming permission granted for development
        locationPermission = true;
      }

      // Check motion permissions - note Motion API doesn't have checkPermissions
      // We'll use a try/catch with an attempt to use the sensor instead
      try {
        // For motion, we can only know if we have permission by trying to use it
        // If it succeeds, we have permission. If it fails, we don't.
        try {
          // We'll try to add a listener temporarily to see if we have permission
          const listener = await Motion.addListener('accel', () => {});
          await listener.remove();
          motionPermission = true;
        } catch (err) {
          // If there's an error, we might not have permission
          console.error('Error checking motion permissions:', err);
          motionPermission = false;
        }
        
        console.log(`Motion permission status: ${motionPermission ? 'granted' : 'denied'}`);
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
      
      setIsChecking(false);
      return locationPermission && motionPermission;
    } catch (err) {
      console.error('Error checking permissions:', err);
      toast.error('Error checking permissions');
      setIsChecking(false);
      return false;
    }
  }, [lastCheckTime, permissions.location, permissions.motion]);

  // Individual permission request method
  const requestPermission = useCallback(async (type: PermissionType) => {
    console.log(`Requesting permission for ${type}...`);
    
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, simulating permission grant');
      setPermissions(prev => ({ ...prev, [type]: true }));
      return true;
    }
    
    try {
      let granted = false;
      
      if (type === 'location') {
        const result = await Geolocation.requestPermissions();
        granted = result.location === 'granted' || result.coarseLocation === 'granted';
      } 
      else if (type === 'motion') {
        try {
          // Motion API doesn't have a standard requestPermissions method like other plugins
          // Instead, we'll try to use the sensor which will trigger the permission prompt
          const listener = await Motion.addListener('accel', () => {});
          await listener.remove();
          granted = true;
        } catch (error) {
          console.error('Error requesting motion permission:', error);
          granted = false;
        }
      }
      else if (type === 'notifications') {
        // Implement this when adding notifications support
        granted = false;
      }
      
      // Update permission state
      setPermissions(prev => ({ ...prev, [type]: granted }));
      console.log(`${type} permission ${granted ? 'granted' : 'denied'}`);
      
      return granted;
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      toast.error(`Failed to request ${type} permission`);
      return false;
    }
  }, []);

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
          try {
            // Motion API doesn't have a standard requestPermissions method
            // Try to use the sensor which will trigger the permission prompt
            const listener = await Motion.addListener('accel', () => {});
            await listener.remove();
            results.motion = true;
            console.log('Motion permission granted');
            toast.success('Motion permission granted');
          } catch (err) {
            console.warn('Motion permission denied');
            toast.error('Motion permission denied');
            results.motion = false;
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
    isChecking,
    checkPermissions,
    requestPermission,
    requestAllPermissions
  };
};
