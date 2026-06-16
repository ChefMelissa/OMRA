import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Landmark, Scale, Hotel, Plane, Star, ArrowRight, ShieldCheck } from 'lucide-react'
import BookNowButton from '@/components/BookNowButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ ids?: string }>
}

export default async function CompareProgramsPage({
  searchParams
}: PageProps) {
  const supabase = createClient()
  const resolvedSearchParams = await searchParams
  const idsList = resolvedSearchParams.ids ? resolvedSearchParams.ids.split(',') : []

  // Fetch programs if ids are provided
  let programs: any[] = []
  if (idsList.length > 0) {
    const { data } = await supabase
      .from('programs')
      .select(`
        *,
        hotels:program_hotels(*),
        room_prices:program_room_prices(*),
        inclusions:program_inclusions(inclusion),
        agency:agencies(*)
      `)
      .in('id', idsList)

    programs = data || []
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span>مقارنة برامج العمرة</span>
          </h1>
          <p className="text-sm text-muted-text mt-1">مقارنة الفنادق، الأسعار، ومسافات السير عن الحرم جنباً إلى جنب لتسهيل اختيارك.</p>
        </div>
        <Link href="/" className="py-2.5 px-4 border border-card-border rounded-xl text-xs font-semibold text-muted-text hover:text-foreground bg-card transition-all flex items-center gap-1">
          <ArrowRight className="h-4 w-4" />
          <span>العودة للبحث</span>
        </Link>
      </div>

      {programs.length > 0 ? (
        <div className="overflow-x-auto border border-card-border rounded-3xl bg-card shadow-sm">
          <table className="w-full min-w-[800px] border-collapse text-right text-xs">
            <thead>
              <tr className="bg-muted-bg/50 border-b border-card-border">
                <th className="p-5 font-extrabold text-sm text-muted-text w-48">الخاصية / البرنامج</th>
                {programs.map((p) => (
                  <th key={p.id} className="p-5 font-black text-sm text-foreground border-r border-card-border text-center">
                    <div className="space-y-2">
                      <div className="h-8 flex items-center justify-center">
                        {p.agency?.logo_url ? (
                          <img src={p.agency.logo_url} alt={p.agency.name} className="h-7 rounded object-contain" />
                        ) : (
                          <span className="text-[10px] text-primary bg-primary-light px-2 py-0.5 rounded font-bold">
                            {p.agency?.name}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 hover:text-primary leading-tight font-extrabold">{p.title}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {/* Price starts from */}
              <tr>
                <td className="p-5 font-bold text-foreground">السعر يبدأ من</td>
                {programs.map((p) => {
                  const minPrice = p.room_prices?.reduce((min: number, pr: any) => pr.price < min ? pr.price : min, Infinity) || 0
                  return (
                    <td key={p.id} className="p-5 text-center font-extrabold text-md text-primary border-r border-card-border">
                      {minPrice === Infinity ? '0' : minPrice.toLocaleString()} دج
                    </td>
                  )}
                )}
              </tr>

              {/* Duration */}
              <tr>
                <td className="p-5 font-bold text-foreground">المدة الإجمالية</td>
                {programs.map((p) => (
                  <td key={p.id} className="p-5 text-center font-semibold text-foreground border-r border-card-border">
                    {p.duration_days} يوم
                  </td>
                ))}
              </tr>

              {/* Departure City */}
              <tr>
                <td className="p-5 font-bold text-foreground">الانطلاق من</td>
                {programs.map((p) => (
                  <td key={p.id} className="p-5 text-center font-semibold text-foreground border-r border-card-border">
                    {p.departure_city}
                  </td>
                ))}
              </tr>

              {/* Airline */}
              <tr>
                <td className="p-5 font-bold text-foreground">طيران الرحلة</td>
                {programs.map((p) => (
                  <td key={p.id} className="p-5 text-center font-semibold text-foreground border-r border-card-border">
                    <div className="flex items-center justify-center gap-1">
                      <Plane className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{p.airline}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Makkah Hotel details */}
              <tr>
                <td className="p-5 font-bold text-foreground">فندق مكة المكرمة</td>
                {programs.map((p) => {
                  const hotel = p.hotels?.find((h: any) => h.city === 'مكة')
                  return (
                    <td key={p.id} className="p-5 border-r border-card-border text-center space-y-1">
                      {hotel ? (
                        <>
                          <p className="font-bold text-foreground">{hotel.hotel_name}</p>
                          <div className="flex justify-center gap-0.5 my-1">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-text font-black">
                            يبعد {hotel.distance_meters}م عن الحرم
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-text">غير متوفر</span>
                      )}
                    </td>
                  )
                })}
              </tr>

              {/* Madinah Hotel details */}
              <tr>
                <td className="p-5 font-bold text-foreground">فندق المدينة المنورة</td>
                {programs.map((p) => {
                  const hotel = p.hotels?.find((h: any) => h.city === 'المدينة')
                  return (
                    <td key={p.id} className="p-5 border-r border-card-border text-center space-y-1">
                      {hotel ? (
                        <>
                          <p className="font-bold text-foreground">{hotel.hotel_name}</p>
                          <div className="flex justify-center gap-0.5 my-1">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-text font-black">
                            يبعد {hotel.distance_meters}م عن الحرم
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-text">غير متوفر</span>
                      )}
                    </td>
                  )
                })}
              </tr>

              {/* Double room price */}
              <tr>
                <td className="p-5 font-bold text-foreground">غرفة ثنائية (للمعتمر)</td>
                {programs.map((p) => {
                  const price = p.room_prices?.find((pr: any) => pr.room_type === 'ثنائية')?.price
                  return (
                    <td key={p.id} className="p-5 text-center font-bold text-foreground border-r border-card-border">
                      {price ? `${Number(price).toLocaleString()} دج` : 'غير مدرج'}
                    </td>
                  )}
                )}
              </tr>

              {/* Triple room price */}
              <tr>
                <td className="p-5 font-bold text-foreground">غرفة ثلاثية (للمعتمر)</td>
                {programs.map((p) => {
                  const price = p.room_prices?.find((pr: any) => pr.room_type === 'ثلاثية')?.price
                  return (
                    <td key={p.id} className="p-5 text-center font-bold text-foreground border-r border-card-border">
                      {price ? `${Number(price).toLocaleString()} دج` : 'غير مدرج'}
                    </td>
                  )}
                )}
              </tr>

              {/* Quad room price */}
              <tr>
                <td className="p-5 font-bold text-foreground">غرفة رباعية (للمعتمر)</td>
                {programs.map((p) => {
                  const price = p.room_prices?.find((pr: any) => pr.room_type === 'رباعية')?.price
                  return (
                    <td key={p.id} className="p-5 text-center font-bold text-foreground border-r border-card-border">
                      {price ? `${Number(price).toLocaleString()} دج` : 'غير مدرج'}
                    </td>
                  )}
                )}
              </tr>

              {/* Inclusions */}
              <tr>
                <td className="p-5 font-bold text-foreground">ميزات تشملها الرحلة</td>
                {programs.map((p) => (
                  <td key={p.id} className="p-5 border-r border-card-border text-center">
                    <div className="flex flex-col items-center gap-1">
                      {p.inclusions?.slice(0, 3).map((inc: any, idx: number) => (
                        <span key={idx} className="bg-primary-light text-primary dark:bg-primary-light/10 text-[10px] font-bold px-2 py-0.5 rounded">
                          {inc.inclusion}
                        </span>
                      ))}
                      {p.inclusions?.length > 3 && (
                        <span className="text-[10px] text-muted-text">+{p.inclusions.length - 3} ميزات أخرى</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Booking Actions */}
              <tr>
                <td className="p-5 font-bold text-foreground">حجز مكانك</td>
                {programs.map((p) => (
                  <td key={p.id} className="p-5 border-r border-card-border text-center">
                    <div className="max-w-[150px] mx-auto">
                      <BookNowButton program={p} />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-card-border rounded-3xl space-y-4">
          <Scale className="h-12 w-12 text-muted-text mx-auto" />
          <h3 className="font-bold text-foreground">لم تقم باختيار برامج للمقارنة بعد</h3>
          <p className="text-sm text-muted-text">تصفح برامج العمرة واضغط على أيقونة الميزان في البطاقة لوضعها في قائمة المقارنة.</p>
          <Link href="/" className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm mt-2 inline-block">
            تصفح البرامج الآن
          </Link>
        </div>
      )}
    </div>
  )
}
