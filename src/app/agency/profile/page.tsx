'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateAgencyProfile } from '@/actions/auth'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Landmark, ShieldCheck, CheckCircle2, ShieldAlert } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200"
    >
      {pending ? 'جاري حفظ التعديلات...' : 'حفظ التغييرات'}
    </button>
  )
}

export default function AgencyProfilePage() {
  const [state, formAction] = useFormState(updateAgencyProfile, null)
  const [agencyData, setAgencyData] = useState<any>(null)
  const [logoInput, setLogoInput] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadAgency() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setAgencyData(data)
          setLogoInput(data.logo_url || '')
        }
      }
    }
    loadAgency()
  }, [])

  if (!agencyData) {
    return (
      <div className="p-8 text-center text-sm text-muted-text">
        جاري تحميل بيانات الملف الشخصي للوكالة...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">بيانات الوكالة السياحية</h1>
        <p className="text-sm text-muted-text mt-1">عرض وتحديث معلومات الترخيص والاتصال والشعار الخاص بالوكالة.</p>
      </div>

      <div className="bg-card border border-card-border rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-900/30">
              <div className="flex gap-2 items-center text-red-700 dark:text-red-400">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <p className="text-sm font-semibold">{state.error}</p>
              </div>
            </div>
          )}

          {state?.success && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-200 dark:border-emerald-900/30">
              <div className="flex gap-2 items-center text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="text-sm font-semibold">{state.success}</p>
              </div>
            </div>
          )}

          {/* Logo and Licence Badge info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-muted-bg/50 border border-card-border">
            {logoInput ? (
              <img 
                src={logoInput} 
                alt="شعار الوكالة" 
                className="h-20 w-20 rounded-2xl object-cover border border-card-border bg-card"
                onError={() => setLogoInput('')} // fallback if invalid url
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-primary-light flex items-center justify-center font-black text-primary text-xl">
                {agencyData.name.substring(0, 2)}
              </div>
            )}
            <div className="text-center sm:text-right space-y-1">
              <h3 className="font-extrabold text-md text-foreground">{agencyData.name}</h3>
              <p className="text-xs text-muted-text">رقم الرخصة: {agencyData.license_number}</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span>حساب معتمد وعمولتك المتفق عليها: {agencyData.commission_rate}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-1">
                اسم الوكالة السياحية *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={agencyData.name}
                className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-foreground mb-1">
                الولاية / المقر الرئيسي *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                defaultValue={agencyData.city}
                className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-1">
                رقم الهاتف للتواصل *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={agencyData.phone}
                className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-semibold text-foreground mb-1">
                رقم الواتساب الرئيسي *
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                required
                defaultValue={agencyData.whatsapp}
                className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-semibold text-foreground mb-1">
              رابط شعار الوكالة (URL لوغو)
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoInput}
              onChange={(e) => setLogoInput(e.target.value)}
              className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary text-left"
              dir="ltr"
            />
            <p className="mt-1.5 text-xs text-muted-text">
              يمكنك رفع شعارك على أي موقع رفع صور ووضع الرابط المباشر هنا ليظهر على برامجك المعروضة.
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-1">
              وصف ونبذة عن الوكالة (اختياري)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={agencyData.description || ''}
              placeholder="اكتب نبذة تعريفية بالوكالة وتاريخ تأسيسها والمميزات التي تقدمونها للزبائن..."
              className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="border-t border-card-border pt-6 flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
