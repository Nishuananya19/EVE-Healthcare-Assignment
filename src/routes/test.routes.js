const express = require("express");

const {
  createTest,
  getTests,
  addTestToCentre,
} = require("../controllers/test.controller");

const authenticate = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/", authenticate, createTest);
router.get("/", getTests);
router.post(
  "/centre/:centreId",
  authenticate,
  addTestToCentre
);

module.exports = router;