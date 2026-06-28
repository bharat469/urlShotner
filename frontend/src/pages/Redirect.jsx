import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

let redirectInFlight = false

function Redirect() {
  const { shotUrl } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (redirectInFlight) {
      return
    }

    redirectInFlight = true

    async function fetchRedirect() {
      try {
        const response = await api.get(`/redirect/${shotUrl}`)
        if (response.data?.redirectUrl) {
          window.location.replace(response.data.redirectUrl)
          return
        }
        setError('Unable to resolve redirect URL.')
      } catch (err) {
        setError(err.response?.data?.status || 'Unable to redirect with this token.')
      } finally {
        setLoading(false)
        redirectInFlight = false
      }
    }

    fetchRedirect()
  }, [navigate, shotUrl])

  if (loading) {
    return (
      <div className="page-center">
        <div className="card">
          <p className="empty-msg">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <div className="card">
        <h1 className="page-title">Redirect failed</h1>
        <p className="page-subtitle">{error || 'Please sign in and try again.'}</p>
      </div>
    </div>
  )
}

export default Redirect
