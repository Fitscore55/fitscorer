
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Capacitor } from '@capacitor/core';

// Define permission types
export type PermissionType = 'location' | 'motion' | 'notifications';

export function usePermissions() {
  const [permissionStates, setPermissionStates] = useState<Record<PermissionType, boolean>>({
    location: false,
    motion: false,
    notifications: false
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if running on a native platform
    const isNative = Capacitor.isNativePlatform();
    
    // For simplicity and to prevent getting stuck, use a timeout
    const checkPermissions = async () => {
      try {
        if (!isNative) {
          // For web platform, assume permissions are granted after a slight delay
          setPermissionStates({
            location: true,
            motion: true,
            notifications: true
          });
        } else {
          // For native platforms, check for stored permissions first
          // If not available, we'll use the requestPermission function to get them later
          const storedPermissions = localStorage.getItem('appPermissions');
          if (storedPermissions) {
            setPermissionStates(JSON.parse(storedPermissions));
          }
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        toast.error('Unable to check permissions');
      } finally {
        // Always complete the checking state to prevent UI getting stuck
        setIsChecking(false);
      }
    };

    // Add a slight timeout to ensure UI has time to render
    const timeoutId = setTimeout(() => {
      checkPermissions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  const requestPermission = async (type: PermissionType) => {
    try {
      setIsChecking(true);
      
      // In a real implementation, you would use Capacitor.Plugins.Permissions
      // or other platform-specific APIs to request permission
      
      // For demo purposes, simulate successful permission grant
      setPermissionStates(prev => {
        const newState = { ...prev, [type]: true };
        // Store permissions in localStorage
        localStorage.setItem('appPermissions', JSON.stringify(newState));
        return newState;
      });
      
      toast.success(`${type} permission granted`);
      return true;
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
