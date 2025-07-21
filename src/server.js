require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');
const certificateMiddleware = require('./middleware/certificate');
const { initializeCanister, getServicePrincipal } = require('./canister');

const app = express();

const PORT = process.env.PORT || 4000;

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

const server = http.createServer(app);
async function startServer() {
  try {
    console.log('🚀 Starting IoB Chain Logger API...');
    console.log('');
    
    await initializeCanister();
    
    server.listen(PORT, () => {
      console.log(`🚀 IoB Chain Logger API running on http://localhost:${PORT}`);
      
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
