/**
 * Setup script to create Supabase Storage buckets
 * Run with: node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nMake sure these are set in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createBucket(bucketName, isPublic = true) {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }

    const bucketExists = buckets.some(b => b.name === bucketName)

    if (bucketExists) {
      console.log(`✓ Bucket "${bucketName}" already exists`)
      return
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB in bytes
    })

    if (error) {
      throw error
    }

    console.log(`✓ Created bucket "${bucketName}"`)
  } catch (error) {
    console.error(`❌ Error creating bucket "${bucketName}":`, error.message)
    throw error
  }
}

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage buckets...\n')

  try {
    // Create portfolio-images bucket
    await createBucket('portfolio-images', true)
    
    console.log('\n✅ Storage setup complete!')
  } catch (error) {
    console.error('\n❌ Storage setup failed:', error.message)
    process.exit(1)
  }
}

setupStorage()

