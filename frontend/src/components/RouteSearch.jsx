import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://cargo-booking-backend.vercel.app/api'

function RouteSearch() {
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: ''
  })
  const [routes, setRoutes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const airports = [
    { code: 'DEL', name: 'Delhi' },
    { code: 'BLR', name: 'Bangalore' },
    { code: 'HYD', name: 'Hyderabad' },
    { code: 'MAA', name: 'Chennai' },
    { code: 'BOM', name: 'Mumbai' },
    { code: 'CCU', name: 'Kolkata' }
  ]

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${API_BASE_URL}/flights/routes`, {
        params: {
          origin: searchData.origin,
          destination: searchData.destination,
          departureDate: searchData.departureDate
        }
      })

      setRoutes(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch routes')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="form-container">
      <h2>🛩️ Find Flight Routes</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Origin Airport</label>
          <select
            name="origin"
            value={searchData.origin}
            onChange={handleChange}
            required
          >
            <option value="">Select Origin</option>
            {airports.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Destination Airport</label>
          <select
            name="destination"
            value={searchData.destination}
            onChange={handleChange}
            required
          >
            <option value="">Select Destination</option>
            {airports.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Departure Date</label>
          <input
            type="date"
            name="departureDate"
            value={searchData.departureDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Routes'}
        </button>
      </form>

      {routes && (
        <div style={{ marginTop: '40px' }}>
          <h3>🎯 Available Routes</h3>
          
          {/* Direct Flights */}
          {routes.directFlights && routes.directFlights.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#27ae60', marginBottom: '15px' }}>✈️ Direct Flights</h4>
              {routes.directFlights.map((flight, index) => (
                <div key={index} className="info-card" style={{ textAlign: 'left', marginBottom: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                      <div className="info-label">Flight</div>
                      <div className="info-value">{flight.flightNumber}</div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>{flight.airlineName}</div>
                    </div>
                    <div>
                      <div className="info-label">Departure</div>
                      <div className="info-value">{flight.origin}</div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        {formatDateTime(flight.departureDateTime)}
                      </div>
                    </div>
                    <div>
                      <div className="info-label">Arrival</div>
                      <div className="info-value">{flight.destination}</div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        {formatDateTime(flight.arrivalDateTime)}
                      </div>
                    </div>
                    <div>
                      <div className="info-label">Duration</div>
                      <div className="info-value">
                        {formatDuration(new Date(flight.arrivalDateTime) - new Date(flight.departureDateTime))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transit Routes */}
          {routes.transitRoutes && routes.transitRoutes.length > 0 && (
            <div>
              <h4 style={{ color: '#f39c12', marginBottom: '15px' }}>🔄 1-Transit Routes</h4>
              {routes.transitRoutes.map((route, index) => (
                <div key={index} className="info-card" style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '15px', fontWeight: 'bold', color: '#2c3e50' }}>
                    Route {index + 1} - Total Duration: {formatDuration(route.totalDuration)}
                  </div>
                  
                  {/* First Flight */}
                  <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#3498db' }}>✈️ First Flight</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                      <div>
                        <div className="info-label">Flight</div>
                        <div style={{ fontWeight: 'bold' }}>{route.firstFlight.flightNumber}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{route.firstFlight.airlineName}</div>
                      </div>
                      <div>
                        <div className="info-label">From</div>
                        <div style={{ fontWeight: 'bold' }}>{route.firstFlight.origin}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {formatDateTime(route.firstFlight.departureDateTime)}
                        </div>
                      </div>
                      <div>
                        <div className="info-label">To</div>
                        <div style={{ fontWeight: 'bold' }}>{route.firstFlight.destination}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {formatDateTime(route.firstFlight.arrivalDateTime)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Flight */}
                  <div style={{ padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#e67e22' }}>✈️ Connecting Flight</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                      <div>
                        <div className="info-label">Flight</div>
                        <div style={{ fontWeight: 'bold' }}>{route.secondFlight.flightNumber}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{route.secondFlight.airlineName}</div>
                      </div>
                      <div>
                        <div className="info-label">From</div>
                        <div style={{ fontWeight: 'bold' }}>{route.secondFlight.origin}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {formatDateTime(route.secondFlight.departureDateTime)}
                        </div>
                      </div>
                      <div>
                        <div className="info-label">To</div>
                        <div style={{ fontWeight: 'bold' }}>{route.secondFlight.destination}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {formatDateTime(route.secondFlight.arrivalDateTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!routes.directFlights || routes.directFlights.length === 0) && 
           (!routes.transitRoutes || routes.transitRoutes.length === 0) && (
            <div className="info-card" style={{ textAlign: 'center', color: '#6c757d' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>✈️</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>No routes found</div>
              <div>Try a different date or route combination</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RouteSearch
