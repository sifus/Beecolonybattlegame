import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rush.beecolony',
  appName: 'Rush',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    backgroundColor: '#F09A18',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    orientation: 'landscape',
    allowsLinkPreview: false,
    scrollEnabled: false,
  },
  android: {
    orientation: 'landscape',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
