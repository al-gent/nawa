  -- =====================================================
  -- SEED DATA WITH AUTH USERS
  -- =====================================================
  -- Creates auth users AND professional profiles in one go

  DO $$
  DECLARE
    user_sarah UUID;
    user_john UUID;
    user_maria UUID;
    user_david UUID;
    user_alice UUID;

    prof_sarah UUID;
    prof_john UUID;
    prof_maria UUID;
    prof_david UUID;
    prof_alice UUID;
  BEGIN

  -- =====================================================
  -- CREATE AUTH USERS
  -- =====================================================

  -- Sarah
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    'sarah.braids@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) RETURNING id INTO user_sarah;

  -- John
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    'john.cuts@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) RETURNING id INTO user_john;

  -- Maria
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    'maria.tutor@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) RETURNING id INTO user_maria;

  -- David
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    'david.plumber@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) RETURNING id INTO user_david;

  -- Alice
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    'alice.nails@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) RETURNING id INTO user_alice;

  -- Also create identities for each user
  INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_sarah, user_sarah::text, 'email', jsonb_build_object('sub', user_sarah::text), NOW(), NOW(), NOW()),
    (gen_random_uuid(), user_john, user_john::text, 'email', jsonb_build_object('sub', user_john::text), NOW(), NOW(), NOW()),
    (gen_random_uuid(), user_maria, user_maria::text, 'email', jsonb_build_object('sub', user_maria::text), NOW(), NOW(), NOW()),
    (gen_random_uuid(), user_david, user_david::text, 'email', jsonb_build_object('sub', user_david::text), NOW(), NOW(), NOW()),
    (gen_random_uuid(), user_alice, user_alice::text, 'email', jsonb_build_object('sub', user_alice::text), NOW(), NOW(), NOW());

  -- =====================================================
  -- PROFESSIONAL PROFILES
  -- =====================================================

  -- Sarah's Braiding Studio (Windhoek)
  INSERT INTO professional_profiles (
    user_id, business_name, bio, service_type, address, lat, lng,
    portfolio_images, verification_status, phone
  ) VALUES (
    user_sarah,
    'Sarah''s Braiding Studio',
    'Specializing in box braids, cornrows, and Senegalese twists. Over 10 years of experience.',
    'Braiding',
    '15 Independence Avenue, Windhoek, Namibia',
    -22.5609, 17.0658,
    ARRAY['https://images.unsplash.com/photo-1560869713-bf9c0b2e9463?w=400'],
    'approved',
    '+264 81 123 4567'
  ) RETURNING id INTO prof_sarah;

  -- John's Cuts (Windhoek)
  INSERT INTO professional_profiles (
    user_id, business_name, bio, service_type, address, lat, lng,
    portfolio_images, verification_status, phone
  ) VALUES (
    user_john,
    'John''s Cuts & Shaves',
    'Professional barber offering classic cuts, fades, and beard grooming.',
    'Barbering',
    '42 Sam Nujoma Drive, Windhoek, Namibia',
    -22.5700, 17.0836,
    ARRAY['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'],
    'approved',
    '+264 81 234 5678'
  ) RETURNING id INTO prof_john;

  -- Maria's Tutoring (Windhoek)
  INSERT INTO professional_profiles (
    user_id, business_name, bio, service_type, address, lat, lng,
    verification_status, phone
  ) VALUES (
    user_maria,
    'Maria''s Mathematics & Science Tutoring',
    'Qualified teacher specializing in high school Mathematics and Physical Science.',
    'Tutoring',
    '8 Mozart Street, Windhoek, Namibia',
    -22.5500, 17.0700,
    'approved',
    '+264 81 345 6789'
  ) RETURNING id INTO prof_maria;

  -- David's Plumbing (Swakopmund)
  INSERT INTO professional_profiles (
    user_id, business_name, bio, service_type, address, lat, lng,
    verification_status, phone
  ) VALUES (
    user_david,
    'David''s Reliable Plumbing Services',
    'Licensed plumber with 15 years experience. Emergency services available.',
    'Plumbing',
    '12 Nathaniel Maxuilili Street, Swakopmund, Namibia',
    -22.6792, 14.5272,
    'approved',
    '+264 81 456 7890'
  ) RETURNING id INTO prof_david;

  -- Alice's Nails (Swakopmund)
  INSERT INTO professional_profiles (
    user_id, business_name, bio, service_type, address, lat, lng,
    portfolio_images, verification_status, phone
  ) VALUES (
    user_alice,
    'Alice''s Nail Art Studio',
    'Creative nail designs, manicures, pedicures, and gel extensions.',
    'Beauty',
    '5 Sam Nujoma Avenue, Swakopmund, Namibia',
    -22.6739, 14.5329,
    ARRAY['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'],
    'approved',
    '+264 81 567 8901'
  ) RETURNING id INTO prof_alice;

  -- =====================================================
  -- SERVICES
  -- =====================================================

  -- Sarah's services
  INSERT INTO services (professional_id, name, description, price, duration_minutes) VALUES
    (prof_sarah, 'Box Braids', 'Classic box braids in various sizes', 450.00, 240),
    (prof_sarah, 'Cornrows', 'Neat cornrow styles', 250.00, 120),
    (prof_sarah, 'Senegalese Twists', 'Beautiful Senegalese twist hairstyle', 500.00, 300);

  -- John's services
  INSERT INTO services (professional_id, name, description, price, duration_minutes) VALUES
    (prof_john, 'Classic Haircut', 'Traditional barbershop cut', 120.00, 30),
    (prof_john, 'Fade & Design', 'Modern fade with line designs', 180.00, 45),
    (prof_john, 'Beard Trim', 'Professional beard grooming', 80.00, 20);

  -- Maria's services
  INSERT INTO services (professional_id, name, description, price, duration_minutes) VALUES
    (prof_maria, 'Mathematics (Grade 8-10)', 'Individual tutoring session', 200.00, 60),
    (prof_maria, 'Mathematics (Grade 11-12)', 'Advanced mathematics tutoring', 250.00, 60),
    (prof_maria, 'Physical Science', 'Physics and Chemistry tutoring', 250.00, 60);

  -- David's services
  INSERT INTO services (professional_id, name, description, price, duration_minutes) VALUES
    (prof_david, 'Leak Repair', 'Fix leaking pipes and faucets', 350.00, 60),
    (prof_david, 'Drain Cleaning', 'Clear blocked drains', 400.00, 90),
    (prof_david, 'Emergency Callout', '24/7 emergency service', 800.00, 60);

  -- Alice's services
  INSERT INTO services (professional_id, name, description, price, duration_minutes) VALUES
    (prof_alice, 'Classic Manicure', 'File, shape, polish', 150.00, 45),
    (prof_alice, 'Gel Manicure', 'Long-lasting gel polish', 220.00, 60),
    (prof_alice, 'Nail Art Design', 'Custom creative designs', 280.00, 75);

  -- =====================================================
  -- AVAILABILITY RULES
  -- =====================================================

  -- Sarah's availability (Mon-Sat, 9am-6pm)
  INSERT INTO availability_rules (professional_id, day_of_week, start_time, end_time) VALUES
    (prof_sarah, 1, '09:00', '18:00'),
    (prof_sarah, 2, '09:00', '18:00'),
    (prof_sarah, 3, '09:00', '18:00'),
    (prof_sarah, 4, '09:00', '18:00'),
    (prof_sarah, 5, '09:00', '18:00'),
    (prof_sarah, 6, '09:00', '16:00');

  -- John's availability (Tue-Sat, 8am-7pm)
  INSERT INTO availability_rules (professional_id, day_of_week, start_time, end_time) VALUES
    (prof_john, 2, '08:00', '19:00'),
    (prof_john, 3, '08:00', '19:00'),
    (prof_john, 4, '08:00', '19:00'),
    (prof_john, 5, '08:00', '19:00'),
    (prof_john, 6, '08:00', '20:00');

  -- Maria's availability (Mon-Fri, 3pm-7pm)
  INSERT INTO availability_rules (professional_id, day_of_week, start_time, end_time) VALUES
    (prof_maria, 1, '15:00', '19:00'),
    (prof_maria, 2, '15:00', '19:00'),
    (prof_maria, 3, '15:00', '19:00'),
    (prof_maria, 4, '15:00', '19:00'),
    (prof_maria, 5, '15:00', '19:00');

  -- David's availability (Mon-Fri, 7am-5pm)
  INSERT INTO availability_rules (professional_id, day_of_week, start_time, end_time) VALUES
    (prof_david, 1, '07:00', '17:00'),
    (prof_david, 2, '07:00', '17:00'),
    (prof_david, 3, '07:00', '17:00'),
    (prof_david, 4, '07:00', '17:00'),
    (prof_david, 5, '07:00', '17:00');

  -- Alice's availability (Mon-Sat, 10am-8pm)
  INSERT INTO availability_rules (professional_id, day_of_week, start_time, end_time) VALUES
    (prof_alice, 1, '10:00', '20:00'),
    (prof_alice, 2, '10:00', '20:00'),
    (prof_alice, 3, '10:00', '20:00'),
    (prof_alice, 4, '10:00', '20:00'),
    (prof_alice, 5, '10:00', '20:00'),
    (prof_alice, 6, '10:00', '18:00');

  END $$;
