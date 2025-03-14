
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
          setPermissionStates(prev => ({ 
            ...prev, 
            location: locationStatus.location === 'granted' || locationStatus.location === 'granted-when-in-use' 
          }));
        } catch (error) {
          console.error('Error checking location permission:', error);
        }

        // Check motion permission
        try {
          const accelStatus = await Motion.checkPermissions();
          setPermissionStates(prev => ({ 
            ...prev, 
            motion: accelStatus.accel === 'granted' 
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
            granted = locationResult.location === 'granted' || locationResult.location === 'granted-when-in-use';
            break;
            
          case 'motion':
            const motionResult = await Motion.requestPermissions();
            granted = motionResult.accel === 'granted';
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
