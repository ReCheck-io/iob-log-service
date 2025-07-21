const express = require("express");
const healthRoutes = require("./healthRoutes");
const certificateRoutes = require("./certificateRoutes");
const apiRoutes = require("./apiRoutes");

const router = express.Router();

// Combine all route modules
router.use("/", healthRoutes); // Health endpoints (no mTLS)
router.use("/", certificateRoutes); // Certificate info endpoints
router.use("/", apiRoutes); // Main API endpoints

// 404 handler for unmatched routes
router.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    code: "NOT_FOUND",
  });
});

module.exports = router;
