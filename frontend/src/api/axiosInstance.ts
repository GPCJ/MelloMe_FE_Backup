import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/useAuthStore'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axiosInstance.post('/auth/refresh')
      const newAccessToken: string = data.accessToken

      const { user } = useAuthStore.getState()
      if (user) useAuthStore.getState().setAuth(user, null, { accessToken: newAccessToken })
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      processQueue(null, newAccessToken)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().clearAuth()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosInstance
