
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import { PushNotifications } from '@capacitor/push-notifications';
import { toast } from 'sonner';
import { Storage } from '@capacitor/storage';

export type PermissionType = 'location' | 'motion' | 'notifications';

// Add key for storing permissions in local storage
const PERMISSIONS_STORAGE_KEY = 'fitscore_app_permissions';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    location: false,
    motion: false,
    notifications: false
  });
  const [isNative, setIsNative] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Load saved permissions from storage
  const loadSavedPermissions = useCallback(async () => {
    try {
      const { value } = await Storage.get({ key: PERMISSIONS_STORAGE_KEY });
      if (value) {
        const savedPermissions = JSON.parse(value);
        console.log('Loaded saved permissions:', savedPermissions);
        setPermissions(savedPermissions);
        return savedPermissions;
      }
    } catch (error) {
      console.error('Error loading saved permissions:', error);
    }
    return null;
  }, []);

  // Save permissions to storage
  const savePermissions = useCallback(async (perms: any) => {
    try {
      await Storage.set({
        key: PERMISSIONS_STORAGE_KEY,
        value: JSON.stringify(perms)
      });
      console.log('Permissions saved to storage:', perms);
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  }, []);

  // Check if running on a native platform on mount
  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);
    console.log(`Permissions on ${isNativePlatform ? 'native' : 'web'} platform`);
    
    // If on a native platform, check permissions on mount
    if (isNativePlatform) {
      // First try to load from storage
      loadSavedPermissions().then(savedPerms => {
        if (!savedPerms) {
          // If nothing in storage, check actual permissions
          checkPermissions();
        } else {
          // Still verify permissions after loading from storage
          setTimeout(() => checkPermissions(), 1000);
        }
      });
    } else {
      // On web, mock permissions
      setPermissions({
        location: false,
        motion: false,
        notifications: false
      });
    }
  }, [loadSavedPermissions]);

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
      
      // For Motion, we need to actually try using the sensor to check permission
      let hasMotionPermission = false;
      try {
        // Create a temporary listener to check if motion is accessible
        const listener = await Motion.addListener('accel', () => {});
        await listener.remove();
        hasMotionPermission = true;
        console.log('Motion permission check: Permission granted');
      } catch (error) {
        console.error('Motion permission check: Permission denied or error:', error);
        hasMotionPermission = false;
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
      
      // Save permissions to storage for persistence
      await savePermissions(updatedPermissions);
      
      return (hasLocationPermission && hasMotionPermission);
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [savePermissions]);

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
          const result = await Geolocation.requestPermissions({
            permissions: ['location', 'coarseLocation']
          });
          const granted = 
            result.location === 'granted' || 
            result.coarseLocation === 'granted';
          
          if (granted) {
            console.log('Location permission granted');
            setPermissions(prev => {
              const updated = { ...prev, location: true };
              savePermissions(updated);
              return updated;
            });
          } else {
            console.log('Location permission denied');
          }
          
          return granted;
        }
          
        case 'motion': {
          console.log('Requesting motion permission...');
          try {
            // The Motion API doesn't have a direct requestPermissions method
            // Try to add a listener which will trigger the permission request on supported platforms
            const listener = await Motion.addListener('accel', () => {});
            await listener.remove();
            console.log('Motion permission granted or not required');
            setPermissions(prev => {
              const updated = { ...prev, motion: true };
              savePermissions(updated);
              return updated;
            });
            return true;
          } catch (error) {
            console.error('Error requesting motion permission:', error);
            toast.warning('Motion permissions may need to be enabled in device settings');
            return false;
          }
        }
          
        case 'notifications': {
          console.log('Requesting notification permission...');
          const result = await PushNotifications.requestPermissions();
          const granted = result.receive === 'granted';
          
          if (granted) {
            console.log('Notification permission granted');
            setPermissions(prev => {
              const updated = { ...prev, notifications: true };
              savePermissions(updated);
              return updated;
            });
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
  }, [savePermissions]);

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
      const notificationsGranted = await requestPermission('notifications');
      
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
