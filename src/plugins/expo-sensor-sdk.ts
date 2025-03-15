
import { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { EventEmitter } from 'events';

// Define the interface to match our existing application expectations
export interface ExpoSensorSdkPlugin {
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

class ExpoSensorSdk implements ExpoSensorSdkPlugin {
  private isActive = false;
  private steps = 0;
  private distance = 0;
  private eventEmitter = new EventEmitter();
  private accelerometerSubscription: { remove: () => void } | null = null;
  private locationSubscription: { remove: () => void } | null = null;
  private pedometerSubscription: { remove: () => void } | null = null;
  private startTime: number | null = null;

  constructor() {
    console.log('ExpoSensorSdk initialized');
    // Set max listeners to avoid memory leak warnings
    this.eventEmitter.setMaxListeners(20);
  }

  async start(): Promise<{ value: boolean }> {
    try {
      console.log('Starting Expo sensor recording...');
      
      // Request permissions first
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: motionStatus } = await Pedometer.requestPermissionsAsync();
      
      if (locationStatus !== 'granted' || motionStatus !== 'granted') {
        console.error('Permissions not granted', { locationStatus, motionStatus });
        return { value: false };
      }
      
      // Start tracking steps with Pedometer
      if (await Pedometer.isAvailableAsync()) {
        this.pedometerSubscription = Pedometer.watchStepCount(result => {
          this.steps = result.steps;
          this.eventEmitter.emit('stepUpdate', { steps: this.steps });
        });
      } else {
        console.warn('Pedometer is not available on this device');
      }
      
      // Start tracking location
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        location => {
          // Calculate distance based on location changes
          // This is simplified; in a real app you'd track path and calculate distance
          this.distance += 0.1;  // Simulated distance increase
          this.eventEmitter.emit('locationUpdate', { 
            location: location.coords,
            distance: this.distance
          });
        }
      );
      
      // Set up accelerometer for activity detection
      Accelerometer.setUpdateInterval(1000);
      this.accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
        this.eventEmitter.emit('accelerometerUpdate', accelerometerData);
      });
      
      this.isActive = true;
      this.startTime = Date.now();
      
      // Emit status update
      this.eventEmitter.emit('statusUpdate', { isRecording: true });
      
      return { value: true };
    } catch (error) {
      console.error('Failed to start sensors:', error);
      return { value: false };
    }
  }

  async stop(): Promise<{ value: boolean }> {
    try {
      console.log('Stopping Expo sensor recording...');
      
      // Unsubscribe from all sensors
      if (this.accelerometerSubscription) {
        this.accelerometerSubscription.remove();
        this.accelerometerSubscription = null;
      }
      
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
      
      if (this.pedometerSubscription) {
        this.pedometerSubscription.remove();
        this.pedometerSubscription = null;
      }
      
      this.isActive = false;
      this.startTime = null;
      
      // Emit status update
      this.eventEmitter.emit('statusUpdate', { isRecording: false });
      
      return { value: true };
    } catch (error) {
      console.error('Failed to stop sensors:', error);
      return { value: false };
    }
  }

  async isRecording(): Promise<{ value: boolean }> {
    return { value: this.isActive };
  }

  async getSteps(): Promise<{ value: number }> {
    return { value: this.steps };
  }

  async getDistance(): Promise<{ value: number }> {
    return { value: parseFloat(this.distance.toFixed(2)) };
  }

  async addListener(
    eventName: string,
    listenerFunc: (data: any) => void
  ): Promise<{ value: string }> {
    this.eventEmitter.addListener(eventName, listenerFunc);
    return { value: `Listener added for ${eventName}` };
  }

  async removeAllListeners(): Promise<void> {
    this.eventEmitter.removeAllListeners();
  }

  // Helper method to check if device is mobile
  static async isMobileDevice(): Promise<boolean> {
    const deviceType = await Device.getDeviceTypeAsync();
    return deviceType === Device.DeviceType.PHONE || deviceType === Device.DeviceType.TABLET;
  }
}

// Create and export the singleton instance
const expoSensorSdk = new ExpoSensorSdk();
export default expoSensorSdk;
