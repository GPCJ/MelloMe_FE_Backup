import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// MSW를 App보다 먼저 켜야 초기 API 요청을 가로챌 수 있어서
// async 함수로 감싸 순서를 보장한 뒤 React 앱을 렌더링함
const bootstrap = async () => {
  // MSW ON / OFF (true = OFF, false = ON)
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === 'false') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

void bootstrap();
