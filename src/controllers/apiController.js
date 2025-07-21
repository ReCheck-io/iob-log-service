const { 
  registerLog: canisterRegisterLog, 
  verifyLog: canisterVerifyLog, 
  getLogsByDataId: getCanisterLogsByDataId,
  getLogsByAction: getCanisterLogsByAction 
} = require('../canister');
const { 
  computeHash,
  validateLogData,
  validateUuid,
  validateAction,
  formatError,
  formatSuccess,
  extractCertificateFingerprint 
} = require('../utils');

/**
 * Register a new audit log entry
 */
async function register(req, res) {
  try {
    // Extract user fingerprint from mTLS certificate
    const userFingerprint = extractCertificateFingerprint(req);
    
    // Validate request data
    const validatedData = await validateLogData(req.body);
    const { uuid, action, data } = validatedData;
    
    // Compute hash: uuid + action + userFingerprint
    const hash = computeHash(uuid, action, userFingerprint);
    
    // Register log in canister with new signature: (uuid, action, userFingerprint, hash, data)
    const result = await canisterRegisterLog(uuid, action, userFingerprint, hash, data);
    
    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }
    
    res.status(201).json(formatSuccess(result.Ok, 'Log entry registered successfully'));
    
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(formatError(error.message, error.code, error.details));
    }
    
    res.status(500).json(formatError('Failed to register log entry', 'INTERNAL_ERROR'));
  }
}

/**
 * Verify an existing audit log entry
 */
async function verify(req, res) {
  try {
    // Extract user fingerprint from mTLS certificate
    const userFingerprint = extractCertificateFingerprint(req);
    
    // Validate request data
    const validatedData = await validateLogData(req.body);
    const { uuid, action } = validatedData;
    
    // Compute hash to search for the log entry
    const hash = computeHash(uuid, action, userFingerprint);
    
    // Verify log in canister with new signature: (hash, uuid, action, userFingerprint)
    const result = await canisterVerifyLog(hash, uuid, action, userFingerprint);
    
    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }
    
    const { valid, hash: returnedHash } = result.Ok;
    
    res.json(formatSuccess({
      verified: valid,
      hash: returnedHash,
      uuid,
      action,
      userFingerprint
    }, valid ? 'Log entry verified successfully' : 'Log entry verification failed'));
    
  } catch (error) {
    console.error('Verify error:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(formatError(error.message, error.code, error.details));
    }
    
    res.status(500).json(formatError('Failed to verify log entry', 'INTERNAL_ERROR'));
  }
}

/**
 * Get logs by data UUID
 */
async function getLogsByDataId(req, res) {
  try {
    // Validate UUID parameter
    const uuid = await validateUuid(req.params.uuid);
    
    // Get logs from canister
    const result = await getCanisterLogsByDataId(uuid);
    
    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }
    
    res.json(formatSuccess(result.Ok, `Found ${result.Ok.length} log(s) for UUID: ${uuid}`));
    
  } catch (error) {
    console.error('Get logs by UUID error:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(formatError(error.message, error.code, error.details));
    }
    
    res.status(500).json(formatError('Failed to retrieve logs by UUID', 'INTERNAL_ERROR'));
  }
}

/**
 * Get logs by action type
 */
async function getLogsByAction(req, res) {
  try {
    // Validate action parameter
    const action = await validateAction(req.params.action);
    
    // Get logs from canister
    const result = await getCanisterLogsByAction(action);
    
    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }
    
    res.json(formatSuccess(result.Ok, `Found ${result.Ok.length} log(s) for action: ${action}`));
    
  } catch (error) {
    console.error('Get logs by action error:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(formatError(error.message, error.code, error.details));
    }
    
    res.status(500).json(formatError('Failed to retrieve logs by action', 'INTERNAL_ERROR'));
  }
}

module.exports = {
  register,
  verify,
  getLogsByDataId,
  getLogsByAction
}; 