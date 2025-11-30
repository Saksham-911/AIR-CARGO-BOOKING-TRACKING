import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://cargo-booking-backend.vercel.app/api/bookings');
      setBookings(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      BOOKED: '#3498db',
      DEPARTED: '#f39c12', 
      ARRIVED: '#e74c3c',
      DELIVERED: '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bookings-list-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-list-container">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchAllBookings} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-list-container">
      <div className="bookings-header">
        <h2>📦 All Bookings</h2>
        <div className="bookings-stats">
          <span className="total-count">{bookings.length} Total Bookings</span>
          <button onClick={fetchAllBookings} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Bookings Found</h3>
          <p>No cargo bookings have been created yet.</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                <div className="ref-id">
                  <strong>{booking.refId}</strong>
                </div>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status}
                </div>
              </div>

              <div className="booking-route">
                <div className="route-info">
                  <span className="origin">{booking.origin}</span>
                  <span className="arrow">✈️</span>
                  <span className="destination">{booking.destination}</span>
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <span className="label">Pieces:</span>
                  <span className="value">{booking.pieces}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Weight:</span>
                  <span className="value">{booking.weight_kg} kg</span>
                </div>
              </div>

              {booking.flightIds && booking.flightIds.length > 0 && (
                <div className="flight-info">
                  <span className="flights-label">Flights:</span>
                  <div className="flight-numbers">
                    {booking.flightIds.map((flightId, index) => (
                      <span key={index} className="flight-number">
                        {flightId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="booking-timestamps">
                <div className="timestamp">
                  <span className="timestamp-label">Created:</span>
                  <span className="timestamp-value">
                    {formatDate(booking.createdAt)}
                  </span>
                </div>
                {booking.updatedAt !== booking.createdAt && (
                  <div className="timestamp">
                    <span className="timestamp-label">Updated:</span>
                    <span className="timestamp-value">
                      {formatDate(booking.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {booking.timeline && booking.timeline.length > 0 && (
                <div className="timeline-preview">
                  <div className="timeline-header">
                    <span>📋 Latest Update:</span>
                  </div>
                  <div className="latest-timeline-item">
                    <span className="timeline-status">
                      {booking.timeline[booking.timeline.length - 1].status}
                    </span>
                    <span className="timeline-time">
                      {formatDate(booking.timeline[booking.timeline.length - 1].timestamp)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsList;
