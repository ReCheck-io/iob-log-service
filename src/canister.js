const { Ed25519KeyIdentity } = require('@dfinity/identity');
const { HttpAgent } = require('@dfinity/agent');
const fetch = require('isomorphic-fetch');
const { readFileSync, existsSync, writeFileSync } = require('fs');

// Import generated declarations (update path after dfx deploy)
const { createActor } = require('../canister/dfx-declarations/iob/index.js');

let agent = null;
let actor = null;
let serviceIdentity = null;

/**
 * Initialize the canister connection with service identity
 */
async function initializeCanister() {
  try {
    const identitySecretPath = process.env.IDENTITY_SECRET_PATH || './identity.secret';
    
    // Create or load service identity
    if (existsSync(identitySecretPath)) {
      console.log('📋 Loading existing service identity...');
      const secretKey = readFileSync(identitySecretPath, { encoding: 'utf8' }).trim();
      serviceIdentity = Ed25519KeyIdentity.fromSecretKey(Buffer.from(secretKey, 'hex'));
    } else {
      console.log('🔑 Generating new service identity...');
      serviceIdentity = Ed25519KeyIdentity.generate();
      
      // Save the identity for persistence across restarts
      const secretKey = Buffer.from(serviceIdentity.getKeyPair().secretKey).toString('hex');
      writeFileSync(identitySecretPath, secretKey);
      console.log(`💾 Service identity saved to: ${identitySecretPath}`);
    }

    // Log the service principal for deployment authorization
    const servicePrincipal = serviceIdentity.getPrincipal().toText();
    console.log('🆔 Service Principal:', servicePrincipal);
    console.log('📝 To authorize this service during deployment, use:');
    console.log(`   dfx deploy --argument "(opt principal \\"${servicePrincipal}\\")"`);
    console.log(`   dfx canister call iob initializeCanister "(principal \\"${servicePrincipal}\\")"`);
    console.log('');

    const host = process.env.IC_HOST || 'http://127.0.0.1:4943';
    
    agent = new HttpAgent({
      identity: serviceIdentity,
      host,
      fetch,
    });

    const canisterId = process.env.CANISTER_ID_IOB;
    if (!canisterId) {
      console.log('⚠️  CANISTER_ID_IOB not configured - actor not created');
      return true;
    }

    actor = createActor(canisterId, { agent });
    
    console.log('✅ Canister client initialized successfully');
    console.log('🔗 Connected to:', host);
    console.log('🎯 Canister ID:', canisterId);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize canister client:', error);
    throw error;
  }
}

/**
 * Get the actor instance (ensures initialization)
 */
function getActor() {
  if (!actor) {
    throw new Error('Canister not initialized. Call initializeCanister() first.');
  }
  return actor;
}

/**
 * Get the service principal (for authorization)
 */
function getServicePrincipal() {
  if (!serviceIdentity) {
    return null;
  }
  return serviceIdentity.getPrincipal().toText();
}

/**
 * Register a new log entry in the canister
 * New signature: (uuid, action, userFingerprint, hash, data)
 * @param {string} uuid - Data object UUID
 * @param {string} action - Action performed
 * @param {string} userFingerprint - User's certificate fingerprint
 * @param {string} hash - Pre-calculated hash
 * @param {any} data - Optional complete data object
 * @returns {Promise<object>} - Canister response
 */
async function registerLog(uuid, action, userFingerprint, hash, data = null) {
  try {
    const canisterActor = getActor();
    
    // Call canister with new signature: addLog(uuid, action, userFingerprint, hash, data)
    const result = await canisterActor.addLog(uuid, action, userFingerprint, hash, data ? [data] : []);
    
    return result;
  } catch (error) {
    console.error('❌ Error registering log:', error);
    throw error;
  }
}

/**
 * Verify a log entry in the canister
 * New signature: (hash, uuid, action, userFingerprint)
 * @param {string} hash - Pre-calculated hash to search for
 * @param {string} uuid - Data object UUID
 * @param {string} action - Action performed
 * @param {string} userFingerprint - User's certificate fingerprint
 * @returns {Promise<object>} - Canister response with verification result
 */
async function verifyLog(hash, uuid, action, userFingerprint) {
  try {
    const canisterActor = getActor();
    
    // Call canister with new signature: verifyLog(hash, uuid, action, userFingerprint)
    const result = await canisterActor.verifyLog(hash, uuid, action, userFingerprint);
    
    return result;
  } catch (error) {
    console.error('❌ Error verifying log:', error);
    throw error;
  }
}

/**
 * Get logs by data UUID
 * @param {string} uuid - Data object UUID
 * @returns {Promise<object>} - Canister response with logs
 */
async function getLogsByDataId(uuid) {
  try {
    const canisterActor = getActor();
    const result = await canisterActor.getLogsByUuid(uuid);
    return result;
  } catch (error) {
    console.error('❌ Error getting logs by UUID:', error);
    throw error;
  }
}

/**
 * Get logs by action type
 * @param {string} action - Action type (create, update, delete)
 * @returns {Promise<object>} - Canister response with logs
 */
async function getLogsByAction(action) {
  try {
    const canisterActor = getActor();
    const result = await canisterActor.getLogsByAction(action);
    return result;
  } catch (error) {
    console.error('❌ Error getting logs by action:', error);
    throw error;
  }
}

/**
 * Get logs by user fingerprint
 * @param {string} userFingerprint - User's certificate fingerprint
 * @returns {Promise<object>} - Canister response with logs
 */
async function getLogsByUserFingerprint(userFingerprint) {
  try {
    const canisterActor = getActor();
    const result = await canisterActor.getLogsByUserFingerprint(userFingerprint);
    return result;
  } catch (error) {
    console.error('❌ Error getting logs by user fingerprint:', error);
    throw error;
  }
}

/**
 * Get all logs
 * @returns {Promise<object>} - Canister response with all logs
 */
async function getAllLogs() {
  try {
    const canisterActor = getActor();
    const result = await canisterActor.getAllLogs();
    return result;
  } catch (error) {
    console.error('❌ Error getting all logs:', error);
    throw error;
  }
}

module.exports = {
  initializeCanister,
  getServicePrincipal,
  registerLog,
  verifyLog,
  getLogsByDataId,
  getLogsByAction,
  getLogsByUserFingerprint,
  getAllLogs
}; 