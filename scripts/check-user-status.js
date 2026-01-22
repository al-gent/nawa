/**
 * Checks user authentication status and confirms unconfirmed users
 * Run with: node scripts/check-user-status.js <email>
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

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

async function checkAndFixUser(email) {
  console.log(`🔍 Checking user: ${email}\n`)

  try {
    // List all users and find the one with this email
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      throw error
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      return
    }

    console.log(`✅ User found!`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'YES ✅' : 'NO ❌'}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`)

    // If email is not confirmed, confirm it
    if (!user.email_confirmed_at) {
      console.log(`\n🔧 Email not confirmed. Confirming now...`)

      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      )

      if (updateError) {
        console.error(`❌ Error confirming email:`, updateError.message)
      } else {
        console.log(`✅ Email confirmed successfully!`)
        console.log(`\nℹ️  The user should now be able to complete onboarding.`)
        console.log(`   Try logging in again at: http://localhost:3000/login`)
      }
    } else {
      console.log(`\n✅ User email is already confirmed.`)
      console.log(`\nℹ️  If you're still getting "Please log in to continue":`)
      console.log(`   1. Clear browser cookies/storage`)
      console.log(`   2. Try logging in again at: http://localhost:3000/login`)
      console.log(`   3. Check browser console for any errors`)
    }

  } catch (error) {
    console.error(`❌ Error:`, error.message)
  }
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.error('Usage: node scripts/check-user-status.js <email>')
  console.error('Example: node scripts/check-user-status.js test@example.com')
  process.exit(1)
}

checkAndFixUser(email)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
