import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Inbox, CalendarRange, CheckCircle2, DollarSign, 
  ArrowLeft, Plus, UserCheck, MessageSquare, Phone
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AgencyDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Fetch Stats
  const { count: programsCount } = await supabase
    .from('programs')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', user.id)

  const { data: bookings } = await supabase
    .from('booking_requests')
    .select('status, booking_value')
    .eq('agency_id', user.id)

  const totalBookingsCount = bookings?.length || 0
  const confirmedBookingsCount = bookings?.filter(b => b.status === 'booked').length || 0

  // 2. Fetch Unpaid Commissions
  const { data: settlements } = await supabase
    .from('commission_settlements')
    .select('total_commission')
    .eq('agency_id', user.id)
    .eq('status', 'unpaid')

  const unpaidCommissionSum = settlements?.reduce((sum, s) => sum + Number(s.total_commission), 0) || 0

  // 3. Fetch Recent Bookings
  const { data: recentBookings } = await supabase
    .from('booking_requests')
    .select(`
      id,
      reference_number,
      customer_name,
      customer_phone,
      is_whatsapp,
      room_type,
      status,
      created_at,
      programs (
        title
      )
    `)
    .eq('agency_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">نظرة عامة على الوكالة</h1>
          <p className="text-sm text-muted-text mt-1">تتبع أداء برامجك، الطلبات الواردة، والعمولات المستحقة.</p>
        </div>
        <Link href="/agency/programs?add=true" className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 px-4 rounded-xl border border-transparent shadow transition-all duration-200 text-center justify-center">
          <Plus className="h-4.5 w-4.5" />
          <span>إضافة برنامج عمرة</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">إجمالي البرامج</p>
            <p className="text-2xl font-black text-foreground">{programsCount || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-500 flex items-center justify-center">
            <CalendarRange className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">طلبات الحجز الواردة</p>
            <p className="text-2xl font-black text-foreground">{totalBookingsCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 flex items-center justify-center">
            <Inbox className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">حجوزات تم تأكيدها</p>
            <p className="text-2xl font-black text-foreground">{confirmedBookingsCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">عمولات معلقة غير مدفوعة</p>
            <p className="text-2xl font-black text-secondary">{unpaidCommissionSum.toLocaleString()} دج</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Bookings & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings List */}
        <div className="bg-card border border-card-border rounded-2xl shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-card-border flex justify-between items-center bg-muted-bg/10">
            <h2 className="font-bold text-md text-foreground">أحدث طلبات الحجز المستلمة</h2>
            <Link href="/agency/bookings" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <span>عرض الكل</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-card-border">
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.map((b) => (
                <div key={b.id} className="p-5 hover:bg-muted-bg/10 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{b.customer_name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted-bg border border-card-border text-muted-text">
                        {b.reference_number}
                      </span>
                    </div>
                    <p className="text-xs text-muted-text">
                      البرنامج: <span className="font-medium text-foreground">{(b.programs as any)?.title || 'برنامج محذوف'}</span> • غرفة {b.room_type}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <a href={`tel:${b.customer_phone}`} className="flex items-center gap-1 text-primary hover:underline">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{b.customer_phone}</span>
                      </a>
                      {b.is_whatsapp && (
                        <a 
                          href={`https://wa.me/${b.customer_phone.replace(/^0/, '213')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-emerald-600 hover:underline"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>واتساب مفعل</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-[11px] text-muted-text">
                      {new Date(b.created_at).toLocaleDateString('ar-DZ')}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      b.status === 'new' 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' 
                        : b.status === 'contacted'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          : b.status === 'booked'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {b.status === 'new' && 'طلب جديد'}
                      {b.status === 'contacted' && 'تم التواصل'}
                      {b.status === 'booked' && 'تم الحجز'}
                      {b.status === 'cancelled' && 'لم يكتمل'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-text">
                لا توجد طلبات حجز حالياً. سيظهر المعتمرون هنا فور ضغطهم على "اطلب الحجز".
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Help / Info inside Dashboard */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1">
            <UserCheck className="h-4.5 w-4.5 text-primary" />
            <span>نصائح تأكيد الحجوزات والعمولة</span>
          </h3>
          <div className="text-xs text-muted-text space-y-3 leading-relaxed">
            <p>
              1. <strong>تواصل سريع:</strong> اتصل بالزبائن فوراً عبر الهاتف أو الواتساب، رقم الهاتف موثق ومؤكد.
            </p>
            <p>
              2. <strong>تغيير الحالة:</strong> بعد التفاوض وتأكيد الحجز الفعلي، قم بتحويل حالة الطلب إلى <span className="text-emerald-600 font-bold">"تم الحجز"</span> وأدخل القيمة الإجمالية المتفق عليها.
            </p>
            <p>
              3. <strong>اعتماد الإدارة:</strong> سيقوم مدير المنصة بمراجعة الحجوزات والتواصل مع عينات عشوائية للتأكد من نجاح العملية قبل احتساب العمولات والتسوية الشهرية.
            </p>
          </div>
          <div className="border-t border-card-border pt-4">
            <Link href="/agency/bookings" className="w-full text-center py-2.5 px-4 border border-card-border rounded-xl text-xs font-semibold text-primary hover:bg-muted-bg transition-all inline-block">
              إدارة طلبات الحجز بالكامل
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
