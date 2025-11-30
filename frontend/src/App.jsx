import { useState } from 'react'
import './App.css'
import CreateBooking from './components/CreateBooking'
import SearchBooking from './components/SearchBooking'
import BookingDetails from './components/BookingDetailsEnhanced'
import RouteSearch from './components/RouteSearch'
import BookingsList from './components/BookingsList'

function App() {
  const [activeTab, setActiveTab] = useState('create')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const handleBookingCreated = (booking) => {
    setSelectedBooking(booking)
    setActiveTab('details')
  }

  const handleBookingFound = (booking) => {
    setSelectedBooking(booking)
    setActiveTab('details')
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1> Air Cargo Booking & Tracking</h1>
      </header>

      <nav className="tab-navigation">
        <button 
          className={activeTab === 'create' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('create')}
        >
          Create Booking
        </button>
        <button 
          className={activeTab === 'search' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('search')}
        >
          Search Booking
        </button>
        <button 
          className={activeTab === 'all-bookings' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('all-bookings')}
        >
          All Bookings
        </button>
        <button 
          className={activeTab === 'routes' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('routes')}
        >
          Find Routes
        </button>
        {selectedBooking && (
          <button 
            className={activeTab === 'details' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('details')}
          >
            Booking Details
          </button>
        )}
      </nav>

      <main className="main-content">
        {activeTab === 'create' && (
          <CreateBooking onBookingCreated={handleBookingCreated} />
        )}
        {activeTab === 'search' && (
          <SearchBooking onBookingFound={handleBookingFound} />
        )}
        {activeTab === 'all-bookings' && (
          <BookingsList />
        )}
        {activeTab === 'routes' && (
          <RouteSearch />
        )}
        {activeTab === 'details' && selectedBooking && (
          <BookingDetails 
            booking={selectedBooking} 
            onBookingUpdated={setSelectedBooking}
          />
        )}
      </main>
    </div>
  )
}

export default App
