
import { useState, useEffect } from 'react';
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
  const checkNativePermissions = async () => {
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

        // Check motion permission
        try {
          // Motion API doesn't have checkPermissions, try to access accelerometer
          let hasMotionAccess = false;
          try {
            // Try to add a listener to verify if we can access motion data
            const removeListener = await Motion.addListener('accel', (data) => {
              console.log('Motion data test:', data);
              removeListener.remove();
            });
            hasMotionAccess = true;
            console.log('Motion permission: granted');
          } catch (e) {
            console.log('Motion permission: denied', e);
            hasMotionAccess = false;
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
            setPermissionStates(JSON.parse(storedPermissions));
          } catch (e) {
            console.error('Error parsing stored permissions:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Load any stored permissions first
    const loadStoredPermissions = () => {
      try {
        const storedPermissions = localStorage.getItem('appPermissions');
        if (storedPermissions) {
          setPermissionStates(JSON.parse(storedPermissions));
        }
      } catch (error) {
        console.error('Error loading stored permissions:', error);
      }
    };

    // Load stored permissions
    loadStoredPermissions();
    
    // Run initial permission check
    checkNativePermissions();
    
    // Set up permission refresh interval
    const permissionCheckInterval = setInterval(() => {
      checkNativePermissions();
    }, 60 * 1000); // Check every minute

    // Always finish checking after a timeout to prevent UI getting stuck
    const timeoutId = setTimeout(() => {
      setIsChecking(false);
    }, 800);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(permissionCheckInterval);
    };
  }, []);

  const requestPermission = async (type: PermissionType) => {
    try {
      setIsChecking(true);
      let granted = false;
      
      if (Capacitor.isNativePlatform()) {
        console.log(`Requesting ${type} permission on native platform...`);
        // Request actual device permissions based on type
        switch (type) {
          case 'location':
            const locationResult = await Geolocation.requestPermissions({
              permissions: ['location']
            });
            
            granted = locationResult.location === 'granted';
            console.log(`Location permission request result: ${granted ? 'granted' : 'denied'}`);
            break;
            
          case 'motion':
            try {
              console.log('Requesting motion permission...');
              // For motion sensors, we try to add a listener to verify access
              let hasMotionAccess = false;
              try {
                // Try to add a listener to verify if we can access motion data
                const removeListener = await Motion.addListener('accel', (data) => {
                  console.log('Motion data access test:', data);
                  // Remove the listener immediately after we confirm it works
                  removeListener.remove();
                });
                hasMotionAccess = true;
                console.log('Motion access granted');
              } catch (e) {
                console.log('Motion access denied after request:', e);
                hasMotionAccess = false;
              }
              
              granted = hasMotionAccess;
            } catch (error) {
              console.error('Error requesting motion access:', error);
              granted = false;
            }
            break;
            
          case 'notifications':
            const notificationResult = await PushNotifications.requestPermissions();
            granted = notificationResult.receive === 'granted';
            console.log(`Notification permission request result: ${granted ? 'granted' : 'denied'}`);
            
            // Initialize notifications if granted
            if (granted) {
              await PushNotifications.register();
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
