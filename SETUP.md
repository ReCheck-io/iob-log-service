# IoB Chain Logger Setup

Complete setup guide for the IoB Chain Logger Node.js API with ICP canister backend.

## Prerequisites

- **Node.js 20+** installed (we recommend using nvm)
- **dfx CLI** installed for ICP development
- **nginx** (for production TLS/mTLS handling)

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

### 3. Install Project Dependencies

```bash
# Clone and install dependencies
git clone <your-repo-url>
cd iob-chain-logger

# Install Node.js dependencies
npm install

# Install canister dependencies
cd canister
npm install
cd ..
```

## Development Setup

### Recommended Workflow

The simplest approach is to start the Node.js service first to generate and display the service principal, then use that principal for canister deployment.

### 1. Start Node.js Service (Get Service Principal)

```bash
# Start the development server
npm run dev
```

You'll see output like:
```bash
🚀 Starting IoB Chain Logger API...

🔑 Generating new service identity...
💾 Service identity saved to: ./identity.secret
🆔 Service Principal: 4ytgb-e7vlr-eqinv-lwclg-emop7-37okk-6dt5k-wosfr-uiq4e-igs6a-aae
📝 To authorize this service during deployment, use:
   dfx deploy --argument "(opt principal \"4ytgb-e7vlr-eqinv-lwclg-emop7-37okk-6dt5k-wosfr-uiq4e-igs6a-aae\")"
   dfx canister call iob initializeCanister "(principal \"4ytgb-e7vlr-eqinv-lwclg-emop7-37okk-6dt5k-wosfr-uiq4e-igs6a-aae\")"

⚠️  CANISTER_ID_IOB not configured - actor not created
🚀 IoB Chain Logger API running on http://localhost:4000
```

### 2. Deploy ICP Canister

Copy the service principal from the logs above and deploy:

```bash
# Start local ICP replica (in a separate terminal)
dfx start --clean

# Deploy with automatic service authorization
dfx deploy --argument "(opt principal \"4ytgb-e7vlr-eqinv-lwclg-emop7-37okk-6dt5k-wosfr-uiq4e-igs6a-aae\")"
```

### 3. Configure Environment

```bash
# Get your deployed canister ID
dfx canister id iob

# Create environment file
cp .env.example .env
```

Edit `.env` with your canister configuration:
```bash
# Server Configuration
PORT=4000
ALLOWED_ORIGINS=*

# ICP Canister Configuration  
CANISTER_ID_IOB=your_actual_canister_id_here
IC_HOST=http://127.0.0.1:4943

# Service Identity (automatically generated)
IDENTITY_SECRET_PATH=./identity.secret
```

### 4. Restart Service

```bash
# Stop the current service (Ctrl+C) and restart
npm run dev
```

Now you should see:
```bash
📋 Loading existing service identity...
🆔 Service Principal: 4ytgb-e7vlr-eqinv-lwclg-emop7-37okk-6dt5k-wosfr-uiq4e-igs6a-aae
✅ Canister client initialized successfully
🎯 Canister ID: cbopz-duaaa-aaaaa-qaaka-cai
```

## Alternative Deployment Options

### Option A: Manual Authorization (If You Forgot Init Argument)

```bash
# Deploy without authorization
dfx deploy

# Get service principal from Node.js logs, then authorize manually
dfx canister call iob initializeCanister "(principal \"YOUR_SERVICE_PRINCIPAL\")"
```

### Option B: Authorize Current dfx Identity

```bash
# Deploy and authorize current dfx identity
CURRENT_PRINCIPAL=$(dfx identity get-principal)
dfx deploy --argument "(opt principal \"$CURRENT_PRINCIPAL\")"
```

## Production Deployment

### nginx + Certbot Setup

For production deployment with automatic certificate management:

1. **Install nginx and certbot:**
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx -y
   ```

2. **Configure nginx:**
   ```bash
   # Copy nginx configuration
   sudo cp nginx/iob-chain-logger.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/iob-chain-logger.conf /etc/nginx/sites-enabled/
   
   # Edit configuration with your domain
   sudo nano /etc/nginx/sites-available/iob-chain-logger.conf
   ```

3. **Generate SSL certificates:**
   ```bash
   sudo certbot --nginx -d your-api-domain.com
   ```

4. **Start production service:**
   ```bash
   # Set production environment
   NODE_ENV=production npm start
   ```

For detailed nginx setup, see [`nginx/setup-nginx.md`](nginx/setup-nginx.md).

## Testing

### Development Testing

```bash
# Health check
curl http://localhost:4000/health

# Certificate info (requires mTLS setup)
curl -k --cert certs/client.crt --key certs/client.key \
     https://localhost:4000/cert-info
```

### Generate Test Certificates

```bash
# Generate development certificates
npm run setup-certs
```

### API Testing

```bash
# Test registration (with mTLS)
curl -k --cert certs/client.crt --key certs/client.key \
     -X POST https://localhost:4000/api/register \
     -H "Content-Type: application/json" \
     -d '{
       "uuid": "test-uuid-123",
       "objectName": "test-document.pdf", 
       "action": "create"
     }'

# Test verification
curl -k --cert certs/client.crt --key certs/client.key \
     -X POST https://localhost:4000/api/verify \
     -H "Content-Type: application/json" \
     -d '{
       "uuid": "test-uuid-123",
       "objectName": "test-document.pdf",
       "action": "create"
     }'
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `ALLOWED_ORIGINS` | CORS origins | `https://your-app.com` |
| `CANISTER_ID_IOB` | ICP canister ID | `cbopz-duaaa-aaaaa-qaaka-cai` |
| `IC_HOST` | ICP network host | `http://127.0.0.1:4943` (local) or `https://icp-api.io` (mainnet) |
| `IDENTITY_SECRET_PATH` | Service identity file | `./identity.secret` |

## Authentication Flow

The canister supports flexible authentication:

1. **Controllers**: dfx identities that deployed the canister are automatically authorized
2. **Authorized Services**: Principals added via init argument or `initializeCanister` method  
3. **Service Identity**: Node.js service uses persistent Ed25519 identity for canister calls

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (no auth required) |
| `/cert-info` | GET | Certificate information |
| `/cert-debug` | GET | Certificate debugging info |
| `/api/register` | POST | Register new audit log |
| `/api/verify` | POST | Verify existing log |
| `/api/logs/data/:uuid` | GET | Get logs by UUID |
| `/api/logs/action/:action` | GET | Get logs by action type |

## Troubleshooting

### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Should be 20+, if not:
nvm install 20
nvm use 20
```

### Canister Authorization Issues

**Error: "Unauthorized access"**

1. **Check service principal:**
   ```bash
   # Service principal should be displayed in Node.js logs
   npm run dev
   ```

2. **Verify canister authorization:**
   ```bash
   # Test a simple call
   dfx canister call iob getLogsByUuid "(\"test\")"
   ```

3. **Re-authorize if needed:**
   ```bash
   dfx canister call iob initializeCanister "(principal \"YOUR_SERVICE_PRINCIPAL\")"
   ```

### Canister Connection Issues

**Error: "Canister not initialized"**

1. **Check environment variables:**
   ```bash
   echo $CANISTER_ID_IOB
   ```

2. **Verify canister deployment:**
   ```bash
   dfx canister status iob
   ```

3. **Check dfx is running:**
   ```bash
   dfx ping
   ```

### Certificate Issues

**Error: "Certificate verification failed"**

1. **Generate new certificates:**
   ```bash
   npm run setup-certs
   ```

2. **Check nginx headers (production):**
   ```bash
   curl -I https://your-domain.com/health
   ```

3. **Verify certificate validity:**
   ```bash
   openssl x509 -in certs/client.crt -text -noout
   ```

### Common Issues

**Module type warnings:**
- These are cosmetic warnings from dfx-declarations and don't affect functionality

**Port already in use:**
```bash
# Find and kill process using port 4000
lsof -ti:4000 | xargs kill -9
```

**Identity file permissions:**
```bash
# Secure identity file
chmod 600 identity.secret
```

## Project Structure

```
iob-chain-logger/
├── src/                        # Node.js API source
│   ├── server.js               # Main server entry point
│   ├── canister.js             # ICP canister integration
│   ├── utils.js                # Utilities and validation
│   ├── middleware/             # Express middleware
│   ├── controllers/            # Route controllers
│   └── routes/                 # API routes
├── canister/                   # ICP canister source
│   ├── src/                    # Azle TypeScript source
│   ├── dfx-declarations/       # Generated canister interface
│   └── dfx.json                # Canister configuration
├── nginx/                      # Production nginx config
├── certs/                      # Development certificates
├── identity.secret             # Service identity (auto-generated)
├── .env                        # Environment configuration
└── SETUP.md                    # This file
```

## Development Workflow

1. **Start Node.js service** → displays service principal
2. **Deploy canister** with service principal authorization  
3. **Configure environment** with canister ID
4. **Restart service** → fully functional API
5. **Test endpoints** with certificates

For production deployment, see [`nginx/setup-nginx.md`](nginx/setup-nginx.md).

## Next Steps

- Set up your frontend application to call the API
- Configure production certificates and domain
- Set up monitoring and logging
- Review security considerations for your use case 
