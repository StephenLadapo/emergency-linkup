import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.956b9256554f442eba4010015872a126',
  appName: 'emergency-linkup',
  webDir: 'dist',
  server: {
    url: 'https://956b9256-554f-442e-ba40-10015872a126.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#f59e0b',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#f59e0b'
    }
  }
};

export default config;