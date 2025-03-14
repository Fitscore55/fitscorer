
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Smartphone, Laptop, BadgeInfo } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Capacitor } from '@capacitor/core';

interface SensorStatusCardProps {
  isRecording: boolean;
  isAutoTracking: boolean; // Kept for compatibility but not used
  isLoading: boolean;
  isNative: boolean;
  hasRequiredPermissions: boolean;
  onToggleAutoTracking: (checked: boolean) => void; // Kept for compatibility but not used
  onRequestPermissions: () => void;
}

const SensorStatusCard = ({
  isRecording,
  isLoading,
  isNative,
  hasRequiredPermissions,
  onRequestPermissions
}: SensorStatusCardProps) => {
  
  const isMobile = Capacitor.isNativePlatform();

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-4 pb-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-semibold">Tracking Status</h3>
              <p className="text-sm text-muted-foreground">
                {isRecording 
                  ? "Activity tracking is active" 
                  : "No active tracking"}
              </p>
            </div>
            <div className={`h-4 w-4 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Device Type</p>
              </div>
              <div className="flex items-center space-x-1 text-xs font-medium">
                {isMobile ? (
                  <>
                    <Smartphone className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Mobile</span>
                  </>
                ) : (
                  <>
                    <Laptop className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-blue-500">Web</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Permissions</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Motion and location permissions are required for accurate tracking
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center space-x-1 text-xs font-medium">
                {hasRequiredPermissions ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Granted</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-orange-500">Required</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Sensor Mode</p>
              </div>
              <div className="flex items-center space-x-1 text-xs font-medium">
                {isNative && hasRequiredPermissions ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Real Data</span>
                  </>
                ) : (
                  <>
                    <BadgeInfo className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-blue-500">Test Mode</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {!hasRequiredPermissions && (
            <div className="pt-2">
              <Button
                className="w-full"
                size="sm"
                variant="outline"
                onClick={onRequestPermissions}
              >
                <BadgeInfo className="mr-2 h-4 w-4" />
                Grant Permissions
              </Button>
            </div>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="info">
              <AccordionTrigger className="text-sm py-2">
                <span className="text-muted-foreground">Information</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    Fitness tracking uses your device's motion sensors to track steps and 
                    location data for distance calculation.
                  </p>
                  <p>
                    {isMobile 
                      ? 'You can start and stop tracking manually using the button below.' 
                      : 'For full tracking features, please use the mobile app.'}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorStatusCard;
