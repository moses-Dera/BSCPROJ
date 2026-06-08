import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends httpOnly cookies automatically
})

// Silent token refresh on 401
apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return apiClient(original)
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
