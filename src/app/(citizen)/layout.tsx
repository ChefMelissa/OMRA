import Link from 'next/link'
import { Landmark } from 'lucide-react'

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - Glassmorphism Sticky */}
      <header className="sticky top-0 z-30 w-full bg-card/80 backdrop-blur-md border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary font-black text-xl hover:opacity-95 transition-opacity">
            <Landmark className="h-7 w-7 text-primary" />
            <span>منصة عمرة</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-text">
            <Link href="/" className="hover:text-foreground transition-colors">تصفح البرامج</Link>
            <Link href="/compare" className="hover:text-foreground transition-colors">مقارنة العروض</Link>
          </nav>

          {/* Action buttons (removed for strict separation) */}
          <div className="flex items-center gap-3">
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-card-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div className="space-y-4">
            <Link href="/" className="flex items-center justify-center md:justify-start gap-2 text-primary font-black text-xl">
              <Landmark className="h-7 w-7 text-primary" />
              <span>منصة عمرة</span>
            </Link>
            <p className="text-xs text-muted-text leading-relaxed">
              المنصة الأولى المخصصة للجزائريين لتصفح، مقارنة، وفلترة برامج عروض العمرة بكل شفافية. هدفنا ربط المعتمرين بأفضل الوكالات المعتمدة.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-foreground">روابط سريعة</h4>
            <ul className="text-xs text-muted-text space-y-2">
              <li><Link href="/" className="hover:text-foreground transition-colors">الرئيسية وتصفح العروض</Link></li>
              <li><Link href="/compare" className="hover:text-foreground transition-colors">مقارنة برامج العمرة</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-foreground">شروط وقوانين المنصة</h4>
            <p className="text-xs text-muted-text leading-relaxed">
              المنصة لا تقبل أي مدفوعات إلكترونية أو عربون مالي. الحجز يتم ببيانات الاتصال ومطابقتها من الإدارة لضمان أمان معاملينا.
            </p>
            <p className="text-[10px] text-muted-text">© {new Date().getFullYear()} عمرة الجزائر. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

