import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProgramForm from '@/components/ProgramForm'
import { 
  Plus, CalendarRange, MapPin, Eye, Trash2, Edit, 
  AlertTriangle, HelpCircle, Check, X, ShieldAlert
} from 'lucide-react'
import { deleteProgram, updateProgramStatus } from '@/actions/programs'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ add?: string; edit?: string }>
}

export default async function AgencyProgramsPage({
  searchParams
}: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const resolvedSearchParams = await searchParams
  const showAdd = resolvedSearchParams.add === 'true'
  const editId = resolvedSearchParams.edit

  // If adding or editing, load the appropriate view
  if (showAdd) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إضافة برنامج عمرة جديد</h1>
            <p className="text-sm text-muted-text mt-1">أدخل البيانات وتفاصيل الفنادق والأسعار لحفظ ونشر البرنامج.</p>
          </div>
          <Link href="/agency/programs">
            <button className="py-2.5 px-4 border border-card-border rounded-xl text-sm font-semibold text-muted-text hover:text-foreground bg-card transition-all">
              إلغاء والعودة
            </button>
          </Link>
        </div>
        <ProgramForm />
      </div>
    )
  }

  if (editId) {
    // Fetch program details
    const { data: program } = await supabase
      .from('programs')
      .select(`
        *,
        hotels:program_hotels(*),
        room_prices:program_room_prices(*),
        inclusions:program_inclusions(inclusion)
      `)
      .eq('id', editId)
      .eq('agency_id', user.id)
      .single()

    if (!program) {
      return (
        <div className="text-center p-8 bg-card rounded-2xl border border-card-border">
          <p className="text-red-500 font-bold">البرنامج المطلوب غير موجود أو لا تملك صلاحية تعديله.</p>
          <Link href="/agency/programs" className="mt-4 inline-block text-primary font-semibold hover:underline">
            العودة للقائمة
          </Link>
        </div>
      )
    }

    // Flatten inclusions
    const formattedProgram = {
      ...program,
      inclusions: program.inclusions.map((i: any) => i.inclusion)
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">تعديل برنامج العمرة</h1>
            <p className="text-sm text-muted-text mt-1">تعديل البيانات الحالية وحفظ التغييرات.</p>
          </div>
          <Link href="/agency/programs">
            <button className="py-2.5 px-4 border border-card-border rounded-xl text-sm font-semibold text-muted-text hover:text-foreground bg-card transition-all">
              إلغاء والعودة
            </button>
          </Link>
        </div>
        <ProgramForm initialProgram={formattedProgram as any} />
      </div>
    )
  }

  // Otherwise, list programs
  const { data: programs } = await supabase
    .from('programs')
    .select(`
      *,
      hotels:program_hotels(*),
      room_prices:program_room_prices(*),
      edit_requests(*)
    `)
    .eq('agency_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة برامج العمرة</h1>
          <p className="text-sm text-muted-text mt-1">إضافة، تعديل ونشر برامج العمرة وتعديل أسعار الغرف ومتابعة طلبات المراجعة.</p>
        </div>
        <Link href="/agency/programs?add=true">
          <button className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 px-4 rounded-xl border border-transparent shadow transition-all duration-200">
            <Plus className="h-4.5 w-4.5" />
            <span>إضافة برنامج عمرة</span>
          </button>
        </Link>
      </div>

      {/* Programs List */}
      <div className="grid grid-cols-1 gap-6">
        {programs && programs.length > 0 ? (
          programs.map((program) => {
            const pendingEditRequest = program.edit_requests?.find((r: any) => r.status === 'pending')
            const startingPrice = program.room_prices?.reduce((min: number, p: any) => p.price < min ? p.price : min, Infinity)
            const makkahHotel = program.hotels?.find((h: any) => h.city === 'مكة')
            const madinahHotel = program.hotels?.find((h: any) => h.city === 'المدينة')

            return (
              <div 
                key={program.id} 
                className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row justify-between items-stretch hover:shadow-md transition-shadow"
              >
                {/* Info block */}
                <div className="p-6 flex-1 space-y-4">
                  {pendingEditRequest && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-700 dark:text-red-400 flex gap-2">
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      <div>
                        <span className="font-bold block">طلب تعديل إداري معلق:</span>
                        <p>{pendingEditRequest.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{program.title}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      program.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : program.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {program.status === 'active' && 'نشط ومستمر'}
                      {program.status === 'draft' && 'مسودة مؤقتة'}
                      {program.status === 'closed' && 'مكتمل المقاعد'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-text">
                    <div>
                      <span>تاريخ الذهاب:</span>
                      <p className="font-bold text-foreground mt-0.5">{new Date(program.departure_date).toLocaleDateString('ar-DZ')}</p>
                    </div>
                    <div>
                      <span>تاريخ العودة:</span>
                      <p className="font-bold text-foreground mt-0.5">{new Date(program.return_date).toLocaleDateString('ar-DZ')}</p>
                    </div>
                    <div>
                      <span>مدينة الانطلاق:</span>
                      <p className="font-bold text-foreground mt-0.5">{program.departure_city}</p>
                    </div>
                    <div>
                      <span>المقاعد الشاغرة:</span>
                      <p className="font-bold text-foreground mt-0.5">{program.seats_available} مقعد</p>
                    </div>
                  </div>

                  <div className="border-t border-card-border pt-4 flex flex-wrap gap-4 text-xs text-muted-text">
                    {makkahHotel && (
                      <div>
                        <span>فندق مكة: </span>
                        <span className="font-semibold text-foreground">{makkahHotel.hotel_name}</span> 
                        <span> ({makkahHotel.distance_meters}م عن الحرم)</span>
                      </div>
                    )}
                    {madinahHotel && (
                      <div>
                        <span>فندق المدينة: </span>
                        <span className="font-semibold text-foreground">{madinahHotel.hotel_name}</span> 
                        <span> ({madinahHotel.distance_meters}م عن الحرم)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Actions block */}
                <div className="bg-muted-bg/20 border-t md:border-t-0 md:border-r border-card-border p-6 flex flex-row md:flex-col justify-between items-center md:justify-center md:w-56 shrink-0 gap-4">
                  <div className="text-center md:space-y-1">
                    <span className="text-xs text-muted-text">يبدأ السعر من</span>
                    <p className="text-xl font-black text-primary">
                      {startingPrice === Infinity ? '0' : startingPrice.toLocaleString()} دج
                    </p>
                    <span className="text-[10px] text-muted-text block">للمعتمر الواحد</span>
                  </div>

                  <div className="flex md:w-full gap-2">
                    <Link href={`/agency/programs?edit=${program.id}`} className="flex-1">
                      <button className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 border border-card-border rounded-xl text-xs font-semibold text-foreground bg-card hover:bg-muted-bg transition-colors">
                        <Edit className="h-4 w-4" />
                        <span>تعديل</span>
                      </button>
                    </Link>

                    <form 
                      action={async () => {
                        'use server'
                        await deleteProgram(program.id)
                      }}
                      className="shrink-0"
                    >
                      <button 
                        type="submit"
                        className="p-2 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors bg-card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-12 bg-card rounded-2xl border border-card-border space-y-3">
            <CalendarRange className="h-12 w-12 text-muted-text mx-auto animate-bounce" />
            <h3 className="font-bold text-foreground">لا توجد برامج عمرة حالياً</h3>
            <p className="text-sm text-muted-text">ابدأ بنشر أول برامجك لعمرة الجزائر واجذب اهتمام المعتمرين.</p>
            <Link href="/agency/programs?add=true" className="inline-block mt-2">
              <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl">
                إضافة برنامج الآن
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
