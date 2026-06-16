'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Form Validations
const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  name: z.string().min(3, 'اسم الوكالة يجب أن يكون 3 أحرف على الأقل'),
  licenseNumber: z.string().min(2, 'رقم الرخصة مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  phone: z.string().min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'),
  whatsapp: z.string().min(9, 'رقم الواتساب مطلوب'),
})

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validation = loginSchema.safeParse({ email, password })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = createClient()

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !signInData?.user) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  // Fetch role to redirect correctly
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', signInData.user.id)
    .single()

  revalidatePath('/', 'layout')
  
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/agency/dashboard')
  }
}

export async function registerAgency(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const licenseNumber = formData.get('licenseNumber') as string
  const city = formData.get('city') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string

  const validation = registerSchema.safeParse({
    email,
    password,
    name,
    licenseNumber,
    city,
    phone,
    whatsapp,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = createClient()
  const adminSupabase = createAdminClient()

  // 1. Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    return { error: signUpError.message || 'حدث خطأ أثناء إنشاء الحساب' }
  }

  const userId = signUpData.user?.id
  if (!userId) {
    return { error: 'تعذر الحصول على معرف المستخدم الجديد' }
  }

  // 2. Insert into profiles with role 'agency' (in case trigger was delayed or to ensure it is set)
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .upsert({ id: userId, role: 'agency' })

  if (profileError) {
    return { error: 'حدث خطأ أثناء تعيين صلاحيات الوكالة' }
  }

  // 3. Insert agency details
  const { error: agencyError } = await adminSupabase
    .from('agencies')
    .insert({
      id: userId,
      name,
      license_number: licenseNumber,
      city,
      phone,
      whatsapp,
      email,
      status: 'pending', // Pending admin approval
      commission_rate: 5.0, // Default 5% commission
    })

  if (agencyError) {
    // Cleanup if profile was created but agency insert failed
    await adminSupabase.from('profiles').delete().eq('id', userId)
    // Auth user cleanup can also be done but requires admin auth delete
    return { error: 'حدث خطأ أثناء حفظ بيانات الوكالة: ' + agencyError.message }
  }

  revalidatePath('/', 'layout')
  redirect('/agency/status')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateAgencyProfile(prevState: any, formData: FormData) {
  const supabase = createClient()
  const adminSupabase = createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح لك' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const city = formData.get('city') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const logoUrl = formData.get('logoUrl') as string

  if (!name || !city || !phone || !whatsapp) {
    return { error: 'الرجاء إدخال الحقول الإلزامية الاسم والمدينة والهاتف والواتساب' }
  }

  const { error } = await adminSupabase
    .from('agencies')
    .update({
      name,
      description: description || null,
      city,
      phone,
      whatsapp,
      logo_url: logoUrl || null,
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'فشل تحديث البيانات: ' + error.message }
  }

  revalidatePath('/agency/profile')
  revalidatePath('/agency/dashboard')
  return { success: 'تم تحديث بيانات الملف الشخصي بنجاح!' }
}

