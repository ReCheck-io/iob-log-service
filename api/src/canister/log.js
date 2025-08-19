const {
  createActor,
} = require('../../../log-canister/dfx-declarations/log/index.js');

let agent = null;
let actor = null;

/**
 * Initialize the log canister module
 * @param {HttpAgent} httpAgent - The IC HTTP agent instance
 * @param {string} canisterId - The canister ID to connect to
 */
function init(httpAgent, canisterId) {
  agent = httpAgent;

  if (!actor) {
    actor = createActor(canisterId, {
      agent,
    });
  }

  return actor;
}

/**
 * Initialize the canister with a service principal
 * @param {Principal} servicePrincipal - The principal to initialize the canister with
 * @returns {Promise<{Ok: {id: Principal, createdAt: BigInt}} | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function initializeCanister(servicePrincipal) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.initializeCanister(servicePrincipal);
    return result;
  } catch (error) {
    console.error('❌ Error initializing canister:', error);
    throw error;
  }
}

/**
 * Add a new log entry
 * @param {string} uuid - UUID of the data object
 * @param {string} action - Action performed
 * @param {string} userFingerprint - User fingerprint
 * @param {string} hash - Hash of the data
 * @param {any} [data] - Optional data object
 * @returns {Promise<{Ok: {id: Principal, action: string, data: any, hash: string, createdAt: BigInt, uuid: string, serviceId: Principal, userFingerprint: string}} | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function addLog(uuid, action, userFingerprint, hash, data = null) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.addLog(
      uuid,
      action,
      userFingerprint,
      hash,
      data ? [data] : []
    );
    return result;
  } catch (error) {
    console.error('❌ Error adding log:', error);
    throw error;
  }
}

/**
 * Get all logs
 * @returns {Promise<{Ok: Array<{id: Principal, action: string, data: any, hash: string, createdAt: BigInt, uuid: string, serviceId: Principal, userFingerprint: string}> | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function getAllLogs() {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.getAllLogs();
    return result;
  } catch (error) {
    console.error('❌ Error getting all logs:', error);
    throw error;
  }
}

/**
 * Get logs by action
 * @param {string} action - The action to filter by
 * @returns {Promise<{Ok: Array<{id: Principal, action: string, data: any, hash: string, createdAt: BigInt, uuid: string, serviceId: Principal, userFingerprint: string}> | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function getLogsByAction(action) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.getLogsByAction(action);
    return result;
  } catch (error) {
    console.error('❌ Error getting logs by action:', error);
    throw error;
  }
}

/**
 * Get logs by user fingerprint
 * @param {string} userFingerprint - User fingerprint to filter by
 * @returns {Promise<{Ok: Array<{id: Principal, action: string, data: any, hash: string, createdAt: BigInt, uuid: string, serviceId: Principal, userFingerprint: string}> | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function getLogsByUserFingerprint(userFingerprint) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.getLogsByUserFingerprint(userFingerprint);
    return result;
  } catch (error) {
    console.error('❌ Error getting logs by user fingerprint:', error);
    throw error;
  }
}

/**
 * Get logs by UUID
 * @param {string} uuid - UUID to filter by
 * @returns {Promise<{Ok: Array<{id: Principal, action: string, data: any, hash: string, createdAt: BigInt, uuid: string, serviceId: Principal, userFingerprint: string}> | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function getLogsByUuid(uuid) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.getLogsByUuid(uuid);
    return result;
  } catch (error) {
    console.error('❌ Error getting logs by UUID:', error);
    throw error;
  }
}

/**
 * Verify a log entry
 * @param {string} hash - Hash to verify
 * @param {string} uuid - UUID of the entry
 * @param {string} action - Action of the entry
 * @param {string} userFingerprint - User fingerprint of the entry
 * @returns {Promise<{Ok: {valid: boolean, hash: string}} | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function verifyLog(hash, uuid, action, userFingerprint) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.verifyLog(hash, uuid, action, userFingerprint);
    return result;
  } catch (error) {
    console.error('❌ Error verifying log:', error);
    throw error;
  }
}

module.exports = {
  init,
  initializeCanister,
  addLog,
  getAllLogs,
  getLogsByAction,
  getLogsByUserFingerprint,
  getLogsByUuid,
  verifyLog,
};
