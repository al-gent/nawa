import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Create admin client with service role key (bypasses RLS)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Create regular client to check user auth
async function createUserClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// List of admin email addresses (in production, use a database table or role system)
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL, // Set this in your .env.local
].filter(Boolean)

export async function POST(request) {
  try {
    const { professionalId, status, notes } = await request.json()

    // Validate input
    if (!professionalId) {
      return NextResponse.json(
        { error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: approved, rejected, or pending' },
        { status: 400 }
      )
    }

    // Verify user is authenticated and is an admin
    const supabase = await createUserClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    const isAdmin =
      ADMIN_EMAILS.includes(user.email) ||
      user.user_metadata?.role === 'admin' ||
      user.app_metadata?.role === 'admin'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Use admin client to update professional (bypasses RLS)
    const adminClient = createAdminClient()

    const { data, error: updateError } = await adminClient
      .from('professional_profiles')
      .update({
        verification_status: status,
        verification_notes: notes || null,
      })
      .eq('id', professionalId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating professional:', updateError)
      return NextResponse.json(
        { error: 'Failed to update professional status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      professional: data,
      message: `Professional ${status} successfully`,
    })
  } catch (error) {
    console.error('Verify professional error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
