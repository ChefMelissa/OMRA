import { createClient } from '@/lib/supabase/server'
import AgencyBookingList from '@/components/AgencyBookingList'
import { Inbox } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AgencyBookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch bookings with programs info
  const { data: bookings } = await supabase
    .from('booking_requests')
    .select(`
      *,
      programs (
        id,
        title
      )
    `)
    .eq('agency_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">طلبات حجز المعتمرين</h1>
        <p className="text-sm text-muted-text mt-1">
          إدارة طلبات الحجز المستلمة من المواطنين. اتصل بالزبون هاتفياً أو عبر واتساب، وأكد حجزهم لتوثيق العمولة.
        </p>
      </div>

      <AgencyBookingList initialBookings={bookings || []} />
    </div>
  )
}
