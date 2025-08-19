// setup-icrc2.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');
const { DEFAULT_DEPLOY_CONFIG } = require('./config');

async function verifyHash(filePath, expectedHash) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', data => hash.update(data));
    stream.on('end', () => {
      const fileHash = hash.digest('hex');
      resolve(fileHash === expectedHash);
    });
    stream.on('error', reject);
  });
}

async function verifyOrDownloadFile(filePath, url, expectedHash, fileType) {
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log(`${fileType} file found, verifying...`);
    const isValid = await verifyHash(filePath, expectedHash);
    if (isValid) {
      console.log(`✓ Existing ${fileType} file verified`);
      return true;
    }
    console.log(`× Existing ${fileType} file is invalid or outdated`);
  }

  // File doesn't exist or is invalid, download it
  console.log(`Downloading ${fileType} file...`);
  try {
    execSync(`curl -L -o ${filePath} ${url}`);
    const isValid = await verifyHash(filePath, expectedHash);
    if (!isValid) {
      throw new Error(`Downloaded ${fileType} file failed hash verification`);
    }
    console.log(`✓ ${fileType} file downloaded and verified`);
    return true;
  } catch (error) {
    console.error(`Failed to download ${fileType} file:`, error.message);
    throw error;
  }
}

async function setupICRC2Ledger() {
  console.log(
    `Setting up ICRC ledger from release ${DEFAULT_DEPLOY_CONFIG.release}...`
  );

  try {
    // Create ledger-canister directory if it doesn't exist
    const ledgerDir = path.join(__dirname, '..', '..', 'ledger-canister');
    if (!fs.existsSync(ledgerDir)) {
      fs.mkdirSync(ledgerDir, { recursive: true });
    }

    // Define file paths
    const wasmPath = path.join(ledgerDir, 'ledger.wasm.gz');
    const didPath = path.join(ledgerDir, 'ledger.did');

    // Create version file to track the release version
    const versionPath = path.join(ledgerDir, 'version.json');
    const currentVersion = fs.existsSync(versionPath)
      ? JSON.parse(fs.readFileSync(versionPath, 'utf8')).version
      : null;

    // Check if we already have the correct version
    if (currentVersion === DEFAULT_DEPLOY_CONFIG.release) {
      console.log(
        'Current version matches required version, checking file integrity...'
      );
    } else {
      console.log(
        `Version mismatch or new setup (current: ${currentVersion}, required: ${DEFAULT_DEPLOY_CONFIG.release})`
      );
    }

    // Verify or download WASM and DID files
    await verifyOrDownloadFile(
      wasmPath,
      DEFAULT_DEPLOY_CONFIG.wasm.ic,
      DEFAULT_DEPLOY_CONFIG.hashes.wasm,
      'WASM'
    );

    await verifyOrDownloadFile(
      didPath,
      DEFAULT_DEPLOY_CONFIG.candid.ic,
      DEFAULT_DEPLOY_CONFIG.hashes.did,
      'DID'
    );

    // Update version file
    fs.writeFileSync(
      versionPath,
      JSON.stringify(
        {
          version: DEFAULT_DEPLOY_CONFIG.release,
          lastVerified: new Date().toISOString(),
        },
        null,
        2
      )
    );

    // Verify hashes
    console.log('Verifying file integrity...');

    const wasmValid = await verifyHash(
      wasmPath,
      DEFAULT_DEPLOY_CONFIG.hashes.wasm
    );
    if (!wasmValid) {
      throw new Error('WASM file hash verification failed');
    }

    const didValid = await verifyHash(
      didPath,
      DEFAULT_DEPLOY_CONFIG.hashes.did
    );
    if (!didValid) {
      throw new Error('DID file hash verification failed');
    }

    console.log('✅ ICRC ledger files ready!');
    console.log(`Files location: ${ledgerDir}`);
    console.log(`Version: ${DEFAULT_DEPLOY_CONFIG.release} (notify-method)`);

    return {
      success: true,
      wasmPath,
      didPath,
      version: DEFAULT_DEPLOY_CONFIG.release,
      isNewSetup: currentVersion !== DEFAULT_DEPLOY_CONFIG.release,
    };
  } catch (error) {
    console.error('Failed to setup ICRC-2 ledger:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

if (require.main === module) {
  setupICRC2Ledger();
}

module.exports = { setupICRC2Ledger };
