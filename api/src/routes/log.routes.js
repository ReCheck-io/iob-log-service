const express = require('express');
const {
  register,
  verify,
  getLogsByUuid,
  getLogsByAction,
} = require('../controllers/log.controller');

const router = express.Router();

// Main API routes for logging functionality
router.post('/', register);
router.post('/verify', verify);

// Log retrieval endpoints
router.get('/uuid/:uuid', getLogsByUuid);
router.get('/action/:action', getLogsByAction);

module.exports = router;
