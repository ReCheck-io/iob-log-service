# IoB Chain Logger & Tokenization Service - Complete Setup Guide

A unified guide for setting up the IoB Chain Logger & Tokenization Service for development and production.

## Prerequisites

- **Node.js 20+** (we recommend using nvm)
- **dfx CLI** for ICP development
- **OpenSSL** for certificate generation
- **nginx** (for production deployment)

## Installation

### 1. Install Node.js 20+

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal and install Node.js 20
nvm install 20
nvm use 20
```

### 2. Install dfx CLI

```bash
# Install dfx
DFX_VERSION=0.22.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify installation
dfx --version
```

### 3. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd iob-chain-logger

# Install API dependencies
cd api
npm install
cd ..

# Install canister dependencies
cd log-canister
npm install
cd ../registry-canister
npm install
cd ..
```

## Development Setup

### Step 1: Generate Test Certificates

```bash
# Generate test certificates for local development
chmod +x scripts/generate-test-certs.sh
./scripts/generate-test-certs.sh
```

This creates certificates in `./api/certs/`:
- `ca.crt` - Certificate Authority (install as trusted root)
- `server.crt/key` - Server certificates for HTTPS
- `client.crt/key` - Client certificates for mTLS testing
- `client.p12` & `client-macos.p12` - Browser-compatible formats

### Step 2: Install Certificates (for Browser Testing)

**macOS:**
- Double-click `api/certs/client-macos.p12` → Install in Keychain
- Double-click `api/certs/ca.crt` → Install as trusted root
- Set both to "Always Trust"

**Other browsers:**
- Import `api/certs/client.p12` in browser settings
- Import `api/certs/ca.crt` as trusted root

### Step 3: Start Node.js Service (Get Service Principal)

```bash
cd api
npm run dev
```

**Important:** The service will auto-generate an identity and display the service principal:

```bash
🚀 Starting IoB Chain Logger API...
🔑 Generating new service identity...
💾 Service identity saved to: ./identity.secret
🆔 Service Principal: <YOUR_API_SERVICE_PRINCIPAL>
📝 To authorize this service during deployment, use:
   dfx deploy --argument "(opt principal \"<YOUR_API_SERVICE_PRINCIPAL>\")"

⚠️  CANISTER_ID_LOG not configured - log canister client not created
⚠️  CANISTER_ID_REGISTRY not configured - registry canister client not created
🚀 IoB Chain Logger API running on https://localhost:4000
```

**Copy the service principal shown in the logs - you'll need it for canister deployment.**

### Step 4: Deploy ICP Canisters

In a separate terminal:

```bash
# Start local ICP replica
dfx start --background

# Deploy log canister with service authorization
cd log-canister
dfx deploy --argument "(opt principal \"<YOUR_API_SERVICE_PRINCIPAL>\")"
cd ..

# Deploy registry canister with service authorization
cd registry-canister
dfx deploy --argument "(opt principal \"<YOUR_API_SERVICE_PRINCIPAL>\")"
cd ..
```

### Step 5: Configure Environment

```bash
cd api
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
CERT_MODE=direct

# Certificate Paths (for direct mode)
TLS_CERT_PATH=./certs/server.crt
TLS_KEY_PATH=./certs/server.key
TLS_CA_PATH=./certs/ca.crt

# ICP Canister Configuration
CANISTER_ID_LOG=<YOUR_LOG_CANISTER_ID>
CANISTER_ID_REGISTRY=<YOUR_REGISTRY_CANISTER_ID>
IC_HOST=http://127.0.0.1:4943

# Service Identity (auto-generated if not provided)
IDENTITY_SECRET_PATH=./identity.secret

# CORS Configuration
ALLOWED_ORIGINS=*
```

**Get your canister IDs:**

```bash
# Get log canister ID
cd log-canister && dfx canister id log && cd ..

# Get registry canister ID
cd registry-canister && dfx canister id registry && cd ..
```

### Step 6: Restart Service

```bash
# Stop the current service (Ctrl+C) and restart
cd api
npm run dev
```

Now you should see:

```bash
📋 Loading existing service identity...
🆔 Service Principal: <YOUR_API_SERVICE_PRINCIPAL>
✅ Log canister client initialized successfully
✅ Registry canister client initialized successfully
🎯 Log Canister ID: <YOUR_LOG_CANISTER_ID>
🎯 Registry Canister ID: <YOUR_REGISTRY_CANISTER_ID>
🚀 IoB Chain Logger API running on https://localhost:4000
```

## API Endpoints

### System Endpoints
- `GET /health` - Health check (no auth required)
- `GET /cert-info` - mTLS certificate information
- `GET /api-docs` - Swagger API documentation

### Audit Logging Endpoints
- `POST /api/register` - Register audit log from main IoB platform
- `POST /api/verify` - Verify an existing log entry
- `GET /api/logs/uuid/:uuid` - Get logs by UUID
- `GET /api/logs/action/:action` - Get logs by action type

### Building Management Endpoints
- `POST /buildings` - Tokenize a building from main IoB platform data
- `GET /buildings` - List all tokenized buildings in this service
- `GET /buildings/:uuid` - Get tokenized building details
- `GET /buildings/owner/:principal` - Get tokenized buildings by owner

### Token Operations Endpoints
- `POST /buildings/:uuid/mint` - Mint additional tokens for a building
- `POST /buildings/:uuid/transfer` - Transfer building tokens
- `GET /buildings/:uuid/balance` - Get token balance for a building

## Testing Your Setup

### 1. Health Check (No Certificate Required)

```bash
curl -k https://localhost:4000/health
```

### 2. Certificate Info (Requires mTLS)

```bash
curl -k --cert api/certs/client.crt --key api/certs/client.key \
  https://localhost:4000/cert-info
```

### 3. Register Audit Log

```bash
curl -k --cert api/certs/client.crt --key api/certs/client.key \
  -X POST https://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "action": "create",
    "data": {"description": "Test log entry"}
  }'
```

### 4. Browser Testing

- Visit `https://localhost:4000`
- Select "IoB Test Client" when prompted for certificate
- Navigate to `https://localhost:4000/cert-info` to verify mTLS

## Certificate Modes

### Direct Mode (Development)
- Node.js handles TLS and mTLS directly
- Use self-signed certificates for testing
- Set `CERT_MODE=direct` in `.env`

### nginx Mode (Production)
- nginx handles TLS termination and mTLS validation
- Forwards validated certificate info via headers
- Set `CERT_MODE=nginx` in `.env`

## Production Deployment

### 1. Configure Environment

```env
NODE_ENV=production
CERT_MODE=nginx
PORT=3000

# Production canister configuration
CANISTER_ID_LOG=<YOUR_PROD_LOG_CANISTER_ID>
CANISTER_ID_REGISTRY=<YOUR_PROD_REGISTRY_CANISTER_ID>
IC_HOST=https://icp-api.io

# Production identity
IDENTITY_SECRET_PATH=./identity.secret

# CORS for production
ALLOWED_ORIGINS=https://your-domain.com,https://your-admin-ui.com
```

### 2. nginx Configuration

See `SETUP-NGINX.md` for complete nginx setup with mTLS support.

### 3. Deploy to Production Network

```bash
# Deploy to IC mainnet
dfx deploy --network ic --argument "(opt principal \"<YOUR_API_SERVICE_PRINCIPAL>\")"
```

## Environment Variables Reference

| Variable | Description | Development Example | Production Example |
|----------|-------------|-------------------|-------------------|
| `PORT` | Server port | `4000` | `3000` |
| `NODE_ENV` | Environment | `development` | `production` |
| `CERT_MODE` | Certificate mode | `direct` | `nginx` |
| `TLS_CERT_PATH` | Server certificate | `./certs/server.crt` | N/A (nginx) |
| `TLS_KEY_PATH` | Server private key | `./certs/server.key` | N/A (nginx) |
| `TLS_CA_PATH` | CA certificate | `./certs/ca.crt` | N/A (nginx) |
| `CANISTER_ID_LOG` | Log canister ID | `<DEV_LOG_CANISTER_ID>` | `<PROD_LOG_CANISTER_ID>` |
| `CANISTER_ID_REGISTRY` | Registry canister ID | `<DEV_REGISTRY_CANISTER_ID>` | `<PROD_REGISTRY_CANISTER_ID>` |
| `IC_HOST` | ICP network host | `http://127.0.0.1:4943` | `https://icp-api.io` |
| `IDENTITY_SECRET_PATH` | Service identity file | `./identity.secret` | `./identity.secret` |
| `ALLOWED_ORIGINS` | CORS origins | `*` | `https://your-domain.com` |

## Service Identity Management

The service automatically generates an Ed25519 identity for ICP canister communication:

- **Auto-generation**: If no identity file exists, one is created automatically
- **Persistence**: Identity is saved to `./identity.secret`
- **Authorization**: The service principal must be authorized during canister deployment
- **Security**: Keep `identity.secret` secure and backed up

## Troubleshooting

### Certificate Issues

**Error: "Certificate verification failed"**

1. Regenerate certificates:
   ```bash
   ./scripts/generate-test-certs.sh
   ```

2. Reinstall in browser/keychain
3. Restart browser

### Canister Connection Issues

**Error: "Canister not found"**

1. Check canister IDs in `.env`
2. Verify canisters are deployed:
   ```bash
   dfx canister status log
   dfx canister status registry
   ```
3. Check dfx is running: `dfx ping`

**Error: "Unauthorized access"**

1. Check service principal in logs
2. Re-authorize service:
   ```bash
   dfx canister call log initializeCanister "(principal \"<YOUR_API_SERVICE_PRINCIPAL>\")"
   dfx canister call registry initializeCanister "(principal \"<YOUR_API_SERVICE_PRINCIPAL>\")"
   ```

### Port Conflicts

**Error: "Port already in use"**

```bash
# Find and kill process using port 4000
lsof -i :4000
kill -9 <PID>
```

### Node.js Version Issues

```bash
# Check version (should be 20+)
node --version

# Switch to Node.js 20
nvm use 20
```

## Project Structure

```
iob-chain-logger/
├── api/                        # Node.js REST API
│   ├── src/
│   │   ├── server.js           # Main server entry
│   │   ├── controllers/        # API route handlers
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Auth & validation
│   │   ├── canister/           # ICP canister clients
│   │   └── deployer/           # ICRC2 deployment
│   ├── certs/                  # mTLS certificates
│   ├── .env                    # Environment config
│   └── identity.secret         # Service identity (auto-generated)
├── log-canister/               # Audit logging canister
├── registry-canister/          # Building registry canister
├── ledger-canister/            # ICRC2 token templates
├── ui/                         # Future: Management interface
├── docs/                       # Documentation
└── scripts/                    # Utility scripts
    └── generate-test-certs.sh  # Certificate generation
```

## Next Steps

1. **API Testing**: Use the provided curl examples to test all endpoints
2. **UI Development**: Build the management interface in the `ui/` folder
3. **Production Deployment**: Set up nginx and deploy to IC mainnet
4. **Integration**: Connect with the main IoB platform for audit logging

For production nginx setup, see `SETUP-NGINX.md`.
For API details, see `API.md`.
