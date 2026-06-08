import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:5000'

export async function serverFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const res = await fetch(`${API_URL}/api/v1${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: 'no-store',
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Request failed')
  return json.data as T
}
