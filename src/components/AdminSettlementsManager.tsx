'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSettlement, updateSettlementStatus } from '@/actions/admin'
import { 
  DollarSign, CheckCircle2, ShieldAlert, Search, 
  X, Calendar, Plus, PlusCircle, RefreshCw 
} from 'lucide-react'

interface AdminSettlementsManagerProps {
  initialSettlements: any[]
  agencies: any[]
}

export default function AdminSettlementsManager({ 
  initialSettlements, 
  agencies 
}: AdminSettlementsManagerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Generate form states
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedAgencyId, setSelectedAgencyId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOpenGenerate = () => {
    setSelectedAgencyId('')
    setStartDate('')
    setEndDate('')
    setError(null)
    setSuccess(null)
    setShowGenerateModal(true)
  }

  const handleCloseGenerate = () => {
    setShowGenerateModal(false)
    setError(null)
    setSuccess(null)
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!selectedAgencyId) {
      setError('يرجى اختيار الوكالة السياحية.')
      setLoading(false)
      return
    }

    if (!startDate || !endDate) {
      setError('يرجى تحديد تواريخ الفترة المطلوبة بالكامل.')
      setLoading(false)
      return
    }

    const result = await generateSettlement(selectedAgencyId, startDate, endDate)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess('تم توليد تسوية العمولات بنجاح للمدة المحددة!')
      setLoading(false)
      router.refresh()
      setTimeout(() => {
        handleCloseGenerate()
      }, 1500)
    }
  }

  const handleTogglePaid = async (id: string, currentStatus: 'paid' | 'unpaid') => {
    setLoading(true)
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid'
    const result = await updateSettlementStatus(id, newStatus)
    if (result.error) {
      alert(result.error)
    }
    setLoading(false)
    router.refresh()
  }

  // Filters
  const filteredSettlements = initialSettlements.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    const matchesSearch = 
      (s.agency?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.agency?.license_number || '').toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Button */}
      <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-right">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 justify-center md:justify-start">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>نظام إعداد التسويات وكشوفات المبالغ</span>
          </h3>
          <p className="text-xs text-muted-text">قم بتجميع العمولات والتحقق من المبالغ المدفوعة وتوليد تسويات شهرية لكل وكالة.</p>
        </div>
        
        <button
          type="button"
          onClick={handleOpenGenerate}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>توليد تسوية جديدة</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-3.5 h-4 w-4 text-muted-text" />
          <input
            type="text"
            placeholder="البحث باسم الوكالة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'unpaid', label: 'مستحقة غير مدفوعة' },
            { id: 'paid', label: 'تم تسويتها (مدفوعة)' },
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

      {/* Settlements List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSettlements.length > 0 ? (
          filteredSettlements.map((s) => (
            <div 
              key={s.id} 
              className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow animate-fade-in"
            >
              {/* Info section */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-extrabold text-md text-foreground">{s.agency?.name}</h3>
                  <span className="text-xs text-muted-text">رخصة: {s.agency?.license_number}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    s.status === 'paid' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                  }`}>
                    {s.status === 'paid' ? 'خالص / تم تسليم المبلغ' : 'مستحق الدفع'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-text">
                  <div>
                    <span>فترة التسوية:</span>
                    <p className="font-bold text-foreground mt-0.5">من {s.period_start} إلى {s.period_end}</p>
                  </div>
                  <div>
                    <span>عدد الحجوزات المؤكدة:</span>
                    <p className="font-bold text-foreground mt-0.5">{s.bookings_count} حجوزات</p>
                  </div>
                  <div>
                    <span>إجمالي قيمة الحجوزات:</span>
                    <p className="font-bold text-foreground mt-0.5">{Number(s.total_bookings_value).toLocaleString()} دج</p>
                  </div>
                  <div>
                    <span>العمولة الافتراضية للوكالة:</span>
                    <p className="font-bold text-foreground mt-0.5">{s.agency?.commission_rate || 5.0}%</p>
                  </div>
                </div>
              </div>

              {/* Commission amount and action button */}
              <div className="border-t md:border-t-0 md:border-r border-card-border pt-4 md:pt-0 md:pr-6 flex flex-row md:flex-col justify-between items-center md:justify-center md:w-52 shrink-0 gap-4">
                <div className="text-center md:space-y-0.5">
                  <span className="text-[10px] text-muted-text">العمولة الكلية للمنصة:</span>
                  <p className="text-lg font-black text-secondary">
                    {Number(s.total_commission).toLocaleString()} دج
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTogglePaid(s.id, s.status)}
                  className={`w-full md:w-auto py-2 px-4 rounded-xl text-xs font-bold shadow transition-all ${
                    s.status === 'paid'
                      ? 'border border-card-border text-muted-text hover:text-foreground bg-card hover:bg-muted-bg'
                      : 'bg-primary hover:bg-primary-hover text-white'
                  }`}
                >
                  {s.status === 'paid' ? 'تراجع لـ غير مدفوع' : 'تعليم كـ تم الدفع ✓'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 bg-card rounded-2xl border border-card-border space-y-3">
            <DollarSign className="h-12 w-12 text-muted-text mx-auto" />
            <h3 className="font-bold text-foreground">لا توجد تسويات عمولات</h3>
            <p className="text-sm text-muted-text">لم نعثر على أي تسوية مطابقة للخيارات الحالية.</p>
          </div>
        )}
      </div>

      {/* Generate Settlement Modal Dialog */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={handleCloseGenerate}
              className="absolute top-4 left-4 text-muted-text hover:text-foreground hover:bg-muted-bg p-1 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-md font-extrabold text-foreground mb-4 flex items-center gap-1.5">
              <PlusCircle className="h-5 w-5 text-primary" />
              <span>توليد تسوية عمولات جديدة</span>
            </h3>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-bold text-red-600 rounded-xl mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-xs font-bold text-emerald-600 rounded-xl mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Select Agency */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  اختر الوكالة السياحية *
                </label>
                <select
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-card text-xs focus:ring-primary"
                  required
                >
                  <option value="">-- اختر الوكالة --</option>
                  {agencies.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (رخصة {a.license_number})</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  بداية فترة الفاتورة (التسوية) *
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-text" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 border border-card-border rounded-xl text-xs bg-card focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  نهاية فترة الفاتورة (التسوية) *
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-text" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 border border-card-border rounded-xl text-xs bg-card focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-card-border">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow disabled:opacity-50 transition-colors"
                >
                  {loading ? 'جاري الاحتساب وتوليد التسوية...' : 'توليد التسوية الآن'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseGenerate}
                  className="py-2.5 px-4 border border-card-border text-muted-text hover:text-foreground text-xs font-bold rounded-xl bg-card hover:bg-muted-bg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
