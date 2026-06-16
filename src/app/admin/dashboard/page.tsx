import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Users, CalendarRange, Inbox, DollarSign, 
  ShieldAlert, ShieldCheck, ArrowLeft, ArrowUpRight 
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 1. Fetch Agencies stats
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, status, commission_rate')

  const totalAgencies = agencies?.length || 0
  const pendingAgencies = agencies?.filter(a => a.status === 'pending').length || 0
  const approvedAgencies = agencies?.filter(a => a.status === 'approved').length || 0

  // 2. Fetch Programs stats
  const { count: activePrograms } = await supabase
    .from('programs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 3. Fetch Bookings stats
  const { data: bookings } = await supabase
    .from('booking_requests')
    .select(`
      *,
      agency:agencies(commission_rate)
    `)

  const totalBookings = bookings?.length || 0
  const bookedRequests = bookings?.filter(b => b.status === 'booked') || []
  const approvedBookingsCount = bookedRequests.filter(b => b.admin_approval === 'approved').length
  const pendingApprovalsCount = bookedRequests.filter(b => b.admin_approval === 'pending').length

  // Calculate total commissions
  // For each approved booking: booking_value * agency_commission_rate / 100
  let totalCommissions = 0
  bookedRequests.forEach(b => {
    if (b.admin_approval === 'approved' && b.booking_value) {
      const rate = b.agency?.commission_rate ? Number(b.agency.commission_rate) : 5.0
      totalCommissions += (Number(b.booking_value) * rate) / 100
    }
  })

  // 4. Fetch Settlements stats
  const { data: settlements } = await supabase
    .from('commission_settlements')
    .select('total_commission, status')

  const unpaidCommission = settlements?.filter(s => s.status === 'unpaid').reduce((sum, s) => sum + Number(s.total_commission), 0) || 0

  // 5. Fetch Pending Agencies list
  const { data: pendingAgenciesList } = await supabase
    .from('agencies')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة تحكم المنصة العامة</h1>
        <p className="text-sm text-muted-text mt-1">تتبع أرباح المنصة، إحصائيات الوكالات وحالة تسويات العمولات.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Agencies */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">الوكالات السياحية</p>
            <p className="text-2xl font-black text-foreground">{totalAgencies}</p>
            {pendingAgencies > 0 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                {pendingAgencies} وكالة معلقة
              </span>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-500 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Programs */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">عروض العمرة النشطة</p>
            <p className="text-2xl font-black text-foreground">{activePrograms || 0}</p>
            <span className="text-[10px] text-muted-text">منشورة حالياً للمواطنين</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-500 flex items-center justify-center">
            <CalendarRange className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Bookings */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">طلبات الحجز الكلية</p>
            <p className="text-2xl font-black text-foreground">{totalBookings}</p>
            {pendingApprovalsCount > 0 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                {pendingApprovalsCount} حجز بانتظار الاعتماد
              </span>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 flex items-center justify-center">
            <Inbox className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Commissions */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-text">عمولات معتمدة محتسبة</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{totalCommissions.toLocaleString()} دج</p>
            {unpaidCommission > 0 && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded">
                {unpaidCommission.toLocaleString()} دج غير محصلة
              </span>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Platform Review lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending Agencies Review (Col Span 2) */}
        <div className="bg-card border border-card-border rounded-2xl shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-card-border flex justify-between items-center bg-muted-bg/10">
            <h2 className="font-bold text-md text-foreground flex items-center gap-1">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <span>طلبات تفعيل الوكالات المعلقة ({pendingAgencies})</span>
            </h2>
            <Link href="/admin/agencies" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <span>إدارة الوكالات</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-card-border">
            {pendingAgenciesList && pendingAgenciesList.length > 0 ? (
              pendingAgenciesList.map((a) => (
                <div key={a.id} className="p-5 flex justify-between items-center hover:bg-muted-bg/10 transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-foreground">{a.name}</h3>
                    <p className="text-xs text-muted-text">
                      رقم الرخصة: <span className="font-semibold text-foreground">{a.license_number}</span> • المدينة: {a.city}
                    </p>
                    <p className="text-xs text-muted-text">
                      الهاتف: <span className="font-semibold" dir="ltr">{a.phone}</span>
                    </p>
                  </div>
                  <Link href={`/admin/agencies?id=${a.id}`}>
                    <button className="inline-flex items-center gap-1 py-1.5 px-3 border border-card-border bg-card rounded-xl text-xs font-bold text-foreground hover:bg-muted-bg transition-all">
                      <span>مراجعة الطلب</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-text">
                لا توجد طلبات تفعيل معلقة للوكالات حالياً. الحسابات تعمل بنشاط.
              </div>
            )}
          </div>
        </div>

        {/* Outstanding Alerts & Quick Operations */}
        <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground">إجراءات سريعة</h3>
          <div className="space-y-2.5">
            <Link href="/admin/bookings">
              <button className="w-full text-right py-3 px-4 border border-card-border hover:bg-muted-bg/40 rounded-xl text-xs font-bold text-foreground flex justify-between items-center transition-all">
                <span>اعتماد حجوزات المعتمرين</span>
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                  {pendingApprovalsCount} معلق
                </span>
              </button>
            </Link>

            <Link href="/admin/settlements">
              <button className="w-full text-right py-3 px-4 border border-card-border hover:bg-muted-bg/40 rounded-xl text-xs font-bold text-foreground flex justify-between items-center transition-all">
                <span>تجميع العمولات والتسويات</span>
                <span className="text-[10px] font-black text-primary">توليد تسوية شهرياً</span>
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
