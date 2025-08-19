const express = require('express');
const {
  getCertificateInfo,
  getCertificateDebug,
} = require('../controllers/certificate.controller');

const router = express.Router();

router.get('/info', getCertificateInfo);
router.get('/debug', getCertificateDebug);

module.exports = router;
