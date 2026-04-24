import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rush.beecolony',
  appName: 'Rush',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#F09A18',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    orientation: 'landscape',
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
