const express = require('express');

const systemRoutes = require('./system.routes');
const certificateRoutes = require('./certificate.routes');
const registryRoutes = require('./registry.routes');
const logRoutes = require('./log.routes');

const router = express.Router();

router.use('/system', systemRoutes);
router.use('/certificates', certificateRoutes); // Certificate info endpoints - ONLY FOR DEBUGGING
router.use('/logs', logRoutes); // Log API endpoints
router.use('/buildings', registryRoutes); // Registry API endpoints

// 404 handler for unmatched routes
router.use('*', (req, res) => {
  console.log(req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
  });
});

module.exports = router;
