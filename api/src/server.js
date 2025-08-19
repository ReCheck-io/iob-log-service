require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const { initializeCanisters } = require('./canister');
const certificateMiddleware = require('./middleware/certificate');
const { swaggerDocs, swaggerUIOptions } = require('./swagger');

const app = express();

const PORT = process.env.PORT || 4000;

// Certificate mode configuration
const CERT_MODE = process.env.CERT_MODE || 'nginx'; // 'nginx' or 'direct'
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || './certs/server.crt';
const TLS_KEY_PATH = process.env.TLS_KEY_PATH || './certs/server.key';
const TLS_CA_PATH = process.env.TLS_CA_PATH || './certs/ca.crt';

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    credentials: true,
  })
);

// HTTPS redirect middleware (only for direct TLS mode)
app.use((req, res, next) => {
  if (
    CERT_MODE === 'direct' &&
    !req.secure &&
    req.get('x-forwarded-proto') !== 'https'
  ) {
    const httpsUrl = `https://${req.get('host')}${req.url}`;
    return res.redirect(301, httpsUrl);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Swagger documentation (before auth middleware for public access)
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, swaggerUIOptions)
);

app.use(certificateMiddleware);
app.use('/api', routes);

app.use((error, req, res) => {
  console.error('Unhandled error:', error);
  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

/**
 * Create server based on certificate mode
 */
function createServer() {
  if (CERT_MODE === 'direct') {
    // Direct TLS mode - Node.js handles mTLS
    try {
      const serverOptions = {
        cert: fs.readFileSync(TLS_CERT_PATH),
        key: fs.readFileSync(TLS_KEY_PATH),
        ca: fs.readFileSync(TLS_CA_PATH),
        requestCert: true, // Request client certificate
        rejectUnauthorized: false, // Don't reject unauthorized certificates (we handle validation in middleware)
        // Use more compatible TLS settings
        // secureProtocol: "TLSv1_2_method", // TLS 1.2 for better compatibility
        // honorCipherOrder: true,
      };

      console.log('🔒 Using direct TLS mode with local certificates');
      console.log(`📁 Server cert: ${TLS_CERT_PATH}`);
      console.log(`🔑 Server key: ${TLS_KEY_PATH}`);
      console.log(`🏛️  CA cert: ${TLS_CA_PATH}`);

      return https.createServer(serverOptions, app);
    } catch (error) {
      console.error('❌ Failed to load TLS certificates:', error.message);
      console.error('💡 Make sure certificate files exist and are readable');
      console.error('📝 Check the paths in your .env file:');
      console.error(`   TLS_CERT_PATH=${TLS_CERT_PATH}`);
      console.error(`   TLS_KEY_PATH=${TLS_KEY_PATH}`);
      console.error(`   TLS_CA_PATH=${TLS_CA_PATH}`);
      process.exit(1);
    }
  } else {
    // Nginx proxy mode - nginx handles TLS
    console.log('🌐 Using nginx proxy mode (TLS handled by nginx)');
    return http.createServer(app);
  }
}

const server = createServer();

async function startServer() {
  try {
    console.log('🚀 Starting IoB Chain Logger API...');
    console.log(`🎛️  Certificate mode: ${CERT_MODE}`);
    console.log('');

    await initializeCanisters();

    server.listen(PORT, () => {
      const protocol = CERT_MODE === 'direct' ? 'https' : 'http';
      console.log('');
      console.log(
        `🚀 IoB Chain Logger API running on ${protocol}://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
