'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'

/**
 * Image Upload Component for Supabase Storage
 *
 * @param {Object} props
 * @param {string} props.bucket - Supabase storage bucket name
 * @param {string} props.folder - Folder path within bucket
 * @param {Function} props.onUploadComplete - Callback with uploaded file URLs
 * @param {number} props.maxFiles - Maximum number of files (default: 5)
 * @param {boolean} props.multiple - Allow multiple file upload (default: true)
 * @param {string} props.label - Label text
 */
export default function ImageUpload({
  bucket = 'portfolio-images',
  folder = '',
  onUploadComplete,
  maxFiles = 5,
  multiple = true,
  label = 'Upload Images',
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState([])
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const supabase = createClient()

  const handleFileChange = async (event) => {
    try {
      setError(null)
      setUploading(true)
      setProgress(0)

      const files = Array.from(event.target.files)

      if (files.length === 0) return

      // Validate file count
      if (files.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        setUploading(false)
        return
      }

      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const invalidFiles = files.filter((file) => !validTypes.includes(file.type))

      if (invalidFiles.length > 0) {
        setError('Only JPEG, PNG, and WebP images are allowed')
        setUploading(false)
        return
      }

      // Validate file sizes (max 5MB per file)
      const maxSize = 5 * 1024 * 1024 // 5MB
      const oversizedFiles = files.filter((file) => file.size > maxSize)

      if (oversizedFiles.length > 0) {
        setError('Each file must be less than 5MB')
        setUploading(false)
        return
      }

      const urls = []

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath)

        urls.push(publicUrl)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      setUploadedUrls([...uploadedUrls, ...urls])
      onUploadComplete && onUploadComplete(urls)
      setUploading(false)
      setProgress(0)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload images')
      setUploading(false)
      setProgress(0)
    }
  }

  const removeImage = (url) => {
    const newUrls = uploadedUrls.filter((u) => u !== url)
    setUploadedUrls(newUrls)
    onUploadComplete && onUploadComplete(newUrls)
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />

        <label
          htmlFor="image-upload"
          className="cursor-pointer inline-flex flex-col items-center"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload images'}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            PNG, JPG, WEBP up to 5MB (max {maxFiles} files)
          </span>
        </label>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress}% uploaded</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {uploadedUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
                crossOrigin="anonymous"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
