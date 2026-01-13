import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import GigList from './pages/GigList'
import CreateGig from './pages/CreateGig'
import GigDetail from './pages/GigDetail'
import BidList from './pages/BidList'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import NotificationProvider from './context/NotificationContext'

function PrivateRoute({ children }) {
  const { user } = useSelector((state) => state.auth)
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<GigList />} />
          <Route path="create-gig" element={<CreateGig />} />
          <Route path="gig/:id" element={<GigDetail />} />
          <Route path="gig/:id/bids" element={<BidList />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </NotificationProvider>
  )
}

export default App
