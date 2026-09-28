const express = require("express");

const {
  processPayment,
  handleWebhook,
} = require("../controllers/payment.controller");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, processPayment);

router.post("/webhook", handleWebhook);

module.exports = router;