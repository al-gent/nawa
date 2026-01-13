'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Google Places Autocomplete Component
 *
 * @param {Object} props
 * @param {Function} props.onPlaceSelect - Callback when a place is selected
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.defaultValue - Default input value
 */
export default function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = 'Enter a location...',
  className = '',
  defaultValue = '',
}) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        // Check if API key exists
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setError('Google Maps API key not configured')
          return
        }

        // Load Google Maps script manually
        if (!window.google) {
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
          script.async = true
          script.defer = true

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        setIsLoaded(true)

        if (!inputRef.current) return

        // Restrict to Namibia for better results
        const options = {
          componentRestrictions: { country: 'na' },
          fields: ['address_components', 'geometry', 'formatted_address', 'name'],
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          options
        )

        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace()

          if (!place.geometry || !place.geometry.location) {
            setError('No location data available for this place')
            return
          }

          // Extract location data
          const locationData = {
            address: place.formatted_address,
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            addressComponents: place.address_components,
          }

          onPlaceSelect && onPlaceSelect(locationData)
        })
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load Google Maps. Please check your API key.')
      }
    }

    initAutocomplete()

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onPlaceSelect])

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`}
        disabled={!isLoaded}
      />
      {!isLoaded && (
        <p className="text-sm text-gray-500 mt-1">Loading location search...</p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
