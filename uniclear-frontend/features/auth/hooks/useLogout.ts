'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/useAuthStore'
import { ROUTES } from '@/lib/constants'

export function useLogout() {
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout()
      queryClient.clear()
      router.push(ROUTES.login)
    },
  })
}
