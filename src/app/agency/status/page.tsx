import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Landmark, Clock, AlertTriangle, ShieldX, LogOut, LayoutDashboard } from 'lucide-react'
import { logout } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export default async function AgencyStatusPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!agency) {
    redirect('/register')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-muted-bg to-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 text-primary font-bold text-2xl mb-6">
          <Landmark className="h-8 w-8 text-primary" />
          <span>منصة عمرة</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 border border-card-border shadow-xl rounded-2xl sm:px-10 text-center">
          {agency.status === 'pending' && (
            <div className="space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500">
                <Clock className="h-10 w-10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">حسابك قيد المراجعة والتدقيق</h2>
                <p className="text-sm text-muted-text">
                  مرحباً بك، وكالة <span className="font-semibold text-foreground">{agency.name}</span>. 
                  نقوم حالياً بمراجعة رخصة السياحة والبيانات المدخلة للتحقق من صحتها.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted-bg border border-card-border text-xs text-muted-text leading-relaxed">
                يستغرق هذا الإجراء عادةً أقل من 24 ساعة. ستتمكن من نشر عروضك وبرامجك فور تفعيل الحساب وتحديد نسبة عمولتك.
              </div>
            </div>
          )}

          {agency.status === 'rejected' && (
            <div className="space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">تم رفض تفعيل الحساب</h2>
                <p className="text-sm text-muted-text">
                  نأسف لإبلاغك، وكالة <span className="font-semibold text-foreground">{agency.name}</span> بأن طلب تفعيل حسابك قد تم رفضه من قبل إدارة المنصة.
                </p>
              </div>
              {agency.rejection_reason && (
                <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-sm text-red-700 dark:text-red-400 text-right">
                  <span className="font-bold block mb-1">سبب الرفض:</span>
                  {agency.rejection_reason}
                </div>
              )}
              <div className="text-xs text-muted-text leading-relaxed">
                يرجى التواصل مع الدعم الفني أو إعداد حسابك ببيانات ورخصة مطابقة لإعادة تقديم الطلب.
              </div>
            </div>
          )}

          {agency.status === 'suspended' && (
            <div className="space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500">
                <ShieldX className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">حساب الوكالة موقوف مؤقتاً</h2>
                <p className="text-sm text-muted-text">
                  حساب وكالة <span className="font-semibold text-foreground">{agency.name}</span> معطل حالياً من قبل الإدارة.
                </p>
              </div>
              {agency.rejection_reason && (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 text-sm text-amber-700 dark:text-amber-400 text-right">
                  <span className="font-bold block mb-1">السبب:</span>
                  {agency.rejection_reason}
                </div>
              )}
              <div className="text-xs text-muted-text">
                قد يكون هذا الإجراء بسبب مستحقات تسوية العمولات المعلقة. يرجى مراجعة الإدارة لحل الإشكال.
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-card-border flex flex-col sm:flex-row gap-3">
            <form action={logout} className="flex-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-card-border rounded-xl text-sm font-semibold text-muted-text hover:text-foreground hover:bg-muted-bg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </button>
            </form>

            <Link href="/" className="flex-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-all duration-200 text-center">
              <span>تصفح الموقع</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
