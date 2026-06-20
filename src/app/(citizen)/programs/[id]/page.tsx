import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { 
  Calendar, MapPin, Plane, Hotel as HotelIcon, Star, 
  Check, ArrowRight, ShieldCheck, Heart, AlertCircle, Info 
} from 'lucide-react'
import BookNowButton from '@/components/BookNowButton'
import { logInquiry } from '@/actions/bookings'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

// Dynamic SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createClient()
  const { data: program } = await supabase
    .from('programs')
    .select('title, description, agency:agencies(name)')
    .eq('id', id)
    .single()

  if (!program) {
    return {
      title: 'برنامج غير موجود - منصة عمرة',
    }
  }

  return {
    title: `${program.title} | وكالة ${(program.agency as any)?.name || 'السياحية'}`,
    description: program.description || `عرض وتفاصيل برنامج العمرة من تنظيم وكالة ${(program.agency as any)?.name}. قارن الفنادق والأسعار وتواصل مباشرة.`,
  }
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createClient()

  // Fetch program with details
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      hotels:program_hotels(*),
      room_prices:program_room_prices(*),
      inclusions:program_inclusions(inclusion),
      agency:agencies(*)
    `)
    .eq('id', id)
    .single()

  if (!program || program.status !== 'active' || (program.agency as any)?.status !== 'approved') {
    notFound()
  }

  // Log view analytic
  await logInquiry(program.id, 'view')

  const makkahHotel = program.hotels?.find((h: any) => h.city === 'مكة')
  const madinahHotel = program.hotels?.find((h: any) => h.city === 'المدينة')

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back to list */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-text hover:text-foreground transition-colors">
          <ArrowRight className="h-4 w-4" />
          <span>العودة لبرامج العمرة</span>
        </Link>
      </div>

      {/* Grid: Details & Side Booking Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details (Col Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Title, dates, airline */}
          <div className="bg-card border border-card-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{program.title}</h1>
              <p className="text-sm text-muted-text flex items-center gap-2 flex-wrap">
                <span>من تنظيم:</span>
                <span className="font-semibold text-foreground">{(program.agency as any)?.name}</span>
                <span>• رخصة: {(program.agency as any)?.license_number}</span>
                {(program.agency as any)?.contract_signed && (
                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-900/30">
                    ✓ معتمدة بعقد رسمي
                  </span>
                )}
              </p>
            </div>

            {/* description */}
            {program.description && (
              <p className="text-sm text-muted-text leading-relaxed border-t border-card-border pt-4">
                {program.description}
              </p>
            )}

            {/* Travel details badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-card-border pt-6">
              <div className="p-3 bg-muted-bg/30 rounded-2xl border border-card-border/60 text-center">
                <span className="text-[10px] text-muted-text font-bold block mb-1">المدة الإجمالية</span>
                <span className="font-black text-xs sm:text-sm text-foreground">{program.duration_days} يوم</span>
              </div>
              <div className="p-3 bg-muted-bg/30 rounded-2xl border border-card-border/60 text-center">
                <span className="text-[10px] text-muted-text font-bold block mb-1">مدينة الانطلاق</span>
                <span className="font-black text-xs sm:text-sm text-foreground">{program.departure_city}</span>
              </div>
              <div className="p-3 bg-muted-bg/30 rounded-2xl border border-card-border/60 text-center">
                <span className="text-[10px] text-muted-text font-bold block mb-1">نوع الرحلة</span>
                <span className="font-black text-xs sm:text-sm text-foreground">
                  {program.flight_type === 'transit' ? '✈️ ترانزيت' : '✨ رحلة مباشرة'}
                </span>
              </div>
              <div className="p-3 bg-muted-bg/30 rounded-2xl border border-card-border/60 text-center">
                <span className="text-[10px] text-muted-text font-bold block mb-1">الخطوط الجوية</span>
                <span className="font-black text-xs sm:text-sm text-foreground flex items-center justify-center gap-1">
                  <Plane className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{program.airline}</span>
                </span>
              </div>
            </div>

            {/* Flight timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-muted-bg/10 p-4 rounded-2xl border border-card-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="text-muted-text block">تاريخ وموعد الذهاب</span>
                  <span className="font-bold text-foreground">{new Date(program.departure_date).toLocaleDateString('ar-DZ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-r border-card-border pt-2.5 sm:pt-0 sm:pr-4">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="text-muted-text block">تاريخ وموعد العودة</span>
                  <span className="font-bold text-foreground">{new Date(program.return_date).toLocaleDateString('ar-DZ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Hotels accommodation */}
          <div className="bg-card border border-card-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HotelIcon className="h-5 w-5 text-primary" />
              <span>الإقامة والفنادق المعتمدة</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Makkah hotel */}
              {makkahHotel ? (
                <div className="p-5 border border-card-border rounded-2xl space-y-3 bg-muted-bg/20">
                  <div className="flex justify-between items-start">
                    <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                      مكة المكرمة ({makkahHotel.nights} ليالي)
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: makkahHotel.stars }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground">{makkahHotel.hotel_name}</h3>
                  <div className="flex justify-between items-center text-xs border-t border-card-border/60 pt-3">
                    <span className="text-muted-text">البعد عن الحرم:</span>
                    <span className="font-extrabold text-foreground">{makkahHotel.distance_meters} متر</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-text">نوع الإقامة:</span>
                    <span className="font-semibold text-foreground">{makkahHotel.board_basis || 'بدون وجبات'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 border border-dashed border-card-border rounded-2xl text-center text-xs text-muted-text">
                  لا توجد معلومات إقامة في مكة.
                </div>
              )}

              {/* Madinah hotel */}
              {madinahHotel ? (
                <div className="p-5 border border-card-border rounded-2xl space-y-3 bg-muted-bg/20">
                  <div className="flex justify-between items-start">
                    <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                      المدينة المنورة ({madinahHotel.nights} ليالي)
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: madinahHotel.stars }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground">{madinahHotel.hotel_name}</h3>
                  <div className="flex justify-between items-center text-xs border-t border-card-border/60 pt-3">
                    <span className="text-muted-text">البعد عن الحرم النبوي:</span>
                    <span className="font-extrabold text-foreground">{madinahHotel.distance_meters} متر</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-text">نوع الإقامة:</span>
                    <span className="font-semibold text-foreground">{madinahHotel.board_basis || 'بدون وجبات'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 border border-dashed border-card-border rounded-2xl text-center text-xs text-muted-text">
                  لا توجد معلومات إقامة في المدينة.
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Room Prices table */}
          <div className="bg-card border border-card-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-foreground">جدول الأسعار والتكلفة</h2>
            <p className="text-xs text-muted-text -mt-2">الأسعار المعروضة هي للمعتمر الواحد وتشمل الرحلة والإقامة والخدمات المدرجة.</p>

            <div className="overflow-hidden border border-card-border rounded-2xl divide-y divide-card-border">
              {program.room_prices && program.room_prices.length > 0 ? (
                <>
                  {program.room_prices.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-4 hover:bg-muted-bg/10 transition-colors">
                      <span className="font-bold text-sm text-foreground">غرفة {p.room_type}</span>
                      <span className="font-black text-md text-primary">{Number(p.price).toLocaleString()} دج</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-4 hover:bg-muted-bg/10 transition-colors bg-secondary/5 border-t border-dashed border-card-border">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">سعر الطفل (شامل التذكرة، التأشيرة والسرير)</span>
                      <span className="text-[10px] text-muted-text">تسعيرة الأطفال المعتمدة للرحلة</span>
                    </div>
                    <span className="font-black text-md text-secondary">
                      {program.child_price > 0 ? `${Number(program.child_price).toLocaleString()} دج` : 'حسب الطلب'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-xs text-muted-text">يرجى التواصل مع الوكالة للاستفسار عن تفاصيل الأسعار.</div>
              )}
            </div>
          </div>

          {/* Card 3.5: Agency Details & Trust Box */}
          <div className="bg-card border border-card-border p-6 md:p-8 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">الوكالة المنظمة والاعتماد الجغرافي</h2>
            </div>
            <p className="text-xs text-muted-text -mt-2">معلومات الاعتماد وعقود العمل الرسمية للوكالة بالمنصة مع فروعها الجغرافية.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-card-border rounded-xl space-y-2 bg-muted-bg/10">
                <span className="text-[10px] text-muted-text font-bold block">توثيق العقد والمكتب</span>
                <div className="space-y-1">
                  <p className="text-xs text-foreground font-semibold flex items-center gap-1.5">
                    <span>حالة العقد مع المنصة:</span>
                    {program.agency?.contract_signed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                        ✓ موقّع بعقد رسمي
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100 text-[10px]">
                        معلق الاتفاقية
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-text">
                    رخصة العمل السياحية: <span className="text-foreground font-bold">{(program.agency as any)?.license_number}</span>
                  </p>
                  <p className="text-xs text-muted-text">
                    الولاية الرئيسية: <span className="text-foreground font-bold">{(program.agency as any)?.city}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 border border-card-border rounded-xl space-y-2 bg-muted-bg/10">
                <span className="text-[10px] text-muted-text font-bold block">معلومات الدفع وتأكيد الحجز</span>
                <p className="text-xs text-muted-text leading-relaxed">
                  تتواصل معك الوكالة مباشرة بعد تقديم طلبك للاتفاق على كيفية الدفع وتدبير الملف (عبر الهاتف، واتساب، أو الحضور لمقر الوكالة).
                </p>
              </div>
            </div>

            {(program.agency as any)?.branches && (
              <div className="p-4 border border-card-border rounded-xl space-y-2 bg-muted-bg/10">
                <span className="text-[10px] text-muted-text font-bold block">الفروع الجغرافية وعناوين مكاتب الوكالة بالجزائر</span>
                <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{(program.agency as any).branches}</p>
              </div>
            )}
          </div>

          {/* Card 4: Inclusions Checklist */}
          {program.inclusions && program.inclusions.length > 0 && (
            <div className="bg-card border border-card-border p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-foreground">المزايا ومشمولات البرنامج</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {program.inclusions.map((inc: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-muted-text">
                    <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{inc.inclusion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Column Booking Box (Col Span 1) */}
        <div className="space-y-6">
          <div className="bg-card border border-card-border p-6 rounded-3xl shadow-lg sticky top-24 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-black text-foreground">طلب حجز مباشر</h2>
              <p className="text-xs text-muted-text leading-relaxed">
                سجل اسمك ورقم هاتفك هنا لإرسال طلب حجزك. سيتم حفظ البيانات والاتصال بك للتأكيد في غضون 24 ساعة.
              </p>
            </div>

            {/* Price reference */}
            <div className="p-4 rounded-2xl bg-muted-bg border border-card-border flex justify-between items-center">
              <span className="text-xs text-muted-text">أقل سعر متوفر:</span>
              <span className="text-lg font-black text-primary">
                {program.room_prices?.reduce((min: number, pr: any) => pr.price < min ? pr.price : min, Infinity).toLocaleString()} دج
              </span>
            </div>

            {/* Book Now Button client modal wrapper */}
            <BookNowButton program={program as any} />

            {/* Trust Badges */}
            <div className="border-t border-card-border pt-4 space-y-3 text-xs text-muted-text leading-relaxed">
              <div className="flex gap-2">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <span><strong>دليل الإحالة:</strong> يُحفظ طلبك برقم مرجعي فريد لمطابقتك مع الوكالة وحماية عمولتك.</span>
              </div>
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <span><strong>معلومات الدفع وتأكيد الحجز:</strong> تتواصل معك الوكالة مباشرة بعد تقديم طلبك للاتفاق على كيفية الدفع وتدبير الملف (عبر الهاتف، واتساب، أو الحضور لمقر الوكالة).</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
