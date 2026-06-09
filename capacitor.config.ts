import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sparta.app',
  appName: 'Sparta',
  webDir: 'dist',
  plugins: {
    SocialLogin: {
      google: {
        // Even if the bridge is failing, keep this here for the JS side
        clientId: '1067794861975-4ucb81a5u3gggc4paleb3rgmp3uua73g.apps.googleusercontent.com'
      }
    }
  }
};

export default config;
