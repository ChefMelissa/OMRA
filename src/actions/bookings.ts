'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Validation Schema for Citizen Bookings
const bookingRequestSchema = z.object({
  program_id: z.string().uuid('معرف البرنامج غير صالح'),
  customer_name: z.string().min(4, 'الاسم الكامل يجب أن يكون 4 أحرف على الأقل'),
  customer_phone: z.string().min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'),
  is_whatsapp: z.boolean().default(false),
  room_type: z.enum(['ثنائية', 'ثلاثية', 'رباعية', 'خماسية']),
  notes: z.string().max(300, 'الملاحظات يجب أن لا تتجاوز 300 حرف').optional(),
})

// Helper to generate reference number
function generateReferenceNumber(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let ref = 'UMR-'
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return ref
}

// 1. Citizen submits booking request
export async function createBookingRequest(bookingData: {
  program_id: string
  customer_name: string
  customer_phone: string
  is_whatsapp: boolean
  room_type: 'ثنائية' | 'ثلاثية' | 'رباعية' | 'خماسية'
  notes?: string
}) {
  const adminSupabase = createAdminClient()

  // Validate
  const validation = bookingRequestSchema.safeParse(bookingData)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Fetch program details to get agency_id
  const { data: program, error: progErr } = await adminSupabase
    .from('programs')
    .select('agency_id, status')
    .eq('id', bookingData.program_id)
    .single()

  if (progErr || !program) {
    return { error: 'البرنامج المطلوب غير متوفر أو تم حذفه' }
  }

  if (program.status !== 'active') {
    return { error: 'عذراً، هذا البرنامج غير متاح حالياً للحجز' }
  }

  // Generate unique reference number (with retry mechanism)
  let referenceNumber = ''
  let attempts = 0
  let isUnique = false

  while (!isUnique && attempts < 5) {
    referenceNumber = generateReferenceNumber()
    const { data: existing } = await adminSupabase
      .from('booking_requests')
      .select('id')
      .eq('reference_number', referenceNumber)
      .maybeSingle()

    if (!existing) {
      isUnique = true
    }
    attempts++
  }

  if (!isUnique) {
    return { error: 'فشل إنشاء رقم مرجعي للحجز، يرجى المحاولة لاحقاً' }
  }

  // Insert booking request
  const { data: newBooking, error: insertErr } = await adminSupabase
    .from('booking_requests')
    .insert({
      reference_number: referenceNumber,
      program_id: bookingData.program_id,
      agency_id: program.agency_id,
      customer_name: bookingData.customer_name,
      customer_phone: bookingData.customer_phone,
      is_whatsapp: bookingData.is_whatsapp,
      room_type: bookingData.room_type,
      notes: bookingData.notes || '',
      status: 'new',
      admin_approval: 'pending',
    })
    .select('*')
    .single()

  if (insertErr) {
    return { error: 'حدث خطأ أثناء حفظ طلب الحجز: ' + insertErr.message }
  }

  if (!newBooking) {
    return { error: 'حدث خطأ غير معروف أثناء حفظ طلب الحجز' }
  }

  // Revalidate lists
  revalidatePath('/agency/bookings')
  revalidatePath('/admin/bookings')

  return { success: true, referenceNumber, booking: newBooking }
}

// 2. Agency updates status (Layer 1 of confirmation)
export async function updateBookingStatus(
  bookingId: string, 
  status: 'new' | 'contacted' | 'booked' | 'cancelled', 
  bookingValue?: number
) {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح لك' }
  }

  // Check booking ownership
  const { data: booking, error: fetchErr } = await supabase
    .from('booking_requests')
    .select('agency_id, program_id, room_type')
    .eq('id', bookingId)
    .single()

  if (fetchErr || !booking || booking.agency_id !== user.id) {
    return { error: 'طلب الحجز غير موجود أو لا ينتمي لوكالتك' }
  }

  // If status is 'booked', bookingValue is mandatory
  if (status === 'booked') {
    if (!bookingValue || bookingValue <= 0) {
      return { error: 'الرجاء إدخال قيمة الحجز الفعلية بالدينار الجزائري لتأكيد الحجز' }
    }
  }

  let commissionValue = null
  if (status === 'booked' && booking.program_id) {
    const { data: roomPrice } = await adminSupabase
      .from('program_room_prices')
      .select('commission')
      .eq('program_id', booking.program_id)
      .eq('room_type', booking.room_type)
      .single()
    
    commissionValue = roomPrice?.commission || 0
  }

  const { error: updateErr } = await adminSupabase
    .from('booking_requests')
    .update({
      status,
      booking_value: status === 'booked' ? bookingValue : null,
      commission_value: status === 'booked' ? commissionValue : null,
      // If status changed from booked, reset approval to pending
      admin_approval: status === 'booked' ? 'pending' : 'pending',
    })
    .eq('id', bookingId)

  if (updateErr) {
    return { error: 'فشل تحديث حالة الحجز: ' + updateErr.message }
  }

  revalidatePath('/agency/bookings')
  revalidatePath('/admin/bookings')
  return { success: true }
}

// 3. Admin approval of booked request (Layer 2 of confirmation)
export async function adminApproveBooking(bookingId: string, approvalStatus: 'approved' | 'rejected' | 'pending') {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح لك' }
  }

  // 2. Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'صلاحيات غير كافية، هذه العملية للمشرفين فقط' }
  }

  // 3. Fetch booking to ensure it's in status 'booked'
  const { data: booking } = await adminSupabase
    .from('booking_requests')
    .select('status, booking_value')
    .eq('id', bookingId)
    .single()

  if (!booking) {
    return { error: 'طلب الحجز غير موجود' }
  }

  if (booking.status !== 'booked') {
    return { error: 'يمكن فقط اعتماد أو رفض الطلبات التي قامت الوكالة بتعليمها كـ "تم الحجز"' }
  }

  // 4. Update approval status
  const { error: updateErr } = await adminSupabase
    .from('booking_requests')
    .update({ admin_approval: approvalStatus })
    .eq('id', bookingId)

  if (updateErr) {
    return { error: 'فشل تغيير حالة الاعتماد: ' + updateErr.message }
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/agency/bookings')
  return { success: true }
}

// 4. Create analytics inquiry
export async function logInquiry(programId: string, type: 'view' | 'whatsapp_click' | 'call_click') {
  const adminSupabase = createAdminClient()
  await adminSupabase.from('inquiries').insert({ program_id: programId, type })
  return { success: true }
}
