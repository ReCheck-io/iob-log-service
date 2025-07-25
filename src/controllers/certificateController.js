/**
 * Certificate info endpoint (JSON response)
 * Returns certificate details for authenticated client
 */
function getCertificateInfo(req, res) {
  const cert = req.clientCertificate;
  const fingerprint = req.certificateFingerprint;
  const certMode = req.certificateMode || process.env.CERT_MODE || 'nginx';
  
  res.json({
    success: true,
    message: 'Client certificate validated successfully',
    certificateMode: certMode,
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
  const certMode = req.certificateMode || process.env.CERT_MODE || 'nginx';
  
  // Get all SSL-related headers from nginx (if in nginx mode)
  const sslHeaders = {};
  Object.keys(req.headers).forEach(key => {
    if (key.toLowerCase().startsWith('x-ssl-')) {
      sslHeaders[key] = req.headers[key];
    }
  });
  
  // Additional debug info for direct TLS mode
  let tlsInfo = null;
  if (certMode === 'direct' && req.socket) {
    const socket = req.socket;
    tlsInfo = {
      encrypted: socket.encrypted || false,
      authorized: socket.authorized || false,
      authorizationError: socket.authorizationError || null,
      protocol: socket.getProtocol ? socket.getProtocol() : null,
      cipher: socket.getCipher ? socket.getCipher() : null
    };
  }
  
  res.json({
    success: true,
    message: `Certificate debug information (${certMode} mode)`,
    certificateMode: certMode,
    certificateInfo: cert,
    tlsSocketInfo: tlsInfo,
    nginxSslHeaders: sslHeaders,
    allHeaders: req.headers,
    environmentConfig: {
      CERT_MODE: process.env.CERT_MODE,
      TLS_CERT_PATH: process.env.TLS_CERT_PATH,
      TLS_KEY_PATH: process.env.TLS_KEY_PATH,
      TLS_CA_PATH: process.env.TLS_CA_PATH,
      NODE_ENV: process.env.NODE_ENV
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getCertificateInfo,
  getCertificateDebug
}; 