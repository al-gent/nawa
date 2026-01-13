'use client'

import { useState } from 'react'
import BookingModal from '../../../components/booking/BookingModal'

export default function ProfileClient({ professional, availabilityRules }) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const avgRating = professional.reviews?.length > 0
    ? professional.reviews.reduce((sum, r) => sum + r.rating, 0) / professional.reviews.length
    : 0

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 sticky top-8">
        <h3 className="font-semibold text-lg mb-4">Book This Professional</h3>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors mb-4"
        >
          Book Now
        </button>

        {/* Availability */}
        {availabilityRules && availabilityRules.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Working Hours</h4>
            <div className="space-y-2 text-sm">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                const rule = availabilityRules.find(r => r.day_of_week === idx)
                return (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600">{day}</span>
                    <span className="font-medium text-gray-900">
                      {rule
                        ? `${rule.start_time.slice(0, 5)} - ${rule.end_time.slice(0, 5)}`
                        : 'Closed'
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="border-t pt-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Services Offered</span>
              <span className="font-medium text-gray-900">
                {professional.services?.filter(s => s.is_active).length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Rating</span>
              <span className="font-medium text-gray-900">
                {avgRating.toFixed(1)} / 5.0
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Reviews</span>
              <span className="font-medium text-gray-900">
                {professional.reviews?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        professional={professional}
        services={professional.services || []}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  )
}
