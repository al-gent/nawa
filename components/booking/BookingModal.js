'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function BookingModal({ professional, services, isOpen, onClose }) {
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [locationType, setLocationType] = useState('shop')
  const [clientLocation, setClientLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedService])

  const fetchAvailableSlots = async () => {
    const date = new Date(selectedDate)
    const dayOfWeek = date.getDay()

    // Get availability rules for this day
    const { data: rules } = await supabase
      .from('availability_rules')
      .select('*')
      .eq('professional_id', professional.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)

    if (!rules || rules.length === 0) {
      setAvailableSlots([])
      return
    }

    // Get existing bookings for this date
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('professional_id', professional.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .in('status', ['pending', 'confirmed'])

    // Generate time slots
    const slots = []
    const service = services.find(s => s.id === selectedService)
    const duration = service.duration_minutes

    rules.forEach(rule => {
      const [startHour, startMin] = rule.start_time.split(':').map(Number)
      const [endHour, endMin] = rule.end_time.split(':').map(Number)

      let currentTime = startHour * 60 + startMin // minutes since midnight
      const endTime = endHour * 60 + endMin

      while (currentTime + duration <= endTime) {
        const slotStart = new Date(selectedDate)
        slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0)

        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)

        // Check if slot conflicts with existing bookings
        const hasConflict = bookings?.some(booking => {
          const bookingStart = new Date(booking.start_time)
          const bookingEnd = new Date(booking.end_time)
          return (slotStart < bookingEnd && slotEnd > bookingStart)
        })

        if (!hasConflict) {
          slots.push({
            time: slotStart.toTimeString().slice(0, 5),
            datetime: slotStart.toISOString()
          })
        }

        currentTime += 30 // 30-minute intervals
      }
    })

    setAvailableSlots(slots)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login - for now just show error
        setError('Please log in to book a service')
        setLoading(false)
        return
      }

      const service = services.find(s => s.id === selectedService)
      const startTime = new Date(`${selectedDate}T${selectedTime}`)
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + service.duration_minutes)

      const bookingData = {
        client_id: user.id,
        professional_id: professional.id,
        service_id: selectedService,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location_type: locationType,
        client_location: locationType === 'mobile' ? clientLocation : null,
        client_notes: notes,
        status: 'pending'
      }

      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single()

      if (bookingError) throw bookingError

      setSuccess(true)
      setTimeout(() => {
        onClose()
        // Optionally redirect to bookings page
      }, 2000)

    } catch (err) {
      console.error('Booking error:', err)
      setError(err.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Book a Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Requested!</h3>
              <p className="text-gray-600">
                {professional.business_name} will review your request and get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service *
                </label>
                <select
                  required
                  value={selectedService || ''}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose a service...</option>
                  {services.filter(s => s.is_active).map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - N${service.price} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <input
                  type="date"
                  required
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedTime('')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && selectedService && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time *
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedTime(slot.time)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            selectedTime === slot.time
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No available slots for this date</p>
                  )}
                </div>
              )}

              {/* Location Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Location *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setLocationType('shop')}
                    className={`px-4 py-3 rounded-lg border font-medium transition-colors ${
                      locationType === 'shop'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    At Professional's Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('mobile')}
                    className={`px-4 py-3 rounded-lg border font-medium transition-colors ${
                      locationType === 'mobile'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    Mobile Service
                  </button>
                </div>
              </div>

              {/* Client Location (if mobile) */}
              {locationType === 'mobile' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    placeholder="Enter your address..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special requests or information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !selectedService || !selectedDate || !selectedTime}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Booking...' : 'Request Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
