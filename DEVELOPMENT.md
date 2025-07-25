# Development Guide - Certificate Modes

This guide explains how to develop and test the IoB Chain Logger API with both **nginx proxy mode** (production) and **direct TLS mode** (development).

## Certificate Mode Overview

The API supports two certificate authentication modes:

- **🌐 nginx mode** - TLS termination handled by nginx (production)
- **🔒 direct mode** - TLS handled directly by Node.js (development)

## Quick Setup for Local Development

### 1. Generate Test Certificates

```bash
# Generate test certificates for local development
./scripts/generate-test-certs.sh
```

This creates:
- `certs/ca.crt` - Certificate Authority
- `certs/server.crt` + `certs/server.key` - Server certificates  
- `certs/client.crt` + `certs/client.key` - Client certificates for testing

### 2. Configure Environment

```bash
# Copy the example configuration
cp .env.example .env

# Edit .env for direct mode development
```

Set these variables in `.env`:
```env
CERT_MODE=direct
TLS_CERT_PATH=./certs/server.crt
TLS_KEY_PATH=./certs/server.key
TLS_CA_PATH=./certs/ca.crt
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Starting IoB Chain Logger API...
🎛️  Certificate mode: direct
🔒 Using direct TLS mode with local certificates
📁 Server cert: ./certs/server.crt
🔑 Server key: ./certs/server.key
🏛️  CA cert: ./certs/ca.crt
🚀 IoB Chain Logger API running on https://localhost:4000
🔐 mTLS authentication is handled directly by Node.js
```

### 4. Test Your Setup

```bash
# Test health endpoint (no certificate required)
curl -k https://localhost:4000/health

# Test with client certificate
curl -k --cert certs/client.crt --key certs/client.key https://localhost:4000/cert-info

# Test API registration
curl -k --cert certs/client.crt --key certs/client.key \
  -X POST https://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "action": "create",
    "data": {"description": "Test log entry"}
  }'
```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Mode |
|----------|-------------|---------|------|
| `CERT_MODE` | Certificate mode (`nginx` or `direct`) | `nginx` | Both |
| `TLS_CERT_PATH` | Server certificate path | `./certs/server.crt` | Direct |
| `TLS_KEY_PATH` | Server private key path | `./certs/server.key` | Direct |
| `TLS_CA_PATH` | CA certificate path | `./certs/ca.crt` | Direct |
| `PORT` | Server port | `4000` | Both |
| `NODE_ENV` | Environment (`development`/`production`) | `development` | Both |

### Direct Mode Options

For development, you can modify the server TLS options in `src/server.js`:

```javascript
const serverOptions = {
  cert: fs.readFileSync(TLS_CERT_PATH),
  key: fs.readFileSync(TLS_KEY_PATH), 
  ca: fs.readFileSync(TLS_CA_PATH),
  requestCert: true,
  rejectUnauthorized: false, // Set to false for self-signed certs
  checkServerIdentity: () => undefined // Skip hostname verification
};
```

## Development Workflows

### Workflow 1: Direct Mode Development

Perfect for local API development and testing:

```bash
# 1. Generate certificates
./scripts/generate-test-certs.sh

# 2. Configure for direct mode
echo "CERT_MODE=direct" > .env

# 3. Start server
npm run dev

# 4. Test API endpoints
curl -k --cert certs/client.crt --key certs/client.key \
  https://localhost:4000/cert-info
```

### Workflow 2: nginx Mode Development  

Simulates production environment:

```bash
# 1. Configure for nginx mode
echo "CERT_MODE=nginx" > .env

# 2. Set up nginx with mTLS (see nginx/setup-nginx.md)

# 3. Start server (HTTP mode)
npm run dev

# 4. Test through nginx proxy
curl --cert certs/client.crt --key certs/client.key \
  https://your-nginx-domain/cert-info
```

## Testing Different Scenarios

### Valid Certificate Test
```bash
curl -k --cert certs/client.crt --key certs/client.key \
  https://localhost:4000/cert-info
```

### No Certificate Test (should fail)
```bash
curl -k https://localhost:4000/cert-info
# Expected: CLIENT_CERTIFICATE_REQUIRED error
```

### Invalid Certificate Test
```bash
# Generate a different client certificate
openssl genrsa -out bad-client.key 2048
openssl req -new -x509 -key bad-client.key -out bad-client.crt -days 1 \
  -subj "/CN=bad-client"

curl -k --cert bad-client.crt --key bad-client.key \
  https://localhost:4000/cert-info
# Expected: Certificate verification failed
```

### Debug Certificate Issues
```bash
curl -k --cert certs/client.crt --key certs/client.key \
  https://localhost:4000/cert-debug
```


## Production Deployment

For production, always use **nginx mode**:

```env
CERT_MODE=nginx
NODE_ENV=production
```

The nginx configuration handles:
- TLS termination
- Certificate validation  
- Header forwarding to Node.js
- Load balancing and SSL offloading

See `nginx/setup-nginx.md` for complete nginx configuration.

