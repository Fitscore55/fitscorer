
import React from 'react';
import { Shield, RefreshCw, CheckCircle2, XCircle, Smartphone, Laptop, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Capacitor } from '@capacitor/core';

interface SensorStatusCardProps {
  isRecording: boolean;
  isAutoTracking: boolean;
  isLoading: boolean;
  isNative?: boolean;
  hasRequiredPermissions: boolean;
  onToggleAutoTracking: (checked: boolean) => void;
  onRequestPermissions: () => void;
}

const SensorStatusCard = ({
  isRecording,
  isAutoTracking,
  isLoading,
  isNative = false,
  hasRequiredPermissions,
  onToggleAutoTracking,
  onRequestPermissions
}: SensorStatusCardProps) => {
  const isMobileDevice = Capacitor.isNativePlatform();
  
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Tracking Status</p>
          <div className="flex items-center gap-1.5 mt-1">
            {isRecording ? (
              <Badge variant="default" className="gap-1 items-center px-2 py-0.5 bg-success-600 hover:bg-success-700">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 items-center px-2 py-0.5">
                <XCircle className="h-3 w-3" />
                <span>Inactive</span>
              </Badge>
            )}
            
            {isNative ? (
              <Badge variant="secondary" className="gap-1 items-center px-2 py-0.5 ml-1">
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 items-center px-2 py-0.5 ml-1">
                <Laptop className="h-3 w-3" />
                <span>Web</span>
              </Badge>
            )}
          </div>
        </div>
        {!hasRequiredPermissions && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={onRequestPermissions}
          >
            <Shield className="h-3 w-3" />
            Permissions Required
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <RefreshCw className={`h-4 w-4 ${isAutoTracking ? 'text-green-600' : 'text-gray-400'}`} />
          <div className="grid gap-0.5">
            <Label htmlFor="auto-tracking" className="text-sm">Auto Tracking</Label>
            <p className="text-xs text-muted-foreground">
              Automatically track your fitness data
            </p>
          </div>
        </div>
        <Switch 
          id="auto-tracking"
          checked={isAutoTracking}
          onCheckedChange={onToggleAutoTracking}
          disabled={isLoading || !isMobileDevice}
        />
      </div>
      
      {isAutoTracking && (
        <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Auto-tracking is enabled. Your fitness data is being recorded automatically. This feature may increase battery usage.
          </p>
        </div>
      )}

      {!isMobileDevice && (
        <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md flex items-start gap-2 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300">
            Fitness tracking is only available on mobile devices. Please use the mobile app to track your fitness activities.
          </p>
        </div>
      )}

      {!hasRequiredPermissions && isMobileDevice && (
        <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md flex items-start gap-2 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300">
            Permissions are required for tracking. Please click the "Permissions Required" button above to grant access.
          </p>
        </div>
      )}

      {isMobileDevice && isRecording && (
        <div className="mt-2 text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded-md flex items-start gap-2 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-800 dark:text-green-300">
            Mobile tracking active. Keep the app open in the background for best results.
          </p>
        </div>
      )}
    </div>
  );
};

export default SensorStatusCard;
