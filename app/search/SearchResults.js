'use client'

import { useState } from 'react'
import { formatDistance } from '../../lib/utils/geocoding'
import Link from 'next/link'

export default function SearchResults({ results, query, location, userLat, userLng }) {
  const [sortBy, setSortBy] = useState('distance')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [filteredResults, setFilteredResults] = useState(results)

  const handleSort = (value) => {
    setSortBy(value)
    let sorted = [...filteredResults]

    switch (value) {
      case 'distance':
        sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        break
      case 'rating':
        sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
        break
      case 'price-low':
        sorted.sort((a, b) => {
          const minA = Math.min(...(a.services?.map(s => s.price) || [0]))
          const minB = Math.min(...(b.services?.map(s => s.price) || [0]))
          return minA - minB
        })
        break
      case 'price-high':
        sorted.sort((a, b) => {
          const maxA = Math.max(...(a.services?.map(s => s.price) || [0]))
          const maxB = Math.max(...(b.services?.map(s => s.price) || [0]))
          return maxB - maxA
        })
        break
    }

    setFilteredResults(sorted)
  }

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

      {/* Search Summary */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Results for "${query}"` : 'All Professionals'}
          </h1>
          {location && (
            <p className="text-gray-600 mt-1">Near {location}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {filteredResults.length} {filteredResults.length === 1 ? 'professional' : 'professionals'} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="font-semibold text-lg mb-4">Sort & Filter</h2>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {userLat && userLng && (
                    <option value="distance">Distance</option>
                  )}
                  <option value="rating">Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="text-sm text-gray-600">
                  N${priceRange[0]} - N${priceRange[1]}
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full mt-2"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setPriceRange([0, 10000])
                  setFilteredResults(results)
                }}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            {filteredResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <Link
                  href="/"
                  className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredResults.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    showDistance={Boolean(userLat && userLng)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function ProfessionalCard({ professional, showDistance }) {
  const minPrice = Math.min(...(professional.services?.map(s => s.price) || [0]))
  const portfolioImage = professional.portfolio_images?.[0]

  return (
    <Link href={`/professional/${professional.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer overflow-hidden h-full">
        {/* Image */}
        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative">
          {portfolioImage ? (
            <img
              src={portfolioImage}
              alt={professional.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl">💼</span>
            </div>
          )}
          {showDistance && professional.distance !== undefined && (
            <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-medium shadow">
              {formatDistance(professional.distance)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {professional.business_name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {professional.service_type}
          </p>

          {professional.bio && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {professional.bio}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(professional.avgRating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({professional.reviewCount || 0})
            </span>
          </div>

          {/* Services Count & Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {professional.services?.length || 0} services
            </span>
            {minPrice > 0 && (
              <span className="font-semibold text-primary-600">
                From N${minPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
