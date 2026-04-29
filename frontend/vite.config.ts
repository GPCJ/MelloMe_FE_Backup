import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import path from 'path';

// vite-prerender-plugin Issue #3 우회 — React 19 + react-dom/server 조합에서
// renderToString이 Node 이벤트 루프에 잔류 핸들을 남겨 vite build가 산출물
// 생성 후에도 exit 못함. Vercel CI는 npm 종료를 기다리다 45분 timeout으로
// 빌드 실패 처리. closeBundle은 모든 산출물 기록 + 다른 플러그인 cleanup이
// 끝난 뒤 호출되는 마지막 훅이라 여기서 process.exit(0)을 호출해도 데이터
// 손실 없음. apply: 'build' + enforce: 'post'로 dev 서버는 차단하고
// vitePrerenderPlugin의 closeBundle 다음에 실행되도록 강제.
// 참고: TanStack Router #6602, vite-prerender-plugin Issue #3
const forceExitAfterBuild = (): Plugin => ({
  name: 'force-exit-after-build',
  apply: 'build',
  enforce: 'post',
  closeBundle() {
    process.exit(0);
  },
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: path.resolve(__dirname, 'src/prerender.tsx'),
      additionalPrerenderRoutes: ['/privacy', '/terms'],
    }),
    forceExitAfterBuild(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // staging 백엔드 CORS 허용 origin이 localhost:3000 / www.melonnetherapists.com 둘뿐.
    // Vite 기본 5173은 staging에서 403 "Invalid CORS request"로 차단되므로 3000 고정.
    // strictPort: 3000 점유 시 조용히 다른 포트로 fallback 하지 않고 즉시 실패.
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
