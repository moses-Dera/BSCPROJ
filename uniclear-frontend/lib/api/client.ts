import axios from 'axios'

// All client requests go through the Next.js proxy at /api/v1/*
// The proxy extracts the httpOnly access_token cookie and forwards it as Bearer token to Express
export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

// Silent token refresh on 401
apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config

    // Network error — server unreachable
    if (!error.response) {
      return Promise.reject(new Error('Cannot reach server. Check your connection.'))
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return apiClient(original)
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }

    // Extract backend error message globally so UI components get friendly messages
    if (error.response?.data?.message) {
      error.message = error.response.data.message
    } else if (error.response?.status === 500) {
      error.message = 'An unexpected server error occurred. Please try again later.'
    }

    return Promise.reject(error)
  }
)
