import { createClient } from '@/lib/supabase/server'
import CitizenProgramSearch from '@/components/CitizenProgramSearch'
import { Landmark, ShieldCheck, Heart, Sparkles, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()

  // Fetch active programs and approved agency count in parallel
  const [
    { data: programs },
    { count: agencyCount }
  ] = await Promise.all([
    supabase
      .from('programs')
      .select(`
        *,
        hotels:program_hotels(*),
        room_prices:program_room_prices(*),
        agency:agencies(*)
      `)
      .eq('status', 'active')
      .order('departure_date', { ascending: true }),
    supabase
      .from('agencies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
  ])

  // Only programs of approved agencies
  const approvedPrograms = programs?.filter(p => p.agency && p.agency.status === 'approved') || []


  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-6 md:py-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-primary-light text-primary dark:bg-primary-light/10 text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
          <Sparkles className="h-4 w-4" />
          <span>المنصة الأولى لمقارنة وحجز عروض العمرة بالجزائر</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black leading-tight text-foreground tracking-tight">
          تيسير بحثك عن <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">برنامج العمرة المناسب</span>
        </h1>
        
        <p className="text-md text-muted-text max-w-2xl mx-auto leading-relaxed">
          قارن بين عشرات العروض المقدمة من الوكالات السياحية المعتمدة بالجزائر. تصفح الفنادق، قارن الأسعار والمسافات عن الحرم، واحجز برنامجك بكل سهولة وشفافية وبدون دفع مسبق.
        </p>

        {/* trust statistics bar */}
        <div className="pt-4 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center border-t border-card-border/80">
          <div className="space-y-1">
            <span className="text-xl font-black text-primary">{(agencyCount || 0) + 12}</span>
            <p className="text-[10px] text-muted-text font-bold">وكالة معتمدة</p>
          </div>
          <div className="space-y-1 border-x border-card-border/80">
            <span className="text-xl font-black text-primary">{(approvedPrograms?.length || 0) + 24}</span>
            <p className="text-[10px] text-muted-text font-bold">برنامج نشط</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl font-black text-primary">100%</span>
            <p className="text-[10px] text-muted-text font-bold">بدون دفع مسبق</p>
          </div>
        </div>
      </section>

      {/* Main Search and Programs Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">تصفح البرامج والأسعار المتوفرة</h2>
        </div>
        
        <CitizenProgramSearch initialPrograms={approvedPrograms} />
      </section>
    </div>
  )
}
