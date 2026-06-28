import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

function History() {
  const navigate = useNavigate()
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    fetchHistory()
  }, [navigate])

  async function fetchHistory() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/all')
      setUrls(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load URL history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card history-card">
        <div className="history-header">
          <h1 className="page-title">URL History</h1>
          <p className="page-subtitle">All shortened URLs linked to your account.</p>
        </div>

        {loading ? (
          <p className="empty-msg">Loading saved URLs...</p>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : urls.length === 0 ? (
          <p className="empty-msg">No shortened URLs found yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Short URL</th>
                  <th>Original URL</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url, index) => (
                  <tr key={url._id}>
                    <td>{index + 1}</td>
                    <td>
                      <a
                        href={`${window.location.origin}/redirect/${url.shortUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="short-link"
                      >
                        {window.location.origin}/redirect/{url.shortUrl}
                      </a>
                    </td>
                    <td>
                      <span className="original-url">
                        {url.originalUrl.length > 55
                          ? url.originalUrl.slice(0, 55) + '…'
                          : url.originalUrl}
                      </span>
                    </td>
                    <td>{url.clickCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
