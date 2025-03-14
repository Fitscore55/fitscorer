
import React from 'react';
import { Shield, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
          <div className="flex items-center gap-1.5 mt-1">
            {isRecording ? (
              <Badge variant="success" className="gap-1 items-center px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 items-center px-2 py-0.5">
                <XCircle className="h-3 w-3" />
                <span>Inactive</span>
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

      {!hasRequiredPermissions && (
        <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md flex items-start gap-2 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300">
            Permissions are required for tracking. Please click the "Permissions Required" button above to grant access.
          </p>
        </div>
      )}
    </div>
  );
};

export default SensorStatusCard;
