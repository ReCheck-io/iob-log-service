const { extractCertificateFingerprint } = require('../utils');

/**
 * Middleware to extract and validate client certificates
 * Supports both nginx proxy mode and direct TLS mode
 */
function certificateMiddleware(req, res, next) {
  try {
    // Skip certificate check for health endpoint
    if (req.path === '/health') {
      return next();
    }

    const certMode = process.env.CERT_MODE || 'nginx';

    if (certMode === 'direct') {
      // Direct TLS mode - extract from Node.js TLS socket
      return handleDirectTLS(req, res, next);
    } else {
      // Nginx proxy mode - extract from nginx headers
      return handleNginxProxy(req, res, next);
    }
  } catch (error) {
    console.error('Certificate validation error:', error);
    res.status(500).json({
      error: 'Certificate validation failed',
      code: 'CERTIFICATE_ERROR',
    });
  }
}

/**
 * Handle certificate extraction in direct TLS mode
 */
function handleDirectTLS(req, res, next) {
  try {
    // Get certificate from TLS socket
    const socket = req.socket || req.connection;

    if (!socket || !socket.encrypted) {
      return res.status(401).json({
        error: 'TLS connection required',
        code: 'TLS_REQUIRED',
      });
    }

    const cert = socket.getPeerCertificate(true);

    if (!cert || Object.keys(cert).length === 0) {
      return res.status(401).json({
        error: 'Client certificate required',
        code: 'CLIENT_CERTIFICATE_REQUIRED',
      });
    }

    // Check if certificate is authorized (not self-signed for this context)
    if (cert.issuerCertificate === cert) {
      // Self-signed certificate - might be acceptable for development
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({
          error: 'Self-signed certificates not allowed in production',
          code: 'INVALID_CERTIFICATE',
        });
      }
    }

    // Check certificate validity dates
    const now = new Date();
    const validFrom = new Date(cert.valid_from);
    const validTo = new Date(cert.valid_to);

    if (now < validFrom) {
      return res.status(401).json({
        error: 'Client certificate is not yet valid',
        code: 'PREMATURE_CERTIFICATE',
        details: {
          validFrom: cert.valid_from,
          currentTime: now.toISOString(),
        },
      });
    }

    if (now > validTo) {
      return res.status(401).json({
        error: 'Client certificate has expired',
        code: 'EXPIRED_CERTIFICATE',
        details: {
          expiredOn: cert.valid_to,
          currentTime: now.toISOString(),
        },
      });
    }

    // Extract fingerprint
    let fingerprint = null;
    if (cert.fingerprint256) {
      // Remove colons from fingerprint and convert to lowercase
      fingerprint = cert.fingerprint256.replace(/:/g, '').toLowerCase();
    } else {
      return res.status(401).json({
        error: 'Unable to extract certificate fingerprint',
        code: 'FINGERPRINT_EXTRACTION_FAILED',
      });
    }

    // Build certificate object compatible with nginx format
    const certInfo = {
      subject: cert.subject || {},
      issuer: cert.issuer || {},
      valid_from: cert.valid_from,
      valid_to: cert.valid_to,
      serialNumber: cert.serialNumber,
      fingerprint256: cert.fingerprint256,
      verified: true, // TLS socket already verified the certificate
    };

    // Attach certificate info to request for use in handlers
    req.certificateFingerprint = fingerprint;
    req.clientCertificate = certInfo;
    req.certificateMode = 'direct';

    next();
  } catch (error) {
    console.error('Direct TLS certificate validation error:', error);
    res.status(500).json({
      error: 'Certificate validation failed',
      code: 'CERTIFICATE_ERROR',
    });
  }
}

/**
 * Handle certificate extraction in nginx proxy mode
 */
function handleNginxProxy(req, res, next) {
  try {
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
        details: [`nginx verification status: ${sslClientVerify || 'NONE'}`],
      });
    }

    // Check if we have required certificate information
    if (!sslClientFingerprint && !sslClientCert) {
      return res.status(401).json({
        error: 'Client certificate information missing',
        code: 'MISSING_CERTIFICATE_INFO',
      });
    }

    // Extract fingerprint (prefer direct fingerprint from nginx)
    let fingerprint = null;
    if (sslClientFingerprint) {
      // Clean up nginx fingerprint format (remove colons, make lowercase)
      fingerprint = sslClientFingerprint.replace(/:/g, '').toLowerCase();
    } else if (sslClientCert) {
      // Fallback: extract fingerprint from certificate
      fingerprint = extractCertificateFingerprint({
        raw: Buffer.from(sslClientCert, 'base64'),
      });
    }

    if (!fingerprint) {
      return res.status(401).json({
        error: 'Unable to extract certificate fingerprint',
        code: 'FINGERPRINT_EXTRACTION_FAILED',
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
            currentTime: now.toISOString(),
          },
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
            currentTime: now.toISOString(),
          },
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
      verified: sslClientVerify === 'SUCCESS',
    };

    // Attach certificate info to request for use in handlers
    req.certificateFingerprint = fingerprint;
    req.clientCertificate = cert;
    req.certificateMode = 'nginx';

    next();
  } catch (error) {
    console.error('Nginx proxy certificate validation error:', error);
    res.status(500).json({
      error: 'Certificate validation failed',
      code: 'CERTIFICATE_ERROR',
    });
  }
}

module.exports = certificateMiddleware;
