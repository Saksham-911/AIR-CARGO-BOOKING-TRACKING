import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://cargo-booking-backend.vercel.app/api'

function CreateBooking({ onBookingCreated }) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    pieces: '',
    weightKg: '',
    departureDate: new Date().toISOString().split('T')[0],
    selectedFlights: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [availableRoutes, setAvailableRoutes] = useState(null)
  const [searchingRoutes, setSearchingRoutes] = useState(false)

  const airports = [
    { code: 'DEL', name: 'Delhi', city: 'New Delhi' },
    { code: 'BLR', name: 'Bangalore', city: 'Bengaluru' },
    { code: 'HYD', name: 'Hyderabad', city: 'Hyderabad' },
    { code: 'MAA', name: 'Chennai', city: 'Chennai' },
    { code: 'BOM', name: 'Mumbai', city: 'Mumbai' },
    { code: 'CCU', name: 'Kolkata', city: 'Kolkata' },
    { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad' },
    { code: 'PNQ', name: 'Pune', city: 'Pune' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
    
    // Reset routes when origin/destination/date changes
    if (['origin', 'destination', 'departureDate'].includes(e.target.name)) {
      setAvailableRoutes(null)
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
        selectedFlights: []
      }))
    }
  }

  const searchRoutes = async () => {
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      setError('Please select origin, destination, and departure date first')
      return
    }

    setSearchingRoutes(true)
    setError('')

    try {
      const response = await axios.get(`${API_BASE_URL}/flights/routes`, {
        params: {
          origin: formData.origin,
          destination: formData.destination,
          departureDate: formData.departureDate
        }
      })
      setAvailableRoutes(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch routes')
    } finally {
      setSearchingRoutes(false)
    }
  }

  const handleFlightSelection = (flightIds, routeType) => {
    setFormData({
      ...formData,
      selectedFlights: flightIds
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.selectedFlights.length === 0) {
      setError('Please select a flight route')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        origin: formData.origin,
        destination: formData.destination,
        pieces: parseInt(formData.pieces),
        weightKg: parseFloat(formData.weightKg),
        flightIds: formData.selectedFlights
      })

      setSuccess(`Booking created successfully! Reference ID: ${response.data.refId}`)
      onBookingCreated(response.data)
      setFormData({ 
        origin: '', 
        destination: '', 
        pieces: '', 
        weightKg: '', 
        departureDate: new Date().toISOString().split('T')[0],
        selectedFlights: []
      })
      setAvailableRoutes(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const swapOriginDestination = () => {
    setFormData({
      ...formData,
      origin: formData.destination,
      destination: formData.origin,
      selectedFlights: []
    })
    setAvailableRoutes(null)
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>✈️ Create New Booking</h2>
        <p>Book your air cargo shipment with flight selection</p>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="icon">⚠️</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <span className="icon">✅</span>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="route-section">
          <h3>🛫 Route Selection</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="icon">🛫</span>
                Origin Airport
              </label>
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                className="select-field"
              >
                <option value="">Select Origin</option>
                {airports.map(airport => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name} ({airport.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="swap-button-container">
              <button
                type="button"
                onClick={swapOriginDestination}
                className="swap-button"
                title="Swap origin and destination"
                disabled={!formData.origin && !formData.destination}
              >
                🔄
              </button>
            </div>

            <div className="form-group">
              <label>
                <span className="icon">🛬</span>
                Destination Airport
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="select-field"
              >
                <option value="">Select Destination</option>
                {airports.map(airport => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name} ({airport.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="icon">📅</span>
              Departure Date
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="input-field"
            />
          </div>

          <button
            type="button"
            onClick={searchRoutes}
            className="btn btn-primary"
            disabled={searchingRoutes || !formData.origin || !formData.destination || !formData.departureDate}
            style={{ width: '100%', marginTop: '15px' }}
          >
            {searchingRoutes ? (
              <>
                <span className="spinner"></span>
                Searching Routes...
              </>
            ) : (
              <>
                <span className="icon">🔍</span>
                Search Available Flights
              </>
            )}
          </button>
        </div>

        {/* Flight Selection */}
        {availableRoutes && (
          <div className="flight-selection-section">
            <h3>✈️ Select Flight</h3>
            
            {/* Direct Flights */}
            {availableRoutes.directFlights && availableRoutes.directFlights.length > 0 && (
              <div className="flight-options">
                <h4>Direct Flights</h4>
                {availableRoutes.directFlights.map((flight) => (
                  <div
                    key={flight.flightId}
                    className={`flight-option ${formData.selectedFlights.includes(flight.flightId) ? 'selected' : ''}`}
                    onClick={() => handleFlightSelection([flight.flightId], 'direct')}
                  >
                    <div className="flight-info">
                      <div className="flight-header">
                        <span className="flight-number">{flight.flightNumber}</span>
                        <span className="airline">{flight.airlineName}</span>
                      </div>
                      <div className="flight-route">
                        <span>{flight.origin}</span>
                        <span className="arrow">→</span>
                        <span>{flight.destination}</span>
                      </div>
                      <div className="flight-times">
                        <span>Departure: {formatDateTime(flight.departureDateTime)}</span>
                        <span>Arrival: {formatDateTime(flight.arrivalDateTime)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Transit Routes */}
            {availableRoutes.transitRoutes && availableRoutes.transitRoutes.length > 0 && (
              <div className="flight-options">
                <h4>Connecting Flights (1 Stop)</h4>
                {availableRoutes.transitRoutes.map((route, index) => (
                  <div
                    key={index}
                    className={`flight-option transit ${JSON.stringify(formData.selectedFlights) === JSON.stringify([route.firstFlight.flightId, route.secondFlight.flightId]) ? 'selected' : ''}`}
                    onClick={() => handleFlightSelection([route.firstFlight.flightId, route.secondFlight.flightId], 'transit')}
                  >
                    <div className="transit-route">
                      <div className="flight-segment">
                        <div className="flight-header">
                          <span className="flight-number">{route.firstFlight.flightNumber}</span>
                          <span className="airline">{route.firstFlight.airlineName}</span>
                        </div>
                        <div className="flight-route">
                          <span>{route.firstFlight.origin}</span>
                          <span className="arrow">→</span>
                          <span>{route.firstFlight.destination}</span>
                        </div>
                        <div className="flight-times">
                          <span>Departure: {formatDateTime(route.firstFlight.departureDateTime)}</span>
                          <span>Arrival: {formatDateTime(route.firstFlight.arrivalDateTime)}</span>
                        </div>
                      </div>
                      
                      <div className="connection-info">
                        <span className="connection-icon">✈️</span>
                        <span>Connection at {route.firstFlight.destination}</span>
                      </div>
                      
                      <div className="flight-segment">
                        <div className="flight-header">
                          <span className="flight-number">{route.secondFlight.flightNumber}</span>
                          <span className="airline">{route.secondFlight.airlineName}</span>
                        </div>
                        <div className="flight-route">
                          <span>{route.secondFlight.origin}</span>
                          <span className="arrow">→</span>
                          <span>{route.secondFlight.destination}</span>
                        </div>
                        <div className="flight-times">
                          <span>Departure: {formatDateTime(route.secondFlight.departureDateTime)}</span>
                          <span>Arrival: {formatDateTime(route.secondFlight.arrivalDateTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {availableRoutes.directFlights.length === 0 && availableRoutes.transitRoutes.length === 0 && (
              <div className="no-flights">
                <span className="icon">✈️</span>
                <p>No flights available for the selected route and date.</p>
                <p>Please try a different date or route.</p>
              </div>
            )}
          </div>
        )}

        <div className="cargo-section">
          <h3>📦 Cargo Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="icon">📋</span>
                Number of Pieces
              </label>
              <input
                type="number"
                name="pieces"
                value={formData.pieces}
                onChange={handleChange}
                min="1"
                max="100"
                placeholder="Enter number of pieces"
                required
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>
                <span className="icon">⚖️</span>
                Total Weight (kg)
              </label>
              <input
                type="number"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                min="0.1"
                max="10000"
                step="0.1"
                placeholder="Enter weight in kg"
                required
                className="input-field"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary submit-button"
          disabled={loading || formData.selectedFlights.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating Booking...
            </>
          ) : (
            <>
              <span className="icon">🚀</span>
              Create Booking
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default CreateBooking
