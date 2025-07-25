# IoB Chain Logger

A secure Node.js API with mTLS authentication for immutable audit logging on the Internet Computer Protocol (ICP).

## What it does

IoB Chain Logger provides tamper-proof audit logging for Internet of Buildings (IoB) protocol by:

- **Capturing user actions** (create, update, delete) with mTLS client certificate authentication
- **Computing cryptographic hashes** using keccak256 for data integrity
- **Storing immutable logs** on ICP blockchain canisters written in Azle
- **Providing query APIs** to retrieve logs by UUID, action type, user, or object

## Key Features

- 🔐 **mTLS Authentication** - Client certificate-based user identification
- 🔗 **ICP Integration** - Immutable storage on Internet Computer blockchain  
- 🔒 **Cryptographic Integrity** - keccak256 hashing of all log components
- 🚀 **Production Ready** - nginx + Certbot for automatic certificate management
- 🛠️ **Development Friendly** - Direct TLS mode for local development and testing
- 📋 **Flexible Queries** - Multiple log retrieval methods
- 🛡️ **Secure by Design** - Service identity authorization and controller access

## Architecture

```
[Client Certificate] → [nginx + mTLS] → [Node.js API] → [ICP Canister]
                                            ↓
                                   [keccak256 Hash] → [Immutable Log]
```

## API Endpoints

- `POST /api/register` - Register a new audit log entry
- `POST /api/verify` - Verify an existing log entry
- `GET /api/logs/uuid/:uuid` - Get logs by data UUID  
- `GET /api/logs/action/:action` - Get logs by action type
- `GET /health` - Health check endpoint

## Hash Composition

Each log entry generates a keccak256 hash from:
```
hash = keccak256(uuid + action + userFingerprint)
```

Where:
- `uuid` - Unique identifier for the data object
- `action` - Operation performed (`create`, `update`, `delete`)
- `userFingerprint` - SHA-256 fingerprint of user's mTLS certificate

## Quick Start

### Development Mode (Local Testing)
```bash
# Install dependencies
npm install

# Generate test certificates for development
./scripts/generate-test-certs.sh

# Configure for direct TLS mode
cp .env.example .env
# Set CERT_MODE=direct in .env

# Start development server with HTTPS
npm run dev

# Test with client certificate
curl -k --cert certs/client.crt --key certs/client.key https://localhost:4000/cert-info
```

### Production Mode (nginx Proxy)
```bash
# Install dependencies
npm install

# Start Node.js service (displays service principal)
npm run dev

# Deploy ICP canister with service authorization
dfx deploy --argument "(opt principal \"YOUR_SERVICE_PRINCIPAL\")"

# Configure environment and restart
cp .env.example .env
# Edit .env with your CANISTER_ID_IOB and CERT_MODE=nginx
npm start
```

## Documentation

- **[Setup Guide](SETUP.md)** - Complete installation and deployment instructions
- **[Development Guide](DEVELOPMENT.md)** - Certificate modes, local development, and testing
- **[API Documentation](API.md)** - Complete REST API reference with endpoints, authentication, examples, and response formats
- **[nginx Configuration](nginx/setup-nginx.md)** - Production deployment with mTLS

## Tech Stack

- **Backend**: Node.js + Express.js
- **Blockchain**: Internet Computer Protocol (ICP)
- **Canister Framework**: Azle (TypeScript/JavaScript for ICP)
- **Authentication**: mTLS with X.509 client certificates
- **Cryptography**: keccak256 hashing
- **Validation**: yup schema validation
- **Production**: nginx + Certbot for certificate management

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For setup issues, see [SETUP.md](SETUP.md).