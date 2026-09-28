require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const authenticate = require("./middleware/auth.middleware");
const centreRoutes = require("./routes/centre.routes");
const testRoutes = require("./routes/test.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/centres", centreRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "EVE Healthcare API is running",
  });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      database: "not connected",
    });
  }
});
app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});
app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});
module.exports = app;