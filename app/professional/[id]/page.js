import { createClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProfileClient from './ProfileClient'

export default async function ProfessionalProfilePage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch professional with services and reviews
  const { data: professional, error } = await supabase
    .from('professional_profiles')
    .select(`
      *,
      services (*),
      reviews (
        id,
        rating,
        comment,
        created_at
      )
    `)
    .eq('id', id)
    .eq('verification_status', 'approved')
    .eq('is_active', true)
    .single()

  if (error || !professional) {
    notFound()
  }

  // Calculate average rating
  const avgRating = professional.reviews?.length > 0
    ? professional.reviews.reduce((sum, r) => sum + r.rating, 0) / professional.reviews.length
    : 0

  // Get availability rules
  const { data: availabilityRules } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('professional_id', id)
    .eq('is_active', true)
    .order('day_of_week')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            NawaConnect
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Search */}
        <Link
          href="/search"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Search
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Portfolio Images */}
              {professional.portfolio_images && professional.portfolio_images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 p-4">
                  {professional.portfolio_images.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${professional.business_name} portfolio ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-8xl">💼</span>
                </div>
              )}

              {/* Business Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {professional.business_name}
                    </h1>
                    <p className="text-lg text-primary-600 font-medium">
                      {professional.service_type}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {avgRating.toFixed(1)}
                      </span>
                      <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      {professional.reviews?.length || 0} reviews
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {professional.bio && (
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {professional.bio}
                  </p>
                )}

                {/* Location */}
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{professional.address}</span>
                </div>

                {/* Phone */}
                {professional.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${professional.phone}`} className="hover:text-primary-600">
                      {professional.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
              <div className="space-y-4">
                {professional.services && professional.services.length > 0 ? (
                  professional.services
                    .filter(s => s.is_active)
                    .map((service) => (
                      <div key={service.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-gray-600 mt-1">{service.description}</p>
                            )}
                          </div>
                          <span className="font-bold text-primary-600 text-lg ml-4">
                            N${service.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Duration: {service.duration_minutes} minutes
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500">No services listed</p>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              {professional.reviews && professional.reviews.length > 0 ? (
                <div className="space-y-4">
                  {professional.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileClient
              professional={professional}
              availabilityRules={availabilityRules}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
