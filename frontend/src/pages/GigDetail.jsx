import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function GigDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidData, setBidData] = useState({
    message: '',
    price: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchGig()
  }, [id])

  const fetchGig = async () => {
    try {
      const response = await axios.get(`${API_URL}/gigs`)
      const foundGig = response.data.find((g) => g._id === id)
      setGig(foundGig)
    } catch (error) {
      console.error('Error fetching gig:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBidSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.post(
        `${API_URL}/bids`,
        {
          gigId: id,
          ...bidData,
          price: parseFloat(bidData.price),
        },
        { withCredentials: true }
      )
      setShowBidForm(false)
      setBidData({ message: '', price: '' })
      alert('Bid submitted successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit bid')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mt-4 text-lg">Loading...</p>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
        <p className="text-gray-500 text-lg">Gig not found</p>
      </div>
    )
  }

  const isOwner = (user?.id || user?._id) === (gig.ownerId?._id || gig.ownerId)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 flex-1">{gig.title}</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold ml-4 ${
              gig.status === 'open'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {gig.status.toUpperCase()}
          </span>
        </div>
        <p className="text-gray-700 text-lg mb-6 leading-relaxed">{gig.description}</p>
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ${gig.budget}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Posted by <span className="font-semibold text-gray-700">{gig.ownerId?.name}</span>
            </p>
          </div>
        </div>
      </div>

      {isOwner && gig.status === 'open' && (
        <div className="mb-6">
          <Link
            to={`/gig/${id}/bids`}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium inline-block shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            View Bids
          </Link>
        </div>
      )}

      {!isOwner && gig.status === 'open' && (
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-100">
          {!showBidForm ? (
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Submit a Bid
            </button>
          ) : (
            <form onSubmit={handleBidSubmit}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Bid</h2>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={bidData.price}
                  onChange={(e) =>
                    setBidData({ ...bidData, price: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="0.00"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows="4"
                  required
                  value={bidData.message}
                  onChange={(e) =>
                    setBidData({ ...bidData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Tell the client why you're the right fit..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBidForm(false)
                    setBidData({ message: '', price: '' })
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
                >
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
