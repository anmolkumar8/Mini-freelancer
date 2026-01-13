import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function CreateGig() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(
        `${API_URL}/gigs`,
        {
          ...formData,
          budget: parseFloat(formData.budget),
        },
        { withCredentials: true }
      )
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create gig')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Post a New Gig
        </h1>
        <p className="text-gray-600">Share your project with talented freelancers</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-100">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
            placeholder="Enter gig title..."
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="6"
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
            placeholder="Describe your project in detail..."
          />
        </div>

        <div className="mb-8">
          <label
            htmlFor="budget"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Budget ($)
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            min="0"
            step="0.01"
            required
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
          >
            {loading ? 'Posting...' : 'Post Gig'}
          </button>
        </div>
      </form>
    </div>
  )
}
