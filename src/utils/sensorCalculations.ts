
// Helper function to calculate steps from accelerometer data with improved sensitivity
export const calculateStepsFromAccel = (accelData: any, previousData: any): number => {
  if (!accelData || !accelData.acceleration) return 0;
  
  // Enhanced algorithm for step detection
  const { x, y, z } = accelData.acceleration;
  const magnitude = Math.sqrt(x*x + y*y + z*z);
  
  // Check if we have a significant movement
  const threshold = 1.2; // Adjusted threshold for better accuracy
  const minThreshold = 0.8; // Minimum threshold for step detection
  
  if (previousData && magnitude > threshold && previousData.magnitude < minThreshold) {
    // Detected a potential step
    
    // Calculate time difference for better accuracy
    const now = Date.now();
    const prevTime = previousData.timestamp || now;
    const timeDiff = now - prevTime;
    
    // Ignore if steps are detected too rapidly (less than 250ms apart)
    // Human walking typically has steps at least 300-500ms apart
    if (timeDiff < 250) {
      return 0;
    }
    
    // Consider this a valid step
    return 1;
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
  
  // Improved haversine formula to calculate distance between GPS coordinates
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
  
  // Filter out GPS errors that cause jumps - more conservative filter
  if (distance > 0.1) { // More than 100 meters in one update (reduced from 200m)
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
