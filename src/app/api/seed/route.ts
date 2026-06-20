import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminSupabase = createAdminClient()

    // 1. Fetch all existing auth users
    const { data: listData, error: listError } = await adminSupabase.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ 
        error: 'فشل جلب قائمة المستخدمين. هل قمت بإعداد مفتاح SUPABASE_SERVICE_ROLE_KEY بشكل صحيح؟',
        details: listError.message 
      }, { status: 500 })
    }

    const authUsers = listData?.users || []
    const results: string[] = []

    const password = 'password123'

    // ==========================================
    // Seed Admin Account
    // ==========================================
    const adminEmail = 'himasouka02@gmail.com'
    const existingAdminUser = authUsers.find(u => u.email === adminEmail)
    let adminId = existingAdminUser?.id

    if (!adminId) {
      // Create user
      const { data: newAdminUser, error: createAdminErr } = await adminSupabase.auth.admin.createUser({
        email: adminEmail,
        password: password,
        email_confirm: true
      })

      if (createAdminErr || !newAdminUser.user) {
        throw new Error(`فشل إنشاء المسؤول: ${createAdminErr?.message}`)
      }
      adminId = newAdminUser.user.id
      results.push(`تم إنشاء حساب المسؤول بنجاح: ${adminEmail}`)
    } else {
      results.push(`حساب المسؤول موجود مسبقاً: ${adminEmail}`)
    }

    // Ensure profile exists and has 'admin' role
    const { error: adminProfileErr } = await adminSupabase
      .from('profiles')
      .upsert({ id: adminId, role: 'admin' })

    if (adminProfileErr) {
      throw new Error(`فشل تعيين صلاحيات المسؤول: ${adminProfileErr.message}`)
    }
    results.push(`تم تعيين صلاحيات المسؤول للحساب: ${adminEmail}`)


    // ==========================================
    // Seed Mock Agency Accounts
    // ==========================================
    const mockAgencies = [
      {
        email: 'mock.agency1@omra.dz',
        name: 'وكالة النخبة الجزائرية للأسفار',
        license: '1234/2026',
        city: 'الجزائر العاصمة',
        phone: '0550111111',
        whatsapp: '0550111111',
        commission: 5.0
      },
      {
        email: 'mock.agency2@omra.dz',
        name: 'وكالة الهدى للسياحة والأسفار',
        license: '5678/2026',
        city: 'وهران',
        phone: '0660222222',
        whatsapp: '0660222222',
        commission: 5.0
      },
      {
        email: 'mock.agency3@omra.dz',
        name: 'وكالة التيسير للخدمات والعمرة',
        license: '9012/2026',
        city: 'قسنطينة',
        phone: '0770333333',
        whatsapp: '0770333333',
        commission: 6.0
      },
      {
        email: 'mock.agency4@omra.dz',
        name: 'وكالة البراق للأسفار والعمرة',
        license: '3456/2026',
        city: 'عنابة',
        phone: '0550444444',
        whatsapp: '0550444444',
        commission: 5.0
      },
      {
        email: 'mock.agency5@omra.dz',
        name: 'وكالة الأمانة للسياحة الدينية',
        license: '7890/2026',
        city: 'تلمسان',
        phone: '0660555555',
        whatsapp: '0660555555',
        commission: 4.5
      }
    ]

    for (const agency of mockAgencies) {
      const existingUser = authUsers.find(u => u.email === agency.email)
      let agencyUserId = existingUser?.id

      if (!agencyUserId) {
        // Create auth user
        const { data: newU, error: createErr } = await adminSupabase.auth.admin.createUser({
          email: agency.email,
          password: password,
          email_confirm: true
        })

        if (createErr || !newU.user) {
          throw new Error(`فشل إنشاء وكالة ${agency.email}: ${createErr?.message}`)
        }
        agencyUserId = newU.user.id
        results.push(`تم إنشاء حساب الوكالة: ${agency.email}`)
      } else {
        results.push(`حساب الوكالة موجود مسبقاً: ${agency.email}`)
      }

      // Ensure profile role is 'agency'
      await adminSupabase
        .from('profiles')
        .upsert({ id: agencyUserId, role: 'agency' })

      // Insert/Update agency details
      const { error: agencyInsertErr } = await adminSupabase
        .from('agencies')
        .upsert({
          id: agencyUserId,
          name: agency.name,
          license_number: agency.license,
          city: agency.city,
          phone: agency.phone,
          whatsapp: agency.whatsapp,
          email: agency.email,
          status: 'approved', // Auto-approved for test convenience
          commission_rate: agency.commission
        })

      if (agencyInsertErr) {
        throw new Error(`فشل إدخال تفاصيل الوكالة ${agency.email}: ${agencyInsertErr.message}`)
      }
      results.push(`تم تفعيل وتحديث تفاصيل وكالة: ${agency.name}`)
    }

    return NextResponse.json({
      success: 'تم إعداد وتهيئة الحسابات بنجاح!',
      actions: results
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'حدث خطأ أثناء التهيئة',
      details: error.message 
    }, { status: 500 })
  }
}
