'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/useAuthStore'
import { ROUTES } from '@/lib/constants'

export function useLogin() {
  const router = useRouter()
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),

    onSuccess: (response) => {
      setUser(response.data.data)
      toast.success('Logged in successfully')

      const user = response.data.data
      if (user.role === 'PLATFORM_OWNER') {
        router.push(ROUTES.platform.dashboard)
      } else if (user.role === 'STUDENT') {
        router.push(ROUTES.student.dashboard)
      } else if (user.role === 'OFFICER') {
        router.push(ROUTES.officer.dashboard)
      } else {
        router.push(ROUTES.admin.dashboard)
      }
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Login failed')
    },
  })
}
