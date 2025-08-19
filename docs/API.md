# IoB Chain Logger - API Documentation

## Overview

The IoB Chain Logger is a secure audit logging system built on the Internet Computer Protocol (ICP). It provides tamper-proof logging capabilities using blockchain technology combined with mutual TLS (mTLS) certificate authentication.

## Base URL

```
https://your-domain.com
```

## Authentication

All API endpoints (except `/health`) require **mutual TLS (mTLS) authentication** using client certificates. The API extracts the certificate fingerprint to identify users and ensure secure audit trails.

### Certificate Requirements

- Valid X.509 client certificate
- Certificate must be trusted by the server's CA chain
- Certificate fingerprint is used as the user identifier in audit logs

## Global Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {
    /* additional error details */
  }
}
```

## Error Codes

| Code                              | Description                                     |
| --------------------------------- | ----------------------------------------------- |
| `VALIDATION_ERROR`                | Request validation failed                       |
| `CANISTER_ERROR`                  | Blockchain canister operation failed            |
| `NOT_FOUND`                       | Requested resource not found                    |
| `UNAUTHORIZED`                    | Authentication/authorization failed             |
| `CONFLICT`                        | Resource already exists                         |
| `INTERNAL_ERROR`                  | Server internal error                           |
| `CERTIFICATE_VERIFICATION_FAILED` | Client certificate verification failed by nginx |
| `MISSING_CERTIFICATE_INFO`        | Client certificate information missing          |
| `FINGERPRINT_EXTRACTION_FAILED`   | Unable to extract certificate fingerprint       |
| `EXPIRED_CERTIFICATE`             | Client certificate has expired                  |
| `PREMATURE_CERTIFICATE`           | Client certificate is not yet valid             |
| `CERTIFICATE_ERROR`               | Certificate validation error                    |

---

## Endpoints

### 1. Health Check

Check if the API service is running.

**Endpoint:** `GET /api/system/health`
**Authentication:** None required

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "iob-chain-logger-api"
}
```

> **Note:** This endpoint returns a simple JSON object, not the standard success wrapper format used by other endpoints.

---

### 2. Register Audit Log

Register a new audit log entry on the blockchain.

**Endpoint:** `POST /api/logs`
**Authentication:** mTLS certificate required

#### Request Body

```json
{
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "action": "create",
  "data": {
    "description": "User profile created",
    "metadata": { "userId": 12345 }
  }
}
```

#### Parameters

- `uuid` (string, required): Valid UUID v4 format identifying the data object
- `action` (string, required): Action type. Must be one of: `create`, `update`, `delete`
- `data` (object, optional): Additional payload data for the audit log

#### Response

```json
{
  "success": true,
  "message": "Log entry registered successfully",
  "data": {
    "id": "bkyz2-fmaaa-aaaaa-qaaaq-cai",
    "hash": "a1b2c3d4e5f6...",
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "action": "create",
    "userFingerprint": "abc123def456...",
    "data": {
      /* your data */
    },
    "serviceId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
    "createdAt": "1642234567890123456"
  }
}
```

#### Error Examples

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": ["UUID must be a valid UUID format"]
}
```

---

### 3. Verify Audit Log

Verify the integrity of an existing audit log entry.

**Endpoint:** `POST /api/logs/verify`
**Authentication:** mTLS certificate required

#### Request Body

```json
{
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "action": "create"
}
```

#### Parameters

- `uuid` (string, required): UUID of the log entry to verify
- `action` (string, required): Action type that was logged. Must be one of: `create`, `update`, `delete`

> **Note:** The verification uses the combination of UUID, action, and your certificate fingerprint to locate and verify the log entry.

#### Response

```json
{
  "success": true,
  "message": "Log entry verified successfully",
  "data": {
    "verified": true,
    "hash": "a1b2c3d4e5f6...",
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "action": "create",
    "userFingerprint": "abc123def456..."
  }
}
```

#### Verification Failed Response

```json
{
  "success": true,
  "message": "Log entry verification failed",
  "data": {
    "verified": false,
    "hash": "a1b2c3d4e5f6...",
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "action": "create",
    "userFingerprint": "abc123def456..."
  }
}
```

---

### 4. Get Logs by Data ID

Retrieve all audit logs for a specific data object UUID.

**Endpoint:** `GET /api/logs/uuid/{uuid}`
**Authentication:** mTLS certificate required

#### Parameters

- `uuid` (path parameter): Valid UUID v4 format

#### Example Request

```
GET /api/logs/uuid/123e4567-e89b-12d3-a456-426614174000
```

#### Response

```json
{
  "success": true,
  "message": "Found 3 log(s) for UUID: 123e4567-e89b-12d3-a456-426614174000",
  "data": [
    {
      "id": "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      "hash": "a1b2c3d4e5f6...",
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "action": "create",
      "userFingerprint": "abc123def456...",
      "data": {
        /* original data */
      },
      "serviceId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
      "createdAt": "1642234567890123456"
    }
    // ... more log entries
  ]
}
```

---

### 5. Get Logs by Action

Retrieve all audit logs for a specific action type.

**Endpoint:** `GET /api/logs/action/{action}`
**Authentication:** mTLS certificate required

#### Parameters

- `action` (path parameter): Action type. Must be one of: `create`, `update`, `delete`

#### Example Request

```
GET /api/logs/action/create
```

#### Response

```json
{
  "success": true,
  "message": "Found 15 log(s) for action: create",
  "data": [
    {
      "id": "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      "hash": "a1b2c3d4e5f6...",
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "action": "create",
      "userFingerprint": "abc123def456...",
      "data": {
        /* original data */
      },
      "serviceId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
      "createdAt": "1642234567890123456"
    }
    // ... more log entries
  ]
}
```

---

## Building Management Endpoints

### 6. Tokenize Building

Tokenize a building from main IoB platform data by deploying an ICRC2 ledger canister.

**Endpoint:** `POST /api/buildings`
**Authentication:** mTLS certificate required

#### Request Body

```json
{
  "buildingUuid": "550e8400-e29b-41d4-a716-446655440000",
  "tokenName": "Building Token Name",
  "tokenSymbol": "BTN",
  "totalSupply": 1000000,
  "decimals": 8
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "buildingUuid": "550e8400-e29b-41d4-a716-446655440000",
    "ledgerCanisterId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
    "tokenName": "Building Token Name",
    "tokenSymbol": "BTN",
    "totalSupply": 1000000,
    "owner": "principal-id-of-owner",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Building tokenized successfully"
}
```

### 7. List Tokenized Buildings

Get a list of all tokenized buildings in this service.

**Endpoint:** `GET /api/buildings`
**Authentication:** mTLS certificate required

#### Query Parameters

- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

#### Response

```json
{
  "success": true,
  "data": {
    "buildings": [
      {
        "buildingUuid": "550e8400-e29b-41d4-a716-446655440000",
        "ledgerCanisterId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
        "tokenName": "Building Token Name",
        "tokenSymbol": "BTN",
        "totalSupply": 1000000,
        "owner": "principal-id-of-owner",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  },
  "message": "Buildings retrieved successfully"
}
```

### 8. Get Building Details

Get details of a specific tokenized building.

**Endpoint:** `GET /api/buildings/:uuid`
**Authentication:** mTLS certificate required

#### Response

```json
{
  "success": true,
  "data": {
    "buildingUuid": "550e8400-e29b-41d4-a716-446655440000",
    "ledgerCanisterId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
    "tokenName": "Building Token Name",
    "tokenSymbol": "BTN",
    "totalSupply": 1000000,
    "owner": "principal-id-of-owner",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Building details retrieved successfully"
}
```

### 9. Get Buildings by Owner

Get tokenized buildings owned by a specific principal.

**Endpoint:** `GET /api/buildings/user/:principal`
**Authentication:** mTLS certificate required

#### Response

```json
{
  "success": true,
  "data": {
    "buildings": [
      {
        "buildingUuid": "550e8400-e29b-41d4-a716-446655440000",
        "ledgerCanisterId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
        "tokenName": "Building Token Name",
        "tokenSymbol": "BTN",
        "totalSupply": 1000000,
        "owner": "principal-id-of-owner",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  },
  "message": "Owner buildings retrieved successfully"
}
```

## Token Operations Endpoints

### 10. Mint Tokens

Mint additional tokens for a building (owner only).

**Endpoint:** `POST /api/buildings/:uuid/mint`
**Authentication:** mTLS certificate required

#### Request Body

```json
{
  "amount": 50000,
  "to": "principal-id-of-recipient"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "transactionId": "12345",
    "amount": 50000,
    "to": "principal-id-of-recipient",
    "newTotalSupply": 1050000
  },
  "message": "Tokens minted successfully"
}
```

### 11. Transfer Tokens

Transfer building tokens between addresses.

**Endpoint:** `POST /api/buildings/:uuid/transfer`
**Authentication:** mTLS certificate required

#### Request Body

```json
{
  "to": "principal-id-of-recipient",
  "amount": 1000,
  "memo": "Payment for building maintenance"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "transactionId": "12346",
    "from": "principal-id-of-sender",
    "to": "principal-id-of-recipient",
    "amount": 1000,
    "memo": "Payment for building maintenance"
  },
  "message": "Tokens transferred successfully"
}
```

### 12. Get Token Balance

Get token balance for a building.

**Endpoint:** `GET /api/buildings/:uuid/balance`
**Authentication:** mTLS certificate required

#### Query Parameters

- `account` (optional): Principal ID to check balance for (defaults to certificate owner)

#### Response

```json
{
  "success": true,
  "data": {
    "balance": 5000,
    "account": "principal-id-of-account",
    "tokenSymbol": "BTN",
    "decimals": 8
  },
  "message": "Balance retrieved successfully"
}
```

---

### 13. Certificate Information

Get information about your authenticated client certificate.

**Endpoint:** `GET /cert-info`
**Authentication:** mTLS certificate required

#### Response

```json
{
  "success": true,
  "message": "Client certificate validated successfully",
  "certificate": {
    "subject": {
      "CN": "client.example.com",
      "O": "Example Organization"
    },
    "issuer": {
      "CN": "Example CA",
      "O": "Example CA Organization"
    },
    "validFrom": "Jan 1 00:00:00 2024 GMT",
    "validTo": "Jan 1 00:00:00 2025 GMT",
    "serialNumber": "01:23:45:67:89:AB:CD:EF",
    "fingerprint": "abc123def456..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 7. Certificate Debug

Get detailed certificate debug information (useful for troubleshooting).

**Endpoint:** `GET /cert-debug`
**Authentication:** mTLS certificate required

#### Response

```json
{
  "success": true,
  "message": "Certificate debug information from nginx headers",
  "certificateFromHeaders": {
    "subject": {
      /* certificate subject */
    },
    "issuer": {
      /* certificate issuer */
    }
  },
  "allSslHeaders": {
    "x-ssl-client-cert": "-----BEGIN CERTIFICATE-----...",
    "x-ssl-client-fingerprint": "abc123def456...",
    "x-ssl-client-verify": "SUCCESS"
  },
  "allHeaders": {
    /* all request headers */
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Data Model

### Log Entry Structure

```json
{
  "id": "Principal ID (ICP canister format)",
  "hash": "SHA-256 hash of uuid+action+userFingerprint",
  "uuid": "UUID v4 format identifying the data object",
  "action": "create|update|delete",
  "userFingerprint": "SHA-256 certificate fingerprint",
  "data": "Optional payload (any JSON structure)",
  "serviceId": "Principal ID of the calling service",
  "createdAt": "Nanosecond timestamp (bigint)"
}
```

### Hash Calculation

The hash is calculated as: `SHA256(uuid + action + userFingerprint)`

This ensures that each log entry is unique to the combination of:

- The data being logged (UUID)
- The action performed
- The user who performed it (certificate fingerprint)

---

## Certificate & System Endpoints

### 13. Certificate Information

Get detailed information about the authenticated client certificate.

**Endpoint:** `GET /api/certificates/info`
**Authentication:** mTLS certificate required

#### Response

```json
{
  "success": true,
  "message": "Client certificate validated successfully",
  "certificateMode": "nginx",
  "certificate": {
    "subject": {
      "CN": "client",
      "O": "IoB Chain Logger"
    },
    "issuer": {
      "CN": "IoB Chain Logger CA",
      "O": "IoB Chain Logger"
    },
    "validFrom": "Jan 15 10:00:00 2024 GMT",
    "validTo": "Jan 15 10:00:00 2025 GMT",
    "serialNumber": "1234567890",
    "fingerprint": "SHA256:abc123..."
  },
  "timestamp": "2025-08-19T12:00:00.000Z"
}
```

### 14. Certificate Debug Information

Get detailed debug information including all SSL headers (development only).

**Endpoint:** `GET /api/certificates/debug`
**Authentication:** mTLS certificate required

#### Response

```json
{
  "success": true,
  "message": "Certificate debug information",
  "certificateMode": "nginx",
  "certificate": {
    "subject": {
      "CN": "client"
    },
    "issuer": {
      "CN": "IoB Chain Logger CA"
    },
    "validFrom": "Jan 15 10:00:00 2024 GMT",
    "validTo": "Jan 15 10:00:00 2025 GMT",
    "serialNumber": "1234567890",
    "fingerprint": "SHA256:abc123..."
  },
  "headers": {
    "ssl-client-cert": "-----BEGIN CERTIFICATE-----...",
    "ssl-client-subject-dn": "CN=client,O=IoB Chain Logger",
    "ssl-client-issuer-dn": "CN=IoB Chain Logger CA,O=IoB Chain Logger"
  },
  "timestamp": "2025-08-19T12:00:00.000Z"
}
```

### 15. Interactive API Documentation

Access the interactive Swagger UI for testing and exploring the API.

**Endpoint:** `GET /api-docs`
**Authentication:** None required

This endpoint provides a complete interactive interface for:
- Exploring all available endpoints
- Testing API calls with example data
- Viewing request/response schemas
- Understanding authentication requirements

> **Note:** While the Swagger UI itself doesn't require authentication, the actual API endpoints still require mTLS certificates when called through the interface.

---

## Status Codes

- `200` - Success (GET requests)
- `201` - Created (successful POST requests)
- `400` - Bad Request (validation errors, canister errors)
- `404` - Not Found (unknown endpoints)
- `500` - Internal Server Error
