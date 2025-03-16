
import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
  const [isNative, setIsNative] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'web'>('web');
  
  useEffect(() => {
    // Simple check for mobile browsers
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      return mobileRegex.test(userAgent);
    };
    
    const isMobile = checkIfMobile();
    setIsNative(false); // We're always on web now
    setDeviceType(isMobile ? 'mobile' : 'web');
    
    console.log(`Running on ${isMobile ? 'mobile browser' : 'desktop browser'}`);
  }, []);
  
  return {
    isNative, // Always false for web
    deviceType,
    isMobileDevice: async () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      return mobileRegex.test(userAgent);
    }
  };
};
