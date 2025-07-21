const express = require('express');
const { getCertificateInfo, getCertificateDebug } = require('../controllers/certificateController');

const router = express.Router();

// Certificate info endpoint (JSON response)
router.get('/cert-info', getCertificateInfo);

// Debug endpoint to see all certificate properties
router.get('/cert-debug', getCertificateDebug);

module.exports = router; 