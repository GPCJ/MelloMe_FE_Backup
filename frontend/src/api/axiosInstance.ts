import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import type { RefreshResponse } from '../types/auth';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData 전송 시 Content-Type 삭제 → 브라우저가 multipart boundary 자동 설정
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const isAuthRequest =
      originalRequest.url?.startsWith('/auth/login') ||
      originalRequest.url?.startsWith('/auth/signup');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRequest) {
      // 4xx/5xx 또는 네트워크 에러 공통 로깅. 401 자동 갱신 케이스는 위 조건에서 빠져 여기 안 옴.
      if (error.response) {
        const data = error.response.data as
          | { code?: string; message?: string; fieldErrors?: unknown }
          | undefined;
        console.error('[api-error]', {
          status: error.response.status,
          method: originalRequest.method?.toUpperCase(),
          url: originalRequest.url,
          code: data?.code,
          message: data?.message,
          fieldErrors: data?.fieldErrors,
        });
      } else {
        console.error('[api-error] network/no-response', {
          method: originalRequest.method?.toUpperCase(),
          url: originalRequest.url,
          message: error.message,
        });
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // _retry: true를 붙여서 refresh 요청의 401이 다시 토큰 갱신 로직을 타지 않도록 함.
      // 없으면 refresh 401 → isRefreshing 중이라 failedQueue 진입 → processQueue 호출 불가 → 데드락.
      // TODO: 리팩토링 시 refresh 전용 axios 인스턴스 분리로 대체 (관심사 분리)
      const { data } = await axiosInstance.post<RefreshResponse>('/auth/refresh', null, {
        _retry: true,
      } as any);
      const newAccessToken: string = data.accessToken;

      useAuthStore.getState().setTokens({ accessToken: newAccessToken });
      // profileImageUrl은 presigned URL (TTL ~1h). refresh 응답에 user가 포함되어 있으므로
      // store를 갱신해 URL 만료 방지 (MEL-45).
      useAuthStore.getState().setUser(data.user);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
