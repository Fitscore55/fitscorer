
// Helper function to calculate steps from accelerometer data 
export const calculateStepsFromAccel = (accelData: any, previousData: any): number => {
  if (!accelData || !accelData.acceleration) return 0;
  
  // Calculate magnitude of acceleration
  const { x, y, z } = accelData.acceleration;
  const magnitude = Math.sqrt(x*x + y*y + z*z);
  
  // Step detection thresholds
  const threshold = 1.2;
  const minThreshold = 0.8;
  
  if (previousData && magnitude > threshold && previousData.magnitude < minThreshold) {
    // Check time between potential steps
    const now = Date.now();
    const prevTime = previousData.timestamp || now;
    const timeDiff = now - prevTime;
    
    // Ignore steps detected too rapidly (less than 250ms apart)
    if (timeDiff < 250) {
      return 0;
    }
    
    return 1; // Valid step detected
  }
  
  return 0;
};

// Helper function to calculate distance from GPS positions
export const calculateDistance = (position: any, lastPosition: any): number => {
  if (!position || !lastPosition || 
      !position.coords || !lastPosition.coords || 
      !position.coords.latitude || !lastPosition.coords.latitude) {
    return 0;
  }
  
  // Haversine formula to calculate distance between GPS coordinates
  const R = 6371; // Earth radius in kilometers
  const dLat = (position.coords.latitude - lastPosition.coords.latitude) * (Math.PI / 180);
  const dLon = (position.coords.longitude - lastPosition.coords.longitude) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lastPosition.coords.latitude * (Math.PI / 180)) * 
    Math.cos(position.coords.latitude * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  // Filter out GPS errors
  if (distance > 0.1) { // More than 100 meters in one update
    console.log('Distance jump detected, ignoring:', distance);
    return 0;
  }
  
  return distance;
};

// Calculate fitscore based on steps and distance
export const calculateFitscore = (steps: number, distance: number): number => {
  return Math.round(steps / 20 + distance * 100);
};

// Calculate calories based on steps
export const calculateCalories = (steps: number): number => {
  return Math.round(steps * 0.04);
};
