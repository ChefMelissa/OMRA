import { createClient } from '@/lib/supabase/server'
import AdminSettlementsManager from '@/components/AdminSettlementsManager'

export const dynamic = 'force-dynamic'

export default async function AdminSettlementsPage() {
  const supabase = createClient()

  // 1. Fetch all settlements with agency info
  const { data: settlements } = await supabase
    .from('commission_settlements')
    .select(`
      *,
      agency:agencies(*)
    `)
    .order('created_at', { ascending: false })

  // 2. Fetch approved agencies list (needed for new settlements creation dropdown)
  const { data: agencies } = await supabase
    .from('agencies')
    .select('*')
    .eq('status', 'approved')
    .order('name', { ascending: true })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">تسويات وفواتير العمولات</h1>
        <p className="text-sm text-muted-text mt-1">
          إصدار التسويات المالية الشهرية للوكالات وتعديل حالة الدفع للعمولات المستحقة للمنصة.
        </p>
      </div>

      <AdminSettlementsManager 
        initialSettlements={settlements || []} 
        agencies={agencies || []} 
      />
    </div>
  )
}
