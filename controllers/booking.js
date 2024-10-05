const Booking = require('../models/Booking');
const Service = require('../models/Service');
const CancelledBooking = require("../models/CancelledBooking");
const { Op } = require('sequelize');

async function createBooking(req, res) {
  const { serviceId, bookingDate, notes } = req.body;

  if (!serviceId || !bookingDate) {
    const err = new Error('Missing required parameters: serviceId and bookingDate are required');
    err.statusCode = 400;
    throw err;
  }

  if (isNaN(Date.parse(bookingDate))) {
    const err = new Error('Invalid bookingDate format');
    err.statusCode = 400;
    throw err;
  }

  const userId = req.user.id;
  try {
    const service = await Service.findByPk(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Check for existing confirmed bookings at the same date and time
    const existingBooking = await Booking.findOne({
      where: {
        providerProfileId: service.providerProfileId,
        bookingDate: new Date(bookingDate),
        status: 'confirmed',
      },
    });

    if (existingBooking) {
      const err = new Error('This time slot is already booked');
      err.statusCode = 400;
      throw err;
    }

    const booking = await Booking.create({
      userId,
      serviceId,
      providerProfileId: service.providerProfileId,
      bookingDate,
      notes,
      status: 'pending',
      confirmed: false,
    });

    res.status(201).json(booking);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function cancelBookingByUser(req, res) {
  const { bookingId } = req.params;
  const { reason } = req.body;
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    if (booking.userId !== req.user.id) {
      throw new Error('You are not authorized to cancel this booking');
    }
    
    const cancelledBooking = await CancelledBooking.create({
      bookingId,
      reason,
      by: 'user',
    });
    res.status(200).json(cancelledBooking);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function cancelBookingByProvider(req, res) {
  const { bookingId } = req.params;
  const { reason } = req.body;
  try {
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    if (booking.providerProfileId !== req.user.profile.id) {
      throw new Error('You are not authorized to cancel this booking');
    }

    const cancelledBooking = await CancelledBooking.create({
      bookingId,
      reason,
      by: 'provider',
    });
    res.status(200).json(cancelledBooking);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function acceptBooking(req, res) {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.providerProfileId !== req.user.profile.id) {
      throw new Error('You are not authorized to accept this booking');
    }
    booking.status = 'confirmed';
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function completeBooking(req, res) {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.providerProfileId !== req.user.profile.id) {
      throw new Error('You are not authorized to complete this booking');
    }
    booking.status = 'completed';
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function getBookingsByUser(req, res) {
  const userId = req.user.id;
  try {
    const bookings = await Booking.findAll({ where: { userId } });
    res.status(200).json(bookings);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function getBookingsByProvider(req, res) {
  const providerId = req.user.profile.id;
  try {
    const bookings = await Booking.findAll({ where: { providerProfileId: providerId } });
    res.status(200).json(bookings);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function getFreeSlots(req, res) {
  const { date } = req.query;
  const { serviceId } = req.params;
  const selectedDate = new Date(date);

  try {
    // Get the service profile
    const service = await Service.findByPk(serviceId);

    if (!service) {
        const err = new Error('Service not found');
        err.statusCode = 400;
        throw err;
    }

    // Check if the selected date is in the service's days of operation
    const dayOfWeek = selectedDate.getDay();
    if (!service.daysOfOperation.includes(dayOfWeek)) {
      return res.status(200).json([]);
    }

    // Get the service's working hours
    const startTime = new Date(selectedDate);
    startTime.setHours(service.startTime.getHours(), service.startTime.getMinutes(), 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(service.endTime.getHours(), service.endTime.getMinutes(), 0, 0);

    // Get existing bookings for the selected date
    const existingBookings = await Booking.findAll({
      where: {
        serviceId: serviceId,
        bookingDate: {
          [Op.between]: [startTime, endTime]
        },
        status: ['pending', 'confirmed']
      },
      order: [['bookingDate', 'ASC']]
    });

    // Generate all possible time slots
    const allSlots = [];
    let currentSlot = new Date(startTime);
    while (currentSlot < endTime) {
      allSlots.push(new Date(currentSlot));
      currentSlot.setHours(currentSlot.getHours() + 1);
    }

    // Filter out booked slots
    const freeSlots = allSlots.filter(slot => {
      return !existingBookings.some(booking => {
        const bookingTime = new Date(booking.bookingDate);
        return bookingTime.getHours() === slot.getHours() && 
               bookingTime.getMinutes() === slot.getMinutes();
      });
    });

    // Format the free slots as HH:MM
    const formattedFreeSlots = freeSlots.map(slot => 
      `${slot.getHours().toString().padStart(2, '0')}:${slot.getMinutes().toString().padStart(2, '0')}`
    );

    res.status(200).json(formattedFreeSlots);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

module.exports = {
  createBooking,
  cancelBookingByUser,
  cancelBookingByProvider,
  acceptBooking,
  completeBooking,
  getBookingsByUser,
  getBookingsByProvider,
  getFreeSlots,
};
