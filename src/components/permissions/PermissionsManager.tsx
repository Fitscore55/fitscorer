
import { useState, useEffect } from 'react';
import { usePermissions, PermissionType } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Bell, Activity, Settings } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const permissionInfo: Record<PermissionType, { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}> = {
  location: {
    title: "Location",
    description: "Track walks and runs",
    icon: <MapPin className="h-4 w-4" />,
  },
  notifications: {
    title: "Notifications",
    description: "Get activity reminders",
    icon: <Bell className="h-4 w-4" />,
  },
  motion: {
    title: "Motion & Fitness",
    description: "Count steps accurately",
    icon: <Activity className="h-4 w-4" />,
  },
};

interface PermissionsManagerProps {
  onComplete?: () => void;
}

const PermissionsManager = ({ onComplete }: PermissionsManagerProps) => {
  const { permissions, isChecking, requestPermission, checkPermissions } = usePermissions();
  const [requesting, setRequesting] = useState<PermissionType | null>(null);

  const allPermissionsGranted = Object.values(permissions).every(Boolean);
  
  // Force recheck permissions when dialog opens
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      checkPermissions();
    }
  }, []);
  
  // Open system settings if permissions are denied multiple times
  const openAppSettings = async () => {
    if (Capacitor.isNativePlatform()) {
      await App.openUrl({ url: 'app-settings:' });
    }
  };

  const handleRequestPermission = async (type: PermissionType) => {
    setRequesting(type);
    const granted = await requestPermission(type);
    
    // If permission wasn't granted, suggest opening settings
    if (!granted && Capacitor.isNativePlatform()) {
      toast.message(
        `${permissionInfo[type].title} permission was denied. You may need to enable it in settings.`,
        {
          action: {
            label: "Settings",
            onClick: openAppSettings
          }
        }
      );
    }
    
    setRequesting(null);
    
    // Recheck all permissions 
    await checkPermissions();
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-fitscore-600" />
        <p className="text-center text-sm text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DialogTitle className="text-center text-lg font-bold">App Permissions</DialogTitle>
      <DialogDescription className="text-center text-xs">
        Enable permissions for the best experience
      </DialogDescription>

      <div className="space-y-2">
        {Object.entries(permissionInfo).map(([key, info]) => {
          const type = key as PermissionType;
          const isGranted = permissions[type];
          
          return (
            <Card key={key} className={`${isGranted ? "border-fitscore-200 bg-fitscore-50/50" : ""} p-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-fitscore-600">{info.icon}</span>
                  <div>
                    <h4 className="text-sm font-medium">{info.title}</h4>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
                {isGranted ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    ✓
                  </span>
                ) : (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={requesting === type}
                    onClick={() => handleRequestPermission(type)}
                  >
                    {requesting === type ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Allow"
                    )}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="pt-2 flex justify-center">
        <Button 
          variant="default" 
          size="sm"
          onClick={handleComplete}
          className="w-full text-sm"
        >
          {allPermissionsGranted ? "Continue" : "Skip for now"}
        </Button>
      </div>
      
      {!allPermissionsGranted && Capacitor.isNativePlatform() && (
        <div className="pt-1 flex justify-center">
          <Button 
            variant="link" 
            size="sm"
            onClick={openAppSettings}
            className="text-xs text-muted-foreground"
          >
            <Settings className="h-3 w-3 mr-1" />
            Open System Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default PermissionsManager;
