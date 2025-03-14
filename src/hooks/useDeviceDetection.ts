
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useDeviceDetection = () => {
  const [isNative, setIsNative] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'web'>('web');
  
  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);
    setDeviceType(isNativePlatform ? 'mobile' : 'web');
    
    console.log(`Running on ${isNativePlatform ? 'native mobile' : 'web'} platform`);
  }, []);
  
  return {
    isNative,
    deviceType,
    isMobileDevice: () => Capacitor.isNativePlatform()
  };
};
