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

// Mock data generation for web environment
let mockDataInterval: number | null = null;

// Generate random increases in steps and distance
const generateMockData = () => {
  // Increase steps by 10-50 per update
  const stepIncrease = Math.floor(Math.random() * 40) + 10;
  stepsCount += stepIncrease;
  
  // Increase distance by 0.01-0.05 km per update
  const distanceIncrease = (Math.random() * 0.04) + 0.01;
  distanceKm += distanceIncrease;
  
  // Emit update event
  eventEmitter.emit('sensorUpdate', {
    steps: stepsCount,
    distance: distanceKm
  });
  
  console.log(`Mock sensor update: ${stepsCount} steps, ${distanceKm.toFixed(2)}km`);
};

const WebSensorSdk = {
  // Start recording sensor data
  async start(): Promise<{ value: boolean }> {
    try {
      // Reset counters
      stepsCount = 0;
      distanceKm = 0;
      
      // Start mock data generation
      if (mockDataInterval === null) {
        mockDataInterval = window.setInterval(generateMockData, 2000) as unknown as number;
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
      if (mockDataInterval !== null) {
        clearInterval(mockDataInterval);
        mockDataInterval = null;
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

export default WebSensorSdk;
