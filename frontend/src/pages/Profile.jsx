import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { getUser, isAuthenticated, logout } from '../services/auth'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    async function fetchProfile() {
      try {
        setLoading(true)
        const response = await api.get('/profile')
        const profileData = response.data?.data
        if (profileData) {
          setUser(profileData)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user.name ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'SN'

  return (
    <div className="page-center">
      <div className="card profile-card profile-card-large">
        <div className="profile-banner">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h1 className="profile-title">Welcome back, {user.name || 'SnapURL user'}</h1>
            <p className="profile-intro">Your account details are shown below. You can view your shortened link history or sign out anytime.</p>
          </div>
        </div>

        {loading ? (
          <p className="empty-msg">Loading profile...</p>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : (
          <>
            <div className="profile-grid">
              <div className="profile-box">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email || 'No email available'}</span>
              </div>
              <div className="profile-box">
                <span className="profile-label">Name</span>
                <span className="profile-value">{user.name || 'Anonymous'}</span>
              </div>
              <div className="profile-box">
                <span className="profile-label">Member since</span>
                <span className="profile-value">Instant access</span>
              </div>
              <div className="profile-box">
                <span className="profile-label">Access level</span>
                <span className="profile-value">Standard user</span>
              </div>
            </div>

            <div className="profile-actions profile-actions-grid">
              <Link to="/history" className="btn-secondary btn-full">
                View URL History
              </Link>
              <button className="btn-primary btn-full" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Profile
