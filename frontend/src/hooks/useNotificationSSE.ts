import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { fetchUnreadCount } from '../api/notifications';
import { connectSSE, type SseConnection } from '../lib/sseClient';
import type { NotificationResponse } from '../types/notification';
import axiosInstance from '../api/axiosInstance';

const SSE_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications/subscribe`;

const INITIAL_DELAY = 1000;
const MAX_DELAY = 30_000;
const BACKOFF_MULTIPLIER = 2;

/**
 * 로그인 사용자일 때 SSE 연결을 자동으로 관리하는 훅.
 * App 루트 레벨에서 한 번만 호출.
 *
 * - 지수 백오프 재연결 (1s → 2s → 4s → ... → 30s)
 * - Last-Event-ID로 유실 이벤트 복구
 * - 401 시 토큰 갱신 후 재연결
 * - 탭 visibility 변경 시 재연결 + unreadCount 동기화
 * - MSW 모드에서는 SSE 비활성화 (REST API만 사용)
 */
export function useNotificationSSE() {
  const tokens = useAuthStore((s) => s.tokens);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const store = useNotificationStore;
  const connectionRef = useRef<SseConnection | null>(null);
  const delayRef = useRef(INITIAL_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      store.getState().clear();
      return;
    }

    // MSW 모드에서는 SSE 비활성화, unreadCount만 REST로 조회
    if (import.meta.env.VITE_MSW_ENABLED === 'true') {
      syncUnreadCount(accessToken);
      return;
    }

    isActiveRef.current = true;
    delayRef.current = INITIAL_DELAY;

    // 초기 unreadCount 동기화
    syncUnreadCount(accessToken);

    // SSE 연결
    connect(accessToken);

    // 탭 복귀 시 재연결 + 동기화
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isActiveRef.current) {
        syncUnreadCount(accessToken);
        if (!store.getState().isConnected) {
          connect(accessToken);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isActiveRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      connectionRef.current?.abort();
      connectionRef.current = null;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      store.getState().setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens?.accessToken]);

  function connect(accessToken: string) {
    connectionRef.current?.abort();

    const lastEventId = store.getState().lastEventId ?? undefined;

    connectionRef.current = connectSSE(
      SSE_URL,
      accessToken,
      (event) => {
        if (event.id) {
          store.getState().setLastEventId(event.id);
        }

        if (event.event === 'connect') {
          store.getState().setConnected(true);
          delayRef.current = INITIAL_DELAY;
          return;
        }

        if (event.event === 'notification') {
          try {
            const notification = JSON.parse(event.data) as NotificationResponse;
            store.getState().addNotification(notification);
            toast(notification.content, { duration: 4000 });
          } catch {
            // 파싱 실패 무시
          }
        }
      },
      (error) => {
        store.getState().setConnected(false);

        if (!isActiveRef.current) return;

        // 401 → 토큰 갱신 시도
        if (error.message === 'SSE_HTTP_401') {
          handleTokenRefresh(accessToken);
          return;
        }

        // 지수 백오프 재연결
        scheduleReconnect(accessToken);
      },
      lastEventId,
    );
  }

  async function handleTokenRefresh(_expiredToken: string) {
    try {
      const { data } = await axiosInstance.post('/auth/refresh');
      const newToken: string = data.accessToken;
      useAuthStore.getState().setTokens({ accessToken: newToken });
      // useEffect가 tokens 변경을 감지하여 재연결함
    } catch {
      clearAuth();
    }
  }

  function scheduleReconnect(accessToken: string) {
    if (!isActiveRef.current) return;

    reconnectTimerRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        connect(accessToken);
      }
    }, delayRef.current);

    delayRef.current = Math.min(delayRef.current * BACKOFF_MULTIPLIER, MAX_DELAY);
  }

  async function syncUnreadCount(_token: string) {
    try {
      const { count } = await fetchUnreadCount();
      store.getState().setUnreadCount(count);
    } catch {
      // 조회 실패 무시
    }
  }
}
