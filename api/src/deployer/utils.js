// deployer/utils.js
const fs = require('fs');
const _path = require('path');

/**
 * Create dfx.json configuration for ICRC ledger deployment
 */
function createDfxConfig(config, _tokenSymbol) {
  return {
    version: 1,
    canisters: {
      ledger: {
        type: 'custom',
        candid: config.candid[config.network],
        wasm: config.wasm[config.network],
      },
    },
    networks: {
      local: {
        bind: '127.0.0.1:4943',
        type: 'ephemeral',
      },
      ic: {
        providers: ['https://ic0.app'],
        type: 'persistent',
      },
    },
  };
}

/**
 * Create ICRC ledger initialization arguments
 */
function createInitArgs({
  tokenName,
  tokenSymbol,
  owner,
  initialSupply,
  uuid,
  buildingHash,
  location,
  buildingType,
  version,
  metadata,
  config,
}) {
  const metadataEntries = [
    `record { "uuid"; variant { Text = "${uuid}" } }`,
    `record { "building_hash"; variant { Text = "${buildingHash}" } }`,
    `record { "version"; variant { Text = "${version}" } }`,
    'record { "deployed_by"; variant { Text = "BuildingTokenizer" } }',
  ];

  if (location) {
    metadataEntries.push(
      `record { "location"; variant { Text = "${location}" } }`
    );
  }

  if (buildingType) {
    metadataEntries.push(
      `record { "building_type"; variant { Text = "${buildingType}" } }`
    );
  }

  // Add custom metadata
  Object.entries(metadata || {}).forEach(([key, value]) => {
    metadataEntries.push(`record { "${key}"; variant { Text = "${value}" } }`);
  });

  return `(variant {
    Init = record {
      token_name = "${tokenName}";
      token_symbol = "${tokenSymbol}";
      minting_account = record {
        owner = principal "${owner}";
        subaccount = null;
      };
      initial_balances = vec {
        record {
          record {
            owner = principal "${owner}";
            subaccount = null;
          };
          ${initialSupply};
        };
      };
      metadata = vec {
        ${metadataEntries.join(';\n        ')}
      };
      transfer_fee = ${config.defaults.transferFee};
      decimals = opt ${config.defaults.decimals};
      fee_collector = null;
      archive_options = record {
        trigger_threshold = ${config.defaults.archiveOptions.triggerThreshold};
        num_blocks_to_archive = ${
          config.defaults.archiveOptions.numBlocksToArchive
        };
        controller_id = principal "${owner}";
      };
      feature_flags = opt record { icrc2 = true };
    }
  })`;
}

/**
 * Validate building data before deployment
 */
function validateBuildingData(buildingData) {
  const required = ['uuid', 'owner', 'name', 'buildingHash'];
  const missing = required.filter(field => !buildingData[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (
    !buildingData.uuid.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  ) {
    throw new Error('Invalid UUID format');
  }

  return true;
}

/**
 * Extract canister ID from dfx deploy output
 */
function extractCanisterId(output) {
  const canisterIdMatch = output.match(/ledger: ([a-z0-9-]+)/);
  if (!canisterIdMatch) {
    throw new Error('Failed to extract canister ID from deployment output');
  }
  return canisterIdMatch[1];
}

/**
 * Ensure deployment directory exists and is clean
 */
function prepareDeploymentDirectory(deployDir) {
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true });
  }
  fs.mkdirSync(deployDir, { recursive: true });
  return deployDir;
}

module.exports = {
  createDfxConfig,
  createInitArgs,
  validateBuildingData,
  extractCanisterId,
  prepareDeploymentDirectory,
};
