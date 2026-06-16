'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Program Validation Schemas
const programBaseSchema = z.object({
  title: z.string().min(5, 'عنوان البرنامج يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().optional(),
  duration_days: z.number().int().min(1, 'المدة يجب أن تكون يوماً واحداً على الأقل'),
  departure_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'تاريخ الذهاب غير صالح'),
  return_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'تاريخ العودة غير صالح'),
  departure_city: z.string().min(2, 'مدينة الانطلاق مطلوبة'),
  airline: z.string().min(2, 'الخطوط الجوية مطلوبة'),
  seats_available: z.number().int().min(0, 'عدد المقاعد يجب أن يكون موجباً'),
  status: z.enum(['draft', 'active', 'closed']).default('draft'),
})

const hotelSchema = z.object({
  city: z.enum(['مكة', 'المدينة']),
  hotel_name: z.string().min(2, 'اسم الفندق مطلوب'),
  stars: z.number().int().min(1).max(5, 'تصنيف الفندق يجب أن يكون بين 1 و 5 نجوم'),
  distance_meters: z.number().int().min(0, 'المسافة يجب أن تكون موجبة'),
  nights: z.number().int().min(0, 'عدد الليالي غير صالح'),
  board_basis: z.string().optional(),
})

const roomPriceSchema = z.object({
  room_type: z.enum(['ثنائية', 'ثلاثية', 'رباعية', 'خماسية']),
  price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
  commission: z.number().min(0, 'العمولة يجب أن تكون موجبة').default(0),
})

export async function saveProgram(programData: {
  id?: string
  title: string
  description?: string
  duration_days: number
  departure_date: string
  return_date: string
  departure_city: string
  airline: string
  seats_available: number
  status: 'draft' | 'active' | 'closed'
  hotels: Array<{
    city: 'مكة' | 'المدينة'
    hotel_name: string
    stars: number
    distance_meters: number
    nights: number
    board_basis?: string
  }>
  room_prices: Array<{
    room_type: 'ثنائية' | 'ثلاثية' | 'رباعية' | 'خماسية'
    price: number
    commission?: number
  }>
  inclusions: string[]
}) {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح لك بإجراء هذه العملية' }
  }

  // 2. Fetch agency info and ensure it's approved
  const { data: agency } = await supabase
    .from('agencies')
    .select('status')
    .eq('id', user.id)
    .single()

  if (!agency || agency.status !== 'approved') {
    return { error: 'حساب الوكالة غير نشط أو لم يتم تفعيله بعد' }
  }

  // 3. Validate base details
  const baseValidation = programBaseSchema.safeParse(programData)
  if (!baseValidation.success) {
    return { error: baseValidation.error.issues[0].message }
  }

  // 4. Validate hotels
  for (const hotel of programData.hotels) {
    const hotelVal = hotelSchema.safeParse(hotel)
    if (!hotelVal.success) {
      return { error: `الفندق: ${hotelVal.error.issues[0].message}` }
    }
  }

  // 5. Validate prices
  for (const price of programData.room_prices) {
    const priceVal = roomPriceSchema.safeParse(price)
    if (!priceVal.success) {
      return { error: `الأسعار: ${priceVal.error.issues[0].message}` }
    }
  }

  const isUpdate = !!programData.id
  let programId = programData.id

  if (isUpdate) {
    // Check ownership
    const { data: existingProgram } = await supabase
      .from('programs')
      .select('agency_id')
      .eq('id', programId)
      .single()

    if (!existingProgram || existingProgram.agency_id !== user.id) {
      return { error: 'البرنامج غير موجود أو لا تملكه هذه الوكالة' }
    }

    // Update program table
    const { error: updateError } = await adminSupabase
      .from('programs')
      .update({
        title: programData.title,
        description: programData.description,
        duration_days: programData.duration_days,
        departure_date: programData.departure_date,
        return_date: programData.return_date,
        departure_city: programData.departure_city,
        airline: programData.airline,
        seats_available: programData.seats_available,
        status: programData.status,
      })
      .eq('id', programId)

    if (updateError) {
      return { error: 'حدث خطأ أثناء تعديل البرنامج: ' + updateError.message }
    }

    // Delete existing relations to overwrite
    await adminSupabase.from('program_hotels').delete().eq('program_id', programId)
    await adminSupabase.from('program_room_prices').delete().eq('program_id', programId)
    await adminSupabase.from('program_inclusions').delete().eq('program_id', programId)

    // Mark edit request as resolved if it existed and is updated
    await adminSupabase
      .from('edit_requests')
      .update({ status: 'resolved' })
      .eq('program_id', programId)

  } else {
    // Insert new program
    const { data: newProg, error: insertError } = await adminSupabase
      .from('programs')
      .insert({
        agency_id: user.id,
        title: programData.title,
        description: programData.description,
        duration_days: programData.duration_days,
        departure_date: programData.departure_date,
        return_date: programData.return_date,
        departure_city: programData.departure_city,
        airline: programData.airline,
        seats_available: programData.seats_available,
        status: programData.status,
      })
      .select('id')
      .single()

    if (insertError || !newProg) {
      return { error: 'حدث خطأ أثناء حفظ البرنامج: ' + insertError.message }
    }

    programId = newProg.id
  }

  // Insert Program Hotels
  const hotelsToInsert = programData.hotels.map((h) => ({
    program_id: programId,
    city: h.city,
    hotel_name: h.hotel_name,
    stars: h.stars,
    distance_meters: h.distance_meters,
    nights: h.nights,
    board_basis: h.board_basis || 'بدون وجبات',
  }))

  const { error: hotelErr } = await adminSupabase
    .from('program_hotels')
    .insert(hotelsToInsert)

  if (hotelErr) {
    return { error: 'خطأ أثناء إضافة الفنادق: ' + hotelErr.message }
  }

  // Insert Room Prices
  const pricesToInsert = programData.room_prices
    .filter((p) => p.price > 0)
    .map((p) => ({
      program_id: programId,
      room_type: p.room_type,
      price: p.price,
      commission: p.commission || 0,
    }))

  if (pricesToInsert.length > 0) {
    const { error: priceErr } = await adminSupabase
      .from('program_room_prices')
      .insert(pricesToInsert)

    if (priceErr) {
      return { error: 'خطأ أثناء إضافة الأسعار: ' + priceErr.message }
    }
  }

  // Insert Inclusions
  const inclusionsToInsert = programData.inclusions
    .filter((inc) => inc.trim() !== '')
    .map((inc) => ({
      program_id: programId,
      inclusion: inc.trim(),
    }))

  if (inclusionsToInsert.length > 0) {
    const { error: incErr } = await adminSupabase
      .from('program_inclusions')
      .insert(inclusionsToInsert)

    if (incErr) {
      return { error: 'خطأ أثناء إضافة المشمولات: ' + incErr.message }
    }
  }

  revalidatePath('/')
  revalidatePath('/agency/programs')
  return { success: true, programId }
}

export async function deleteProgram(programId: string) {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح لك' }
  }

  // Check ownership
  const { data: existingProgram } = await supabase
    .from('programs')
    .select('agency_id')
    .eq('id', programId)
    .single()

  if (!existingProgram || existingProgram.agency_id !== user.id) {
    return { error: 'البرنامج غير موجود أو لا يخص هذه الوكالة' }
  }

  const { error } = await adminSupabase
    .from('programs')
    .delete()
    .eq('id', programId)

  if (error) {
    return { error: 'فشل حذف البرنامج: ' + error.message }
  }

  revalidatePath('/')
  revalidatePath('/agency/programs')
  return { success: true }
}

export async function updateProgramStatus(programId: string, status: 'draft' | 'active' | 'closed') {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح لك' }
  }

  // Check ownership
  const { data: existingProgram } = await supabase
    .from('programs')
    .select('agency_id')
    .eq('id', programId)
    .single()

  if (!existingProgram || existingProgram.agency_id !== user.id) {
    return { error: 'البرنامج غير موجود أو لا يخص هذه الوكالة' }
  }

  const { error } = await adminSupabase
    .from('programs')
    .update({ status })
    .eq('id', programId)

  if (error) {
    return { error: 'فشل تغيير حالة البرنامج: ' + error.message }
  }

  revalidatePath('/')
  revalidatePath('/agency/programs')
  return { success: true }
}
