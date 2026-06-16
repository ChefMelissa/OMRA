'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApproveBooking } from '@/actions/bookings'
import { updateAgencyStatus } from '@/actions/admin'
import { 
  Inbox, CheckCircle2, XCircle, Search, Scale, 
  Phone, ShieldCheck, AlertTriangle, RefreshCw, X, Play 
} from 'lucide-react'

interface AdminBookingsManagerProps {
  initialBookings: any[]
}

export default function AdminBookingsManager({ initialBookings }: AdminBookingsManagerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Audit Tool state
  const [auditList, setAuditList] = useState<any[]>([])
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [auditNotes, setAuditNotes] = useState<Record<string, {
    called: boolean
    valueMatched: boolean
    statusChecked: boolean
    note: string
  }>>({})

  // Filter confirmed booked items
  const confirmedBookings = initialBookings.filter(b => b.status === 'booked')

  const handleApprove = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setError(null)
    setLoading(true)
    const result = await adminApproveBooking(id, status)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      router.refresh()
    }
  }

  // Layer 3: Random Auditing Sample Generator
  const generateAuditSample = () => {
    // Select up to 4 random bookings from confirmed, approved bookings
    const approvedBookings = confirmedBookings.filter(b => b.admin_approval === 'approved')
    if (approvedBookings.length === 0) {
      alert('لا توجد حجوزات معتمدة حالياً لتوليد عينة مطابقة عشوائية منها.')
      return
    }

    const shuffled = [...approvedBookings].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 4)
    
    // Initialize audit notes
    const initialNotes: any = {}
    selected.forEach(b => {
      initialNotes[b.id] = { called: false, valueMatched: false, statusChecked: false, note: '' }
    })
    
    setAuditList(selected)
    setAuditNotes(initialNotes)
    setShowAuditModal(true)
  }

  const handleAuditCheck = (id: string, field: string, value: any) => {
    setAuditNotes(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  // Filter Bookings List
  const filteredBookings = initialBookings.filter(b => {
    const matchesSearch = 
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_phone.includes(searchQuery) ||
      b.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.programs?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.agency?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (filterStatus === 'pending_approval') {
      matchesStatus = b.status === 'booked' && b.admin_approval === 'pending'
    } else if (filterStatus === 'approved') {
      matchesStatus = b.status === 'booked' && b.admin_approval === 'approved'
    } else if (filterStatus === 'rejected') {
      matchesStatus = b.status === 'booked' && b.admin_approval === 'rejected'
    } else if (filterStatus === 'new') {
      matchesStatus = b.status === 'new'
    } else if (filterStatus === 'contacted') {
      matchesStatus = b.status === 'contacted'
    }

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Top Banner: Operations */}
      <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-right">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 justify-center md:justify-start">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            <span>الطبقة 3: المطابقة الدورية العشوائية للعمولات</span>
          </h3>
          <p className="text-xs text-muted-text">اختر عينة عشوائية للاتصال بالمعتمرين للتأكد من نزاهة وصحة المبالغ المدخلة من الوكالات.</p>
        </div>
        
        <button
          type="button"
          onClick={generateAuditSample}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition-colors shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span>توليد عينة المطابقة العشوائية</span>
        </button>
      </div>

      {/* Search and Filters */}
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
            { id: 'pending_approval', label: 'بانتظار الاعتماد (الطبقة 2)' },
            { id: 'approved', label: 'حجوزات معتمدة' },
            { id: 'rejected', label: 'حجوزات مرفوضة' },
            { id: 'new', label: 'طلبات جديدة' },
            { id: 'contacted', label: 'تم التواصل' },
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

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-bold text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => {
            const commissionRate = b.agency?.commission_rate ? Number(b.agency.commission_rate) : 5.0
            const calculatedCommission = b.commission_value !== null && b.commission_value !== undefined
              ? Number(b.commission_value)
              : b.booking_value ? (Number(b.booking_value) * commissionRate) / 100 : 0
            
            return (
              <div 
                key={b.id} 
                className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-shadow animate-fade-in"
              >
                {/* Details Section */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-extrabold text-md text-foreground">{b.customer_name}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted-bg border border-card-border text-muted-text">
                      {b.reference_number}
                    </span>
                    
                    {/* Status details */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'new' 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' 
                        : b.status === 'contacted'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          : b.status === 'booked'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      حالة الوكالة: {b.status === 'new' && 'طلب جديد'}
                      {b.status === 'contacted' && 'تم التواصل'}
                      {b.status === 'booked' && 'تم الحجز'}
                      {b.status === 'cancelled' && 'لم يكتمل'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-text">
                    البرنامج: <span className="font-bold text-foreground">{b.programs?.title || 'برنامج محذوف'}</span> • غرفة {b.room_type}
                  </p>

                  <p className="text-xs text-muted-text">
                    الوكالة المنظمة: <span className="font-bold text-foreground">{b.agency?.name}</span> (نسبة العمولة: {commissionRate}%)
                  </p>

                  <div className="flex gap-4 text-xs font-bold">
                    <a href={`tel:${b.customer_phone}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{b.customer_phone}</span>
                    </a>
                  </div>
                </div>

                {/* Booking Value & Admin Approval Section */}
                <div className="border-t lg:border-t-0 lg:border-r border-card-border pt-4 lg:pt-0 lg:pr-6 flex flex-col justify-center min-w-[260px] gap-3">
                  {b.status === 'booked' ? (
                    <div className="space-y-2 text-center lg:text-right">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-text">قيمة الحجز:</span>
                        <span className="font-extrabold text-foreground">{Number(b.booking_value).toLocaleString()} دج</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-card-border/60 pb-2">
                        <span className="text-muted-text">
                          {b.commission_value !== null && b.commission_value !== undefined
                            ? 'العمولة المستحقة (محددة بالبرنامج):'
                            : `العمولة المستحقة (${commissionRate}%):`}
                        </span>
                        <span className="font-black text-primary">{calculatedCommission.toLocaleString()} دج</span>
                      </div>

                      {/* Approval controls */}
                      <div className="flex gap-2 pt-1">
                        {b.admin_approval === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(b.id, 'approved')}
                              disabled={loading}
                              className="flex-1 py-1.5 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition-colors"
                            >
                              اعتماد الحجز
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(b.id, 'rejected')}
                              disabled={loading}
                              className="flex-1 py-1.5 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors bg-card"
                            >
                              رفض واعتبار ملغى
                            </button>
                          </>
                        ) : (
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded w-full text-center ${
                              b.admin_approval === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                            }`}>
                              اعتماد الإدارة: {b.admin_approval === 'approved' ? 'معتمد ومؤكد ✓' : 'مرفوض ❌'}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleApprove(b.id, 'pending')}
                              className="p-1.5 border border-card-border rounded-lg text-muted-text hover:text-foreground hover:bg-muted-bg"
                              title="إعادة تعيين الحالة لـ قيد المراجعة"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-text text-center">لم يكتمل الحجز الفعلي من الوكالة بعد.</p>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-12 bg-card rounded-2xl border border-card-border space-y-3">
            <Inbox className="h-12 w-12 text-muted-text mx-auto" />
            <h3 className="font-bold text-foreground">لا توجد طلبات حجز معلقة</h3>
            <p className="text-sm text-muted-text">لم يتم العثور على أي نتائج مطابقة لخيارات الفرز الحالية.</p>
          </div>
        )}
      </div>

      {/* Layer 3 Auditing Modal Dialog */}
      {showAuditModal && auditList.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-card border border-card-border rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowAuditModal(false)}
              className="absolute top-4 left-4 text-muted-text hover:text-foreground hover:bg-muted-bg p-1 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-md font-extrabold text-foreground mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>أداة المطابقة والتحقق العشوائي (Layer 3 Auditing)</span>
            </h3>
            <p className="text-xs text-muted-text mb-6">اتصل بالمعتمرين أدناه هاتفياً وتأكد من مطابقة الأسعار والبيانات المدخلة من الوكالة.</p>

            <div className="space-y-4 divide-y divide-card-border">
              {auditList.map((b) => {
                const noteState = auditNotes[b.id] || { called: false, valueMatched: false, statusChecked: false, note: '' }
                return (
                  <div key={b.id} className="pt-4 first:pt-0 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{b.customer_name}</span>
                        <span className="text-[10px] bg-muted-bg border border-card-border px-1.5 py-0.5 rounded font-bold text-muted-text">
                          {b.reference_number}
                        </span>
                      </div>
                      <p className="text-xs text-muted-text">
                        الوكالة: <span className="font-semibold text-foreground">{b.agency?.name}</span> • المبلغ المدخل: <span className="font-black text-primary">{Number(b.booking_value).toLocaleString()} دج</span>
                      </p>
                      <a href={`tel:${b.customer_phone}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline my-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span dir="ltr">{b.customer_phone}</span>
                      </a>
                    </div>

                    {/* Auditor Checkboxes */}
                    <div className="grid grid-cols-3 md:flex md:items-center gap-3 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noteState.called}
                          onChange={(e) => handleAuditCheck(b.id, 'called', e.target.checked)}
                          className="h-4 w-4 text-primary border-card-border rounded focus:ring-primary"
                        />
                        <span>تم الاتصال</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noteState.valueMatched}
                          onChange={(e) => handleAuditCheck(b.id, 'valueMatched', e.target.checked)}
                          className="h-4 w-4 text-primary border-card-border rounded focus:ring-primary"
                        />
                        <span>المبلغ صحيح</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noteState.statusChecked}
                          onChange={(e) => handleAuditCheck(b.id, 'statusChecked', e.target.checked)}
                          className="h-4 w-4 text-primary border-card-border rounded focus:ring-primary"
                        />
                        <span>تأكيد الحجز</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-card-border justify-end">
              <button
                onClick={() => {
                  setShowAuditModal(false)
                  router.refresh()
                }}
                className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                حفظ وإنهاء المطابقة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
