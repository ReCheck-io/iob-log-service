/**
 * Health check endpoint (no certificate required for monitoring)
 */
function healthCheck(req, res) {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'iob-chain-logger-api'
  });
}

module.exports = {
  healthCheck
}; 