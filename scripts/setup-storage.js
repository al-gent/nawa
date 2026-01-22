/**
 * Setup script to create Supabase Storage buckets
 * Run with: node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

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

async function setupStoragePolicies() {
  console.log('Setting up storage policies...')

  // Note: Storage policies must be created via SQL in Supabase Dashboard
  // Go to: SQL Editor and run the following:

  const policies = `
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
);

-- Policy: Allow public read access to portfolio images
CREATE POLICY "Public can read portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update own portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete own portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  `

  console.log('\n📋 Storage policies SQL:')
  console.log('─────────────────────────────────────────────────────────')
  console.log(policies)
  console.log('─────────────────────────────────────────────────────────')
  console.log('\n⚠️  Please run the above SQL in your Supabase Dashboard:')
  console.log('   1. Go to https://supabase.com/dashboard')
  console.log('   2. Select your project')
  console.log('   3. Navigate to SQL Editor')
  console.log('   4. Copy and paste the SQL above')
  console.log('   5. Click "Run"\n')
}

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage buckets...\n')

  try {
    // Create portfolio-images bucket
    await createBucket('portfolio-images', true)

    // Show storage policies
    await setupStoragePolicies()

    console.log('\n✅ Storage bucket setup complete!')
  } catch (error) {
    console.error('\n❌ Storage setup failed:', error.message)
    process.exit(1)
  }
}

setupStorage()

