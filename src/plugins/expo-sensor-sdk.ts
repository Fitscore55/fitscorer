import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { EventEmitter } from 'events';

// Create an event emitter for sensor updates
const eventEmitter = new EventEmitter();

// Interface for sensor data
interface SensorData {
  steps: number;
  distance: number;
}

// Keep track of subscribers and recording state
let isRecordingActive = false;
let stepsCount = 0;
let distanceKm = 0;
let pedometerSubscription: any = null;
let locationSubscription: any = null;
let lastLocation: Location.LocationObject | null = null;

// Calculate distance between two coordinates in kilometers
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

const ExpoSensorSdk = {
  // Start recording sensor data
  async start(): Promise<{ value: boolean }> {
    try {
      // Reset counters
      stepsCount = 0;
      distanceKm = 0;
      lastLocation = null;
      
      // Start pedometer if available
      const isPedometerAvailable = await Pedometer.isAvailableAsync();
      if (isPedometerAvailable) {
        pedometerSubscription = Pedometer.watchStepCount(result => {
          stepsCount = result.steps;
          
          // Emit update event
          eventEmitter.emit('sensorUpdate', {
            steps: stepsCount,
            distance: distanceKm
          });
        });
      }
      
      // Start location tracking
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 10, // Update every 10 meters
          },
          (location) => {
            // If we have a previous location, calculate distance
            if (lastLocation) {
              const newDistance = calculateDistance(
                lastLocation.coords.latitude,
                lastLocation.coords.longitude,
                location.coords.latitude,
                location.coords.longitude
              );
              
              // Add to total distance (km)
              distanceKm += newDistance;
              
              // Emit update event
              eventEmitter.emit('sensorUpdate', {
                steps: stepsCount,
                distance: distanceKm
              });
            }
            
            lastLocation = location;
          }
        );
      }
      
      isRecordingActive = true;
      return { value: true };
    } catch (error) {
      console.error('Error starting sensor recording:', error);
      return { value: false };
    }
  },
  
  // Stop recording sensor data
  async stop(): Promise<{ value: boolean }> {
    try {
      if (pedometerSubscription) {
        pedometerSubscription.remove();
        pedometerSubscription = null;
      }
      
      if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
      }
      
      isRecordingActive = false;
      return { value: true };
    } catch (error) {
      console.error('Error stopping sensor recording:', error);
      return { value: false };
    }
  },
  
  // Check if recording is active
  async isRecording(): Promise<{ value: boolean }> {
    return { value: isRecordingActive };
  },
  
  // Get current step count
  async getSteps(): Promise<{ value: number }> {
    return { value: stepsCount };
  },
  
  // Get current distance in kilometers
  async getDistance(): Promise<{ value: number }> {
    return { value: distanceKm };
  },
  
  // Add a listener for sensor updates
  async addListener(
    eventName: string, 
    callback: (data: SensorData) => void
  ): Promise<{ value: string }> {
    const id = Math.random().toString(36).substring(2, 15);
    eventEmitter.on(eventName, callback);
    return { value: id };
  },
  
  // Remove all listeners
  async removeAllListeners(): Promise<void> {
    eventEmitter.removeAllListeners();
  }
};

export default ExpoSensorSdk;
