const { Ed25519KeyIdentity } = require('@dfinity/identity');
const { HttpAgent } = require('@dfinity/agent');
const fetch = require('isomorphic-fetch');
const { readFileSync, existsSync, writeFileSync } = require('fs');

// Import canister modules
const logCanister = require('./log');
const registryCanister = require('./registry');
const ledgerCanister = require('./ledger');

let serviceIdentity = null;
const canisterIds = {};

/**
 * Initialize the canister connection with service identity
 */
async function initializeCanisters() {
  try {
    const identitySecretPath =
      process.env.IDENTITY_SECRET_PATH || './identity.secret';

    // Create or load service identity
    if (existsSync(identitySecretPath)) {
      console.log('📋 Loading existing service identity...');
      const secretKey = readFileSync(identitySecretPath, {
        encoding: 'utf8',
      }).trim();
      serviceIdentity = Ed25519KeyIdentity.fromSecretKey(
        Buffer.from(secretKey, 'hex')
      );
    } else {
      console.log('🔑 Generating new service identity...');
      serviceIdentity = Ed25519KeyIdentity.generate();

      // Save the identity for persistence across restarts
      const secretKey = Buffer.from(
        serviceIdentity.getKeyPair().secretKey
      ).toString('hex');
      writeFileSync(identitySecretPath, secretKey);
      console.log(`💾 Service identity saved to: ${identitySecretPath}`);
    }

    // Log the service principal for deployment authorization
    const servicePrincipal = serviceIdentity.getPrincipal().toText();
    console.log('🆔 Service Principal:', servicePrincipal);
    console.log('📝 To authorize this service during deployment, use:');
    console.log('For Log Canister:');
    console.log(
      `   dfx deploy log --argument "(opt principal \\"${servicePrincipal}\\")"`
    );
    console.log(
      `   dfx canister call log initializeCanister "(principal \\"${servicePrincipal}\\")"`
    );
    console.log('');
    console.log('For Registry Canister:');
    console.log(
      `   dfx deploy registry --argument "(opt principal \\"${servicePrincipal}\\")"`
    );
    console.log(
      `   dfx canister call registry initializeCanister "(principal \\"${servicePrincipal}\\")"`
    );
    console.log('');

    const host = process.env.IC_HOST || 'http://127.0.0.1:4943';

    const agent = new HttpAgent({
      identity: serviceIdentity,
      host,
      fetch,
    });

    canisterIds.log = process.env.CANISTER_ID_LOG;
    canisterIds.registry = process.env.CANISTER_ID_REGISTRY;

    if (!canisterIds.log || !canisterIds.registry) {
      console.log(
        '⚠️  CANISTER_ID_IOB or CANISTER_ID_REGISTRY not configured - actor not created'
      );
      return true;
    }

    // Initialize canister modules
    logCanister.init(agent, canisterIds.log);
    registryCanister.init(agent, canisterIds.registry);
    ledgerCanister.init(agent); // Ledger module handles multiple canister IDs dynamically

    console.log('✅ Canister client initialized successfully');
    console.log('🔗 Connected to:', host);

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize canister client:', error);
    throw error;
  }
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

module.exports = {
  initializeCanisters,
  getServicePrincipal,
};
