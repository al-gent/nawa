import { createClient } from '../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientDashboard from './ClientDashboard'

export default async function ClientDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's bookings with professional and service details
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      professional:professional_profiles(
        business_name,
        location_address,
        phone,
        user_id
      ),
      service:services(
        name,
        price,
        duration_minutes
      )
    `)
    .eq('client_id', user.id)
    .order('booking_date', { ascending: true })

  return <ClientDashboard user={user} bookings={bookings || []} />
}
