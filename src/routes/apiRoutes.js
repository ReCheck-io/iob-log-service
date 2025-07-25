const express = require('express');
const { 
  register, 
  verify, 
  getLogsByUuid, 
  getLogsByAction 
} = require('../controllers/apiController');

const router = express.Router();

// Main API routes for logging functionality
router.post('/api/register', register);
router.post('/api/verify', verify);

// Log retrieval endpoints
router.get('/api/logs/uuid/:uuid', getLogsByUuid);
router.get('/api/logs/action/:action', getLogsByAction);

module.exports = router; 