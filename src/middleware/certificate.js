const { extractCertificateFingerprint } = require('../utils');

/**
 * Middleware to extract and validate client certificates from nginx headers
 * Handles mTLS certificate validation and fingerprint extraction
 */
function certificateMiddleware(req, res, next) {
  try {
    // Skip certificate check for health endpoint
    if (req.path === '/health') {
      return next();
    }

    // Get certificate info from nginx headers
    const sslClientVerify = req.headers['x-ssl-client-verify'];
    const sslClientFingerprint = req.headers['x-ssl-client-fingerprint'];
    const sslClientCert = req.headers['x-ssl-client-cert'];
    const sslClientSubject = req.headers['x-ssl-client-subject'];
    const sslClientIssuer = req.headers['x-ssl-client-issuer'];
    const sslClientValidFrom = req.headers['x-ssl-client-not-before'];
    const sslClientValidTo = req.headers['x-ssl-client-not-after'];
    const sslClientSerial = req.headers['x-ssl-client-serial'];

    // Check if nginx verified the client certificate
    if (sslClientVerify !== 'SUCCESS') {
      return res.status(401).json({ 
        error: 'Client certificate verification failed',
        code: 'CERTIFICATE_VERIFICATION_FAILED',
        details: [`nginx verification status: ${sslClientVerify || 'NONE'}`]
      });
    }

    // Check if we have required certificate information
    if (!sslClientFingerprint && !sslClientCert) {
      return res.status(401).json({ 
        error: 'Client certificate information missing',
        code: 'MISSING_CERTIFICATE_INFO'
      });
    }

    // Extract fingerprint (prefer direct fingerprint from nginx)
    let fingerprint = null;
    if (sslClientFingerprint) {
      // Clean up nginx fingerprint format (remove colons, make lowercase)
      fingerprint = sslClientFingerprint.replace(/:/g, '').toLowerCase();
    } else if (sslClientCert) {
      // Fallback: extract fingerprint from certificate
      fingerprint = extractCertificateFingerprint({ raw: Buffer.from(sslClientCert, 'base64') });
    }

    if (!fingerprint) {
      return res.status(401).json({ 
        error: 'Unable to extract certificate fingerprint',
        code: 'FINGERPRINT_EXTRACTION_FAILED'
      });
    }

    // Validate certificate expiration if dates are available
    if (sslClientValidTo) {
      const now = new Date();
      const validTo = new Date(sslClientValidTo);
      if (now > validTo) {
        return res.status(401).json({
          error: 'Client certificate has expired',
          code: 'EXPIRED_CERTIFICATE',
          details: {
            expiredOn: sslClientValidTo,
            currentTime: now.toISOString()
          }
        });
      }
    }

    if (sslClientValidFrom) {
      const now = new Date();
      const validFrom = new Date(sslClientValidFrom);
      if (now < validFrom) {
        return res.status(401).json({
          error: 'Client certificate is not yet valid',
          code: 'PREMATURE_CERTIFICATE',
          details: {
            validFrom: sslClientValidFrom,
            currentTime: now.toISOString()
          }
        });
      }
    }

    // Build certificate object from nginx headers
    const cert = {
      subject: sslClientSubject ? { CN: sslClientSubject } : {},
      issuer: sslClientIssuer ? { CN: sslClientIssuer } : {},
      valid_from: sslClientValidFrom,
      valid_to: sslClientValidTo,
      serialNumber: sslClientSerial,
      fingerprint256: sslClientFingerprint,
      verified: sslClientVerify === 'SUCCESS'
    };

    // Attach certificate info to request for use in handlers
    req.certificateFingerprint = fingerprint;
    req.clientCertificate = cert;
    
    next();
  } catch (error) {
    console.error('Certificate validation error:', error);
    res.status(500).json({ 
      error: 'Certificate validation failed',
      code: 'CERTIFICATE_ERROR'
    });
  }
}

module.exports = certificateMiddleware; 