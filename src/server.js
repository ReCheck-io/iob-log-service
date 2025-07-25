require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');
const certificateMiddleware = require('./middleware/certificate');
const { initializeCanister, getServicePrincipal } = require('./canister');

const app = express();

const PORT = process.env.PORT || 4000;

// Certificate mode configuration
const CERT_MODE = process.env.CERT_MODE || 'nginx'; // 'nginx' or 'direct'
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || './certs/server.crt';
const TLS_KEY_PATH = process.env.TLS_KEY_PATH || './certs/server.key';
const TLS_CA_PATH = process.env.TLS_CA_PATH || './certs/ca.crt';

app.use(helmet());
app.use(cors( {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(certificateMiddleware);
app.use('/', routes);

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
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
        requestCert: true,
        rejectUnauthorized: false, // Allow self-signed certificates for development
        checkServerIdentity: () => undefined // Skip hostname verification for development
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
    
    await initializeCanister();
    
    server.listen(PORT, () => {
      const protocol = CERT_MODE === 'direct' ? 'https' : 'http';
      console.log(`🚀 IoB Chain Logger API running on ${protocol}://localhost:${PORT}`);
      
      if (CERT_MODE === 'direct') {
        console.log('🔐 mTLS authentication is handled directly by Node.js');
        console.log('💡 Use client certificates to authenticate requests');
      } else {
        console.log('🌐 mTLS authentication is handled by nginx proxy');
        console.log('💡 Make sure nginx is configured for mTLS forwarding');
      }
      
      const servicePrincipal = getServicePrincipal();
      if (servicePrincipal) {
        console.log('');
        console.log('🔑 Current Service Principal:', servicePrincipal);
        console.log('💡 Make sure this principal is authorized in your canister!');
      }
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
