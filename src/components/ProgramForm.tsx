'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProgram } from '@/actions/programs'
import { 
  Plane, Hotel as HotelIcon, DollarSign, Sparkles, Check, 
  ChevronLeft, ChevronRight, Plus, Trash2, HelpCircle 
} from 'lucide-react'
import type { UmrahProgram } from '@/types'

interface ProgramFormProps {
  initialProgram?: UmrahProgram
}

const INCLUSION_OPTIONS = [
  'التأشيرة السياحية / الإلكترونية',
  'التأشيرة الرسمية (عمرة)',
  'رحلات طيران مباشرة',
  'النقل بحافلات حديثة ومكيفة',
  'الوجبات (فطور فقط)',
  'الوجبات (نصف إقامة)',
  'الوجبات (إقامة كاملة)',
  'المزارات الدينية في مكة والمدينة',
  'مرشد ديني ومرافق طوال الرحلة',
  'تأمين طبي شامل',
  'عبوة ماء زمزم لكل معتمر',
  'حقيبة إهداء وكتيب العمرة'
]

const ALGERIAN_AIRPORTS = [
  'الجزائر العاصمة (ALG)',
  'وهران (ORN)',
  'قسنطينة (CZL)',
  'عنابة (AAE)',
  'ورقلة (OGX)',
  'الوادي (ELU)',
  'غرداية (GHA)',
  'أدرار (AZR)',
  'باتنة (BLJ)',
  'تلمسان (TLM)',
  'بجاية (BJA)'
]

export default function ProgramForm({ initialProgram }: ProgramFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form State
  const [title, setTitle] = useState(initialProgram?.title || '')
  const [description, setDescription] = useState(initialProgram?.description || '')
  const [durationDays, setDurationDays] = useState(initialProgram?.duration_days || 15)
  const [departureDate, setDepartureDate] = useState(
    initialProgram?.departure_date ? new Date(initialProgram.departure_date).toISOString().split('T')[0] : ''
  )
  const [returnDate, setReturnDate] = useState(
    initialProgram?.return_date ? new Date(initialProgram.return_date).toISOString().split('T')[0] : ''
  )
  const [departureCity, setDepartureCity] = useState(initialProgram?.departure_city || 'الجزائر العاصمة (ALG)')
  const [flightType, setFlightType] = useState<'direct' | 'transit'>(initialProgram?.flight_type || 'direct')
  const [childPrice, setChildPrice] = useState<number>(initialProgram?.child_price || 0)
  const [airline, setAirline] = useState(initialProgram?.airline || '')
  const [seatsAvailable, setSeatsAvailable] = useState(initialProgram?.seats_available || 50)
  const [status, setStatus] = useState<'draft' | 'active' | 'closed'>(initialProgram?.status || 'draft')

  // Hotels State
  const [hotels, setHotels] = useState<Array<{
    city: 'مكة' | 'المدينة'
    hotel_name: string
    stars: number
    distance_meters: number
    nights: number
    board_basis: string
  }>>(
    initialProgram?.hotels?.map(h => ({
      city: h.city,
      hotel_name: h.hotel_name,
      stars: h.stars,
      distance_meters: h.distance_meters,
      nights: h.nights,
      board_basis: h.board_basis || 'بدون وجبات'
    })) || [
      { city: 'مكة', hotel_name: '', stars: 4, distance_meters: 500, nights: 10, board_basis: 'فطور فقط' },
      { city: 'المدينة', hotel_name: '', stars: 4, distance_meters: 200, nights: 4, board_basis: 'فطور فقط' }
    ]
  )

  // Room Prices State
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>({
    'ثنائية': initialProgram?.room_prices?.find(p => p.room_type === 'ثنائية')?.price || 0,
    'ثلاثية': initialProgram?.room_prices?.find(p => p.room_type === 'ثلاثية')?.price || 0,
    'رباعية': initialProgram?.room_prices?.find(p => p.room_type === 'رباعية')?.price || 0,
    'خماسية': initialProgram?.room_prices?.find(p => p.room_type === 'خماسية')?.price || 0,
  })

  // Adult and Child Commissions State
  const [adultCommission, setAdultCommission] = useState<number>(initialProgram?.adult_commission || 0)
  const [childCommission, setChildCommission] = useState<number>(initialProgram?.child_commission || 0)

  // Inclusions State
  const [inclusions, setInclusions] = useState<string[]>(
    initialProgram?.inclusions || []
  )

  const handlePriceChange = (type: string, val: string) => {
    setRoomPrices(prev => ({
      ...prev,
      [type]: val === '' ? 0 : parseFloat(val)
    }))
  }

  const handleInclusionToggle = (option: string) => {
    setInclusions(prev => 
      prev.includes(option)
        ? prev.filter(x => x !== option)
        : [...prev, option]
    )
  }

  const addHotel = () => {
    setHotels(prev => [
      ...prev,
      { city: 'مكة', hotel_name: '', stars: 3, distance_meters: 800, nights: 5, board_basis: 'بدون وجبات' }
    ])
  }

  const removeHotel = (index: number) => {
    setHotels(prev => prev.filter((_, i) => i !== index))
  }

  const updateHotel = (index: number, field: string, value: any) => {
    setHotels(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Formulate final room prices list
    const pricesList = Object.entries(roomPrices)
      .filter(([_, price]) => price > 0)
      .map(([room_type, price]) => ({
        room_type: room_type as any,
        price,
      }))

    if (pricesList.length === 0) {
      setError('يجب إدخال سعر واحد على الأقل لنوع غرفة من الغرف.')
      setLoading(false)
      setStep(3) // Jump to price step
      return
    }

    const payload = {
      id: initialProgram?.id,
      title,
      description,
      duration_days: Number(durationDays),
      departure_date: departureDate,
      return_date: returnDate,
      departure_city: departureCity,
      airline,
      adult_commission: Number(adultCommission),
      child_commission: Number(childCommission),
      flight_type: flightType,
      child_price: Number(childPrice),
      seats_available: Number(seatsAvailable),
      status,
      hotels,
      room_prices: pricesList,
      inclusions,
    }

    const result = await saveProgram(payload)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/agency/programs')
      router.refresh()
    }
  }

  return (
    <div className="bg-card border border-card-border rounded-2xl shadow-xl overflow-hidden animate-fade-in max-w-4xl mx-auto">
      {/* Step Header Indicator */}
      <div className="bg-muted-bg border-b border-card-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
          <h2 className="text-lg font-bold text-foreground">
            {initialProgram ? 'تعديل برنامج عمرة' : 'إضافة برنامج عمرة جديد'}
          </h2>
        </div>
        <div className="flex gap-1.5 text-xs font-semibold">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                step === s 
                  ? 'bg-primary text-white' 
                  : step > s 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-card border border-card-border text-muted-text'
              }`}
            >
              {s === 1 && 'معلومات الرحلة'}
              {s === 2 && 'الإقامة والفنادق'}
              {s === 3 && 'الأسعار والغرف'}
              {s === 4 && 'المزايا والمراجعة'}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-sm font-semibold text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  عنوان البرنامج *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عمرة ربيع الثاني - فنادق قريبة ومريحة"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  وصف البرنامج (اختياري)
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب تفاصيل الرحلة أو ملاحظات إضافية للمواطن..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  المدة الكلية (بالأيام) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  تاريخ الذهاب (الإقلاع) *
                </label>
                <input
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  تاريخ العودة (الرجوع) *
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  مدينة الانطلاق *
                </label>
                <select
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-card text-sm focus:ring-primary focus:border-primary"
                >
                  {ALGERIAN_AIRPORTS.map((airport) => (
                    <option key={airport} value={airport}>
                      {airport}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  الخطوط الجوية *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الخطوط الجوية الجزائرية، السعودية"
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  المقاعد المتاحة *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={seatsAvailable}
                  onChange={(e) => setSeatsAvailable(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  نوع الرحلة *
                </label>
                <select
                  value={flightType}
                  onChange={(e) => setFlightType(e.target.value as any)}
                  className="w-full px-3 py-3 border border-card-border rounded-xl bg-card text-sm focus:ring-primary focus:border-primary"
                >
                  <option value="direct">رحلة مباشرة (Direct)</option>
                  <option value="transit">رحلة غير مباشرة / ترانزيت (Transit)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Hotels */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-foreground">بيانات فنادق مكة المكرمة والمدينة المنورة</h3>
              <button
                type="button"
                onClick={addHotel}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover border border-primary/20 hover:border-primary px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة فندق آخر</span>
              </button>
            </div>

            {hotels.map((hotel, idx) => (
              <div 
                key={idx} 
                className="p-5 border border-card-border rounded-xl bg-muted-bg/30 relative space-y-4 animate-fade-in"
              >
                {hotels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHotel(idx)}
                    className="absolute top-4 left-4 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      المدينة *
                    </label>
                    <select
                      value={hotel.city}
                      onChange={(e) => updateHotel(idx, 'city', e.target.value)}
                      className="w-full px-3 py-2.5 border border-card-border rounded-lg bg-card text-sm focus:ring-primary"
                    >
                      <option value="مكة">مكة المكرمة</option>
                      <option value="المدينة">المدينة المنورة</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      اسم الفندق *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: فندق أنوار المدينة، فندق ريع بخش"
                      value={hotel.hotel_name}
                      onChange={(e) => updateHotel(idx, 'hotel_name', e.target.value)}
                      className="w-full px-3 py-2.5 border border-card-border rounded-lg bg-card text-sm focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      النجوم *
                    </label>
                    <select
                      value={hotel.stars}
                      onChange={(e) => updateHotel(idx, 'stars', parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 border border-card-border rounded-lg bg-card text-sm focus:ring-primary"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 نجوم)</option>
                      <option value={3}>⭐⭐⭐ (3 نجوم)</option>
                      <option value={2}>⭐⭐ (نجمتين)</option>
                      <option value={1}>⭐ (نجمة واحدة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                      <span>البُعد عن الحرم (متر) *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={hotel.distance_meters}
                      onChange={(e) => updateHotel(idx, 'distance_meters', parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 border border-card-border rounded-lg bg-card text-sm focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      عدد الليالي *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={hotel.nights}
                      onChange={(e) => updateHotel(idx, 'nights', parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 border border-card-border rounded-lg bg-card text-sm focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      نوع الإقامة (الوجبات)
                    </label>
                    <select
                      value={hotel.board_basis}
                      onChange={(e) => updateHotel(idx, 'board_basis', e.target.value)}
                      className="w-full px-3 py-2.5 border border-card-border rounded-lg bg-card text-sm focus:ring-primary"
                    >
                      <option value="بدون وجبات">بدون وجبات</option>
                      <option value="فطور فقط">فطور فقط</option>
                      <option value="نصف إقامة">نصف إقامة (فطور + عشاء)</option>
                      <option value="إقامة كاملة">إقامة كاملة</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Room Prices */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <HelpCircle className="h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">ملاحظة هامة حول إدخال الأسعار والعمولات:</p>
                <p>جميع المبالغ بالدينار الجزائري (DZD). حدد الأسعار المناسبة للغرف المتوفرة؛ سيتم تجاهل أي غرفة يترك سعرها بقيمة (0). حدد عمولة الوكالة الخاصة بكل بالغ وطفل.</p>
              </div>
            </div>

            {/* Commissions Section */}
            <div className="p-5 border border-primary/20 rounded-xl bg-primary/5 space-y-4">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h4 className="font-bold text-sm text-foreground">عمولة الوكالة (لكل شخص)</h4>
              </div>
              <p className="text-xs text-muted-text">
                حدد قيمة العمولة المخصصة لوكالتك عن كل معتمر (بالغ / طفل) يسجل في هذا البرنامج.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">عمولة الشخص البالغ (دج) *</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="0"
                      value={adultCommission || ''}
                      onChange={(e) => setAdultCommission(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full pl-16 pr-3 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary font-semibold text-left"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-muted-text text-xs font-bold">دج</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">عمولة الطفل (دج) *</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="0"
                      value={childCommission || ''}
                      onChange={(e) => setChildCommission(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full pl-16 pr-3 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary font-semibold text-left"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-muted-text text-xs font-bold">دج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Child Price Section */}
            <div className="p-5 border border-card-border rounded-xl bg-card space-y-4">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <h4 className="font-bold text-sm text-foreground">تسعيرة الأطفال (خاص بسوق الجزائر)</h4>
              </div>
              <p className="text-xs text-muted-text">
                أدخل تكلفة السفر التقريبية للطفل الواحد بالدينار الجزائري (تشمل عادة التأشيرة والتذكرة دون سرير مستقل).
              </p>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">سعر الطفل (دج) *</label>
                <div className="relative rounded-md shadow-sm max-w-md">
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="0"
                    value={childPrice || ''}
                    onChange={(e) => setChildPrice(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    className="w-full pl-16 pr-3 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary font-semibold text-left"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-text text-xs font-bold">دج</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['ثنائية', 'ثلاثية', 'رباعية', 'خماسية'].map((roomType) => (
                <div key={roomType} className="p-5 border border-card-border rounded-xl bg-card space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-foreground">غرفة {roomType}</span>
                    <span className="text-xs text-muted-text">سعر المعتمر الواحد</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">السعر (دج) *</label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={roomPrices[roomType] || ''}
                          onChange={(e) => handlePriceChange(roomType, e.target.value)}
                          className="w-full pl-16 pr-3 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary font-semibold text-left"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-text text-xs font-bold">دج</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Inclusions & Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">ماذا يشمل البرنامج؟ (مشمولات العرض)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {INCLUSION_OPTIONS.map((option) => {
                  const isChecked = inclusions.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleInclusionToggle(option)}
                      className={`flex items-center gap-2 p-3 text-right rounded-xl border text-xs font-medium transition-all ${
                        isChecked 
                          ? 'border-primary bg-primary-light text-primary dark:bg-primary-light/10' 
                          : 'border-card-border bg-card text-muted-text hover:bg-muted-bg'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-primary border-primary text-white' : 'border-card-border'
                      }`}>
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                      <span>{option}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-card-border pt-6">
              <label className="block text-sm font-semibold text-foreground mb-2">
                حالة نشر البرنامج للعموم *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`p-3 text-center rounded-xl border text-xs font-semibold transition-all ${
                    status === 'draft' 
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/15 text-amber-700 dark:text-amber-400' 
                      : 'border-card-border text-muted-text hover:bg-muted-bg'
                  }`}
                >
                  مسودة (Draft) - حفظ مؤقت
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`p-3 text-center rounded-xl border text-xs font-semibold transition-all ${
                    status === 'active' 
                      ? 'border-primary bg-primary-light text-primary' 
                      : 'border-card-border text-muted-text hover:bg-muted-bg'
                  }`}
                >
                  نشط (Active) - ينشر للبحث
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('closed')}
                  className={`p-3 text-center rounded-xl border text-xs font-semibold transition-all ${
                    status === 'closed' 
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/15 text-red-700 dark:text-red-400' 
                      : 'border-card-border text-muted-text hover:bg-muted-bg'
                  }`}
                >
                  مغلق (Closed) - مكتمل المقاعد
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-text leading-relaxed">
                * عند تحديد حالة "نشط"، سيتم نشر العرض مباشرة للمواطنين للبحث والفلترة، بشرط أن يكون حساب وكالتك مفعلاً بالكامل من الإدارة.
              </p>
            </div>
          </div>
        )}

        {/* Form Footer Action Buttons */}
        <div className="border-t border-card-border pt-6 flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-text hover:text-foreground border border-card-border px-4 py-2.5 rounded-xl transition-colors bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
              <span>السابق</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl transition-colors border border-transparent"
            >
              <span>التالي</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1 text-sm font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 px-6 py-3 rounded-xl transition-all border border-transparent shadow-md"
            >
              {loading ? 'جاري حفظ البرنامج...' : initialProgram ? 'حفظ التعديلات' : 'نشر البرنامج الآن'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
