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
        NSLocationWhenInUseUsageDescription: "We need your location to track your fitness activities and calculate distance",
        NSLocationAlwaysUsageDescription: "We need your location to track your fitness activities in the background for accurate step and distance tracking",
        NSLocationAlwaysAndWhenInUseUsageDescription: "We need your location to track your fitness activities whether the app is in use or in the background"
      },
      permissions: {
        android: [
          "android.permission.ACCESS_COARSE_LOCATION",
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.ACCESS_BACKGROUND_LOCATION"
        ]
      }
    },
    Motion: {
      plistAdditions: {
        NSMotionUsageDescription: "We need motion data to count your steps and track physical activities"
      },
      permissions: {
        android: [
          "android.permission.ACTIVITY_RECOGNITION",
          "android.permission.BODY_SENSORS"
        ]
      }
    },
    // Background mode settings
    BackgroundMode: {
      enable: true,
      title: "FitScorer",
      text: "Tracking your fitness activities in background"
    },
    // Keep screen on while tracking
    KeepAwake: {
      enable: true
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#ffffff",
    buildOptions: {
      keystorePath: null,
      keystorePassword: null,
      keystoreAlias: null,
      keystoreAliasPassword: null,
      releaseType: null
    },
    minSdkVersion: 22,
    targetSdkVersion: 32
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#ffffff",
    preferredContentMode: "mobile",
    scheme: "fitscorer",
    deploymentTarget: "13.0"
  }
};

export default config;
