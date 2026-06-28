import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

function Analytics() {
  const navigate = useNavigate()
  const [urls, setUrls] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUrl, setSelectedUrl] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchData(showLoader = true) {
    if (showLoader) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError('')

    try {
      const [urlsRes, analyticsRes] = await Promise.all([
        api.get('/all'),
        api.get('/analytics'),
      ])
      setUrls(urlsRes.data.data)
      setAnalytics(analyticsRes.data.data)
    } catch {
      setError('Failed to load analytics data. Make sure the server is running.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    fetchData(true)

    const intervalId = window.setInterval(() => {
      fetchData(false)
    }, 15000)

    return () => window.clearInterval(intervalId)
  }, [navigate])

  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0)
  const visitsForSelected = selectedUrl
    ? analytics.filter((a) => a.shortUrl === selectedUrl)
    : []
  const chartData = urls.map((url) => ({
    shortUrl: url.shortUrl,
    originalUrl: url.originalUrl,
    count: url.clickCount || 0,
  }))
  const maxChartValue = Math.max(...chartData.map((item) => item.count), 1)

  if (loading) {
    return (
      <div className="analytics-page">
        <p className="empty-msg">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <p className="error-msg">{error}</p>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Overview of all shortened URLs and their performance.</p>
        </div>
        <button className="btn-refresh" onClick={fetchData}>
          ↻ Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{urls.length}</span>
          <span className="stat-label">Total URLs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalClicks}</span>
          <span className="stat-label">Total Clicks</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{analytics.length}</span>
          <span className="stat-label">Recorded Visits</span>
        </div>
      </div>

      <div className="table-wrapper dash-table-gap">
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="section-title">Live Click Breakdown</h2>
            <span className="chart-caption">{refreshing ? 'Refreshing…' : 'Auto-refresh every 15s'}</span>
          </div>

          {chartData.length === 0 ? (
            <p className="empty-msg">No click data available yet.</p>
          ) : (
            <div className="chart-bars">
              {chartData.map((item) => (
                <div className="chart-row" key={item.shortUrl}>
                  <div className="chart-meta">
                    <span className="chart-label">{item.shortUrl}</span>
                    <span className="chart-original">{item.originalUrl}</span>
                  </div>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{ width: `${Math.max(8, (item.count / maxChartValue) * 100)}%` }}
                    />
                  </div>
                  <span className="chart-value">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="table-wrapper dash-table-gap">
        <h2 className="section-title">All Shortened URLs ({urls.length})</h2>
        {urls.length === 0 ? (
          <p className="empty-msg">No URLs shortened yet.</p>
        ) : (
          <table className="analytics-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Short Code</th>
                <th>Original URL</th>
                <th>Clicks</th>
                <th>Visitor Log</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url, i) => {
                const visitCount = analytics.filter((a) => a.shortUrl === url.shortUrl).length
                const isSelected = selectedUrl === url.shortUrl
                return (
                  <tr key={url._id} className={isSelected ? 'row-selected' : ''}>
                    <td>{i + 1}</td>
                    <td>
                      <a
                        href={`${window.location.origin}/redirect/${url.shortUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="short-code"
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
                    <td>
                      <span className="click-badge">{url.clickCount || 0}</span>
                    </td>
                    <td>
                      <button
                        className={`btn-visits ${isSelected ? 'btn-visits-active' : ''}`}
                        onClick={() => setSelectedUrl(isSelected ? null : url.shortUrl)}
                      >
                        {visitCount} {isSelected ? '▲ Hide' : '▼ Show'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedUrl && (
        <div className="table-wrapper">
          <h2 className="section-title">
            Visitor Log —&nbsp;
            <code className="short-code">{selectedUrl}</code>
            <span className="visit-count-badge">{visitsForSelected.length} visits</span>
          </h2>
          {visitsForSelected.length === 0 ? (
            <p className="empty-msg">No visits recorded for this URL yet.</p>
          ) : (
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date &amp; Time</th>
                  <th>Browser</th>
                  <th>OS</th>
                  <th>Device</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {visitsForSelected.map((row, i) => (
                  <tr key={row._id}>
                    <td>{i + 1}</td>
                    <td>{row.lastVisitedAt}</td>
                    <td>{row.browser || '—'}</td>
                    <td>{row.os || '—'}</td>
                    <td>{row.device?.trim() || '—'}</td>
                    <td>{row.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default Analytics
