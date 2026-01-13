import { createContext, useContext, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export default function NotificationProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [notification, setNotification] = useState(null)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        newSocket.emit('join-user-room', user.id || user._id)
      })

      newSocket.on('hired', (data) => {
        setNotification(data)
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setNotification(null)
        }, 5000)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const clearNotification = () => {
    setNotification(null)
  }

  return (
    <NotificationContext.Provider value={{ notification, clearNotification, socket }}>
      {children}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{notification.message}</p>
              <p className="text-sm mt-1">Gig: {notification.gig?.title}</p>
            </div>
            <button
              onClick={clearNotification}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}
