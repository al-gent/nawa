import { createClient } from '../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfessionalDashboard from './ProfessionalDashboard'

export default async function ProfessionalDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch professional profile
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  // Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('professional_id', profile.id)
    .order('created_at')

  // Fetch bookings with client and service details
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(name, price, duration_minutes)
    `)
    .eq('professional_id', profile.id)
    .order('booking_date', { ascending: true })

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('professional_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <ProfessionalDashboard
      user={user}
      profile={profile}
      services={services || []}
      bookings={bookings || []}
      reviews={reviews || []}
    />
  )
}
