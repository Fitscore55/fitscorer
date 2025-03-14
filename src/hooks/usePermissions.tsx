
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
    
    // For web platform, assume permissions can be granted
    if (!Capacitor.isNativePlatform()) {
      // Web platform doesn't need real permissions, just simulate
      setIsChecking(false);
    } else {
      // On native platform, we'd actually check permissions
      // For now, just ensure we're not stuck in checking state
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
