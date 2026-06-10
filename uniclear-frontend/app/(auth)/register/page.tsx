'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/useAuthStore'
import { useTenantStore } from '@/store/useTenantStore'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

const registerSchema = z.object({
  jambRegNo: z.string().min(1, 'JAMB Reg No is required'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { setAuth } = useAuthStore()

  // Read from CSS variables set server-side
  const name         = useTenantStore(s => s.name)
  const slug         = useTenantStore(s => s.slug)
  const logoUrl      = useTenantStore(s => s.logoUrl)
  const primaryColor = 'var(--color-primary)'
  const accentColor  = 'var(--color-accent)'

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const { mutate: registerAccount, isPending } = useMutation({
    mutationFn: (d: RegisterForm) => authApi.register(slug!, d.jambRegNo, d.email, d.password),
    onSuccess: (res) => {
      const data = res.data.data
      setAuth(res.data.data as any)
      qc.setQueryData(['officer', 'me'], res.data.data)
      toast.success('Registration successful')
      router.push(ROUTES.student.dashboard)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  })

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative overflow-hidden login-bg-panel"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
        }}
      >
        <div className="absolute inset-0 login-bg-image" />
        <div className="absolute inset-0 login-bg-overlay" />
        <div className="max-w-sm text-center relative z-10">
          {logoUrl
            ? <Image src={logoUrl} alt={name ?? ''} width={80} height={80} className="rounded-xl mx-auto mb-6 object-cover" />
            : (
              <div className="h-20 w-20 rounded-xl bg-white/20 mx-auto mb-6 flex items-center justify-center text-3xl font-bold">
                {name?.[0] ?? 'U'}
              </div>
            )
          }
          <h1 className="text-3xl font-bold mb-3">{name || 'UniClear'}</h1>
          <p className="text-white/80 text-base leading-relaxed">
            University Clearance Management Portal.<br />
            Fast, transparent, and paperless.
          </p>
        </div>
      </div>

      {/* Right — register form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-bg)]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div
              className="h-14 w-14 rounded-xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {name?.[0] ?? 'U'}
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{name || 'UniClear'}</h2>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Claim your admission</h2>
          <p className="text-sm text-[var(--color-muted)] mb-8">Enter your JAMB Reg No to verify your admission</p>

          <form onSubmit={handleSubmit(d => registerAccount(d))} className="space-y-4">
            <Input label="JAMB Registration No" placeholder="e.g. 12345678AB" error={errors.jambRegNo?.message} {...register('jambRegNo')} />
            <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Create Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            
            <Button type="submit" size="lg" loading={isPending} className="w-full mt-2" style={{ backgroundColor: primaryColor }}>
              Verify & Register
            </Button>
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-[var(--color-muted)]">Already claimed your account?</p>
              <Link href="/login" className="text-xs text-[var(--color-primary)] hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
