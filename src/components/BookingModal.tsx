'use client'

import { useState } from 'react'
import { createBookingRequest } from '@/actions/bookings'
import { X, CheckCircle2, MessageSquare, PhoneCall, ShieldCheck, ShieldAlert } from 'lucide-react'
import type { UmrahProgram } from '@/types'

interface BookingModalProps {
  program: UmrahProgram
  isOpen: boolean
  onClose: () => void
}

export default function BookingModal({ program, isOpen, onClose }: BookingModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isWhatsapp, setIsWhatsapp] = useState(true)
  const [roomType, setRoomType] = useState<'ثنائية' | 'ثلاثية' | 'رباعية' | 'خماسية'>('ثنائية')
  const [notes, setNotes] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{
    refNumber: string
    booking: any
  } | null>(null)

  if (!isOpen) return null

  // Get only room types that have prices configured
  const availableRoomTypes = program.room_prices || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (customerName.trim().length < 4) {
      setError('الرجاء إدخال اسمك الكامل الثلاثي (4 أحرف على الأقل).')
      setLoading(false)
      return
    }

    if (!/^0[567][0-9]{8}$/.test(customerPhone.trim())) {
      setError('الرجاء إدخال رقم هاتف جزائري صحيح يتكون من 10 أرقام (يبدأ بـ 05 أو 06 أو 07).')
      setLoading(false)
      return
    }

    const payload = {
      program_id: program.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      is_whatsapp: isWhatsapp,
      room_type: roomType,
      notes: notes || undefined,
    }

    const result = await createBookingRequest(payload)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccessData({
        refNumber: result.referenceNumber!,
        booking: result.booking!
      })
      setLoading(false)
    }
  }

  // Prefilled WhatsApp Link Generator
  const getWhatsAppLink = () => {
    if (!successData || !program.agency) return '#'
    const cleanPhone = program.agency.whatsapp.replace(/^0/, '213')
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله. لقد قمت بطلب حجز لبرنامج العمرة: "${program.title}" عبر منصة عمرة.\nالاسم: ${customerName}\nالهاتف: ${customerPhone}\nنوع الغرفة: غرفة ${roomType}\nالرقم المرجعي للحجز: ${successData.refNumber}`
    )
    return `https://wa.me/${cleanPhone}?text=${message}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-muted-text hover:text-foreground p-1 rounded-lg hover:bg-muted-bg/50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {successData ? (
          /* SUCCESS VIEW */
          <div className="p-6 md:p-8 space-y-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">تم تسجيل طلب حجزك بنجاح!</h3>
              <p className="text-xs text-muted-text">
                لقد قمنا بحفظ بيانات إحالتك لضمان توثيق الحجز وسيقوم ممثلو الوكالة بالتواصل معك قريباً.
              </p>
            </div>

            {/* Reference Number Badge */}
            <div data-testid="ref-badge" className="p-4 rounded-xl bg-muted-bg border border-card-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-text block">الرقم المرجعي للحجز</span>
              <span className="text-2xl font-black text-primary tracking-widest block">{successData.refNumber}</span>
            </div>

            {/* Next Steps Buttons */}
            <div className="space-y-3 pt-2">
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-colors"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span>تواصل فوري عبر الواتساب مع الوكالة</span>
              </a>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-card-border"></div>
                <span className="flex-shrink mx-4 text-xs text-muted-text font-semibold">أو</span>
                <div className="flex-grow border-t border-card-border"></div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl border border-card-border text-sm font-semibold text-muted-text hover:text-foreground hover:bg-muted-bg transition-colors"
              >
                انتظر اتصال الوكالة بك هاتفياً
              </button>
            </div>

            <p className="text-[10px] text-muted-text">
              * تم تزويد الوكالة باسمك ورقم هاتفك للاتصال بك وإتمام إجراءات جواز السفر وملف العمرة. لا يوجد أي عربون مالي مسبق على الموقع.
            </p>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase bg-secondary-light dark:bg-secondary-light/10 px-2.5 py-1 rounded-lg">
                طلب الحجز المجاني
              </span>
              <h3 className="text-lg font-bold text-foreground mt-2">{program.title}</h3>
              <p className="text-xs text-muted-text mt-0.5">
                الوكالة المنظمة: <span className="font-semibold text-foreground">{program.agency?.name}</span>
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-semibold text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  الاسم الكامل (اللقب والاسم) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد بن علي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  رقم الهاتف (الجزائر) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 0550123456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary text-left placeholder-muted-text/30"
                  dir="ltr"
                />
              </div>

              {/* WhatsApp Check */}
              <div className="flex items-center">
                <input
                  id="whatsapp-check"
                  type="checkbox"
                  checked={isWhatsapp}
                  onChange={(e) => setIsWhatsapp(e.target.checked)}
                  className="h-4 w-4 text-primary border-card-border rounded focus:ring-primary"
                />
                <label htmlFor="whatsapp-check" className="mr-2 block text-xs text-muted-text">
                  هذا الرقم مفعل على واتساب (يفضل تفعيله للتواصل الفوري) ✓
                </label>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  نوع الغرفة المطلوب *
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-card text-sm focus:ring-primary"
                >
                  {availableRoomTypes.map((p) => (
                    <option key={p.id} value={p.room_type}>
                      غرفة {p.room_type} (بسعر: {Number(p.price).toLocaleString()} دج)
                    </option>
                  ))}
                  {availableRoomTypes.length === 0 && (
                    <option value="ثنائية">غرفة ثنائية (الرجاء التواصل لمعرفة السعر)</option>
                  )}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: مرافقة كبار السن، الرغبة في مقاعد متجاورة بالطائرة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 border border-card-border rounded-xl bg-transparent text-sm focus:ring-primary focus:border-primary placeholder-muted-text/30"
                />
              </div>
            </div>

            {/* Footer Form info */}
            <div className="flex gap-2.5 text-[10px] text-muted-text leading-relaxed p-3.5 rounded-xl bg-muted-bg/50 border border-card-border">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <span>
                <strong>أمان بياناتك:</strong> سيتم تسجيل وحفظ بيانات الاتصال الخاصة بك في قاعدة المنصة لتأكيد الإحالة، وتظهر للوكالة فقط لتباشر تيسير حجزك.
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t border-card-border">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm shadow transition-colors"
              >
                {loading ? 'جاري تسجيل الطلب...' : 'إرسال طلب الحجز'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-card-border text-sm font-semibold text-muted-text hover:text-foreground hover:bg-muted-bg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
