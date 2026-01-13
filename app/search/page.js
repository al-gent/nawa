import { createClient } from '../../lib/supabase/server'
import { calculateDistance, formatDistance } from '../../lib/utils/geocoding'
import SearchResults from './SearchResults'

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const query = params.q || ''
  const lat = params.lat ? parseFloat(params.lat) : null
  const lng = params.lng ? parseFloat(params.lng) : null
  const location = params.location || ''

  const supabase = await createClient()

  // Fetch all approved professionals with their services
  let professionalsQuery = supabase
    .from('professional_profiles')
    .select(`
      *,
      services (*)
    `)
    .eq('verification_status', 'approved')
    .eq('is_active', true)

  const { data: professionals, error } = await professionalsQuery

  if (error) {
    console.error('Error fetching professionals:', error)
  }

  // Filter and enhance results
  let results = professionals || []

  // Filter by search query (service type or business name)
  if (query) {
    const searchLower = query.toLowerCase()
    results = results.filter(prof => {
      const matchesBusinessName = prof.business_name?.toLowerCase().includes(searchLower)
      const matchesServiceType = prof.service_type?.toLowerCase().includes(searchLower)
      const matchesServices = prof.services?.some(s =>
        s.name?.toLowerCase().includes(searchLower)
      )
      return matchesBusinessName || matchesServiceType || matchesServices
    })
  }

  // Calculate distances if location provided
  if (lat && lng) {
    results = results.map(prof => ({
      ...prof,
      distance: calculateDistance(lat, lng, parseFloat(prof.lat), parseFloat(prof.lng))
    }))

    // Sort by distance by default
    results.sort((a, b) => a.distance - b.distance)
  }

  // Calculate average rating for each professional (placeholder for now)
  results = results.map(prof => ({
    ...prof,
    avgRating: 0, // Will be calculated from reviews later
    reviewCount: 0
  }))

  return (
    <SearchResults
      results={results}
      query={query}
      location={location}
      userLat={lat}
      userLng={lng}
    />
  )
}
