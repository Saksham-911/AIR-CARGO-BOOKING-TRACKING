import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://cargo-booking-backend.vercel.app/api'

function SearchBooking({ onBookingFound }) {
  const [refId, setRefId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!refId.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${refId.trim()}`)
      onBookingFound(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Booking not found')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setRefId(e.target.value.toUpperCase())
    setError('')
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>🔍 Search Booking</h2>
        <p>Enter your booking reference ID to track your shipment</p>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="icon">⚠️</span>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label>
            <span className="icon">📋</span>
            Booking Reference ID
          </label>
          <input
            type="text"
            value={refId}
            onChange={handleInputChange}
            placeholder="e.g., CRG123456789"
            required
            className="search-input"
            maxLength={20}
          />
          <small style={{ color: '#6c757d', fontSize: '14px', textAlign: 'center', display: 'block', marginTop: '10px' }}>
            Reference ID format: CRG followed by numbers
          </small>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary search-button"
          disabled={loading || !refId.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            <>
              <span className="icon">🔍</span>
              Search Booking
            </>
          )}
        </button>
      </form>
      
      <div style={{ marginTop: '30px', textAlign: 'center', color: '#6c757d' }}>
        <p>💡 <strong>Tip:</strong> You can find your reference ID in your booking confirmation</p>
      </div>
    </div>
  )
}

export default SearchBooking
