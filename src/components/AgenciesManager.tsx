'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateAgencyStatus } from '@/actions/admin'
import { 
  Users, CheckCircle2, ShieldAlert, AlertTriangle, 
  Search, ShieldX, X, HelpCircle 
} from 'lucide-react'

interface AgenciesManagerProps {
  initialAgencies: any[]
}

export default function AgenciesManager({ initialAgencies }: AgenciesManagerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Action states
  const [activeAgencyId, setActiveAgencyId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | null>(null)
  
  // Fields for approval/rejection
  const [contractSigned, setContractSigned] = useState<boolean>(false)
  const [reason, setReason] = useState<string>('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenAction = (id: string, type: 'approve' | 'reject' | 'suspend') => {
    const agencyObj = initialAgencies.find(a => a.id === id)
    setActiveAgencyId(id)
    setActionType(type)
    setContractSigned(agencyObj?.contract_signed || false)
    setReason('')
    setError(null)
  }

  const handleCloseAction = () => {
    setActiveAgencyId(null)
    setActionType(null)
    setError(null)
  }

  const handleConfirmAction = async () => {
    if (!activeAgencyId || !actionType) return
    setError(null)
    setLoading(true)

    let options: any = {}
    if (actionType === 'approve') {
      options.contractSigned = contractSigned
    } else {
      if (reason.trim().length < 5) {
        setError('يرجى كتابة سبب التوقيف أو الرفض بالتفصيل (5 أحرف على الأقل).')
        setLoading(false)
        return
      }
      options.rejectionReason = reason
    }

    const result = await updateAgencyStatus(
      activeAgencyId, 
      actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'suspended',
      options
    )

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      handleCloseAction()
      setLoading(false)
      router.refresh()
    }
  }

  const filteredAgencies = initialAgencies.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-3.5 h-4 w-4 text-muted-text" />
          <input
            type="text"
            placeholder="البحث بالاسم، الترخيص، المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'طلبات معلقة' },
            { id: 'approved', label: 'الوكالات النشطة' },
            { id: 'rejected', label: 'مرفوضة' },
            { id: 'suspended', label: 'موقوفة' },
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

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.length > 0 ? (
          filteredAgencies.map((agency) => (
            <div 
              key={agency.id} 
              className="bg-card border border-card-border rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-5 hover:shadow-md transition-shadow animate-fade-in"
            >
              {/* Info section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {agency.logo_url ? (
                    <img 
                      src={agency.logo_url} 
                      alt={agency.name} 
                      className="h-12 w-12 rounded-xl object-cover border border-card-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center font-black text-primary text-md shrink-0">
                      {agency.name.substring(0, 2)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h3 className="font-extrabold text-sm text-foreground truncate">{agency.name}</h3>
                    <p className="text-xs text-muted-text">رخصة: {agency.license_number}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-text">
                  <p>الولاية: <span className="font-bold text-foreground">{agency.city}</span></p>
                  <p>الهاتف: <span className="font-bold text-foreground text-left" dir="ltr">{agency.phone}</span></p>
                  <p>البريد: <span className="font-semibold text-foreground truncate block">{agency.email}</span></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      agency.contract_signed 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-900/30' 
                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-900/30'
                    }`}>
                      {agency.contract_signed ? 'العقد: موقّع ✓' : 'العقد: غير موقّع ⚠️'}
                    </span>
                  </div>
                </div>

                {agency.status === 'rejected' && agency.rejection_reason && (
                  <p className="text-[10px] font-medium text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100">
                    <span className="font-bold block mb-0.5">سبب الرفض:</span>
                    {agency.rejection_reason}
                  </p>
                )}

                {agency.status === 'suspended' && agency.rejection_reason && (
                  <p className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-100">
                    <span className="font-bold block mb-0.5">سبب التوقيف:</span>
                    {agency.rejection_reason}
                  </p>
                )}
              </div>

              {/* Actions Section */}
              <div className="border-t border-card-border pt-4 flex gap-2 justify-end">
                {agency.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleOpenAction(agency.id, 'approve')}
                      className="py-1.5 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition-colors"
                    >
                      تفعيل الحساب
                    </button>
                    <button
                      onClick={() => handleOpenAction(agency.id, 'reject')}
                      className="py-1.5 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors bg-card"
                    >
                      رفض الطلب
                    </button>
                  </>
                )}

                {agency.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleOpenAction(agency.id, 'approve')}
                      className="py-1.5 px-3 border border-card-border hover:bg-muted-bg text-xs font-bold rounded-xl transition-all"
                    >
                      تعديل حالة العقد
                    </button>
                    <button
                      onClick={() => handleOpenAction(agency.id, 'suspend')}
                      className="py-1.5 px-3 border border-amber-200 text-amber-600 hover:bg-amber-50 text-xs font-bold rounded-xl transition-colors bg-card"
                    >
                      توقيف مؤقت
                    </button>
                  </>
                )}

                {agency.status === 'suspended' && (
                  <button
                    onClick={() => handleOpenAction(agency.id, 'approve')}
                    className="py-1.5 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    إلغاء التوقيف وتنشيط
                  </button>
                )}

                {agency.status === 'rejected' && (
                  <button
                    onClick={() => handleOpenAction(agency.id, 'approve')}
                    className="py-1.5 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    إعادة قبول وتفعيل
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-card border border-card-border rounded-3xl space-y-3">
            <Users className="h-12 w-12 text-muted-text mx-auto" />
            <h3 className="font-bold text-foreground">لا توجد وكالات مطابقة</h3>
            <p className="text-sm text-muted-text">لم نجد أي وكالة مطابقة لخيارات الفرز والبحث المحددة.</p>
          </div>
        )}
      </div>

      {/* Action Popups (Modal) */}
      {activeAgencyId && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={handleCloseAction}
              className="absolute top-4 left-4 text-muted-text hover:text-foreground hover:bg-muted-bg p-1 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-md font-bold text-foreground mb-4">
              {actionType === 'approve' && 'تأكيد تفعيل حساب الوكالة'}
              {actionType === 'reject' && 'رفض طلب تسجيل الوكالة'}
              {actionType === 'suspend' && 'تعليق حساب الوكالة مؤقتاً'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-bold text-red-600 rounded-xl mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {actionType === 'approve' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-card-border bg-muted-bg/30">
                    <input
                      id="contract-signed-checkbox"
                      type="checkbox"
                      checked={contractSigned}
                      onChange={(e) => setContractSigned(e.target.checked)}
                      className="h-4 w-4 text-primary border-card-border rounded focus:ring-primary mt-0.5"
                    />
                    <div>
                      <label htmlFor="contract-signed-checkbox" className="block text-xs font-bold text-foreground">
                        توقيع الاتفاقية والعقد الرسمي
                      </label>
                      <p className="text-[10px] text-muted-text leading-relaxed">
                        تحديد هذا الخيار يعني أن الوكالة قد قامت بتوقيع العقد القانوني الورقي معنا لضمان مصداقية العروض والأسعار المنشورة.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(actionType === 'reject' || actionType === 'suspend') && (
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    سبب الرفض أو التوقيف للوكالة *
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="اكتب أسباب الرفض بالتفصيل لتظهر للوكالة في صفحة الحالة الخاصة بهم..."
                    className="w-full px-3 py-2.5 border border-card-border rounded-xl text-xs bg-card focus:ring-primary focus:border-primary placeholder-muted-text/30"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-card-border">
                <button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className="flex-grow py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow disabled:opacity-50 transition-colors"
                >
                  {loading ? 'جاري التنفيذ...' : 'تأكيد العملية'}
                </button>
                <button
                  onClick={handleCloseAction}
                  className="py-2.5 px-4 border border-card-border text-muted-text hover:text-foreground text-xs font-bold rounded-xl bg-card hover:bg-muted-bg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
