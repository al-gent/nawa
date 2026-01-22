/**
 * Checks Supabase auth configuration
 * Run with: node scripts/check-auth-config.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAuthConfig() {
  console.log('🔍 Checking Supabase Auth Configuration...\n')

  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('\n📧 Email confirmation settings can be checked in:')
  console.log('   Supabase Dashboard > Authentication > Settings > Email Auth')
  console.log('   Look for "Confirm email" setting\n')

  console.log('🔐 If email confirmation is enabled and causing issues:')
  console.log('   1. Go to Supabase Dashboard')
  console.log('   2. Authentication > Settings')
  console.log('   3. Scroll to "Email" section')
  console.log('   4. Disable "Enable email confirmations"')
  console.log('   5. Save changes\n')

  console.log('OR manually confirm users via:')
  console.log('   Authentication > Users > Click user > Confirm email\n')
}

checkAuthConfig()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error.message)
    process.exit(1)
  })
