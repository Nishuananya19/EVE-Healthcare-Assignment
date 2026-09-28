const prisma = require("../config/database");
const crypto = require("crypto");

const processPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.userId !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to pay for this booking",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        message: "Booking is not pending",
      });
    }

    // Simulate payment
    const status = Math.random() < 0.8 ? "SUCCESS" : "FAILED";

    const eventId = crypto.randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.amount,
          status,
          eventId,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: status === "SUCCESS" ? "CONFIRMED" : "FAILED",
        },
      });

      return { payment, updatedBooking };
    });

    return res.status(201).json({
      message: `Payment ${status.toLowerCase()}`,
      ...result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Payment processing failed",
    });
  }
};
const handleWebhook = async (req, res) => {
  try {
    const { eventId, bookingId, status } = req.body;

    if (!eventId || !bookingId || !status) {
      return res.status(400).json({
        message: "eventId, bookingId and status are required",
      });
    }

    if (!["SUCCESS", "FAILED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    // Idempotency check
    const existingEvent = await prisma.payment.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      return res.status(200).json({
        message: "Webhook already processed",
        payment: existingEvent,
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Prevent a second payment for the same booking
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: Number(bookingId) },
    });

    if (existingPayment) {
      return res.status(409).json({
        message: "Payment already exists for this booking",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        message: "Booking is not pending",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.amount,
          status,
          eventId,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: status === "SUCCESS" ? "CONFIRMED" : "FAILED",
        },
      });

      return { payment, updatedBooking };
    });

    res.status(200).json({
      message: "Webhook processed successfully",
      ...result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  processPayment,
  handleWebhook,
};

;