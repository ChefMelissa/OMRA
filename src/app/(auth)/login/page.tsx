'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/actions/auth'
import Link from 'next/link'
import { Landmark, ArrowRight, ShieldAlert } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors duration-200"
    >
      {pending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, null)

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-muted-bg to-background">
      <div className="sm:mx-auto sm:w-full sm:max-allowed sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl hover:opacity-95 transition-opacity">
          <Landmark className="h-8 w-8 text-primary" />
          <span>منصة عمرة</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          تسجيل الدخول لوكالتك
        </h2>
        <p className="mt-2 text-center text-sm text-muted-text">
          أو{' '}
          <Link href="/register" className="font-medium text-secondary hover:text-secondary-hover transition-colors">
            قم بتسجيل وكالة جديدة الآن
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 border border-card-border shadow-xl rounded-2xl sm:px-10">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-900/30">
                <div className="flex gap-2 items-center text-red-700 dark:text-red-400">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold">{state.error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                البريد الإلكتروني للوكالة
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@agency.com"
                  className="appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                كلمة المرور
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-hover transition-colors">
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            <div>
              <SubmitButton />
            </div>
          </form>

          <div className="mt-6 border-t border-card-border pt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-text hover:text-foreground transition-colors">
              <ArrowRight className="h-4 w-4" />
              <span>العودة للصفحة الرئيسية للمواطنين</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
