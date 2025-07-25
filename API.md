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
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error description",
  "code": "ERROR_CODE", 
  "details": { /* additional error details */ }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `CANISTER_ERROR` | Blockchain canister operation failed |
| `NOT_FOUND` | Requested resource not found |
| `UNAUTHORIZED` | Authentication/authorization failed |
| `CONFLICT` | Resource already exists |
| `INTERNAL_ERROR` | Server internal error |
| `CERTIFICATE_VERIFICATION_FAILED` | Client certificate verification failed by nginx |
| `MISSING_CERTIFICATE_INFO` | Client certificate information missing |
| `FINGERPRINT_EXTRACTION_FAILED` | Unable to extract certificate fingerprint |
| `EXPIRED_CERTIFICATE` | Client certificate has expired |
| `PREMATURE_CERTIFICATE` | Client certificate is not yet valid |
| `CERTIFICATE_ERROR` | Certificate validation error |

---

## Endpoints

### 1. Health Check

Check if the API service is running.

**Endpoint:** `GET /health`  
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

**Endpoint:** `POST /api/register`  
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
    "data": { /* your data */ },
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

**Endpoint:** `POST /api/verify`  
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

**Endpoint:** `GET /api/logs/data/{uuid}`  
**Authentication:** mTLS certificate required  

#### Parameters
- `uuid` (path parameter): Valid UUID v4 format

#### Example Request
```
GET /api/logs/data/123e4567-e89b-12d3-a456-426614174000
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
      "data": { /* original data */ },
      "serviceId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
      "createdAt": "1642234567890123456"
    },
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
      "data": { /* original data */ },
      "serviceId": "rdmx6-jaaaa-aaaaa-aaadq-cai",
      "createdAt": "1642234567890123456"
    },
    // ... more log entries
  ]
}
```

---

### 6. Certificate Information

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
    "subject": { /* certificate subject */ },
    "issuer": { /* certificate issuer */ }
  },
  "allSslHeaders": {
    "x-ssl-client-cert": "-----BEGIN CERTIFICATE-----...",
    "x-ssl-client-fingerprint": "abc123def456...",
    "x-ssl-client-verify": "SUCCESS"
  },
  "allHeaders": { /* all request headers */ },
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

## Status Codes

- `200` - Success (GET requests)
- `201` - Created (successful POST requests)
- `400` - Bad Request (validation errors, canister errors)
- `404` - Not Found (unknown endpoints)
- `500` - Internal Server Error
