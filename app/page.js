'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlacesAutocomplete from '../components/maps/PlacesAutocomplete'
import Header from '../components/ui/Header'

export default function HomePage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedLocation) {
      params.set('lat', selectedLocation.lat)
      params.set('lng', selectedLocation.lng)
      params.set('location', selectedLocation.address)
    }

    router.push(`/search?${params.toString()}`)
  }

  const popularServices = [
    { name: 'Braiding', icon: '💇‍♀️' },
    { name: 'Barbering', icon: '💈' },
    { name: 'Tutoring', icon: '📚' },
    { name: 'Plumbing', icon: '🔧' },
    { name: 'Beauty', icon: '💅' },
    { name: 'Cleaning', icon: '🧹' },
  ]

  const handleServiceClick = (serviceName) => {
    const params = new URLSearchParams()
    params.set('q', serviceName)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Find Trusted Professionals
            <br />
            <span className="text-primary-600">in Namibia</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified braiders, barbers, tutors, plumbers and more.
            Book services instantly with real-time availability.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="space-y-4">
              {/* Service Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What service do you need?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Braiding, Barber, Tutor, Plumber..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Location Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where?
                </label>
                <PlacesAutocomplete
                  placeholder="Enter your location (e.g., Windhoek, Swakopmund...)"
                  onPlaceSelect={setSelectedLocation}
                  className="py-3 text-lg"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Search Professionals
              </button>
            </div>
          </form>

          {/* Popular Services */}
          <div className="mt-8">
            <p className="text-center text-sm text-gray-600 mb-4">Popular Services:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularServices.map((service) => (
                <button
                  key={service.name}
                  onClick={() => handleServiceClick(service.name)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center gap-2"
                >
                  <span>{service.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
          How NawaConnect Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">1. Search</h4>
            <p className="text-gray-600">
              Find professionals by service type and location. Filter by ratings, price, and availability.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">2. Book</h4>
            <p className="text-gray-600">
              View real-time availability and book your appointment instantly. Get confirmation immediately.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">3. Get Service</h4>
            <p className="text-gray-600">
              Meet your professional and enjoy quality service. Leave a review to help others.
            </p>
          </div>
        </div>
      </section>

      {/* For Professionals CTA */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Are you a service professional?
          </h3>
          <p className="text-xl mb-8 text-primary-100">
            Join NawaConnect and grow your business. Manage bookings, showcase your work, and reach more clients.
          </p>
          <a
            href="/signup?type=professional"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Become a Professional
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} NawaConnect. Built for Namibia.
          </p>
        </div>
      </footer>
    </div>
  )
}
