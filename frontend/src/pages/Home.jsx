import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

const BASE_URL = 'http://localhost:4000'

function Home() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    }
  }, [navigate])

  async function handleShorten(e) {
    e.preventDefault()
    setError('')
    setShortUrl('')
    setCopied(false)

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/', { url })
      setShortUrl(res.data.value)
    } catch (err) {
      setError(err.response?.data?.status || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    const full = `${window.location.origin}/redirect/${shortUrl}`
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-center">
      <div className="card shorten-card">
        <h1 className="page-title">Shorten Your URL</h1>
        <p className="page-subtitle">Paste a long link and get a short, shareable URL instantly.</p>

        <form onSubmit={handleShorten} className="shorten-form">
          <input
            type="text"
            className="url-input"
            placeholder="https://example.com/very-long-url..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {shortUrl && (
          <div className="result-box">
            <p className="result-label">Your protected redirect link is ready!</p>
            <div className="result-row">
              <a
                href={`${window.location.origin}/redirect/${shortUrl}`}
                target="_blank"
                rel="noreferrer"
                className="short-link"
              >
                {window.location.origin}/redirect/{shortUrl}
              </a>
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
