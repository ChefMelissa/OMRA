'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookingStatus } from '@/actions/bookings'
import { 
  Phone, MessageSquare, Check, X, AlertTriangle, 
  Search, ShieldAlert, DollarSign 
} from 'lucide-react'
import type { BookingRequest } from '@/types'

interface AgencyBookingListProps {
  initialBookings: any[]
}

export default function AgencyBookingList({ initialBookings }: AgencyBookingListProps) {
  const router = useRouter()
  const [bookings, setBookings] = useState(initialBookings)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Status Editing State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempStatus, setTempStatus] = useState<'new' | 'contacted' | 'booked' | 'cancelled'>('new')
  const [bookingValue, setBookingValue] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartEdit = (b: any) => {
    setEditingId(b.id)
    setTempStatus(b.status)
    setBookingValue(b.booking_value ? b.booking_value.toString() : '')
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setError(null)
  }

  const handleSaveStatus = async (id: string) => {
    setError(null)
    setLoading(true)

    const parsedValue = tempStatus === 'booked' ? parseFloat(bookingValue) : undefined

    if (tempStatus === 'booked' && (!parsedValue || parsedValue <= 0)) {
      setError('يجب إدخال قيمة مالية صالحة للرحلة بالدينار الجزائري.')
      setLoading(false)
      return
    }

    const result = await updateBookingStatus(id, tempStatus, parsedValue)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setEditingId(null)
      setLoading(false)
      router.refresh()
    }
  }

  // Filters
  const filteredBookings = initialBookings.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus
    const matchesSearch = 
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_phone.includes(searchQuery) ||
      b.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.programs?.title || '').toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // WhatsApp Link Helper
  const getWhatsAppLink = (phone: string, name: string, ref: string, programTitle: string) => {
    // Format phone to international (remove leading 0 and prepend 213)
    const cleanPhone = phone.replace(/^0/, '213')
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله، الأستاذ(ة) ${name}. معك وكالة السياحة بخصوص طلب حجزك لبرنامج العمرة: "${programTitle}" (رقم مرجعي: ${ref}) عبر منصة عمرة. نود تأكيد حجزك والإجابة على أي استفسارات.`
    )
    return `https://wa.me/${cleanPhone}?text=${message}`
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-3.5 h-4 w-4 text-muted-text" />
          <input
            type="text"
            placeholder="البحث بالاسم، الهاتف، الرقم المرجعي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'new', label: 'طلبات جديدة' },
            { id: 'contacted', label: 'تم التواصل' },
            { id: 'booked', label: 'تم الحجز' },
            { id: 'cancelled', label: 'لم يكتمل' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === tab.id
                  ? 'bg-primary border-primary text-white'
                  : 'bg-card border-card-border text-muted-text hover:bg-muted-bg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => {
            const isEditing = editingId === b.id
            const programTitle = b.programs?.title || 'برنامج تم حذفه'
            
            return (
              <div 
                key={b.id} 
                className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-shadow animate-fade-in"
              >
                {/* User Info details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-extrabold text-md text-foreground">{b.customer_name}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted-bg border border-card-border text-muted-text">
                      {b.reference_number}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'new' 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' 
                        : b.status === 'contacted'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          : b.status === 'booked'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {b.status === 'new' && 'طلب جديد'}
                      {b.status === 'contacted' && 'تم التواصل مع الزبون'}
                      {b.status === 'booked' && 'تم تأكيد الحجز'}
                      {b.status === 'cancelled' && 'طلب ملغى / لم يكتمل'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-text leading-relaxed">
                    البرنامج المطلوب: <span className="font-semibold text-foreground">{programTitle}</span> • غرفة {b.room_type}
                  </p>

                  {b.notes && (
                    <div className="p-3 bg-muted-bg/50 rounded-lg border border-card-border text-xs text-muted-text">
                      <span className="font-bold text-foreground block mb-0.5">ملاحظات الزبون:</span>
                      {b.notes}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs">
                    <a href={`tel:${b.customer_phone}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{b.customer_phone}</span>
                    </a>
                    <a 
                      href={getWhatsAppLink(b.customer_phone, b.customer_name, b.reference_number, programTitle)}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>اتصال واتساب فوري</span>
                      {b.is_whatsapp && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">
                          مؤكد ✓
                        </span>
                      )}
                    </a>
                  </div>
                </div>

                {/* Status Update / Booking Value Form */}
                <div className="border-t lg:border-t-0 lg:border-r border-card-border pt-4 lg:pt-0 lg:pr-6 flex flex-col justify-center min-w-[240px] gap-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          تحديث حالة الطلب
                        </label>
                        <select
                          value={tempStatus}
                          onChange={(e) => setTempStatus(e.target.value as any)}
                          className="w-full px-3 py-2 border border-card-border rounded-xl text-xs bg-card focus:ring-primary focus:border-primary"
                        >
                          <option value="new">طلب جديد</option>
                          <option value="contacted">تم التواصل</option>
                          <option value="booked">تم الحجز (تأكيد نهائي)</option>
                          <option value="cancelled">لم يكتمل / ملغى</option>
                        </select>
                      </div>

                      {tempStatus === 'booked' && (
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">
                            القيمة الإجمالية للحجز (دج DZD) *
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              type="number"
                              required
                              min={1}
                              placeholder="أدخل القيمة بالدينار"
                              value={bookingValue}
                              onChange={(e) => setBookingValue(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-card-border rounded-xl text-xs bg-card focus:ring-primary font-semibold text-left"
                            />
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                              <span className="text-muted-text text-[10px] font-bold">دج</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {error && (
                        <p className="text-[10px] font-bold text-red-500">{error}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveStatus(b.id)}
                          disabled={loading}
                          className="flex-1 py-2 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'حفظ...' : 'تأكيد الحفظ'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="py-2 px-3 border border-card-border text-muted-text text-xs font-bold rounded-xl bg-card hover:bg-muted-bg transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-center lg:text-right">
                      {b.status === 'booked' ? (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-text block">قيمة الحجز المدخلة:</span>
                          <span className="text-md font-extrabold text-primary block">
                            {Number(b.booking_value).toLocaleString()} دج
                          </span>
                          
                          {/* Admin Approval status check */}
                          {b.admin_approval === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                              <Check className="h-3 w-3" />
                              <span>معتمد من الإدارة (العمولة نشطة)</span>
                            </span>
                          ) : b.admin_approval === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                              <X className="h-3 w-3" />
                              <span>مرفوض من الإدارة</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
                              <span>قيد مراجعة الإدارة (الطبقة 2)</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-text">لم يتم إدخال قيمة حجز مالية بعد.</p>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(b)}
                        className="w-full py-2 px-4 border border-card-border rounded-xl text-xs font-bold text-foreground bg-card hover:bg-muted-bg transition-colors"
                      >
                        تحديث حالة الطلب
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-12 bg-card rounded-2xl border border-card-border space-y-3">
            <AlertTriangle className="h-12 w-12 text-muted-text mx-auto" />
            <h3 className="font-bold text-foreground">لا توجد نتائج مطابقة</h3>
            <p className="text-sm text-muted-text">لم نجد أي طلبات حجز مطابقة لخيارات الفلترة أو البحث المحددة.</p>
          </div>
        )}
      </div>
    </div>
  )
}
