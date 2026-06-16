import { createClient } from '@/lib/supabase/server'
import AdminBookingsManager from '@/components/AdminBookingsManager'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage() {
  const supabase = createClient()

  // Fetch all bookings with relations
  const { data: bookings } = await supabase
    .from('booking_requests')
    .select(`
      *,
      programs (
        id,
        title
      ),
      agency:agencies(*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">طلبات حجز وتأكيدات العمولة</h1>
        <p className="text-sm text-muted-text mt-1">
          مراجعة واعتماد طلبات حجز المعتمرين لتوثيق العمولات المستحقة للوكالات، وتطبيق أدوات المطابقة الدورية.
        </p>
      </div>

      <AdminBookingsManager initialBookings={bookings || []} />
    </div>
  )
}
