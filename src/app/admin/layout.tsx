import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, ShieldCheck, Inbox, DollarSign, 
  LogOut, Landmark, Users 
} from 'lucide-react'
import { logout } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Define nav links
  const navItems = [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/admin/agencies', label: 'الوكالات السياحية', icon: Users },
    { href: '/admin/bookings', label: 'طلبات الحجز والعمولة', icon: Inbox },
    { href: '/admin/settlements', label: 'تسويات العمولات', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-muted-bg/50 to-background">
      {/* Sidebar - Right side (RTL) */}
      <aside className="w-full md:w-64 shrink-0 bg-card border-l border-card-border flex flex-col justify-between py-6 px-4 md:min-h-screen">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl px-2">
            <Landmark className="h-7 w-7" />
            <span>لوحة الإدارة</span>
          </Link>

          {/* Admin badge */}
          <div className="p-3.5 rounded-2xl bg-primary-light dark:bg-primary-light/5 border border-primary/20 space-y-1.5 text-center">
            <ShieldCheck className="h-7 w-7 text-primary mx-auto" />
            <p className="font-extrabold text-xs text-primary">المشرف الرئيسي</p>
            <p className="text-[10px] text-muted-text truncate">{user.email}</p>
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
