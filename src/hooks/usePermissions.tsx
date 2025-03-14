
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import { PushNotifications } from '@capacitor/push-notifications';
import { toast } from 'sonner';

export type PermissionType = 'location' | 'motion' | 'notifications';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    location: false,
    motion: false,
    notifications: false
  });
  const [isNative, setIsNative] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check if running on a native platform on mount
  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);
    console.log(`Permissions on ${isNativePlatform ? 'native' : 'web'} platform`);
    
    // If on a native platform, check permissions on mount
    if (isNativePlatform) {
      checkPermissions();
    } else {
      // On web, mock permissions
      setPermissions({
        location: false,
        motion: false,
        notifications: false
      });
    }
  }, []);

  // Check all permissions
  const checkPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Cannot check permissions: Not on a native platform');
      return false;
    }
    
    setIsChecking(true);
    
    try {
      console.log('Checking device permissions...');
      
      // Check location permission
      const locationStatus = await Geolocation.checkPermissions();
      const hasLocationPermission = 
        locationStatus.location === 'granted' || 
        locationStatus.coarseLocation === 'granted';
      
      // Check motion/activity recognition permission
      let hasMotionPermission = false;
      try {
        // For some devices/OS versions, this might not be available
        // so we need to handle it gracefully
        // Motion doesn't have requestPermissions, we'll use checkPermissions instead
        const motionStatus = await Motion.checkPermissions();
        hasMotionPermission = motionStatus.motion === 'granted';
      } catch (error) {
        console.error('Error checking motion permissions:', error);
        // Assume permission is granted if check fails (different platforms handle this differently)
        hasMotionPermission = true;
      }
      
      // Check notification permission
      const notificationStatus = await PushNotifications.checkPermissions();
      const hasNotificationPermission = notificationStatus.receive === 'granted';
      
      const updatedPermissions = {
        location: hasLocationPermission,
        motion: hasMotionPermission,
        notifications: hasNotificationPermission
      };
      
      console.log('Current permissions:', updatedPermissions);
      setPermissions(updatedPermissions);
      
      return (hasLocationPermission && hasMotionPermission);
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Request a specific permission
  const requestPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log(`Cannot request ${type} permission: Not on a native platform`);
      return false;
    }
    
    setIsChecking(true);
    
    try {
      switch (type) {
        case 'location': {
          console.log('Requesting location permission...');
          const result = await Geolocation.requestPermissions();
          const granted = 
            result.location === 'granted' || 
            result.coarseLocation === 'granted';
          
          if (granted) {
            console.log('Location permission granted');
            setPermissions(prev => ({ ...prev, location: true }));
          } else {
            console.log('Location permission denied');
          }
          
          return granted;
        }
          
        case 'motion': {
          console.log('Requesting motion permission...');
          try {
            // Motion API doesn't have a requestPermissions method, so we check permissions
            // and if they're not granted, we can't request them programmatically.
            // This varies by platform, but we'll handle it consistently.
            const result = await Motion.checkPermissions();
            const granted = result.motion === 'granted';
            
            if (granted) {
              console.log('Motion permission granted');
              setPermissions(prev => ({ ...prev, motion: true }));
            } else {
              console.log('Motion permission denied or not available');
              // On some platforms, we need to inform the user to enable permissions manually
              toast.warning('Motion permissions may need to be enabled in device settings');
            }
            
            return granted;
          } catch (error) {
            console.error('Error requesting motion permission:', error);
            // On some platforms, requestPermissions might fail but the permission is still granted
            // We'll optimistically assume it's granted if the request fails
            setPermissions(prev => ({ ...prev, motion: true }));
            return true;
          }
        }
          
        case 'notifications': {
          console.log('Requesting notification permission...');
          const result = await PushNotifications.requestPermissions();
          const granted = result.receive === 'granted';
          
          if (granted) {
            console.log('Notification permission granted');
            setPermissions(prev => ({ ...prev, notifications: true }));
          } else {
            console.log('Notification permission denied');
          }
          
          return granted;
        }
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Request all permissions at once
  const requestAllPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Cannot request permissions: Not on a native platform');
      return false;
    }
    
    try {
      console.log('Requesting all permissions...');
      
      const locationGranted = await requestPermission('location');
      const motionGranted = await requestPermission('motion');
      
      // Only show toast for permissions that weren't granted
      if (!locationGranted || !motionGranted) {
        toast.warning('Some permissions were denied. This may affect app functionality.');
      }
      
      return (locationGranted && motionGranted);
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      return false;
    }
  }, [requestPermission]);

  return {
    permissions,
    isNative,
    isChecking,
    checkPermissions,
    requestPermission,
    requestAllPermissions
  };
};
