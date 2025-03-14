
import { registerPlugin } from '@capacitor/core';

// Define plugin interface
export interface CapacitorSensorSdkPlugin {
  start(): Promise<{ value: boolean }>;
  stop(): Promise<{ value: boolean }>;
  isRecording(): Promise<{ value: boolean }>;
  getSteps(): Promise<{ value: number }>;
  getDistance(): Promise<{ value: number }>;
  addListener(
    eventName: string,
    listenerFunc: (data: any) => void
  ): Promise<{ value: string }>;
  removeAllListeners(): Promise<void>;
}

// Register the plugin
const CapacitorSensorSdk = registerPlugin<CapacitorSensorSdkPlugin>('CapacitorSensorSdk');

export default CapacitorSensorSdk;

// Export App plugin for settings access
export { App } from '@capacitor/app';
