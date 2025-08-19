// deployer/config.js

const DEFAULT_DEPLOY_CONFIG = {
  network: process.env.DFX_NETWORK || 'local',
  cycleAmount: '2T',
  deploymentDir: './deployments',
  icpHost:
    process.env.DFX_NETWORK === 'ic'
      ? 'https://ic0.app'
      : 'http://localhost:4943',
  // Official ICRC ledger release with notify method
  release: 'ledger-suite-icp-2025-07-04',
  candid: {
    ic: 'https://github.com/dfinity/ic/releases/download/ledger-suite-icp-2025-07-04/ledger.did',
    local:
      'https://github.com/dfinity/ic/releases/download/ledger-suite-icp-2025-07-04/ledger.did',
  },
  wasm: {
    ic: 'https://github.com/dfinity/ic/releases/download/ledger-suite-icp-2025-07-04/ledger-canister_notify-method.wasm.gz',
    local:
      'https://github.com/dfinity/ic/releases/download/ledger-suite-icp-2025-07-04/ledger-canister_notify-method.wasm.gz',
  },
  // Known hashes from the release
  hashes: {
    wasm: '1b634871bcbf377b1bd617172a72f5439c7285c9425ccc9389747ac0a70e35ae',
    did: 'e6cbb4dcad645ff4421e55d55ea438261ddd14ec7c6de954925ceaa3a1772eec',
  },
  // Default token parameters
  defaults: {
    decimals: 8,
    transferFee: 10_000,
    archiveOptions: {
      triggerThreshold: 2000,
      numBlocksToArchive: 1000,
    },
  },
};

module.exports = { DEFAULT_DEPLOY_CONFIG };
