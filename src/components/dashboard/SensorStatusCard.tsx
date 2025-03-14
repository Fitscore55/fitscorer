
import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface SensorStatusCardProps {
  isRecording: boolean;
  isAutoTracking: boolean;
  isLoading: boolean;
  hasRequiredPermissions: boolean;
  onToggleAutoTracking: (checked: boolean) => void;
  onRequestPermissions: () => void;
}

const SensorStatusCard = ({
  isRecording,
  isAutoTracking,
  isLoading,
  hasRequiredPermissions,
  onToggleAutoTracking,
  onRequestPermissions
}: SensorStatusCardProps) => {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Tracking Status</p>
          <p className={`text-xs ${isRecording ? 'text-green-600' : 'text-yellow-600'}`}>
            {isRecording ? 'Active' : 'Inactive'}
          </p>
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
          disabled={isLoading}
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
    </div>
  );
};

export default SensorStatusCard;
