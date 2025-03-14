
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

  // Function to check permissions on native platforms
  const checkNativePermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Check location permission
        try {
          const locationStatus = await Geolocation.checkPermissions();
          const isLocationGranted = locationStatus.location === 'granted';
          
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
            const removeListener = await Motion.addListener('accel', () => {});
            if (removeListener) {
              removeListener.remove();
              hasMotionAccess = true;
            }
          } catch (e) {
            console.log('No motion access:', e);
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
          setPermissionStates(prev => ({ 
            ...prev, 
            notifications: notificationStatus.receive === 'granted' 
          }));
        } catch (error) {
          console.error('Error checking notification permission:', error);
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
    
    if (Capacitor.isNativePlatform()) {
      // On native platform, check actual permissions
      checkNativePermissions();
    } else {
      // For web platform, assume permissions can be granted via simulation
      setIsChecking(false);
    }

    // Always finish checking after a timeout to prevent UI getting stuck
    const timeoutId = setTimeout(() => {
      setIsChecking(false);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, []);

  const requestPermission = async (type: PermissionType) => {
    try {
      setIsChecking(true);
      let granted = false;
      
      if (Capacitor.isNativePlatform()) {
        // Request actual device permissions based on type
        switch (type) {
          case 'location':
            const locationResult = await Geolocation.requestPermissions({
              permissions: ['location']
            });
            
            granted = locationResult.location === 'granted';
            break;
            
          case 'motion':
            try {
              // For motion sensors, we try to add a listener to verify access
              let hasMotionAccess = false;
              try {
                // Try to add a listener to verify if we can access motion data
                const removeListener = await Motion.addListener('accel', () => {});
                if (removeListener) {
                  removeListener.remove();
                  hasMotionAccess = true;
                }
              } catch (e) {
                console.log('No motion access after request:', e);
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
    requestPermission
  };
}
