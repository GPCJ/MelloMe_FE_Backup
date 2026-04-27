import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// 진단용 임시 비활성화 — Vercel 빌드 finalize hang 가설 2 검증 (prerender 산출물 원인 여부)
// import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // vitePrerenderPlugin({
    //   renderTarget: '#root',
    //   prerenderScript: path.resolve(__dirname, 'src/prerender.tsx'),
    //   additionalPrerenderRoutes: ['/privacy', '/terms'],
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
