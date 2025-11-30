# Air Cargo Booking & Tracking System

A simple MERN stack application for managing air cargo bookings and tracking their journey.

## Features

### Backend
- **Create Booking**: Create new air cargo bookings with origin, destination, pieces, and weight
- **Track Booking**: Search and view booking details by reference ID
- **Update Status**: Mark bookings as departed, arrived, or cancelled
- **Timeline History**: Maintain chronological event timeline for each booking
- **Flight Routes**: Find direct and 1-transit routes between airports

### Frontend
- **Clean UI**: Simple, responsive interface for booking management
- **Create Booking Form**: Easy-to-use form for new bookings
- **Search Functionality**: Quick search by booking reference ID
- **Status Updates**: Visual status tracking with timeline
- **Real-time Updates**: Immediate feedback on status changes

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Axios
- **Database**: MongoDB with proper indexing
- **Styling**: Custom CSS with responsive design

## Database Schema

### Booking Model
```javascript
{
  refId: String (unique, auto-generated),
  origin: String,
  destination: String,
  pieces: Number,
  weightKg: Number,
  status: Enum ['BOOKED', 'DEPARTED', 'ARRIVED', 'DELIVERED', 'CANCELLED'],
  timeline: [TimelineEvent],
  createdAt: Date,
  updatedAt: Date
}
```

### Flight Model
```javascript
{
  flightId: String (unique),
  flightNumber: String,
  airlineName: String,
  departureDateTime: Date,
  arrivalDateTime: Date,
  origin: String,
  destination: String
}
```

## API Endpoints

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:refId` - Get booking by reference ID
- `PATCH /api/bookings/:refId/depart` - Mark booking as departed
- `PATCH /api/bookings/:refId/arrive` - Mark booking as arrived
- `PATCH /api/bookings/:refId/cancel` - Cancel booking
- `GET /api/bookings` - Get all bookings (admin)

### Flights
- `GET /api/flights/routes` - Get available routes (direct + 1-transit)
- `POST /api/flights` - Create new flight (admin)
- `GET /api/flights` - Get all flights (admin)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file with your MongoDB connection string:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cargoapp
   NODE_ENV=development
   ```

4. Seed sample flight data:
   ```bash
   node seedFlights.js
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: https://cargo-booking-backend.vercel.app/api

## Performance Optimizations

### Database Indexing
- Compound index on `(origin, destination, departureDateTime)` for flights
- Single indexes on `refId`, `status`, and `(origin, destination)` for bookings

### Caching Strategy
- In-memory caching can be implemented for frequently accessed flight routes
- Redis can be added for distributed caching in production

### Concurrency Handling
- Mongoose optimistic concurrency control using version keys
- Proper error handling for concurrent updates

## Monitoring & Logging
- Console logging for all major operations
- Error logging for debugging
- Request/response logging can be added with middleware

## Security Considerations
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- MongoDB injection prevention through Mongoose

## Future Enhancements
- User authentication and authorization
- Email notifications for status updates
- Real-time tracking with WebSockets
- Mobile app support
- Advanced analytics and reporting
- Integration with airline APIs
