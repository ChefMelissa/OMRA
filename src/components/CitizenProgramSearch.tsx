'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, SlidersHorizontal, Calendar, MapPin, 
  Plane, Hotel as HotelIcon, Star, Eye, ArrowUpDown, 
  Heart, CheckCircle, Scale, MessageSquare, ChevronDown, X,
  ChevronRight, ChevronLeft
} from 'lucide-react'
import type { UmrahProgram } from '@/types'

interface CitizenProgramSearchProps {
  initialPrograms: any[]
}

export default function CitizenProgramSearch({ initialPrograms }: CitizenProgramSearchProps) {
  const [programs, setPrograms] = useState<any[]>(initialPrograms)
  
  // Search inputs state (temporary until Search button is clicked)
  const [departureCity, setDepartureCity] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Custom spiritual calendar states
  const [dateMode, setDateMode] = useState<'any' | 'specific' | 'range'>('any')
  const [specificDate, setSpecificDate] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(5) // June (0-indexed 5)
  const [calendarYear, setCalendarYear] = useState(2026)
  
  // Filters state (temporary inputs)
  const [showFilters, setShowFilters] = useState(false)
  const [maxDistance, setMaxDistance] = useState<number | 'all'>('all')
  const [durationFilter, setDurationFilter] = useState<string>('all')
  const [maxPrice, setMaxPrice] = useState<number>(1000000)
  const [selectedAirline, setSelectedAirline] = useState<string>('all')
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all')

  // Applied states used for actual query filtering (initially empty to show all)
  const [appliedCity, setAppliedCity] = useState('all')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const [appliedDateMode, setAppliedDateMode] = useState<'any' | 'specific' | 'range'>('any')
  const [appliedSpecificDate, setAppliedSpecificDate] = useState('')
  
  const [appliedMaxDistance, setAppliedMaxDistance] = useState<number | 'all'>('all')
  const [appliedDurationFilter, setAppliedDurationFilter] = useState<string>('all')
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number>(1000000)
  const [appliedAirline, setAppliedAirline] = useState<string>('all')
  const [appliedRoomType, setAppliedRoomType] = useState<string>('all')

  const ALGERIAN_MONTHS = [
    'جانفي / يناير', 'فيفري / فبراير', 'مارس', 'أفريل / أبريل', 'ماي / مايو', 'جوان / يونيو',
    'جويلية / يوليو', 'أوت / أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]

  const formatDateArabic = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    const day = date.getDate()
    const month = ALGERIAN_MONTHS[date.getMonth()].split(' / ')[0]
    return `${day} ${month} ${date.getFullYear()}`
  }

  const generateCalendarDays = () => {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
    const firstDayIndex = (new Date(calendarYear, calendarMonth, 1).getDay() + 1) % 7
    
    const days = []
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ day: d, dateStr })
    }
    return days
  }

  const handleDayClick = (dateStr: string) => {
    if (dateMode === 'specific') {
      setSpecificDate(dateStr)
      setStartDate(dateStr)
      setEndDate(dateStr)
      setCalendarOpen(false) // Auto-close upon date selection
    } else if (dateMode === 'range') {
      if (!startDate || (startDate && endDate)) {
        setStartDate(dateStr)
        setEndDate('')
      } else {
        if (new Date(dateStr) < new Date(startDate)) {
          setStartDate(dateStr)
          setEndDate('')
        } else {
          setEndDate(dateStr)
          setCalendarOpen(false) // Auto-close upon range selection complete
        }
      }
    }
  }

  const changeMonth = (offset: number) => {
    let newMonth = calendarMonth + offset
    let newYear = calendarYear
    if (newMonth < 0) {
      newMonth = 11
      newYear -= 1
    } else if (newMonth > 11) {
      newMonth = 0
      newYear += 1
    }
    setCalendarMonth(newMonth)
    setCalendarYear(newYear)
  }

  const handleSearch = () => {
    setAppliedCity(departureCity)
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)
    setAppliedDateMode(dateMode)
    setAppliedSpecificDate(specificDate)
    
    setAppliedMaxDistance(maxDistance)
    setAppliedDurationFilter(durationFilter)
    setAppliedMaxPrice(maxPrice)
    setAppliedAirline(selectedAirline)
    setAppliedRoomType(selectedRoomType)
    setCalendarOpen(false)
  }

  // Sorting
  const [sortBy, setSortBy] = useState<string>('featured')

  // Favorites (stored in LocalStorage)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    // Load favorites from local storage
    const savedFavs = localStorage.getItem('omra_favorites')
    if (savedFavs) setFavorites(JSON.parse(savedFavs))
  }, [])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = favorites.includes(id)
      ? favorites.filter(x => x !== id)
      : [...favorites, id]
    setFavorites(updated)
    localStorage.setItem('omra_favorites', JSON.stringify(updated))
  }

  // Extract unique airlines & cities
  const uniqueAirlines = Array.from(new Set(initialPrograms.map(p => p.airline))).filter(Boolean)
  const uniqueCities = Array.from(new Set(initialPrograms.map(p => p.departure_city))).filter(Boolean)

  // Filtered Programs
  const filteredPrograms = programs.filter((p) => {
    // City
    const matchesCity = appliedCity === 'all' || p.departure_city === appliedCity

    // Date Filtering (Specific day or Date Range)
    let matchesDate = true
    if (appliedStartDate) {
      matchesDate = matchesDate && new Date(p.departure_date) >= new Date(appliedStartDate)
    }
    if (appliedEndDate) {
      matchesDate = matchesDate && new Date(p.departure_date) <= new Date(appliedEndDate)
    }

    // Stars filter (checks Makkah hotel stars by default or any hotel) - Makkah Hotel Stars removed as requested
    const makkahHotel = p.hotels?.find((h: any) => h.city === 'مكة')

    // Distance
    const matchesDistance = appliedMaxDistance === 'all' || (makkahHotel && makkahHotel.distance_meters <= appliedMaxDistance)

    // Duration
    let matchesDuration = true
    if (appliedDurationFilter === 'short') {
      matchesDuration = p.duration_days < 12
    } else if (appliedDurationFilter === 'medium') {
      matchesDuration = p.duration_days >= 12 && p.duration_days <= 15
    } else if (appliedDurationFilter === 'long') {
      matchesDuration = p.duration_days > 15
    }

    // Price
    const minPrice = p.room_prices?.reduce((min: number, pr: any) => pr.price < min ? pr.price : min, Infinity) || 0
    const matchesPrice = minPrice <= appliedMaxPrice

    // Airline
    const matchesAirline = appliedAirline === 'all' || p.airline === appliedAirline

    // Room Type
    const matchesRoom = appliedRoomType === 'all' || p.room_prices?.some((pr: any) => pr.room_type === appliedRoomType)

    return matchesCity && matchesDate && matchesDistance && matchesDuration && matchesPrice && matchesAirline && matchesRoom
  })

  // Sorted Programs
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    const getMinPrice = (p: any) => p.room_prices?.reduce((min: number, pr: any) => pr.price < min ? pr.price : min, Infinity) || 0
    const getMakkahDist = (p: any) => p.hotels?.find((h: any) => h.city === 'مكة')?.distance_meters || 9999

    if (sortBy === 'price_asc') {
      return getMinPrice(a) - getMinPrice(b)
    }
    if (sortBy === 'price_desc') {
      return getMinPrice(b) - getMinPrice(a)
    }
    if (sortBy === 'distance_asc') {
      return getMakkahDist(a) - getMakkahDist(b)
    }
    if (sortBy === 'duration_asc') {
      return a.duration_days - b.duration_days
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    // Featured default
    return new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime()
  })

  return (
    <div className="space-y-8">
      {/* Search Header Wrapper */}
      <div className="bg-card border border-card-border p-6 rounded-3xl shadow-xl space-y-5">
        {/* Core Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* City Selector */}
          <div className="relative">
            <label className="block text-xs font-semibold text-muted-text mb-1">ولاية الانطلاق</label>
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 h-5 w-5 text-primary shrink-0" />
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="w-full pl-3 pr-11 py-3.5 bg-transparent border border-card-border rounded-2xl text-sm focus:ring-primary focus:border-primary appearance-none font-bold"
              >
                <option value="all">كل الولايات</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3.5 top-4.5 h-4 w-4 text-muted-text pointer-events-none" />
            </div>
          </div>

          {/* Custom Spiritual Calendar Picker */}
          <div className="relative md:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
              <span>🌙</span>
              <span>موعد انطلاق رحلة العمرة المباركة</span>
            </label>
            
            <button
              type="button"
              onClick={() => setCalendarOpen(!calendarOpen)}
              className={`w-full flex items-center justify-between pl-3 pr-10 py-3.5 bg-transparent border rounded-2xl text-sm text-right transition-all font-semibold ${
                calendarOpen ? 'border-primary ring-2 ring-primary/20' : 'border-card-border hover:bg-muted-bg/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>
                  {dateMode === 'any' && 'كل المواعيد المتوفرة (عرض كل الرحلات)'}
                  {dateMode === 'specific' && (specificDate ? `تاريخ محدد: ${formatDateArabic(specificDate)}` : 'حدد تاريخ الانطلاق')}
                  {dateMode === 'range' && (startDate || endDate ? `فترة السفر: ${startDate ? formatDateArabic(startDate) : 'البداية'} ← ${endDate ? formatDateArabic(endDate) : 'النهاية'}` : 'حدد نطاق التواريخ')}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-text pointer-events-none" />
            </button>

            {calendarOpen && (
              <div className="absolute right-0 z-50 mt-2 w-full max-w-md bg-card border border-primary/20 shadow-2xl rounded-3xl overflow-hidden animate-fade-in text-right">
                {/* Islamic Spiritual Header */}
                <div className="relative overflow-hidden bg-primary/5 dark:bg-primary-light/10 p-4 border-b border-card-border/60">
                  <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 opacity-5 text-primary pointer-events-none">
                    <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50 0 L60 35 L95 35 L67 55 L77 90 L50 70 L23 90 L33 55 L5 35 L40 35 Z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l.5 1.5 1.5.5-1.5.5L16 12l-.5-1.5-1.5-.5 1.5-.5L16 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">تحديد موعد السفر المبارك</h4>
                      <p className="text-[10px] text-muted-text">اختر تاريخ انطلاق رحلتك لأداء مناسك العمرة</p>
                    </div>
                  </div>
                </div>

                {/* Mode Toggles */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 p-1 bg-muted-bg rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setDateMode('any')
                        setStartDate('')
                        setEndDate('')
                        setSpecificDate('')
                        setCalendarOpen(false) // Auto-close on "All dates"
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        dateMode === 'any'
                          ? 'bg-card text-primary shadow-sm border border-primary/10'
                          : 'text-muted-text hover:text-foreground'
                      }`}
                    >
                      كل التواريخ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDateMode('specific')
                        setStartDate(specificDate)
                        setEndDate(specificDate)
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        dateMode === 'specific'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-text hover:text-foreground'
                      }`}
                    >
                      يوم محدد
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDateMode('range')
                        if (specificDate) {
                          setStartDate(specificDate)
                          setEndDate('')
                        }
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        dateMode === 'range'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-text hover:text-foreground'
                      }`}
                    >
                      بين تاريخين
                    </button>
                  </div>

                  {/* Date Status Info (Simplified Instructions) */}
                  <div className="text-[11px] text-muted-text font-bold bg-muted-bg/50 p-2.5 rounded-xl border border-card-border/60">
                    {dateMode === 'specific' && (
                      specificDate ? `اليوم المختار: ${formatDateArabic(specificDate)}` : 'يرجى اختيار يوم الذهاب من التقويم أدناه.'
                    )}
                    {dateMode === 'range' && (
                      !startDate ? 'يرجى اختيار تاريخ بداية السفر.' :
                      !endDate ? `تاريخ البدية: ${formatDateArabic(startDate)} (اضغط تاريخ النهاية لتحديد الفترة)` :
                      `الفترة المختارة: من ${formatDateArabic(startDate)} إلى ${formatDateArabic(endDate)}`
                    )}
                  </div>

                  {dateMode !== 'any' && (
                    <div className="space-y-4">
                      {/* Calendar Grid navigation */}
                      <div className="flex justify-between items-center px-1">
                        <button
                          type="button"
                          onClick={() => changeMonth(-1)}
                          className="p-1.5 hover:bg-muted-bg rounded-lg text-muted-text hover:text-foreground transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <span className="text-xs font-extrabold text-foreground">
                          {ALGERIAN_MONTHS[calendarMonth]} {calendarYear}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeMonth(1)}
                          className="p-1.5 hover:bg-muted-bg rounded-lg text-muted-text hover:text-foreground transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Weekdays Header */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-secondary-hover">
                        <div>سبت</div>
                        <div>أحد</div>
                        <div>اثنين</div>
                        <div>ثلاثاء</div>
                        <div>أربعاء</div>
                        <div>خميس</div>
                        <div>جمعة</div>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays().map((dayObj, idx) => {
                          if (!dayObj) return <div key={`empty-${idx}`} />

                          const { day, dateStr } = dayObj
                          const isSelected = 
                            (dateMode === 'specific' && specificDate === dateStr) ||
                            (dateMode === 'range' && (startDate === dateStr || endDate === dateStr))
                          
                          let isInRange = false
                          if (dateMode === 'range' && startDate && endDate) {
                            const curr = new Date(dateStr)
                            const start = new Date(startDate)
                            const end = new Date(endDate)
                            isInRange = curr > start && curr < end
                          }

                          const isToday = new Date().toDateString() === new Date(dateStr).toDateString()

                          return (
                            <button
                              key={dateStr}
                              type="button"
                              onClick={() => handleDayClick(dateStr)}
                              className={`py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center relative ${
                                isSelected
                                  ? 'bg-primary text-white ring-2 ring-secondary'
                                  : isInRange
                                  ? 'bg-primary-light text-primary font-bold dark:bg-primary-light/20'
                                  : 'text-foreground hover:bg-muted-bg'
                              }`}
                            >
                              <span>{day}</span>
                              {isToday && !isSelected && (
                                <span className="absolute bottom-1 h-1.5 w-1.5 bg-secondary rounded-full" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-bold py-3.5 px-4 rounded-2xl border border-transparent shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              <span>بحث عن عروض العمرة</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel Toggle */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
              showFilters 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'border-card-border text-foreground hover:bg-muted-bg'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>تصفية إضافية (المسافة، الطيران، السعر...)</span>
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="pt-6 border-t border-card-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Distance */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">البعد عن الحرم في مكة</label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-card text-xs focus:ring-primary"
              >
                <option value="all">أي مسافة</option>
                <option value="300">أقل من 300 متر (ساحة الحرم)</option>
                <option value="600">أقل من 600 متر</option>
                <option value="1000">أقل من 1000 متر (1 كم)</option>
                <option value="1500">أقل من 1500 متر</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">مدة البرنامج (أيام)</label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-card text-xs focus:ring-primary"
              >
                <option value="all">كل المدد</option>
                <option value="short">أقل من 12 يوم</option>
                <option value="medium">12 إلى 15 يوم</option>
                <option value="long">أطول من 15 يوم</option>
              </select>
            </div>

            {/* Airline */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">الخطوط الجوية</label>
              <select
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-card text-xs focus:ring-primary"
              >
                <option value="all">جميع خطوط الطيران</option>
                {uniqueAirlines.map(airline => (
                  <option key={airline} value={airline}>{airline}</option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">الغرفة المفضلة</label>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-card text-xs focus:ring-primary"
              >
                <option value="all">أي نوع غرفة</option>
                <option value="ثنائية">غرفة ثنائية</option>
                <option value="ثلاثية">غرفة ثلاثية</option>
                <option value="رباعية">غرفة رباعية</option>
                <option value="خماسية">غرفة خماسية</option>
              </select>
            </div>

            {/* Max Price Range */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-foreground font-sans">السعر الأقصى: </label>
                <span className="text-xs font-black text-primary">{maxPrice.toLocaleString()} دج</span>
              </div>
              <input
                type="range"
                min={100000}
                max={1000000}
                step={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-primary bg-card-border rounded-lg h-2 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Results, Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-muted-text font-semibold">
          تم العثور على <span className="text-primary font-black">{sortedPrograms.length}</span> برنامج متوفر
        </p>

        {/* Sort drop down */}
        <div className="flex items-center gap-2 relative">
          <ArrowUpDown className="h-4 w-4 text-muted-text" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-card-border rounded-xl bg-card text-xs font-bold focus:ring-primary"
          >
            <option value="featured">الأفضل ترتيباً</option>
            <option value="price_asc">السعر (من الأقل للأعلى)</option>
            <option value="price_desc">السعر (من الأعلى للأقل)</option>
            <option value="distance_asc">قرب فندق مكة من الحرم</option>
            <option value="duration_asc">الأقصر مدة</option>
            <option value="newest">البرامج الأحدث إدراجاً</option>
          </select>
        </div>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPrograms.length > 0 ? (
          sortedPrograms.map((p) => {
            const makkahHotel = p.hotels?.find((h: any) => h.city === 'مكة')
            const madinahHotel = p.hotels?.find((h: any) => h.city === 'المدينة')
            const minPrice = p.room_prices?.reduce((min: number, pr: any) => pr.price < min ? pr.price : min, Infinity) || 0
            const isFav = favorites.includes(p.id)

            // Badges
            const isBestPrice = minPrice < 250000
            const isPopular = p.seats_available < 15

            return (
              <Link 
                key={p.id} 
                href={`/programs/${p.id}`}
                className="group bg-card border border-card-border rounded-3xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative hover:-translate-y-1 animate-fade-in"
              >
                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 items-end">
                  {isBestPrice && (
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      أفضل سعر
                    </span>
                  )}
                  {isPopular && (
                    <span className="bg-amber-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      الأكثر طلباً
                    </span>
                  )}
                </div>

                {/* Floating Action buttons */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  {/* Heart button */}
                  <button
                    onClick={(e) => toggleFavorite(p.id, e)}
                    className={`p-2 rounded-xl border backdrop-blur shadow-sm transition-all ${
                      isFav 
                        ? 'bg-red-500 border-red-500 text-white' 
                        : 'bg-white/95 dark:bg-slate-900/95 border-card-border text-muted-text hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  {/* Agency info */}
                  <div className="flex items-center gap-2">
                    {p.agency?.logo_url ? (
                      <img 
                        src={p.agency.logo_url} 
                        alt={p.agency.name} 
                        className="h-7 w-7 rounded-lg object-cover border border-card-border"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-primary-light flex items-center justify-center font-bold text-[10px] text-primary">
                        {p.agency?.name?.substring(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-muted-text truncate max-w-[150px]">
                      {p.agency?.name}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-md text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {p.title}
                  </h3>

                  {/* Hotel details cards */}
                  <div className="space-y-2 bg-muted-bg/30 p-3.5 rounded-2xl border border-card-border/60 text-xs">
                    {makkahHotel && (
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1 text-muted-text">
                          <HotelIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>مكة: {makkahHotel.hotel_name}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-black text-foreground">{makkahHotel.distance_meters}م</span>
                          <span className="text-[10px] text-muted-text">عن الحرم</span>
                        </div>
                      </div>
                    )}

                    {madinahHotel && (
                      <div className="flex justify-between items-center border-t border-card-border/40 pt-2">
                        <span className="flex items-center gap-1 text-muted-text">
                          <HotelIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>المدينة: {madinahHotel.hotel_name}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-black text-foreground">{madinahHotel.distance_meters}م</span>
                          <span className="text-[10px] text-muted-text">عن الحرم</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Departure/Airline Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-text">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{p.duration_days} يوم (من {p.departure_city})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Plane className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate">{p.airline}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing block */}
                <div className="p-6 border-t border-card-border bg-muted-bg/10 flex justify-between items-center">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-text block">سعر المعتمر يبدأ من</span>
                    <span className="text-lg font-black text-primary">
                      {minPrice === Infinity ? '0' : minPrice.toLocaleString()} دج
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                    <span>التفاصيل والحجز</span>
                    <span className="text-sm font-light">←</span>
                  </span>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full text-center py-16 bg-card border border-card-border rounded-3xl space-y-4">
            <SlidersHorizontal className="h-12 w-12 text-muted-text mx-auto animate-bounce" />
            <h3 className="font-bold text-foreground">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-sm text-muted-text">يرجى تعديل خيارات الفلاتر المتقدمة، أو البحث في نطاق تواريخ آخر.</p>
          </div>
        )}
      </div>

    </div>
  )
}
