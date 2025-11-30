import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://cargo-booking-backend.vercel.app/api'

function BookingDetails({ booking, onBookingUpdated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'BOOKED': return 'status-badge status-booked'
      case 'DEPARTED': return 'status-badge status-departed'
      case 'ARRIVED': return 'status-badge status-arrived'
      case 'DELIVERED': return 'status-badge status-delivered'
      case 'CANCELLED': return 'status-badge status-cancelled'
      default: return 'status-badge'
    }
  }

  const getTimelineIcon = (eventType) => {
    switch (eventType) {
      case 'BOOKED': return '📋'
      case 'DEPARTED': return '✈️'
      case 'ARRIVED': return '🏁'
      case 'DELIVERED': return '📦'
      case 'CANCELLED': return '❌'
      default: return '📍'
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleStatusUpdate = async (action, location = '') => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.patch(`${API_BASE_URL}/bookings/${booking.refId}/${action}`, {
        location: location || booking.destination
      })
      
      onBookingUpdated(response.data)
      setSuccess(`Booking ${action}ed successfully`)
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} booking`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.patch(`${API_BASE_URL}/bookings/${booking.refId}/cancel`)
      onBookingUpdated(response.data)
      setSuccess('Booking cancelled successfully')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking')
    } finally {
      setLoading(false)
    }
  }

  const canDepart = booking.status === 'BOOKED'
  const canArrive = booking.status === 'DEPARTED'
  const canDeliver = booking.status === 'ARRIVED'
  const canCancel = !['ARRIVED', 'DELIVERED', 'CANCELLED'].includes(booking.status)

  return (
    <div className="booking-details">
      <div className="booking-header">
        <h2>Booking Details</h2>
        <h3>Reference ID: {booking.refId}</h3>
        <div className={getStatusBadgeClass(booking.status)}>
          {booking.status}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="booking-info">
        <div className="info-card">
          <div className="info-label">Origin</div>
          <div className="info-value">{booking.origin}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Destination</div>
          <div className="info-value">{booking.destination}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Pieces</div>
          <div className="info-value">{booking.pieces}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Weight</div>
          <div className="info-value">{booking.weightKg} kg</div>
        </div>
        <div className="info-card">
          <div className="info-label">Created</div>
          <div className="info-value">{formatDateTime(booking.createdAt)}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Last Updated</div>
          <div className="info-value">{formatDateTime(booking.updatedAt)}</div>
        </div>
      </div>

      <div className="actions">
        {canDepart && (
          <button 
            className="btn btn-warning"
            onClick={() => handleStatusUpdate('depart')}
            disabled={loading}
          >
            Mark as Departed
          </button>
        )}
        
        {canArrive && (
          <button 
            className=" btn-success"
            onClick={() => handleStatusUpdate('arrive')}
            disabled={loading}
          >
            Mark as Arrived
          </button>
        )}
        
        {canDeliver && (
          <button 
            className="btn btn-success"
            onClick={() => handleStatusUpdate('deliver')}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}
          >
            Mark as Delivered
          </button>
        )}
        
        {canCancel && (
          <button 
            className="btn btn-danger"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel Booking
          </button>
        )}
      </div>

      <div className="timeline">
        <h3>📅 Timeline History</h3>
        {booking.timeline && booking.timeline.length > 0 ? (
          booking.timeline
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-icon">
                  {getTimelineIcon(event.eventType)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-event">{event.eventType}</div>
                  <div className="timeline-location">📍 {event.location}</div>
                  {event.flightInfo && (
                    <div className="timeline-location">✈️ {event.flightInfo}</div>
                  )}
                  {event.notes && (
                    <div className="timeline-location">💬 {event.notes}</div>
                  )}
                  <div className="timeline-time">
                    🕒 {formatDateTime(event.timestamp)}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="loading">No timeline events found</div>
        )}
      </div>
    </div>
  )
}

export default BookingDetails
