const express = require("express");

const {
  createCentre,
  getCentres,
  getCentreById,
} = require("../controllers/centre.controller");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, createCentre);
router.get("/", getCentres);
router.get("/:id", getCentreById);

module.exports = router;