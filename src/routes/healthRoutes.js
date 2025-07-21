const express = require('express');
const { healthCheck } = require('../controllers/healthController');

const router = express.Router();

// Health check endpoint (no certificate required for monitoring)
router.get('/health', healthCheck);

module.exports = router; 