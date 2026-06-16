import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, CalendarRange, Inbox, User, LogOut, 
  Landmark, AlertCircle, ShieldCheck
} from 'lucide-react'
import { logout } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export default async function AgencyPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch agency status & profile
  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!agency) {
    redirect('/register')
  }

  // Define nav links
  const navItems = [
    { href: '/agency/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/agency/programs', label: 'برامج العمرة', icon: CalendarRange },
    { href: '/agency/bookings', label: 'طلبات الحجز', icon: Inbox },
    { href: '/agency/profile', label: 'الملف الشخصي', icon: User },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-muted-bg/50 to-background">
      {/* Sidebar - Right side (RTL) */}
      <aside className="w-full md:w-64 shrink-0 bg-card border-l border-card-border flex flex-col justify-between py-6 px-4 md:min-h-screen">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl px-2">
            <Landmark className="h-7 w-7" />
            <span>منصة عمرة</span>
          </Link>

          {/* Agency Badge */}
          <div className="p-3.5 rounded-2xl bg-muted-bg border border-card-border space-y-2">
            <div className="flex items-center gap-2">
              {agency.logo_url ? (
                <img 
                  src={agency.logo_url} 
                  alt={agency.name} 
                  className="h-10 w-10 rounded-xl object-cover border border-card-border"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center font-bold text-primary text-md">
                  {agency.name.substring(0, 2)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-foreground truncate">{agency.name}</p>
                <p className="text-xs text-muted-text truncate">رخصة: {agency.license_number}</p>
              </div>
            </div>
            
            {/* Account Status Badge */}
            {agency.status === 'approved' ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-1 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>حساب معتمد ومفعّل</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-1 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>قيد المراجعة</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-muted-text hover:text-foreground hover:bg-muted-bg transition-all duration-200"
                >
                  <Icon className="h-5 w-5 text-muted-text hover:text-foreground" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-6 border-t border-card-border mt-6 md:mt-0">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 hover:text-red-700 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
