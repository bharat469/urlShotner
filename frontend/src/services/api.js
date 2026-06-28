import axios from 'axios'
import { getToken, refreshAccessToken, logout } from './auth'

const BASE_URL = 'http://localhost:4000'
const api = axios.create({ baseURL: `${BASE_URL}/api/urlShot` })

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
      logout()
    }
    return Promise.reject(error)
  },
)

export default api
