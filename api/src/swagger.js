const swaggerJsDoc = require('swagger-jsdoc');

// ========== REUSABLE SCHEMAS ==========
const schemas = {
  // Base response schemas
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string' },
      data: { type: 'object' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' },
      code: { type: 'string' },
      details: { type: 'object' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  },

  // Building schemas
  Building: {
    type: 'object',
    properties: {
      uuid: { type: 'string', format: 'uuid' },
      ledgerCanisterId: { type: 'string' },
      owner: { type: 'string' },
      name: { type: 'string' },
      tokenSymbol: { type: 'string' },
      tokenName: { type: 'string' },
      totalSupply: { type: 'string' },
      decimals: { type: 'integer', example: 8 },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  BuildingRegistration: {
    type: 'object',
    required: [
      'uuid',
      'ledgerCanisterId',
      'owner',
      'name',
      'tokenSymbol',
      'tokenName',
    ],
    properties: {
      uuid: { type: 'string', format: 'uuid' },
      ledgerCanisterId: { type: 'string' },
      owner: { type: 'string' },
      name: { type: 'string', minLength: 1, maxLength: 100 },
      tokenSymbol: { type: 'string', minLength: 1, maxLength: 10 },
      tokenName: { type: 'string', minLength: 1, maxLength: 50 },
    },
  },

  // Token operation schemas
  TokenMint: {
    type: 'object',
    required: ['to', 'amount'],
    properties: {
      to: { type: 'string' },
      amount: { type: 'string', pattern: '^[0-9]+$' },
      memo: { type: 'string', maxLength: 32 },
    },
  },
  TokenTransfer: {
    type: 'object',
    required: ['to', 'amount'],
    properties: {
      to: { type: 'string' },
      amount: { type: 'string', pattern: '^[0-9]+$' },
      memo: { type: 'string', maxLength: 32 },
    },
  },
  TokenBalance: {
    type: 'object',
    properties: {
      balance: { type: 'string' },
      account: { type: 'string' },
      tokenSymbol: { type: 'string' },
      decimals: { type: 'integer', example: 8 },
      buildingUuid: { type: 'string', format: 'uuid' },
      ledgerCanisterId: { type: 'string' },
    },
  },

  // Log schemas
  LogEntry: {
    type: 'object',
    properties: {
      uuid: { type: 'string', format: 'uuid' },
      action: { type: 'string' },
      userFingerprint: { type: 'string' },
      hash: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
      details: { type: 'object' },
    },
  },
  LogCreation: {
    type: 'object',
    required: ['action'],
    properties: {
      action: { type: 'string', minLength: 1, maxLength: 100 },
      details: { type: 'object' },
    },
  },

  // Pagination schemas
  PaginationQuery: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      offset: { type: 'integer', minimum: 0, default: 0 },
    },
  },
  PaginatedResponse: {
    type: 'object',
    properties: {
      items: { type: 'array' },
      total: { type: 'integer' },
      limit: { type: 'integer' },
      offset: { type: 'integer' },
    },
  },

  // System schemas
  HealthStatus: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'healthy' },
      timestamp: { type: 'string', format: 'date-time' },
      version: { type: 'string' },
      canisters: {
        type: 'object',
        properties: {
          log: { type: 'string' },
          registry: { type: 'string' },
        },
      },
    },
  },
  CertificateInfo: {
    type: 'object',
    properties: {
      fingerprint: { type: 'string' },
      subject: { type: 'string' },
      issuer: { type: 'string' },
      validFrom: { type: 'string', format: 'date-time' },
      validTo: { type: 'string', format: 'date-time' },
      serialNumber: { type: 'string' },
    },
  },
};

// ========== REQUEST BODIES ==========
const requestBodies = {
  BuildingRegistration: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/BuildingRegistration' },
        example: {
          uuid: '123e4567-e89b-12d3-a456-426614174000',
          ledgerCanisterId: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
          owner: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
          name: 'Downtown Office Building',
          tokenSymbol: 'DOB',
          tokenName: 'Downtown Office Building Token',
        },
      },
    },
  },
  TokenMint: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/TokenMint' },
        example: {
          to: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
          amount: '1000000',
          memo: 'Initial token mint',
        },
      },
    },
  },
  TokenTransfer: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/TokenTransfer' },
        example: {
          to: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
          amount: '50000',
          memo: 'Token transfer',
        },
      },
    },
  },
  LogCreation: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/LogCreation' },
        example: {
          action: 'building_tokenized',
          details: {
            buildingId: '123e4567-e89b-12d3-a456-426614174000',
            tokenAmount: '1000000',
          },
        },
      },
    },
  },
};

// ========== RESPONSES ==========
const responses = {
  Success: {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/SuccessResponse' },
      },
    },
  },
  Created: {
    description: 'Resource created successfully',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/SuccessResponse' },
      },
    },
  },
  BadRequest: {
    description: 'Invalid request data',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: {
            field: 'uuid',
            message: 'Must be a valid UUID',
          },
          timestamp: '2025-08-19T12:00:00Z',
        },
      },
    },
  },
  Unauthorized: {
    description: 'Authentication required',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'mTLS certificate required',
          code: 'UNAUTHORIZED',
          timestamp: '2025-08-19T12:00:00Z',
        },
      },
    },
  },
  NotFound: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'Building not found',
          code: 'NOT_FOUND',
          timestamp: '2025-08-19T12:00:00Z',
        },
      },
    },
  },
  InternalError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          timestamp: '2025-08-19T12:00:00Z',
        },
      },
    },
  },
};

// ========== SECURITY SCHEMES ==========
const securitySchemes = {
  mTLS: {
    type: 'apiKey',
    in: 'header',
    name: 'X-Client-Certificate',
    description: 'mTLS client certificate authentication',
  },
  ICPPrincipal: {
    type: 'apiKey',
    in: 'header',
    name: 'X-ICP-Principal',
    description: 'ICP Principal ID for token operations',
  },
};

const reusableDefinitions = {
  schemas,
  requestBodies,
  responses,
  securitySchemes,
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'IoB Chain Logger & Tokenization API',
      contact: {
        name: 'ReCheck B.V.',
        url: 'https://recheck.io',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'https://localhost:4000',
        description: 'Development server',
      },
    ],
    components: reusableDefinitions,
  },
  apis: [`./src/routes/*.js`, `./src/controllers/*.js`],
};

const swaggerUIOptions = {
  customSiteTitle: 'IoB Chain Logger & Tokenization API',
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2c5aa0; }
    .swagger-ui .response-col_description p { margin: 0; }
    .swagger-ui .scheme-container { background: #f7f7f7; padding: 10px; border-radius: 4px; }
  `,
  customCssUrl: null,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerDocs,
  swaggerUIOptions,
};
