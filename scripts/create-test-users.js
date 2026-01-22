/**
 * Creates test users and their professional profiles
 * Run with: node scripts/create-test-users.js
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

const testUsers = [
  {
    email: 'sarah.braids@test.com',
    password: 'password123',
    profile: {
      business_name: "Sarah's Braiding Studio",
      bio: 'Specializing in box braids, cornrows, and Senegalese twists. Over 10 years of experience.',
      service_type: 'Braiding',
      address: '15 Independence Avenue, Windhoek, Namibia',
      lat: -22.5609,
      lng: 17.0658,
      portfolio_images: ['https://images.unsplash.com/photo-1560869713-bf9c0b2e9463?w=400'],
      verification_status: 'approved',
      phone: '+264 81 123 4567'
    },
    services: [
      { name: 'Box Braids', description: 'Classic box braids in various sizes', price: 450.00, duration_minutes: 240 },
      { name: 'Cornrows', description: 'Neat cornrow styles', price: 250.00, duration_minutes: 120 },
      { name: 'Senegalese Twists', description: 'Beautiful Senegalese twist hairstyle', price: 500.00, duration_minutes: 300 }
    ],
    availability: [
      { day_of_week: 1, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 2, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 3, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 4, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 5, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 6, start_time: '09:00', end_time: '16:00' }
    ]
  },
  {
    email: 'john.cuts@test.com',
    password: 'password123',
    profile: {
      business_name: "John's Cuts & Shaves",
      bio: 'Professional barber offering classic cuts, fades, and beard grooming.',
      service_type: 'Barbering',
      address: '42 Sam Nujoma Drive, Windhoek, Namibia',
      lat: -22.5700,
      lng: 17.0836,
      portfolio_images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'],
      verification_status: 'approved',
      phone: '+264 81 234 5678'
    },
    services: [
      { name: 'Classic Haircut', description: 'Traditional barbershop cut', price: 120.00, duration_minutes: 30 },
      { name: 'Fade & Design', description: 'Modern fade with line designs', price: 180.00, duration_minutes: 45 },
      { name: 'Beard Trim', description: 'Professional beard grooming', price: 80.00, duration_minutes: 20 }
    ],
    availability: [
      { day_of_week: 2, start_time: '08:00', end_time: '19:00' },
      { day_of_week: 3, start_time: '08:00', end_time: '19:00' },
      { day_of_week: 4, start_time: '08:00', end_time: '19:00' },
      { day_of_week: 5, start_time: '08:00', end_time: '19:00' },
      { day_of_week: 6, start_time: '08:00', end_time: '20:00' }
    ]
  },
  {
    email: 'maria.tutor@test.com',
    password: 'password123',
    profile: {
      business_name: "Maria's Mathematics & Science Tutoring",
      bio: 'Qualified teacher specializing in high school Mathematics and Physical Science.',
      service_type: 'Tutoring',
      address: '8 Mozart Street, Windhoek, Namibia',
      lat: -22.5500,
      lng: 17.0700,
      verification_status: 'approved',
      phone: '+264 81 345 6789'
    },
    services: [
      { name: 'Mathematics (Grade 8-10)', description: 'Individual tutoring session', price: 200.00, duration_minutes: 60 },
      { name: 'Mathematics (Grade 11-12)', description: 'Advanced mathematics tutoring', price: 250.00, duration_minutes: 60 },
      { name: 'Physical Science', description: 'Physics and Chemistry tutoring', price: 250.00, duration_minutes: 60 }
    ],
    availability: [
      { day_of_week: 1, start_time: '15:00', end_time: '19:00' },
      { day_of_week: 2, start_time: '15:00', end_time: '19:00' },
      { day_of_week: 3, start_time: '15:00', end_time: '19:00' },
      { day_of_week: 4, start_time: '15:00', end_time: '19:00' },
      { day_of_week: 5, start_time: '15:00', end_time: '19:00' }
    ]
  }
]

async function createTestUsers() {
  console.log('🚀 Starting test user creation...\n')

  for (const userData of testUsers) {
    try {
      console.log(`Creating user: ${userData.email}`)

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const userExists = existingUser?.users?.find(u => u.email === userData.email)

      let userId

      if (userExists) {
        console.log(`  ℹ️  User already exists, using existing ID`)
        userId = userExists.id
      } else {
        // Create user with email/password
        const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {}
        })

        if (userError) {
          console.error(`  ❌ Error creating user:`, userError)
          continue
        }

        userId = newUser.user.id
        console.log(`  ✅ User created with ID: ${userId}`)
      }

      // Check if professional profile exists
      const { data: existingProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      let profileId

      if (existingProfile) {
        console.log(`  ℹ️  Professional profile already exists`)
        profileId = existingProfile.id
      } else {
        // Create professional profile
        const { data: profile, error: profileError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: userId,
            ...userData.profile
          })
          .select('id')
          .single()

        if (profileError) {
          console.error(`  ❌ Error creating profile:`, profileError.message)
          continue
        }

        profileId = profile.id
        console.log(`  ✅ Professional profile created`)
      }

      // Check if services already exist
      const { data: existingServices } = await supabase
        .from('services')
        .select('id')
        .eq('professional_id', profileId)

      if (existingServices && existingServices.length > 0) {
        console.log(`  ℹ️  Services already exist (${existingServices.length} services)`)
      } else {
        // Create services
        const servicesData = userData.services.map(service => ({
          professional_id: profileId,
          ...service
        }))

        const { error: servicesError } = await supabase
          .from('services')
          .insert(servicesData)

        if (servicesError) {
          console.error(`  ❌ Error creating services:`, servicesError.message)
        } else {
          console.log(`  ✅ Created ${userData.services.length} services`)
        }
      }

      // Check if availability rules exist
      const { data: existingAvailability } = await supabase
        .from('availability_rules')
        .select('id')
        .eq('professional_id', profileId)

      if (existingAvailability && existingAvailability.length > 0) {
        console.log(`  ℹ️  Availability rules already exist (${existingAvailability.length} rules)`)
      } else {
        // Create availability rules
        const availabilityData = userData.availability.map(rule => ({
          professional_id: profileId,
          ...rule
        }))

        const { error: availabilityError } = await supabase
          .from('availability_rules')
          .insert(availabilityData)

        if (availabilityError) {
          console.error(`  ❌ Error creating availability:`, availabilityError.message)
        } else {
          console.log(`  ✅ Created ${userData.availability.length} availability rules`)
        }
      }

      console.log(`✨ Successfully set up ${userData.email}\n`)

    } catch (error) {
      console.error(`❌ Unexpected error for ${userData.email}:`, error.message)
    }
  }

  console.log('🎉 Test user setup complete!')
  console.log('\nTest Credentials:')
  testUsers.forEach(user => {
    console.log(`  - ${user.email} / ${user.password}`)
  })
}

createTestUsers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
