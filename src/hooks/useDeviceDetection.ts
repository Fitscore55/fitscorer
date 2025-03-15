
import { useState, useEffect } from 'react';
import * as Device from 'expo-device';

export const useDeviceDetection = () => {
  const [isNative, setIsNative] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'web'>('web');
  
  useEffect(() => {
    const checkDeviceType = async () => {
      try {
        const deviceTypeValue = await Device.getDeviceTypeAsync();
        const isMobileDevice = 
          deviceTypeValue === Device.DeviceType.PHONE || 
          deviceTypeValue === Device.DeviceType.TABLET;
        
        setIsNative(isMobileDevice);
        setDeviceType(isMobileDevice ? 'mobile' : 'web');
        
        console.log(`Running on ${isMobileDevice ? 'native mobile' : 'web'} platform`);
      } catch (error) {
        console.error('Error detecting device type:', error);
        setIsNative(false);
        setDeviceType('web');
      }
    };
    
    checkDeviceType();
  }, []);
  
  return {
    isNative,
    deviceType,
    isMobileDevice: async () => {
      try {
        const deviceTypeValue = await Device.getDeviceTypeAsync();
        return deviceTypeValue === Device.DeviceType.PHONE || 
               deviceTypeValue === Device.DeviceType.TABLET;
      } catch (error) {
        console.error('Error checking if device is mobile:', error);
        return false;
      }
    }
  };
};
