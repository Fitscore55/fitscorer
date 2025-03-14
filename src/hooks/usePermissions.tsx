
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import { PushNotifications } from '@capacitor/push-notifications';

// Define permission types
export type PermissionType = 'location' | 'motion' | 'notifications';

export function usePermissions() {
  const [permissionStates, setPermissionStates] = useState<Record<PermissionType, boolean>>({
    location: false,
    motion: false,
    notifications: false
  });
  const [isChecking, setIsChecking] = useState(true);
  const [isNative, setIsNative] = useState(false);

  // Check if running on a native platform
  useEffect(() => {
    const checkPlatform = async () => {
      const isNativePlatform = Capacitor.isNativePlatform();
      setIsNative(isNativePlatform);
      console.log(`Running on ${isNativePlatform ? 'native' : 'web'} platform`);
    };
    
    checkPlatform();
  }, []);

  // Function to check permissions on native platforms
  const checkNativePermissions = useCallback(async () => {
    try {
      setIsChecking(true);
      if (Capacitor.isNativePlatform()) {
        console.log('Checking native permissions...');
        
        // Check location permission
        try {
          const locationStatus = await Geolocation.checkPermissions();
          const isLocationGranted = locationStatus.location === 'granted';
          console.log(`Location permission: ${isLocationGranted ? 'granted' : 'denied'}`);
          
          setPermissionStates(prev => ({ 
            ...prev, 
            location: isLocationGranted
          }));
        } catch (error) {
          console.error('Error checking location permission:', error);
        }

        // Check motion permission - different approach for iOS vs Android
        try {
          let hasMotionAccess = false;
          
          if (Capacitor.getPlatform() === 'ios') {
            // On iOS, we need to try to access the data to test permission
            try {
              // Try to add a listener to verify if we can access motion data
              const removeListener = await Motion.addListener('accel', (data) => {
                console.log('Motion data test:', data);
                removeListener.remove();
              });
              hasMotionAccess = true;
              console.log('Motion permission: granted (iOS)');
            } catch (e) {
              console.log('Motion permission: denied (iOS)', e);
              hasMotionAccess = false;
            }
          } else if (Capacitor.getPlatform() === 'android') {
            // On Android, basic accelerometer data generally doesn't need explicit permission
            // But we'll still test if we can access it
            try {
              const removeListener = await Motion.addListener('accel', (data) => {
                console.log('Motion data test (Android):', data);
                removeListener.remove();
              });
              hasMotionAccess = true;
              console.log('Motion permission: granted (Android)');
            } catch (e) {
              console.log('Motion permission: denied (Android)', e);
              hasMotionAccess = false;
            }
          } else {
            // Web or other platform
            console.log('Motion permission: platform not supported for direct check');
            hasMotionAccess = true; // Assume granted for web
          }
          
          setPermissionStates(prev => ({ 
            ...prev, 
            motion: hasMotionAccess 
          }));
        } catch (error) {
          console.error('Error checking motion permission:', error);
        }

        // Check notification permission
        try {
          const notificationStatus = await PushNotifications.checkPermissions();
          const notificationsGranted = notificationStatus.receive === 'granted';
          console.log(`Notification permission: ${notificationsGranted ? 'granted' : 'denied'}`);
          
          setPermissionStates(prev => ({ 
            ...prev, 
            notifications: notificationsGranted 
          }));
        } catch (error) {
          console.error('Error checking notification permission:', error);
        }
      } else {
        // For web simulation, check stored permissions or set defaults
        console.log('Checking web permissions simulation...');
        const storedPermissions = localStorage.getItem('appPermissions');
        if (storedPermissions) {
          try {
            const parsed = JSON.parse(storedPermissions);
            setPermissionStates(parsed);
            console.log('Loaded stored web permissions:', parsed);
          } catch (e) {
            console.error('Error parsing stored permissions:', e);
          }
        } else {
          // For web testing, default to true
          setPermissionStates({
            location: true,
            motion: true,
            notifications: false
          });
          localStorage.setItem('appPermissions', JSON.stringify({
            location: true,
            motion: true,
            notifications: false
          }));
          console.log('Set default web permissions');
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Run initial permission check
    checkNativePermissions();
    
    // Set up permission refresh interval
    const permissionCheckInterval = setInterval(() => {
      checkNativePermissions();
    }, 60 * 1000); // Check every minute

    return () => {
      clearInterval(permissionCheckInterval);
    };
  }, [checkNativePermissions]);

  const requestPermission = async (type: PermissionType) => {
    try {
      setIsChecking(true);
      let granted = false;
      
      if (Capacitor.isNativePlatform()) {
        console.log(`Requesting ${type} permission on native platform...`);
        // Request actual device permissions based on type
        switch (type) {
          case 'location':
            try {
              const locationResult = await Geolocation.requestPermissions({
                permissions: ['location']
              });
              
              granted = locationResult.location === 'granted';
              console.log(`Location permission request result: ${granted ? 'granted' : 'denied'}`);
            } catch (e) {
              console.error('Error requesting location permission:', e);
              granted = false;
            }
            break;
            
          case 'motion':
            try {
              console.log('Requesting motion permission...');
              // For iOS, there's a system prompt for motion sensors
              // For Android, basic accelerometer access is typically available without permission
              
              if (Capacitor.getPlatform() === 'ios') {
                // On iOS we need to test if we can access the data after requesting
                try {
                  const removeListener = await Motion.addListener('accel', (data) => {
                    console.log('Motion data test after request:', data);
                    removeListener.remove();
                  });
                  granted = true;
                } catch (e) {
                  console.error('Motion access denied after request:', e);
                  granted = false;
                }
              } else {
                // For Android, try to access motion data directly
                try {
                  const removeListener = await Motion.addListener('accel', (data) => {
                    console.log('Motion data test after request (Android):', data);
                    removeListener.remove();
                  });
                  granted = true;
                } catch (e) {
                  console.error('Motion access denied after request (Android):', e);
                  granted = false;
                }
              }
              
              console.log(`Motion permission request result: ${granted ? 'granted' : 'denied'}`);
            } catch (error) {
              console.error('Error requesting motion access:', error);
              granted = false;
            }
            break;
            
          case 'notifications':
            try {
              const notificationResult = await PushNotifications.requestPermissions();
              granted = notificationResult.receive === 'granted';
              console.log(`Notification permission request result: ${granted ? 'granted' : 'denied'}`);
              
              // Initialize notifications if granted
              if (granted) {
                await PushNotifications.register();
              }
            } catch (e) {
              console.error('Error requesting notification permission:', e);
              granted = false;
            }
            break;
            
          default:
            break;
        }
      } else {
        // For web simulation, always grant permission
        granted = true;
        console.log(`Web simulation: ${type} permission would be requested on a real device`);
      }
      
      // Update permission state
      setPermissionStates(prev => {
        const newState = { ...prev, [type]: granted };
        // Store permissions in localStorage
        localStorage.setItem('appPermissions', JSON.stringify(newState));
        return newState;
      });
      
      if (granted) {
        toast.success(`${type} permission granted`);
      } else {
        toast.error(`${type} permission denied`);
      }
      
      return granted;
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      toast.error(`Unable to get ${type} permission`);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    permissions: permissionStates,
    isChecking,
    isNative,
    requestPermission,
    checkPermissions: checkNativePermissions
  };
}
