import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, logout, getUser } from '../services/auth'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setUser(getUser())
  }, [location])

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🔗</span>
        <span className="brand-name">SnapURL</span>
      </div>
      <div className="navbar-links">
        {authenticated ? (
          <>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Shorten
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Analytics
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Profile
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              History
            </NavLink>
            <button type="button" className="nav-link nav-link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Sign In
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default Navbar
