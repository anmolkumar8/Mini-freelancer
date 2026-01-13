import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function BidList() {
  const { id } = useParams()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [gig, setGig] = useState(null)

  useEffect(() => {
    fetchBids()
    fetchGig()
  }, [id])

  const fetchGig = async () => {
    try {
      const response = await axios.get(`${API_URL}/gigs`)
      const foundGig = response.data.find((g) => g._id === id)
      setGig(foundGig)
    } catch (error) {
      console.error('Error fetching gig:', error)
    }
  }

  const fetchBids = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/bids/${id}`, {
        withCredentials: true,
      })
      setBids(response.data)
    } catch (error) {
      console.error('Error fetching bids:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHire = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer?')) {
      return
    }

    try {
      await axios.patch(
        `${API_URL}/bids/${bidId}/hire`,
        {},
        { withCredentials: true }
      )
      alert('Freelancer hired successfully!')
      fetchBids()
      fetchGig()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to hire freelancer')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mt-4 text-lg">Loading bids...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Bids for {gig?.title}
        </h1>
        <p className="text-gray-600">Review and select the best freelancer for your project</p>
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-20 bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mt-4 text-lg">No bids yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bids.map((bid, index) => (
            <div
              key={bid._id}
              className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 animate-fadeIn ${
                bid.status === 'hired'
                  ? 'border-green-500 bg-green-50/50'
                  : bid.status === 'rejected'
                  ? 'border-red-200 opacity-60'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-2xl'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {bid.freelancerId?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {bid.freelancerId?.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {bid.freelancerId?.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ${bid.price}
                  </p>
                  <span
                    className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-bold ${
                      bid.status === 'hired'
                        ? 'bg-green-100 text-green-800'
                        : bid.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {bid.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed bg-gray-50 p-4 rounded-lg">{bid.message}</p>
              {bid.status === 'pending' && gig?.status === 'open' && (
                <button
                  onClick={() => handleHire(bid._id)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Hire This Freelancer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
