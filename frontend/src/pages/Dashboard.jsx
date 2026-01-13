import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getCurrentUser } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, user])

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mt-4 text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>
      
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-100 mb-8">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/')}
            className="block w-full text-left bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center space-x-3 mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-bold text-gray-900 text-lg">Browse Gigs</h3>
            </div>
            <p className="text-sm text-gray-600">View and search for available gigs</p>
          </button>
          <button
            onClick={() => navigate('/create-gig')}
            className="block w-full text-left bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center space-x-3 mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="font-bold text-gray-900 text-lg">Post a New Gig</h3>
            </div>
            <p className="text-sm text-gray-600">Create a new job posting</p>
          </button>
        </div>
      </div>
    </div>
  )
}
