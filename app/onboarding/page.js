'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import PlacesAutocomplete from '../../components/maps/PlacesAutocomplete'
import ImageUpload from '../../components/forms/ImageUpload'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    businessName: '',
    serviceType: '',
    bio: '',
    phone: '',
    address: '',
    lat: null,
    lng: null,
    services: [],
    portfolioImages: [],
    verificationDocuments: [],
  })

  // Temporary service form
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  })

  const steps = [
    { number: 1, name: 'Basic Info', description: 'Tell us about your business' },
    { number: 2, name: 'Location', description: 'Where do you operate?' },
    { number: 3, name: 'Services', description: 'What services do you offer?' },
    { number: 4, name: 'Portfolio', description: 'Show your work' },
    { number: 5, name: 'Review', description: 'Review and submit' },
  ]

  const serviceTypes = [
    'Braiding',
    'Barbering',
    'Tutoring',
    'Plumbing',
    'Beauty',
    'Cleaning',
    'Catering',
    'Photography',
    'Other'
  ]

  const handleNext = () => {
    setError(null)

    // Validation for each step
    if (currentStep === 1) {
      if (!formData.businessName || !formData.serviceType || !formData.phone) {
        setError('Please fill in all required fields')
        return
      }
    }

    if (currentStep === 2) {
      if (!formData.address || !formData.lat || !formData.lng) {
        setError('Please select a location from the dropdown')
        return
      }
    }

    if (currentStep === 3) {
      if (formData.services.length === 0) {
        setError('Please add at least one service')
        return
      }
    }

    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep(currentStep - 1)
  }

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
    })
  }

  const addService = () => {
    if (!newService.name || !newService.price || !newService.duration) {
      setError('Please fill in all service fields')
      return
    }

    setFormData({
      ...formData,
      services: [...formData.services, { ...newService, id: Date.now() }],
    })

    setNewService({ name: '', description: '', price: '', duration: '' })
    setError(null)
  }

  const removeService = (id) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s.id !== id),
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Please log in to continue')
        setLoading(false)
        return
      }

      // Create professional profile
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .insert([{
          user_id: user.id,
          business_name: formData.businessName,
          service_type: formData.serviceType,
          bio: formData.bio,
          phone: formData.phone,
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng,
          portfolio_images: formData.portfolioImages,
          verification_documents: formData.verificationDocuments,
          verification_status: 'pending',
        }])
        .select()
        .single()

      if (profileError) throw profileError

      // Create services
      const servicesData = formData.services.map(service => ({
        professional_id: profile.id,
        name: service.name,
        description: service.description,
        price: parseFloat(service.price),
        duration_minutes: parseInt(service.duration),
      }))

      const { error: servicesError } = await supabase
        .from('services')
        .insert(servicesData)

      if (servicesError) throw servicesError

      // Success! Redirect to dashboard
      router.push('/dashboard/professional?success=true')

    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Failed to create profile')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary-600">
            NawaConnect
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep - 1].name}
          </h2>
          <p className="text-gray-600 mb-6">
            {steps[currentStep - 1].description}
          </p>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g., Sarah's Braiding Studio"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a service type...</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+264 81 123 4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell potential clients about your business, experience, and what makes you unique..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <PlacesAutocomplete
                  placeholder="Search for your business location..."
                  onPlaceSelect={handleLocationSelect}
                  defaultValue={formData.address}
                />
                {formData.address && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Location selected: {formData.address}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  This helps clients find you and see professionals near them
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Existing Services */}
              {formData.services.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Your Services</h3>
                  {formData.services.map((service) => (
                    <div key={service.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          N${service.price} • {service.duration} minutes
                        </p>
                      </div>
                      <button
                        onClick={() => removeService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Service */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Add a Service</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="e.g., Box Braids"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Describe this service..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (N$) *
                      </label>
                      <input
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        placeholder="450"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        value={newService.duration}
                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                        placeholder="240"
                        min="15"
                        step="15"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addService}
                    type="button"
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    + Add Service
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Portfolio */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Upload photos of your work to showcase your skills (optional but recommended)
              </p>
              <ImageUpload
                bucket="portfolio-images"
                folder="portfolios"
                onUploadComplete={(urls) => {
                  setFormData({ ...formData, portfolioImages: [...formData.portfolioImages, ...urls] })
                }}
                maxFiles={6}
                label="Portfolio Images (Up to 6)"
              />
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Your profile will be reviewed by our admin team before going live. This usually takes 1-2 business days.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Business Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Business Name:</span> {formData.businessName}</p>
                    <p><span className="font-medium">Service Type:</span> {formData.serviceType}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                    {formData.bio && <p><span className="font-medium">Bio:</span> {formData.bio}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{formData.address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Services ({formData.services.length})</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {formData.services.map((service, idx) => (
                      <p key={idx}>
                        {service.name} - N${service.price} ({service.duration} min)
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Portfolio</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{formData.portfolioImages.length} images uploaded</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
