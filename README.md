# IoB Chain Logger & Tokenization

## Key Features

- 🔗 **IoB Platform Integration** - Receives logs and fetches building data from main IoB platform
- 🏗️ **Automated Tokenization** - Deploy ICRC2 tokens for buildings from IoB data
- 🗄️ **Tokenized Building Registry** - Separate registry for blockchain-based building tokens
- 🔐 **Dual mTLS Authentication** - Secure communication with IoB platform + service UI access
- 🔗 **ICP Blockchain** - Immutable storage on Internet Computer Protocol
- 🔒 **Cryptographic Integrity** - keccak256 hashing for all operations
- 🚀 **Production Ready** - nginx + automatic certificate management
- 📡 **Comprehensive APIs** - REST endpoints for tokenization and audit operations
- 🖥️ **Management Interface** - Web UI for service administration (in development)specialized blockchain service for the Internet of Buildings (IoB) ecosystem that provides secure audit logging and building tokenization on the Internet Computer Protocol (ICP). This service works alongside the main IoB platform to offer immutable audit trails and ICRC2 token deployment for building assets.

> **⚠️ Important**: This is a separate service that integrates with the main IoB platform, not the main IoB platform itself. It handles blockchain operations and audit logging for building tokenization.

## What it does

This service provides blockchain capabilities for the IoB ecosystem:

### 🔗 **IoB Platform Integration**
- **Audit Log Receiver** - Receives building operation logs from the main IoB platform
- **Building Data Fetching** - Uses mTLS to securely fetch original building data from IoB platform
- **Tokenization Bridge** - Converts IoB building data into blockchain tokens

### 🏢 **Building Tokenization**
- **ICRC2 Deployment** - Automated ledger canister creation for tokenized buildings
- **Registry Management** - Maintains registry of tokenized buildings
- **Token Operations** - Minting, transfers, and balance management on ICP

### 📝 **Immutable Audit Logging**
- **Chain Storage** - All building operations logged immutably on ICP canisters
- **Cryptographic Integrity** - keccak256 hashing for tamper-proof verification
- **Cross-Platform Logging** - Receives and stores logs from main IoB platform operations

### 🔐 **Dual Authentication Architecture**
- **mTLS for IoB Integration** - Secure communication with main IoB platform
- **mTLS for Service UI** - Client certificate authentication for this service's web interface
- **ICP Identity** - Blockchain identity management for on-chain operations

### 🌐 **Full-Stack Platform**
- **REST API** - Comprehensive backend services
- **Web Interface** - Modern UI for building and token management (planned)
- **Production Ready** - Enterprise-grade deployment with nginx

## Architecturee

- **REST API** - Blockchain operations and audit logging endpoints
- **Web Interface** - Management UI for tokenized buildings and logs (with mTLS auth)
- **IoB Integration** - Secure communication with main IoB platform

## Project Structure

```
iob-chain-logger/
├── api/                    # Node.js REST API server
│   ├── src/
│   │   ├── controllers/    # API route handlers
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/     # Authentication & validation
│   │   ├── canister/       # ICP canister clients
│   │   ├── deployer/       # ICRC2 ledger deployment
│   │   └── server.js       # Main application entry
│   ├── certs/              # mTLS certificates
│   └── package.json        # API dependencies
├── ui/                     # Web interface (TODO:)
│   └── .gitkeep            # Future: Next.js + TailwindCSS
├── log-canister/           # Audit logging canister (Azle)
│   ├── src/                # TypeScript canister code
│   └── dfx-declarations/   # Generated bindings
├── registry-canister/      # Building registry canister (Azle)
│   ├── src/                # TypeScript canister code
│   └── dfx-declarations/   # Generated bindings
├── ledger-canister/        # ICRC2 token templates
│   ├── ledger.wasm.gz      # Compiled ledger canister
│   └── ledger.did          # Candid interface
├── docs/                   # Documentation
│   ├── SETUP.md           # Deployment & configuration
│   ├── DEVELOPMENT.md     # Development guide
│   └── SETUP-NGINX.md     # Production nginx setup
└── scripts/                # Utility scripts
    └── generate-test-certs.sh
```

## API Endpoints

### Building Tokenization (from IoB Data)
- `POST /api/buildings` - Tokenize a building from main IoB platform data
- `GET /api/buildings` - List all tokenized buildings in this service
- `GET /api/buildings/:uuid` - Get tokenized building details
- `GET /api/buildings/user/:principal` - Get tokenized buildings by owner

### Token Operations
- `POST /api/buildings/:uuid/mint` - Mint additional tokens for a building
- `POST /api/buildings/:uuid/transfer` - Transfer building tokens
- `GET /api/buildings/:uuid/balance` - Get token balance for a building

### Audit Logging (from IoB Platform)
- `POST /api/logs` - Register audit log from main IoB platform
- `POST /api/logs/verify` - Verify an existing log entry
- `GET /api/logs/uuid/:uuid` - Get logs by UUID
- `GET /api/logs/action/:action` - Get logs by action type

### System & Integration
- `GET /api/system/health` - Service health check
- `GET /api/certificates/info` - mTLS certificate information
- `GET /api/certificates/debug` - Debug certificate information
- `GET /api-docs` - Interactive API documentation

> **Note**: This service maintains its own registry of **tokenized buildings** only. Original building data remains in the main IoB platform and is fetched via secure mTLS when needed for tokenization.

## Hash Composition

Each log entry generates a keccak256 hash from:

```
hash = keccak256(uuid + action + userFingerprint)
```

## Documentation

- **[Complete Setup Guide](docs/SETUP-COMPLETE.md)** - Unified installation, development, and deployment guide
- **[API Documentation](docs/API.md)** - Complete REST API reference with endpoints and examples
- **[nginx Configuration](docs/SETUP-NGINX.md)** - Production deployment with mTLS support

## Technology Stack

### Backend
- **Node.js + Express** - REST API server
- **Internet Computer Protocol (ICP)** - Blockchain storage
- **Azle (TypeScript)** - Canister development framework
- **mTLS Authentication** - Client certificate security
- **ICRC2 Standard** - Fungible token specification

### Development
- **ESLint + Prettier** - Code quality & formatting
- **Swagger/OpenAPI** - API documentation
- **Docker** - Containerization support
- **Nginx** - Production reverse proxy

### Future UI Stack
- **Next.js + TypeScript** - React framework
- **TailwindCSS + shadcn/ui** - Component library
- **Dual Authentication** - mTLS + ICP Identity

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For setup issues, see [SETUP.md](SETUP.md).
