const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');


router.post('/', async (req, res) => {
  try {
    console.log("Incoming booking request:", req.body);

    const { origin, destination, pieces, weightKg, flightIds } = req.body;

    if (!origin || !destination || !pieces || !weightKg) {
      return res.status(400).json({ 
        error: 'Missing required fields: origin, destination, pieces, weightKg' 
      });
    }

    // Generate unique ref_id
    const ref_id = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Validate flightIds if provided
    if (flightIds && Array.isArray(flightIds) && flightIds.length > 0) {
      const Flight = require('../models/Flight');
      const validFlights = await Flight.find({ flightId: { $in: flightIds } });
      if (validFlights.length !== flightIds.length) {
        return res.status(400).json({ error: 'One or more flight IDs are invalid' });
      }
    }

    const booking = new Booking({
      ref_id,
      origin,
      destination,
      pieces: parseInt(pieces),
      weightKg: parseFloat(weightKg),
      status: 'BOOKED',
      flightIds: flightIds || [],
      timeline: []
    });

    await booking.save();

    console.log(`✅ New booking created: ${booking.ref_id}`);
    res.status(201).json(booking);
  } catch (error) {
    console.error('🔥 Error creating booking:', error);
    res.status(500).json({ 
      error: 'Failed to create booking',
      details: error.message
    });
  }
});



// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking by reference ID
router.get('/:refId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ refId: req.params.refId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status - Depart
router.patch('/:refId/depart', async (req, res) => {
  try {
    const { location, flightInfo } = req.body;
    
    const booking = await Booking.findOne({ refId: req.params.refId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot update cancelled booking' });
    }

    booking.status = 'DEPARTED';
    booking.timeline.push({
      eventType: 'DEPARTED',
      location: location || booking.origin,
      flightInfo: flightInfo || '',
      notes: 'Package departed'
    });

    await booking.save();
    
    console.log(`Booking ${booking.refId} marked as DEPARTED`);
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Update booking status - Arrive
router.patch('/:refId/arrive', async (req, res) => {
  try {
    const { location } = req.body;
    
    const booking = await Booking.findOne({ refId: req.params.refId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot update cancelled booking' });
    }

    booking.status = 'ARRIVED';
    booking.timeline.push({
      eventType: 'ARRIVED',
      location: location || booking.destination,
      notes: 'Package arrived'
    });

    await booking.save();
    
    console.log(`Booking ${booking.refId} marked as ARRIVED`);
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Update booking status - Deliver
router.patch('/:refId/deliver', async (req, res) => {
  try {
    const { location } = req.body;
    
    const booking = await Booking.findOne({ refId: req.params.refId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot update cancelled booking' });
    }

    if (booking.status !== 'ARRIVED') {
      return res.status(400).json({ error: 'Booking must be arrived before delivery' });
    }

    booking.status = 'DELIVERED';
    booking.timeline.push({
      eventType: 'DELIVERED',
      location: location || booking.destination,
      notes: 'Package delivered successfully'
    });

    await booking.save();
    
    console.log(`Booking ${booking.refId} marked as DELIVERED`);
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Update booking status - Deliver
router.patch('/:refId/deliver', async (req, res) => {
  try {
    const { location } = req.body;
    
    const booking = await Booking.findOne({ refId: req.params.refId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot update cancelled booking' });
    }

    if (booking.status !== 'ARRIVED') {
      return res.status(400).json({ error: 'Booking must be arrived before it can be delivered' });
    }

    booking.status = 'DELIVERED';
    booking.timeline.push({
      eventType: 'DELIVERED',
      location: location || booking.destination,
      notes: 'Package delivered to recipient'
    });

    await booking.save();
    
    console.log(`Booking ${booking.refId} marked as DELIVERED`);
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Cancel booking
router.patch('/:refId/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ refId: req.params.refId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status === 'ARRIVED' || booking.status === 'DELIVERED') {
      return res.status(400).json({ 
        error: 'Cannot cancel booking that has already arrived or been delivered' 
      });
    }

    booking.status = 'CANCELLED';
    booking.timeline.push({
      eventType: 'CANCELLED',
      location: booking.origin,
      notes: 'Booking cancelled'
    });

    await booking.save();
    
    console.log(`Booking ${booking.refId} cancelled`);
    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
