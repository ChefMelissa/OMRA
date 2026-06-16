import { createClient } from '@/lib/supabase/server'
import AgenciesManager from '@/components/AgenciesManager'

export const dynamic = 'force-dynamic'

export default async function AdminAgenciesPage() {
  const supabase = createClient()

  // Fetch all agencies profiles and email
  const { data: agencies } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة الوكالات السياحية</h1>
        <p className="text-sm text-muted-text mt-1">
          مراجعة طلبات الانضمام للوكالات، تفعيل الحسابات، تعيين نسب العمولة، أو إيقاف الحسابات المخالفة للاتفاقيات.
        </p>
      </div>

      <AgenciesManager initialAgencies={agencies || []} />
    </div>
  )
}
