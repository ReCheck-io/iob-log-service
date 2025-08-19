const crypto = require('crypto');
const yup = require('yup');

/**
 * Validation schema for register/verify endpoints
 */
const logValidationSchema = yup.object().shape({
  uuid: yup
    .string()
    .required('UUID is required')
    .matches(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'UUID must be a valid UUID format'
    ),
  action: yup
    .string()
    .required('Action is required')
    .oneOf(
      ['create', 'update', 'delete'],
      'Action must be one of: create, update, delete'
    ),
  data: yup.mixed().optional().nullable().default(null),
});

/**
 * Validation schema for UUID parameter
 */
const uuidValidationSchema = yup
  .string()
  .required('UUID is required')
  .matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'UUID must be a valid UUID format'
  );

/**
 * Validation schema for action parameter
 */
const actionValidationSchema = yup
  .string()
  .required('Action is required')
  .oneOf(
    ['create', 'update', 'delete'],
    'Action must be one of: create, update, delete'
  );

/**
 * Validation schema for ICP Principal
 */
const principalValidationSchema = yup
  .string()
  .required('Principal is required')
  .matches(
    /^[a-z0-9-]+$/,
    'Principal must contain only lowercase letters, numbers, and hyphens'
  )
  .min(5, 'Principal must be at least 5 characters')
  .max(63, 'Principal must be at most 63 characters');

/**
 * Validation schema for building registration
 */
const buildingRegistrationSchema = yup.object().shape({
  uuid: yup
    .string()
    .required('Building UUID is required')
    .matches(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'UUID must be a valid UUID format'
    ),
  ledgerCanisterId: principalValidationSchema,
  owner: principalValidationSchema,
  name: yup
    .string()
    .required('Building name is required')
    .min(1, 'Building name cannot be empty')
    .max(100, 'Building name must be at most 100 characters'),
  tokenSymbol: yup
    .string()
    .required('Token symbol is required')
    .matches(/^[A-Z]{2,10}$/, 'Token symbol must be 2-10 uppercase letters'),
  tokenName: yup
    .string()
    .required('Token name is required')
    .min(1, 'Token name cannot be empty')
    .max(50, 'Token name must be at most 50 characters'),
});

/**
 * Validation schema for building tokenization
 */
const buildingTokenizationSchema = yup.object().shape({
  buildingUuid: yup
    .string()
    .required('Building UUID is required')
    .matches(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'UUID must be a valid UUID format'
    ),
  tokenName: yup
    .string()
    .required('Token name is required')
    .min(1, 'Token name cannot be empty')
    .max(50, 'Token name must be at most 50 characters'),
  tokenSymbol: yup
    .string()
    .required('Token symbol is required')
    .matches(/^[A-Z]{2,10}$/, 'Token symbol must be 2-10 uppercase letters'),
  totalSupply: yup
    .number()
    .required('Total supply is required')
    .positive('Total supply must be positive')
    .integer('Total supply must be an integer')
    .max(Number.MAX_SAFE_INTEGER, 'Total supply is too large'),
  decimals: yup
    .number()
    .required('Decimals is required')
    .integer('Decimals must be an integer')
    .min(0, 'Decimals must be non-negative')
    .max(18, 'Decimals must be at most 18'),
});

/**
 * Validation schema for token minting
 */
const tokenMintSchema = yup.object().shape({
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .integer('Amount must be an integer')
    .max(Number.MAX_SAFE_INTEGER, 'Amount is too large'),
  to: principalValidationSchema,
});

/**
 * Validation schema for token transfer
 */
const tokenTransferSchema = yup.object().shape({
  to: principalValidationSchema,
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .integer('Amount must be an integer')
    .max(Number.MAX_SAFE_INTEGER, 'Amount is too large'),
  memo: yup.string().optional().max(500, 'Memo must be at most 500 characters'),
});

/**
 * Validation schema for pagination
 */
const paginationSchema = yup.object().shape({
  limit: yup
    .number()
    .optional()
    .integer('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(50),
  offset: yup
    .number()
    .optional()
    .integer('Offset must be an integer')
    .min(0, 'Offset must be non-negative')
    .default(0),
});

/**
 * Validation schema for token balance query
 */
const tokenBalanceQuerySchema = yup.object().shape({
  account: yup
    .string()
    .optional()
    .matches(
      /^[a-z0-9-]+$/,
      'Account must contain only lowercase letters, numbers, and hyphens'
    )
    .min(5, 'Account must be at least 5 characters')
    .max(63, 'Account must be at most 63 characters'),
});

/**
 * Compute keccak256 hash using Node.js crypto
 * Hash composition: uuid + action + userFingerprint
 * @param {string} uuid - Data object UUID
 * @param {string} action - Action performed (create, update, delete)
 * @param {string} userFingerprint - User's certificate fingerprint
 * @returns {string} - Hexadecimal hash string
 */
function computeHash(uuid, action, userFingerprint) {
  const input = uuid + action.toLowerCase() + userFingerprint;

  // Use SHA-256 as a substitute for keccak256 (for demo purposes)
  // In production, use actual keccak256 implementation
  const hash = crypto.createHash('sha256');
  hash.update(input, 'utf8');
  return hash.digest('hex');
}

/**
 * Validate request data against schema
 * @param {any} data - Data to validate
 * @param {yup.Schema} schema - Validation schema
 * @returns {Promise<any>} - Validated data
 * @throws {Error} - Validation error with details
 */
async function validateData(data, schema) {
  try {
    return await schema.validate(data, {
      stripUnknown: true,
      abortEarly: false,
    });
  } catch (error) {
    const validationError = new Error('Validation failed');
    validationError.code = 'VALIDATION_ERROR';
    validationError.details = error.errors || [error.message];
    throw validationError;
  }
}

/**
 * Validate log data (register/verify)
 * @param {object} data - Log data to validate
 * @returns {Promise<object>} - Validated log data
 */
async function validateLogData(data) {
  return await validateData(data, logValidationSchema);
}

/**
 * Validate UUID parameter
 * @param {string} uuid - UUID to validate
 * @returns {Promise<string>} - Validated UUID
 */
async function validateUuid(uuid) {
  return await validateData(uuid, uuidValidationSchema);
}

/**
 * Validate action parameter
 * @param {string} action - Action to validate
 * @returns {Promise<string>} - Validated action
 */
async function validateAction(action) {
  return await validateData(action, actionValidationSchema);
}

/**
 * Validate building registration data
 * @param {object} data - Building registration data to validate
 * @returns {Promise<object>} - Validated building registration data
 */
async function validateBuildingRegistration(data) {
  return await validateData(data, buildingRegistrationSchema);
}

/**
 * Validate building tokenization data
 * @param {object} data - Building tokenization data to validate
 * @returns {Promise<object>} - Validated building tokenization data
 */
async function validateBuildingTokenization(data) {
  return await validateData(data, buildingTokenizationSchema);
}

/**
 * Validate token mint data
 * @param {object} data - Token mint data to validate
 * @returns {Promise<object>} - Validated token mint data
 */
async function validateTokenMint(data) {
  return await validateData(data, tokenMintSchema);
}

/**
 * Validate token transfer data
 * @param {object} data - Token transfer data to validate
 * @returns {Promise<object>} - Validated token transfer data
 */
async function validateTokenTransfer(data) {
  return await validateData(data, tokenTransferSchema);
}

/**
 * Validate pagination parameters
 * @param {object} data - Pagination data to validate
 * @returns {Promise<object>} - Validated pagination data
 */
async function validatePagination(data) {
  return await validateData(data, paginationSchema);
}

/**
 * Validate token balance query parameters
 * @param {object} data - Token balance query data to validate
 * @returns {Promise<object>} - Validated token balance query data
 */
async function validateTokenBalanceQuery(data) {
  return await validateData(data, tokenBalanceQuerySchema);
}

/**
 * Validate principal parameter
 * @param {string} principal - Principal to validate
 * @returns {Promise<string>} - Validated principal
 */
async function validatePrincipal(principal) {
  return await validateData(principal, principalValidationSchema);
}

/**
 * Format error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {any} details - Additional error details
 * @returns {object} - Formatted error response
 */
function formatError(message, code = 'INTERNAL_ERROR', details = {}) {
  return {
    error: message,
    code,
    details,
  };
}

/**
 * Format success response
 * @param {any} data - Response data
 * @param {string} message - Success message (optional)
 * @returns {object} - Formatted success response
 */
function formatSuccess(data, message = null) {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * Extract certificate fingerprint from request
 * Works with both direct TLS connections and nginx proxy headers
 * @param {object} req - Express request object
 * @returns {string} - Certificate fingerprint
 * @throws {Error} - If certificate cannot be extracted
 */
function extractCertificateFingerprint(req) {
  // Check for nginx forwarded certificate headers first
  if (req.headers['x-ssl-client-cert']) {
    try {
      // nginx forwards the certificate in PEM format (URL encoded)
      const certPem = decodeURIComponent(req.headers['x-ssl-client-cert']);

      // Extract certificate data (remove PEM headers/footers and whitespace)
      const certData = certPem
        .replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\s/g, '');

      // Convert base64 to binary
      const certBinary = Buffer.from(certData, 'base64');

      // Calculate SHA-256 fingerprint
      const fingerprint = crypto
        .createHash('sha256')
        .update(certBinary)
        .digest('hex');

      return fingerprint;
    } catch (error) {
      throw new Error(
        'Failed to process certificate from nginx headers: ' + error.message
      );
    }
  }

  // Fallback to direct TLS connection (for development)
  if (req.socket && req.socket.getPeerCertificate) {
    const cert = req.socket.getPeerCertificate();

    if (!cert || !cert.fingerprint256) {
      throw new Error('No client certificate found in TLS connection');
    }

    // Remove colons from fingerprint and convert to lowercase
    return cert.fingerprint256.replace(/:/g, '').toLowerCase();
  }

  throw new Error(
    'Client certificate not found - ensure mTLS is properly configured'
  );
}

module.exports = {
  computeHash,
  validateLogData,
  validateUuid,
  validateAction,
  validateBuildingRegistration,
  validateBuildingTokenization,
  validateTokenMint,
  validateTokenTransfer,
  validatePagination,
  validateTokenBalanceQuery,
  validatePrincipal,
  formatError,
  formatSuccess,
  extractCertificateFingerprint,
};
