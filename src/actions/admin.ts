'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to check admin access
async function ensureAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مصرح لك')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('صلاحيات غير كافية، هذه العملية للمشرفين فقط')
  }
}

// 1. Approve / Reject / Suspend Agency
export async function updateAgencyStatus(
  agencyId: string,
  status: 'approved' | 'rejected' | 'suspended',
  options?: {
    rejectionReason?: string
    commissionRate?: number
  }
) {
  try {
    await ensureAdmin()
    const adminSupabase = createAdminClient()

    const updateData: any = { status }

    if (status === 'rejected' || status === 'suspended') {
      updateData.rejection_reason = options?.rejectionReason || null
    } else {
      updateData.rejection_reason = null
    }

    if (options?.commissionRate !== undefined) {
      updateData.commission_rate = options.commissionRate
    }

    const { error } = await adminSupabase
      .from('agencies')
      .update(updateData)
      .eq('id', agencyId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/agencies')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'حدث خطأ غير متوقع' }
  }
}

// 2. Generate Commission Settlement
export async function generateSettlement(
  agencyId: string,
  startDateStr: string,
  endDateStr: string
) {
  try {
    await ensureAdmin()
    const adminSupabase = createAdminClient()

    // 1. Fetch agency commission rate
    const { data: agency, error: agencyErr } = await adminSupabase
      .from('agencies')
      .select('commission_rate')
      .eq('id', agencyId)
      .single()

    if (agencyErr || !agency) {
      throw new Error('الوكالة المطلوبة غير موجودة')
    }

    // 2. Fetch approved bookings for the agency in the date range
    const { data: bookings, error: bookingsErr } = await adminSupabase
      .from('booking_requests')
      .select('booking_value, commission_value')
      .eq('agency_id', agencyId)
      .eq('status', 'booked')
      .eq('admin_approval', 'approved')
      .gte('created_at', `${startDateStr}T00:00:00Z`)
      .lte('created_at', `${endDateStr}T23:59:59Z`)

    if (bookingsErr) throw new Error(bookingsErr.message)

    const bookingsCount = bookings?.length || 0
    const totalBookingsValue = bookings?.reduce((sum, b) => sum + Number(b.booking_value || 0), 0) || 0
    const totalCommission = bookings?.reduce((sum, b) => {
      const comm = b.commission_value !== null && b.commission_value !== undefined
        ? Number(b.commission_value)
        : (Number(b.booking_value || 0) * Number(agency.commission_rate)) / 100
      return sum + comm
    }, 0) || 0

    if (bookingsCount === 0) {
      return { error: 'لا توجد حجوزات معتمدة ومؤكدة لهذه الفترة لتوليد تسوية لها' }
    }

    // 3. Insert or update settlement
    const { error: insertErr } = await adminSupabase
      .from('commission_settlements')
      .upsert({
        agency_id: agencyId,
        period_start: startDateStr,
        period_end: endDateStr,
        bookings_count: bookingsCount,
        total_bookings_value: totalBookingsValue,
        total_commission: totalCommission,
        status: 'unpaid',
      }, {
        onConflict: 'agency_id,period_start,period_end'
      })

    if (insertErr) throw new Error(insertErr.message)

    revalidatePath('/admin/settlements')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'حدث خطأ أثناء توليد التسوية' }
  }
}

// 3. Mark Settlement as Paid
export async function updateSettlementStatus(settlementId: string, status: 'paid' | 'unpaid') {
  try {
    await ensureAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('commission_settlements')
      .update({ status })
      .eq('id', settlementId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/settlements')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'حدث خطأ أثناء تعديل حالة التسوية' }
  }
}

// 4. Create edit request for programs
export async function createProgramEditRequest(programId: string, notes: string) {
  try {
    await ensureAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('edit_requests')
      .insert({
        program_id: programId,
        admin_notes: notes,
        status: 'pending',
      })

    if (error) throw new Error(error.message)

    // Put program in draft status so it is hidden while waiting for edit
    await adminSupabase
      .from('programs')
      .update({ status: 'draft' })
      .eq('id', programId)

    revalidatePath('/admin/bookings')
    revalidatePath('/agency/programs')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'حدث خطأ' }
  }
}
