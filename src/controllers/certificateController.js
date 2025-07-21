/**
 * Certificate info endpoint (JSON response)
 * Returns certificate details for authenticated client
 */
function getCertificateInfo(req, res) {
  const cert = req.clientCertificate;
  const fingerprint = req.certificateFingerprint;
  
  res.json({
    success: true,
    message: 'Client certificate validated successfully',
    certificate: {
      subject: cert?.subject || {},
      issuer: cert?.issuer || {},
      validFrom: cert?.valid_from || null,
      validTo: cert?.valid_to || null,
      serialNumber: cert?.serialNumber || null,
      fingerprint: fingerprint
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Debug endpoint to see all certificate properties from nginx headers
 * Useful for troubleshooting certificate issues
 */
function getCertificateDebug(req, res) {
  const cert = req.clientCertificate;
  
  // Get all SSL-related headers from nginx
  const sslHeaders = {};
  Object.keys(req.headers).forEach(key => {
    if (key.toLowerCase().startsWith('x-ssl-')) {
      sslHeaders[key] = req.headers[key];
    }
  });
  
  res.json({
    success: true,
    message: 'Certificate debug information from nginx headers',
    certificateFromHeaders: cert,
    allSslHeaders: sslHeaders,
    allHeaders: req.headers,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getCertificateInfo,
  getCertificateDebug
}; 