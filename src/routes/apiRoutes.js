const express = require('express');
const { 
  register, 
  verify, 
  getLogsByDataId, 
  getLogsByAction 
} = require('../controllers/apiController');

const router = express.Router();

// Main API routes for logging functionality
router.post('/api/register', register);
router.post('/api/verify', verify);

// Log retrieval endpoints
router.get('/api/logs/data/:dataId', getLogsByDataId);
router.get('/api/logs/action/:action', getLogsByAction);

module.exports = router; 