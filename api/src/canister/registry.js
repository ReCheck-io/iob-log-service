const {
  createActor: createRegistryActor,
} = require('../../../registry-canister/dfx-declarations/registry/index.js');

let agent = null;
let actor = null;

/**
 * Initialize the registry canister module
 * @param {HttpAgent} httpAgent - The IC HTTP agent instance
 */
function init(httpAgent, canisterId) {
  agent = httpAgent;

  if (!actor) {
    actor = createRegistryActor(canisterId, {
      agent,
    });
  }

  return actor;
}

/**
 * Get all buildings
 * @returns {Promise<{Ok: Array<{ledgerCanisterId: Principal, deployedAt: BigInt, owner: Principal, metadata?: {}, name: string, uuid: string, lastUpdated: BigInt, description: string, version: string, tokenSymbol: string, tokenName: string, buildingHash: string, buildingType?: string, location?: string}> | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function getAllBuildings() {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.getAllBuildings();
    return result;
  } catch (error) {
    console.error('❌ Error getting all buildings:', error);
    throw error;
  }
}

/**
 * Get a specific building
 * @param {string} uuid - UUID of the building
 * @returns {Promise<{Ok: {ledgerCanisterId: Principal, deployedAt: BigInt, owner: Principal, metadata?: {}, name: string, uuid: string, lastUpdated: BigInt, description: string, version: string, tokenSymbol: string, tokenName: string, buildingHash: string, buildingType?: string, location?: string}} | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function getBuilding(uuid) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.getBuilding(uuid);
    return result;
  } catch (error) {
    console.error('❌ Error getting building:', error);
    throw error;
  }
}

/**
 * Get all buildings owned by a user
 * @param {Principal} owner - Principal ID of the owner
 * @returns {Promise<{Ok: Array<{ledgerCanisterId: Principal, deployedAt: BigInt, owner: Principal, metadata?: {}, name: string, uuid: string, lastUpdated: BigInt, description: string, version: string, tokenSymbol: string, tokenName: string, buildingHash: string, buildingType?: string, location?: string}> | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function getUserBuildings(owner) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.getUserBuildings(owner);
    return result;
  } catch (error) {
    console.error('❌ Error getting user buildings:', error);
    throw error;
  }
}

/**
 * Register a new building
 * @param {string} uuid - UUID for the building
 * @param {Principal} owner - Principal ID of the owner
 * @param {Principal} ledgerCanisterId - Principal ID of the ledger canister
 * @param {string} name - Name of the building
 * @param {string} description - Description of the building
 * @param {string} tokenSymbol - Symbol for the building token
 * @param {string} tokenName - Name of the building token
 * @returns {Promise<{Ok: {ledgerCanisterId: Principal, deployedAt: BigInt, owner: Principal, metadata?: {}, name: string, uuid: string, lastUpdated: BigInt, description: string, version: string, tokenSymbol: string, tokenName: string, buildingHash: string, buildingType?: string, location?: string}} | {Err: {NotFound: string, ValidationError: string, Unauthorized: string, InternalError: string, Conflict: string}}>}
 */
async function registerBuilding(
  uuid,
  ledgerCanisterId,
  owner,
  name,
  buildingHash,
  tokenSymbol,
  tokenName
) {
  if (!actor) {
    throw new Error('Actor not initialized. Get an actor instance first.');
  }

  try {
    const result = await actor.registerBuilding(
      uuid,
      ledgerCanisterId,
      owner,
      name,
      buildingHash,
      tokenSymbol,
      tokenName
    );
    return result;
  } catch (error) {
    console.error('❌ Error registering building:', error);
    throw error;
  }
}

module.exports = {
  init,
  getAllBuildings,
  getBuilding,
  getUserBuildings,
  registerBuilding,
};
