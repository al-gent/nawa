'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [professionals, setProfessionals] = useState([])
  const [filter, setFilter] = useState('pending')
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    fetchProfessionals()
  }, [filter])

  const fetchProfessionals = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('professional_profiles')
        .select(`
          *,
          services (id, name, price, duration_minutes)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('verification_status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setProfessionals(data || [])
    } catch (err) {
      console.error('Error fetching professionals:', err)
      setError('Failed to load professionals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (professionalId) => {
    setActionLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/verify-professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId,
          status: 'approved',
          notes: verificationNotes || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve professional')
      }

      setSuccessMessage('Professional approved successfully')
      setSelectedProfessional(null)
      setVerificationNotes('')
      fetchProfessionals()
    } catch (err) {
      console.error('Error approving professional:', err)
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (professionalId) => {
    if (!verificationNotes.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    setActionLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/verify-professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId,
          status: 'rejected',
          notes: verificationNotes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject professional')
      }

      setSuccessMessage('Professional rejected')
      setSelectedProfessional(null)
      setVerificationNotes('')
      fetchProfessionals()
    } catch (err) {
      console.error('Error rejecting professional:', err)
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage professional verifications</p>
            </div>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    filter === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                  {tab === 'pending' && professionals.length > 0 && filter === 'pending' && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                      {professionals.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Professionals List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Professionals
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : professionals.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No {filter === 'all' ? '' : filter} professionals found
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {professionals.map((professional) => (
                    <li
                      key={professional.id}
                      onClick={() => setSelectedProfessional(professional)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedProfessional?.id === professional.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {professional.business_name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(professional.verification_status)}`}>
                              {professional.verification_status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{professional.service_type}</p>
                          <p className="text-xs text-gray-500 mt-1">{professional.address}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Applied: {formatDate(professional.created_at)}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Professional Detail Panel */}
          <div className="lg:col-span-1">
            {selectedProfessional ? (
              <div className="bg-white rounded-lg shadow sticky top-4">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                </div>

                <div className="p-4 space-y-4">
                  {/* Business Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{selectedProfessional.business_name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedProfessional.verification_status)}`}>
                      {selectedProfessional.verification_status}
                    </span>
                  </div>

                  <div className="text-sm space-y-2">
                    <p><span className="font-medium">Type:</span> {selectedProfessional.service_type}</p>
                    <p><span className="font-medium">Phone:</span> {selectedProfessional.phone || 'N/A'}</p>
                    <p><span className="font-medium">Address:</span> {selectedProfessional.address}</p>
                  </div>

                  {selectedProfessional.bio && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bio</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedProfessional.bio}</p>
                    </div>
                  )}

                  {/* Services */}
                  {selectedProfessional.services && selectedProfessional.services.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Services ({selectedProfessional.services.length})</p>
                      <ul className="mt-1 space-y-1">
                        {selectedProfessional.services.map((service) => (
                          <li key={service.id} className="text-sm text-gray-600">
                            {service.name} - N${service.price} ({service.duration_minutes} min)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Portfolio Images */}
                  {selectedProfessional.portfolio_images && selectedProfessional.portfolio_images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Portfolio ({selectedProfessional.portfolio_images.length} images)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProfessional.portfolio_images.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={url}
                              alt={`Portfolio ${idx + 1}`}
                              className="w-full h-20 object-cover rounded-lg hover:opacity-75 transition-opacity"
                              crossOrigin="anonymous"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Documents */}
                  {selectedProfessional.verification_documents && selectedProfessional.verification_documents.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Verification Documents</p>
                      <div className="space-y-1">
                        {selectedProfessional.verification_documents.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-primary-600 hover:underline"
                          >
                            Document {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Notes */}
                  {selectedProfessional.verification_notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Previous Notes</p>
                      <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                        {selectedProfessional.verification_notes}
                      </p>
                    </div>
                  )}

                  {/* Action Section */}
                  {selectedProfessional.verification_status === 'pending' && (
                    <div className="border-t pt-4 mt-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (required for rejection)
                        </label>
                        <textarea
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          rows={3}
                          placeholder="Add notes about this verification..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(selectedProfessional.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(selectedProfessional.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Re-review actions for already processed */}
                  {selectedProfessional.verification_status !== 'pending' && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        This professional has already been {selectedProfessional.verification_status}.
                      </p>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Update Notes
                        </label>
                        <textarea
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          rows={3}
                          placeholder="Add notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        {selectedProfessional.verification_status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(selectedProfessional.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {selectedProfessional.verification_status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(selectedProfessional.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <svg className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a professional to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
