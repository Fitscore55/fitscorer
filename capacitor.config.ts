
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.05bd2449b1264395abdcc676c5259146',
  appName: 'fitscorer',
  webDir: 'dist',
  server: {
    url: 'https://05bd2449-b126-4395-abdc-c676c5259146.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Configure permission plugins
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Geolocation: {
      plistAdditions: {
        NSLocationWhenInUseUsageDescription: "We need your location to track your fitness activities",
        NSLocationAlwaysUsageDescription: "We need your location to track your fitness activities in the background"
      }
    },
    Motion: {
      plistAdditions: {
        NSMotionUsageDescription: "We need motion data to count your steps and track activities"
      }
    }
  }
};

export default config;
