'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { registerAgency } from '@/actions/auth'
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
      {pending ? 'جاري تسجيل الوكالة...' : 'إنشاء حساب الوكالة'}
    </button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAgency, null)

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-muted-bg to-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl hover:opacity-95 transition-opacity">
          <Landmark className="h-8 w-8 text-primary" />
          <span>منصة عمرة</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          تسجيل وكالة سياحية جديدة
        </h2>
        <p className="mt-2 text-center text-sm text-muted-text">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="font-medium text-secondary hover:text-secondary-hover transition-colors">
            سجل الدخول من هنا
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-card py-8 px-4 border border-card-border shadow-xl rounded-2xl sm:px-10">
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-900/30">
                <div className="flex gap-2 items-center text-red-700 dark:text-red-400">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold">{state.error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                  اسم الوكالة السياحية *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="مثال: وكالة الأمان للسياحة"
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-foreground">
                  رقم رخصة وزارة السياحة *
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  placeholder="مثال: 1654/2024"
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-foreground">
                  مقر الوكالة (الولاية) *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="مثال: الجزائر، وهران، قسنطينة"
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  البريد الإلكتروني للوكالة *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@agency.com"
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground">
                  رقم الهاتف للتواصل *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="مثال: 0550123456"
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-foreground">
                  رقم الواتساب الرئيسي للوكالة *
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  placeholder="مثال: 0550123456"
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                كلمة المرور (6 أحرف على الأقل) *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 appearance-none block w-full px-3 py-3 border border-card-border rounded-xl shadow-sm placeholder-muted-text/50 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary border-card-border rounded focus:ring-primary"
              />
              <label htmlFor="terms" className="mr-2 block text-xs text-muted-text">
                أوافق على الشروط والأحكام الخاصة بالمنصة ونظام العمولات والتسويات.
              </label>
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
