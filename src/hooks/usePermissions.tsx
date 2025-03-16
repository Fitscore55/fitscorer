
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type PermissionType = 'location' | 'motion' | 'notifications';

// Key for storing permissions in local storage
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
      const savedPermissionsJson = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      if (savedPermissionsJson) {
        const savedPermissions = JSON.parse(savedPermissionsJson);
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
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(perms));
      console.log('Permissions saved to storage:', perms);
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    setIsNative(false);
    console.log('Permissions manager initialized on web platform');
    
    // Load saved permissions
    loadSavedPermissions().then(savedPerms => {
      if (!savedPerms) {
        // Default permissions for web
        setPermissions({
          location: false,
          motion: false,
          notifications: false
        });
      }
    });
  }, [loadSavedPermissions]);

  // Check all permissions - simulated on web
  const checkPermissions = useCallback(async () => {
    setIsChecking(true);
    
    try {
      console.log('Checking permissions...');
      
      // For web, we'll just use the stored values
      const savedPermissions = await loadSavedPermissions();
      if (savedPermissions) {
        setPermissions(savedPermissions);
      }
      
      // We could implement web-specific permission checks here
      // For example, using the Permissions API for notifications
      
      return false; // No native permissions on web
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [loadSavedPermissions]);

  // Request a specific permission - simulated on web
  const requestPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      console.log(`Requesting ${type} permission...`);
      
      // Mock permission request for web
      // In a real app, you would implement actual web permission requests here
      
      // For notifications, we could use the actual web Notifications API
      if (type === 'notifications' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          const granted = permission === 'granted';
          
          setPermissions(prev => {
            const updated = { ...prev, notifications: granted };
            savePermissions(updated);
            return updated;
          });
          
          return granted;
        } catch (e) {
          console.error('Error requesting notification permission:', e);
        }
      }
      
      // For other permission types, just simulate success on web
      const mockGranted = true;
      setPermissions(prev => {
        const updated = { ...prev, [type]: mockGranted };
        savePermissions(updated);
        return updated;
      });
      
      return mockGranted;
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [savePermissions]);

  // Request all permissions at once
  const requestAllPermissions = useCallback(async () => {
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
