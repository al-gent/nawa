import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardRouter() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has a professional profile
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profile) {
    redirect('/dashboard/professional')
  } else {
    redirect('/dashboard/client')
  }
}
