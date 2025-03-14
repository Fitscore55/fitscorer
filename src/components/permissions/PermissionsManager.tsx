
import { useState } from 'react';
import { usePermissions, PermissionType } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Bell, Activity } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';

const permissionInfo: Record<PermissionType, { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}> = {
  location: {
    title: "Location",
    description: "Track your walks and runs with precise location data",
    icon: <MapPin className="h-5 w-5" />,
  },
  notifications: {
    title: "Notifications",
    description: "Stay updated with activity reminders and achievement alerts",
    icon: <Bell className="h-5 w-5" />,
  },
  motion: {
    title: "Motion & Fitness",
    description: "Count steps and measure activity accurately",
    icon: <Activity className="h-5 w-5" />,
  },
};

interface PermissionsManagerProps {
  onComplete?: () => void;
}

const PermissionsManager = ({ onComplete }: PermissionsManagerProps) => {
  const { permissions, isChecking, requestPermission } = usePermissions();
  const [requesting, setRequesting] = useState<PermissionType | null>(null);

  const allPermissionsGranted = Object.values(permissions).every(Boolean);

  const handleRequestPermission = async (type: PermissionType) => {
    setRequesting(type);
    await requestPermission(type);
    setRequesting(null);
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-fitscore-600" />
        <p className="text-center text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DialogTitle className="text-center text-2xl font-bold">App Permissions</DialogTitle>
      <DialogDescription className="text-center">
        Enable these permissions to get the most out of Fitscorer
      </DialogDescription>

      {Object.entries(permissionInfo).map(([key, info]) => {
        const type = key as PermissionType;
        const isGranted = permissions[type];
        
        return (
          <Card key={key} className={isGranted ? "border-fitscore-200 bg-fitscore-50/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <span className="mr-2 text-fitscore-600">{info.icon}</span>
                {info.title}
                {isGranted && (
                  <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Granted
                  </span>
                )}
              </CardTitle>
              <CardDescription>{info.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-1">
              <Button 
                variant={isGranted ? "outline" : "default"}
                className={isGranted ? "text-muted-foreground" : ""}
                disabled={isGranted || requesting === type}
                onClick={() => handleRequestPermission(type)}
              >
                {requesting === type ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting
                  </>
                ) : isGranted ? (
                  "Permission granted"
                ) : (
                  "Grant permission"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}

      <div className="pt-4 flex justify-center">
        <Button 
          variant="default" 
          size="lg"
          onClick={handleComplete}
          className="w-full"
        >
          {allPermissionsGranted ? "Continue" : "Skip for now"}
        </Button>
      </div>
    </div>
  );
};

export default PermissionsManager;
