import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function GigList() {
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGigs()
  }, [searchTerm])

  const fetchGigs = async () => {
    try {
      setLoading(true)
      const url = searchTerm
        ? `${API_URL}/gigs?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/gigs`
      const response = await axios.get(url)
      setGigs(response.data)
    } catch (error) {
      console.error('Error fetching gigs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Browse Gigs
          </h1>
          <p className="text-gray-600 mt-2">Discover amazing opportunities</p>
        </div>
        <Link
          to="/create-gig"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          + Post a Gig
        </Link>
      </div>

      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search gigs by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md transition-all duration-200 text-lg"
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4 text-lg">Loading gigs...</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 mt-4 text-lg">No gigs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig, index) => (
            <Link
              key={gig._id}
              to={`/gig/${gig._id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {gig.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {gig.description}
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ${gig.budget}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  by {gig.ownerId?.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
