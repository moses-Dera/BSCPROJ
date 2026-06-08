'use client'

import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { useTenantStore } from '@/store/useTenantStore'

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin()
  const { name, primaryColor, accentColor, logoUrl } = useTenantStore()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => login(data)

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
      >
        <div className="max-w-sm text-center">
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

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-bg)]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="h-14 w-14 rounded-xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {name?.[0] ?? 'U'}
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{name || 'UniClear'}</h2>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Sign in</h2>
          <p className="text-sm text-[var(--color-muted)] mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@university.edu"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              size="lg"
              loading={isPending}
              className="w-full mt-2"
              style={{ backgroundColor: primaryColor }}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
