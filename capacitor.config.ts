
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitscore.app',
  appName: 'fitscorer',
  webDir: 'dist',
  server: {
    url: 'https://05bd2449-b126-4395-abdc-c676c5259146.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Configure permission plugins with improved descriptions
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Geolocation: {
      plistAdditions: {
        NSLocationWhenInUseUsageDescription: "FitScorer needs your location to track distance and calculate calories burned during your fitness activities",
        NSLocationAlwaysUsageDescription: "FitScorer needs background location access to track your fitness activities even when the app is not open",
        NSLocationAlwaysAndWhenInUseUsageDescription: "FitScorer uses your location to track distance for more accurate fitness metrics"
      },
      permissions: {
        android: {
          alwaysPermission: [
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.ACCESS_BACKGROUND_LOCATION"
          ]
        }
      }
    },
    Motion: {
      plistAdditions: {
        NSMotionUsageDescription: "FitScorer uses motion data to count steps and track your physical activities accurately"
      },
      permissions: {
        android: {
          alwaysPermission: [
            "android.permission.ACTIVITY_RECOGNITION",
            "android.permission.BODY_SENSORS",
            "android.permission.HIGH_SAMPLING_RATE_SENSORS"
          ]
        }
      }
    },
    // Background mode settings for continuous tracking
    BackgroundMode: {
      enable: true,
      title: "FitScorer",
      text: "Tracking your fitness activities"
    },
    // Keep screen on while tracking
    KeepAwake: {
      enable: true
    },
    // Register our native sensor SDK plugin
    CapacitorSensorSdk: {
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
    targetSdkVersion: 33,
    // Add permissions to AndroidManifest.xml
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      "android.permission.ACTIVITY_RECOGNITION",
      "android.permission.BODY_SENSORS",
      "android.permission.HIGH_SAMPLING_RATE_SENSORS",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_LOCATION"
    ]
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
