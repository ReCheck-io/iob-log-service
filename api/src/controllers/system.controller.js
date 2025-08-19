/**
 * @swagger
 * /api/system/health:
 *   get:
 *     tags: [System]
 *     summary: Health check endpoint
 *     description: Check the health status of the API service (no authentication required)
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: "healthy"
 *               timestamp: "2025-08-19T12:00:00Z"
 *               service: "iob-chain-logger-api"
 */
/**
 * Health check endpoint (no certificate required for monitoring)
 */
function healthCheck(req, res) {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'iob-chain-logger-api',
  });
}

module.exports = {
  healthCheck,
};
