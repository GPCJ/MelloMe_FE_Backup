import axios from 'axios'
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

axiosInstance.interceptors.response.use((response) => {
  if (response.data && response.data.success === true && 'data' in response.data) {
    response.data = response.data.data
  }
  return response
})

export default axiosInstance
