import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * 네이티브(Capacitor) 환경 전용 초기화.
 * 웹 브라우저에는 이 플러그인들의 네이티브 구현이 없으므로 isNativePlatform 가드로 전부 건너뜀
 * (가드 없이 호출하면 웹에서 unimplemented 에러).
 */
export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
      return;
    }
    App.exitApp();
  });

  try {
    // 상단 안전영역 처리: OS가 상태바 높이만큼 공간을 비우고 WebView를 그 밑부터 그리게 함.
    // → 헤더가 노치/상태바에 가려지지 않음. 그래서 상단은 CSS env(safe-area-inset-top)가 불필요.
    await StatusBar.setOverlaysWebView({ overlay: false });
    // Style.Light = "밝은 배경 기준 → 글자/아이콘은 어둡게". 흰 상태바 배경에 맞춘 값.
    await StatusBar.setStyle({ style: Style.Light });
    // 상태바 배경색 지정은 Android 전용(iOS는 미지원). 플랫폼 분기로 의도를 명시.
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch (err) {
    // 플러그인 호출 실패가 앱 부팅을 막지 않도록 삼키되, 원인은 콘솔에 노출(폴백이 문제를 가리지 않게).
    console.warn('[native] StatusBar init 실패', err);
  }

  // 스플래시는 React 마운트가 끝난 뒤 숨김(흰 화면 깜빡임 최소화). config의 launchAutoHide가 백업.
  try {
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[native] SplashScreen.hide 실패', err);
  }
}
