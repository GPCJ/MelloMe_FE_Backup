import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mellti.app',
  appName: 'Mellti',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      // initNative가 SplashScreen.hide()를 부르면 즉시 숨김. 혹시 못 부르는 경우(JS 에러 등)에도
      // 2초 뒤 자동으로 숨겨 스플래시가 영구히 박히는 사태를 방지(백업 안전장치).
      launchShowDuration: 2000,
      launchAutoHide: true,
    },
  },
};

export default config;
