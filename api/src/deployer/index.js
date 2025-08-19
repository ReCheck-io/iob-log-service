// deployer/index.js
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { DEFAULT_DEPLOY_CONFIG } = require('./config');
const {
  createDfxConfig,
  createInitArgs,
  validateBuildingData,
  extractCanisterId,
  prepareDeploymentDirectory,
} = require('./utils');

/**
 * Deploy an ICRC-2 ledger for a building
 */
async function deployBuildingToken(buildingData, config = {}) {
  // Merge with default config
  const deployConfig = { ...DEFAULT_DEPLOY_CONFIG, ...config };

  try {
    // Validate building data
    validateBuildingData(buildingData);

    const { uuid, owner, name, initialSupply = '1000000' } = buildingData;

    // Generate token identifiers using last 6 chars of UUID
    const uuidSuffix = uuid.slice(-6).toUpperCase();
    const tokenSymbol = `BLDG${uuidSuffix}`;
    const tokenName = `${name} Token`;

    // Create unique deployment directory
    const deployId = uuidv4().slice(0, 8);
    const deployDir = path.join(deployConfig.deploymentDir, deployId);
    prepareDeploymentDirectory(deployDir);

    console.log(`🚀 Deploying ${tokenSymbol} for building ${name}...`);
    console.log(`📁 Deployment directory: ${deployDir}`);

    // Create and write dfx config
    const dfxConfig = createDfxConfig(deployConfig, tokenSymbol);
    fs.writeFileSync(
      path.join(deployDir, 'dfx.json'),
      JSON.stringify(dfxConfig, null, 2)
    );

    // Create initialization arguments
    const initArgs = createInitArgs({
      tokenName,
      tokenSymbol,
      owner,
      initialSupply,
      uuid,
      config: deployConfig,
    });

    // Write init args for debugging
    fs.writeFileSync(path.join(deployDir, 'init-args.did'), initArgs);

    // Deploy the ledger canister
    const deployCommand =
      deployConfig.network === 'ic'
        ? `cd ${deployDir} && dfx deploy --network ic --with-cycles ${deployConfig.cycleAmount} ledger --argument '${initArgs}'`
        : `cd ${deployDir} && dfx deploy ledger --argument '${initArgs}'`;

    const output = execSync(deployCommand, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const ledgerCanisterId = extractCanisterId(output);
    console.log(`✅ Successfully deployed ledger: ${ledgerCanisterId}`);

    // Cleanup deployment directory unless specified to keep
    if (process.env.KEEP_DEPLOY_FILES !== 'true') {
      fs.rmSync(deployDir, { recursive: true });
    }

    return {
      success: true,
      ledgerCanisterId,
      tokenSymbol,
      tokenName,
      uuid,
      deploymentOutput: output,
    };
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
    };
  }
}

/**
 * Deploy multiple building tokens in parallel
 */
async function deployMultipleBuildings(
  buildingsData,
  options = {},
  config = {}
) {
  const results = [];
  const concurrent = options.concurrent || 1;

  try {
    // Validate all buildings first
    buildingsData.forEach(building => validateBuildingData(building));

    for (let i = 0; i < buildingsData.length; i += concurrent) {
      const batch = buildingsData.slice(i, i + concurrent);
      const batchPromises = batch.map(building =>
        deployBuildingToken(building, config)
      );

      console.log(`📦 Deploying batch ${i / concurrent + 1}...`);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches
      if (i + concurrent < buildingsData.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(
      `✅ Deployment complete. Success: ${successful}/${buildingsData.length}`
    );

    return results;
  } catch (error) {
    console.error('❌ Batch deployment failed:', error.message);
    return {
      success: false,
      error: error.message,
      results,
    };
  }
}

module.exports = {
  deployBuildingToken,
  deployMultipleBuildings,
};
