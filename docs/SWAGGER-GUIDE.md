# Swagger API Documentation

## Overview

The IoB Chain Logger API now includes comprehensive Swagger/OpenAPI 3.0 documentation available at `/api-docs` when the server is running.

## Access Documentation

- **Local Development**: `http://localhost:4000/api-docs`
- **Production**: `https://api.iob.recheck.io/api-docs`

## Swagger Configuration

### 📁 File Structure
```
api/src/swagger.js      # Main swagger configuration with all schemas
api/src/server.js       # Swagger UI integration
```

### 🎯 Features Implemented

#### **Comprehensive Schemas**
- ✅ **SuccessResponse/ErrorResponse**: Standard response formats
- ✅ **Building**: Complete building data structure
- ✅ **TokenMint/Transfer/Balance**: All token operation schemas
- ✅ **LogEntry**: Audit logging data structures
- ✅ **Pagination**: Query parameters and response formats

#### **Request Bodies**
- ✅ **BuildingRegistration**: Building creation payload
- ✅ **TokenMint**: Token minting requests
- ✅ **TokenTransfer**: Token transfer requests
- ✅ **LogCreation**: Log entry creation

#### **Response Templates**
- ✅ **Success/Created**: Standard success responses
- ✅ **BadRequest**: Validation error responses
- ✅ **Unauthorized**: Authentication error responses
- ✅ **NotFound**: Resource not found responses
- ✅ **InternalError**: Server error responses

#### **Security Schemes**
- ✅ **mTLS**: Client certificate authentication
- ✅ **ICPPrincipal**: ICP Principal header for token operations

#### **Tags & Organization**
- ✅ **System**: Health and info endpoints
- ✅ **Certificates**: mTLS certificate information
- ✅ **Logs**: Audit logging operations
- ✅ **Buildings**: Building registry management
- ✅ **Tokens**: ICRC-2 token operations

## Adding Swagger Documentation to Controllers

### Basic Endpoint Documentation
```javascript
/**
 * @swagger
 * /api/buildings:
 *   post:
 *     tags: [Buildings]
 *     summary: Register a new building
 *     description: Register a building in the IoB registry with tokenization support
 *     security:
 *       - mTLS: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/BuildingRegistration'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Created'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
```

### Advanced Response Schema
```javascript
/**
 * @swagger
 * /api/buildings/{uuid}:
 *   get:
 *     responses:
 *       200:
 *         description: Building details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Building'
 */
```

### Path Parameters
```javascript
/**
 * @swagger
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Building UUID
 */
```

### Query Parameters
```javascript
/**
 * @swagger
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items to return
 */
```

## Adding New Schemas

### 1. Add to swagger.js schemas object:
```javascript
const schemas = {
  // ... existing schemas
  NewSchema: {
    type: 'object',
    required: ['field1', 'field2'],
    properties: {
      field1: { type: 'string' },
      field2: { type: 'integer' },
    },
  },
};
```

### 2. Add request body if needed:
```javascript
const requestBodies = {
  // ... existing request bodies
  NewRequest: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/NewSchema' },
        example: {
          field1: 'example value',
          field2: 123,
        },
      },
    },
  },
};
```

### 3. Reference in controller JSDoc:
```javascript
/**
 * @swagger
 * /api/new-endpoint:
 *   post:
 *     requestBody:
 *       $ref: '#/components/requestBodies/NewRequest'
 */
```

## Current Documentation Status

### ✅ Documented Endpoints
- `POST /api/buildings` - Building registration
- `GET /api/buildings/{uuid}` - Get building details
- `POST /api/buildings/{uuid}/mint` - Mint tokens

### 🚧 To Be Documented
- `GET /api/buildings/user/{principal}` - Get user buildings
- `GET /api/buildings` - Get all buildings (paginated)
- `POST /api/buildings/{uuid}/transfer` - Transfer tokens
- `GET /api/buildings/{uuid}/balance` - Get token balance
- `POST /api/logs` - Create log entry
- `GET /api/logs` - Get logs (paginated)
- `GET /api/system/health` - Health check
- `GET /api/certificates/info` - Certificate info

## Best Practices

### 1. **Consistent Naming**
- Use descriptive operation IDs
- Follow REST conventions
- Use consistent tag names

### 2. **Comprehensive Examples**
- Provide realistic example data
- Include all required fields
- Show optional parameters

### 3. **Error Documentation**
- Document all possible error responses
- Include error codes and messages
- Reference standard error schemas

### 4. **Security Documentation**
- Always specify required security schemes
- Document header requirements
- Explain authentication flow

## Testing with Swagger UI

1. **Start the server**: `npm run dev`
2. **Open documentation**: `http://localhost:4000/api-docs`
3. **Explore endpoints**: Use the interactive interface
4. **Test requests**: Use "Try it out" buttons (Note: mTLS required for most endpoints)

## Production Considerations

- Swagger UI is accessible without authentication
- Consider restricting access in production if needed
- Documentation is generated from source code comments
- Keep schemas updated with API changes

## Next Steps

1. Add documentation to remaining controllers
2. Include more detailed examples
3. Add API versioning information
4. Consider adding response time examples
5. Document rate limiting if implemented
