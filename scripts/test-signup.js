/**
 * Tests signup functionality
 * Run with: node scripts/test-signup.js <email> <password>
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testSignup(email, password) {
  console.log(`🧪 Testing signup with: ${email}\n`)

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: 'Test User',
          account_type: 'professional'
        }
      }
    })

    if (error) {
      console.error(`❌ Signup failed:`, error.message)
      console.error(`   Error code:`, error.code || 'unknown')
      return
    }

    console.log(`✅ Signup successful!`)
    console.log(`   User ID: ${data.user?.id}`)
    console.log(`   Email: ${data.user?.email}`)
    console.log(`   Email Confirmed: ${data.user?.email_confirmed_at ? 'YES' : 'NO'}`)
    console.log(`   Session: ${data.session ? 'YES ✅' : 'NO ❌'}`)

    if (!data.session) {
      console.log(`\n⚠️  No session created - email confirmation is likely required`)
      console.log(`   Check Supabase Dashboard > Authentication > Settings`)
      console.log(`   Look for "Enable email confirmations" setting`)
    }

  } catch (error) {
    console.error(`❌ Unexpected error:`, error.message)
  }
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('❌ Please provide email and password')
  console.error('Usage: node scripts/test-signup.js <email> <password>')
  console.error('Example: node scripts/test-signup.js test@example.com password123')
  process.exit(1)
}

testSignup(email, password)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
