const prisma = require("../config/database");

const createBooking = async (req, res) => {
  try {
    const { testId, centreId, appointmentTime } = req.body;

    if (!testId || !centreId || !appointmentTime) {
      return res.status(400).json({
        message: "Test, centre and appointment time are required",
      });
    }

    const test = await prisma.diagnosticTest.findUnique({
      where: {
        id: Number(testId),
      },
    });

    if (!test) {
      return res.status(404).json({
        message: "Diagnostic test not found",
      });
    }

    const centre = await prisma.diagnosticCentre.findUnique({
      where: {
        id: Number(centreId),
      },
    });

    if (!centre) {
      return res.status(404).json({
        message: "Diagnostic centre not found",
      });
    }

    const centreTest = await prisma.centreTest.findUnique({
      where: {
        centreId_testId: {
          centreId: Number(centreId),
          testId: Number(testId),
        },
      },
    });

    if (!centreTest) {
      return res.status(400).json({
        message: "This test is not available at this centre",
      });
    }

    const appointment = new Date(appointmentTime);

    if (Number.isNaN(appointment.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment time",
      });
    }

    if (appointment <= new Date()) {
      return res.status(400).json({
        message: "Appointment time must be in the future",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.userId,
        testId: Number(testId),
        centreId: Number(centreId),
        appointmentTime: appointment,
        amount: centreTest.price,
        status: "PENDING",
      },
      include: {
        test: true,
        centre: true,
      },
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        test: true,
        centre: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        test: true,
        centre: true,
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.userId !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to access this booking",
      });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.userId !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "CONFIRMED") {
      return res.status(400).json({
        message: "Confirmed booking cannot be cancelled",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    res.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};