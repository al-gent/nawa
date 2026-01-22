/**
 * Checks if the database schema has been applied
 * Run with: node scripts/check-database.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Create Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkDatabase() {
  console.log('🔍 Checking database setup...\n')

  // Try to query each table
  const tables = [
    'professional_profiles',
    'services',
    'availability_rules',
    'availability_overrides',
    'bookings',
    'reviews'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1)

      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': exists`)
      }
    } catch (error) {
      console.log(`❌ Table '${table}': ${error.message}`)
    }
  }

  // Check if any users exist
  console.log('\n🔍 Checking auth users...')
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.log(`❌ Auth users: ${error.message}`)
    } else {
      console.log(`✅ Auth is accessible. Found ${users.users.length} user(s)`)

      if (users.users.length > 0) {
        console.log('\nExisting users:')
        users.users.forEach(user => {
          console.log(`  - ${user.email} (ID: ${user.id}, Confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'})`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Auth check failed: ${error.message}`)
  }

  // Check professional profiles
  console.log('\n🔍 Checking professional profiles...')
  try {
    const { data: profiles, error } = await supabase
      .from('professional_profiles')
      .select('id, user_id, business_name, verification_status')

    if (error) {
      console.log(`❌ Professional profiles: ${error.message}`)
    } else {
      console.log(`✅ Found ${profiles.length} professional profile(s)`)

      if (profiles.length > 0) {
        console.log('\nExisting profiles:')
        profiles.forEach(profile => {
          console.log(`  - ${profile.business_name} (Status: ${profile.verification_status})`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Profile check failed: ${error.message}`)
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✨ Database check complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  })
