import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from 'sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// MSW를 App보다 먼저 켜야 초기 API 요청을 가로챌 수 있어서
// async 함수로 감싸 순서를 보장한 뒤 React 앱을 렌더링함
const bootstrap = async () => {
  // VITE_MSW_ENABLED=true → MSW ON / false → MSW OFF
  if (import.meta.env.VITE_MSW_ENABLED === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster position="top-center" richColors visibleToasts={1} />
      </QueryClientProvider>
    </StrictMode>,
  );
};

void bootstrap();
