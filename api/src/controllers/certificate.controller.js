/**
 * @swagger
 * /api/certificates/info:
 *   get:
 *     tags: [Certificates]
 *     summary: Get client certificate information
 *     description: Retrieve detailed information about the authenticated client certificate
 *     security:
 *       - mTLS: []
 *     responses:
 *       200:
 *         description: Certificate information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     certificateMode:
 *                       type: string
 *                       example: "nginx"
 *                     certificate:
 *                       $ref: '#/components/schemas/CertificateInfo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
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
      fingerprint: fingerprint,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * @swagger
 * /api/certificates/debug:
 *   get:
 *     tags: [Certificates]
 *     summary: Debug certificate information
 *     description: Detailed debug information including all SSL headers (development only)
 *     security:
 *       - mTLS: []
 *     responses:
 *       200:
 *         description: Debug information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 certificateMode:
 *                   type: string
 *                 certificate:
 *                   type: object
 *                 sslHeaders:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
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
      cipher: socket.getCipher ? socket.getCipher() : null,
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
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getCertificateInfo,
  getCertificateDebug,
};
