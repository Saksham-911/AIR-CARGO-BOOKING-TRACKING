const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// Get routes (direct and 1-transit)
router.get('/routes', async (req, res) => {
  try {
    const { origin, destination, departureDate } = req.query;
    
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters: origin, destination, departureDate' 
      });
    }

    const searchDate = new Date(departureDate);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find direct flights
    const directFlights = await Flight.find({
      origin: origin,
      destination: destination,
      departureDateTime: {
        $gte: searchDate,
        $lt: nextDay
      }
    }).sort({ departureDateTime: 1 });

    // Find 1-transit routes
    const transitRoutes = [];
    
    // Find flights from origin to any intermediate destination
    const firstHopFlights = await Flight.find({
      origin: origin,
      destination: { $ne: destination },
      departureDateTime: {
        $gte: searchDate,
        $lt: nextDay
      }
    });

    for (const firstFlight of firstHopFlights) {
      // Find connecting flights from intermediate destination to final destination
      const connectingDate = new Date(firstFlight.arrivalDateTime);
      const connectingNextDay = new Date(connectingDate);
      connectingNextDay.setDate(connectingNextDay.getDate() + 2); // Same day or next day

      const secondHopFlights = await Flight.find({
        origin: firstFlight.destination,
        destination: destination,
        departureDateTime: {
          $gte: firstFlight.arrivalDateTime,
          $lt: connectingNextDay
        }
      });

      secondHopFlights.forEach(secondFlight => {
        transitRoutes.push({
          firstFlight: firstFlight,
          secondFlight: secondFlight,
          totalDuration: new Date(secondFlight.arrivalDateTime) - new Date(firstFlight.departureDateTime)
        });
      });
    }

    // Sort transit routes by total duration
    transitRoutes.sort((a, b) => a.totalDuration - b.totalDuration);

    res.json({
      directFlights,
      transitRoutes: transitRoutes.slice(0, 5) // Return top 5 transit routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Create a new flight (for admin/testing)
router.post('/', async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    res.status(201).json(flight);
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json({ error: 'Failed to create flight' });
  }
});

// Get all flights (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureDateTime: 1 }).limit(100);
    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

module.exports = router;
