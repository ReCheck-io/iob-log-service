const { IcrcLedgerCanister } = require('@dfinity/ledger-icrc');
const { Principal } = require('@dfinity/principal');

let agent = null;
const ledgerActors = new Map(); // Cache actors by canister ID

/**
 * Initialize the ledger canister module
 * @param {HttpAgent} httpAgent - The IC HTTP agent instance
 */
function init(httpAgent) {
  agent = httpAgent;
}

/**
 * Get or create a ledger actor for a specific canister
 * @param {string} canisterId - Ledger canister ID
 * @returns {Promise<IcrcLedgerCanister>}
 */
async function getLedgerActor(canisterId) {
  if (!agent) {
    throw new Error('Agent not initialized. Call init() first.');
  }

  if (!ledgerActors.has(canisterId)) {
    const actor = IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(canisterId),
    });
    ledgerActors.set(canisterId, actor);
  }
  return ledgerActors.get(canisterId);
}

// ========== ICRC-1 STANDARD METHODS ==========

/**
 * Get token name
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function getTokenName(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.name();
    return { Ok: result };
  } catch (error) {
    console.error('❌ Error getting token name:', error);
    return { Err: error.message };
  }
}

/**
 * Get token symbol
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function getTokenSymbol(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.symbol();
    return { Ok: result };
  } catch (error) {
    console.error('❌ Error getting token symbol:', error);
    return { Err: error.message };
  }
}

/**
 * Get token decimals
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: number} | {Err: string}>}
 */
async function getTokenDecimals(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.decimals();
    return { Ok: result };
  } catch (error) {
    console.error('❌ Error getting token decimals:', error);
    return { Err: error.message };
  }
}

/**
 * Get transfer fee
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function getTransferFee(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.fee();
    return { Ok: result.toString() };
  } catch (error) {
    console.error('❌ Error getting transfer fee:', error);
    return { Err: error.message };
  }
}

/**
 * Get token metadata
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: Array<[string, any]>} | {Err: string}>}
 */
async function getTokenMetadata(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.metadata();
    return { Ok: result };
  } catch (error) {
    console.error('❌ Error getting token metadata:', error);
    return { Err: error.message };
  }
}

/**
 * Get total token supply
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function getTotalSupply(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.totalSupply();
    return { Ok: result.toString() };
  } catch (error) {
    console.error('❌ Error getting total supply:', error);
    return { Err: error.message };
  }
}

/**
 * Get minting account
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: {owner: string, subaccount?: Uint8Array} | null} | {Err: string}>}
 */
async function getMintingAccount(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.mintingAccount();
    if (result) {
      return {
        Ok: {
          owner: result.owner.toString(),
          subaccount: result.subaccount,
        },
      };
    }
    return { Ok: null };
  } catch (error) {
    console.error('❌ Error getting minting account:', error);
    return { Err: error.message };
  }
}

/**
 * Get account balance
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} accountOwner - Account owner principal
 * @param {Uint8Array} [subaccount] - Optional subaccount
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function getBalance(ledgerCanisterId, accountOwner, subaccount = null) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.balance({
      owner: Principal.fromText(accountOwner),
      subaccount: subaccount ? [subaccount] : [],
    });
    return { Ok: result.toString() };
  } catch (error) {
    console.error('❌ Error getting balance:', error);
    return { Err: error.message };
  }
}

/**
 * Transfer tokens
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} to - Recipient principal
 * @param {string|bigint} amount - Amount to transfer
 * @param {Uint8Array} [fromSubaccount] - From subaccount
 * @param {Uint8Array} [toSubaccount] - To subaccount
 * @param {string} [memo] - Optional memo
 * @param {bigint} [fee] - Optional custom fee
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function transferTokens(
  ledgerCanisterId,
  to,
  amount,
  fromSubaccount = null,
  toSubaccount = null,
  memo = null,
  fee = null
) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);

    const transferArgs = {
      to: {
        owner: Principal.fromText(to),
        subaccount: toSubaccount ? [toSubaccount] : [],
      },
      amount: BigInt(amount),
      from_subaccount: fromSubaccount ? [fromSubaccount] : [],
      fee: fee ? [fee] : [],
      memo: memo ? [new TextEncoder().encode(memo)] : [],
      created_at_time: [],
    };

    const result = await ledger.transfer(transferArgs);
    return { Ok: result.toString() };
  } catch (error) {
    console.error('❌ Error transferring tokens:', error);
    return { Err: error.message };
  }
}

/**
 * Mint tokens to a recipient (only for minting account)
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} to - Recipient principal
 * @param {string|bigint} amount - Amount to mint
 * @param {Uint8Array} [toSubaccount] - To subaccount
 * @param {string} [memo] - Optional memo
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function mintTokens(
  ledgerCanisterId,
  to,
  amount,
  toSubaccount = null,
  memo = null
) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);

    const result = await ledger.transfer({
      to: {
        owner: Principal.fromText(to),
        subaccount: toSubaccount ? [toSubaccount] : [],
      },
      amount: BigInt(amount),
      fee: [],
      memo: memo ? [new TextEncoder().encode(memo)] : [],
      created_at_time: [],
    });

    return { Ok: result.toString() };
  } catch (error) {
    console.error('❌ Error minting tokens:', error);
    return { Err: error.message };
  }
}

/**
 * Get supported standards
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: Array<{name: string, url: string}>} | {Err: string}>}
 */
async function getSupportedStandards(ledgerCanisterId) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);
    const result = await ledger.supportedStandards();
    return { Ok: result };
  } catch (error) {
    console.error('❌ Error getting supported standards:', error);
    return { Err: error.message };
  }
}

// ========== ICRC-2 SPECIFIC METHODS ==========

/**
 * Approve another account to spend tokens on your behalf
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} spender - Spender principal
 * @param {string|bigint} amount - Amount to approve
 * @param {Uint8Array} [fromSubaccount] - From subaccount
 * @param {Uint8Array} [spenderSubaccount] - Spender subaccount
 * @param {bigint} [expiresAt] - Optional expiration timestamp
 * @param {string} [memo] - Optional memo
 * @param {bigint} [fee] - Optional custom fee
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function approveAllowance(
  ledgerCanisterId,
  spender,
  amount,
  fromSubaccount = null,
  spenderSubaccount = null,
  expiresAt = null,
  memo = null,
  fee = null
) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);

    const approveArgs = {
      spender: {
        owner: Principal.fromText(spender),
        subaccount: spenderSubaccount ? [spenderSubaccount] : [],
      },
      amount: BigInt(amount),
      from_subaccount: fromSubaccount ? [fromSubaccount] : [],
      expires_at: expiresAt ? [expiresAt] : [],
      fee: fee ? [fee] : [],
      memo: memo ? [new TextEncoder().encode(memo)] : [],
    };

    const result = await ledger.approve(approveArgs);
    return { Ok: result.toString() };
  } catch (error) {
    console.error('❌ Error approving allowance:', error);
    return { Err: error.message };
  }
}

/**
 * Get allowance between two accounts
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} owner - Owner principal
 * @param {string} spender - Spender principal
 * @param {Uint8Array} [ownerSubaccount] - Owner subaccount
 * @param {Uint8Array} [spenderSubaccount] - Spender subaccount
 * @returns {Promise<{Ok: {allowance: string, expires_at?: string}} | {Err: string}>}
 */
async function getAllowance(
  ledgerCanisterId,
  owner,
  spender,
  ownerSubaccount = null,
  spenderSubaccount = null
) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);

    const allowanceArgs = {
      account: {
        owner: Principal.fromText(owner),
        subaccount: ownerSubaccount ? [ownerSubaccount] : [],
      },
      spender: {
        owner: Principal.fromText(spender),
        subaccount: spenderSubaccount ? [spenderSubaccount] : [],
      },
    };

    const result = await ledger.allowance(allowanceArgs);
    return {
      Ok: {
        allowance: result.allowance.toString(),
        expires_at: result.expires_at ? result.expires_at.toString() : null,
      },
    };
  } catch (error) {
    console.error('❌ Error getting allowance:', error);
    return { Err: error.message };
  }
}

/**
 * Transfer tokens from approved account
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} from - From principal (must have approved the caller)
 * @param {string} to - To principal
 * @param {string|bigint} amount - Amount to transfer
 * @param {Uint8Array} [fromSubaccount] - From subaccount
 * @param {Uint8Array} [toSubaccount] - To subaccount
 * @param {string} [memo] - Optional memo
 * @param {bigint} [fee] - Optional custom fee
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function transferFrom(
  ledgerCanisterId,
  from,
  to,
  amount,
  fromSubaccount = null,
  toSubaccount = null,
  memo = null,
  fee = null
) {
  try {
    const ledger = await getLedgerActor(ledgerCanisterId);

    const transferFromArgs = {
      from: {
        owner: Principal.fromText(from),
        subaccount: fromSubaccount ? [fromSubaccount] : [],
      },
      to: {
        owner: Principal.fromText(to),
        subaccount: toSubaccount ? [toSubaccount] : [],
      },
      amount: BigInt(amount),
      fee: fee ? [fee] : [],
      memo: memo ? [new TextEncoder().encode(memo)] : [],
      created_at_time: [],
    };

    const result = await ledger.transferFrom(transferFromArgs);
    return { Ok: result.toString() };
  } catch (error) {
    console.error('❌ Error transferring from approved account:', error);
    return { Err: error.message };
  }
}

// ========== UTILITY & CONVENIENCE METHODS ==========

/**
 * Get complete token information
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @returns {Promise<{Ok: {name: string, symbol: string, decimals: number, totalSupply: string, fee: string, metadata: Array, mintingAccount: any}} | {Err: string}>}
 */
async function getTokenInfo(ledgerCanisterId) {
  try {
    const [name, symbol, decimals, totalSupply, fee, metadata, mintingAccount] =
      await Promise.all([
        getTokenName(ledgerCanisterId),
        getTokenSymbol(ledgerCanisterId),
        getTokenDecimals(ledgerCanisterId),
        getTotalSupply(ledgerCanisterId),
        getTransferFee(ledgerCanisterId),
        getTokenMetadata(ledgerCanisterId),
        getMintingAccount(ledgerCanisterId),
      ]);

    // Check if any call failed
    const results = [
      name,
      symbol,
      decimals,
      totalSupply,
      fee,
      metadata,
      mintingAccount,
    ];
    const failedResult = results.find(result => result.Err);
    if (failedResult) {
      return { Err: failedResult.Err };
    }

    return {
      Ok: {
        name: name.Ok,
        symbol: symbol.Ok,
        decimals: decimals.Ok,
        totalSupply: totalSupply.Ok,
        fee: fee.Ok,
        metadata: metadata.Ok,
        mintingAccount: mintingAccount.Ok,
      },
    };
  } catch (error) {
    console.error('❌ Error getting token info:', error);
    return { Err: error.message };
  }
}

/**
 * Check if an account has sufficient balance for a transaction
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} accountOwner - Account owner principal
 * @param {string|bigint} requiredAmount - Required amount
 * @param {Uint8Array} [subaccount] - Optional subaccount
 * @returns {Promise<{Ok: {sufficient: boolean, currentBalance: string, required: string}} | {Err: string}>}
 */
async function checkSufficientBalance(
  ledgerCanisterId,
  accountOwner,
  requiredAmount,
  subaccount = null
) {
  try {
    const balanceResult = await getBalance(
      ledgerCanisterId,
      accountOwner,
      subaccount
    );
    if (balanceResult.Err) {
      return balanceResult;
    }

    const currentBalance = BigInt(balanceResult.Ok);
    const required = BigInt(requiredAmount);

    return {
      Ok: {
        sufficient: currentBalance >= required,
        currentBalance: currentBalance.toString(),
        required: required.toString(),
      },
    };
  } catch (error) {
    console.error('❌ Error checking sufficient balance:', error);
    return { Err: error.message };
  }
}

/**
 * Revoke allowance (set allowance to 0)
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string} spender - Spender principal
 * @param {Uint8Array} [fromSubaccount] - From subaccount
 * @param {Uint8Array} [spenderSubaccount] - Spender subaccount
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function revokeAllowance(
  ledgerCanisterId,
  spender,
  fromSubaccount = null,
  spenderSubaccount = null
) {
  return await approveAllowance(
    ledgerCanisterId,
    spender,
    0,
    fromSubaccount,
    spenderSubaccount
  );
}

/**
 * Burn tokens (transfer to null account - if supported)
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string|bigint} amount - Amount to burn
 * @param {Uint8Array} [fromSubaccount] - From subaccount
 * @param {string} [memo] - Optional memo
 * @returns {Promise<{Ok: string} | {Err: string}>}
 */
async function burnTokens(
  ledgerCanisterId,
  amount,
  fromSubaccount = null,
  memo = null
) {
  try {
    // Get minting account to use as burn destination
    const mintingAccountResult = await getMintingAccount(ledgerCanisterId);
    if (mintingAccountResult.Err) {
      return mintingAccountResult;
    }

    if (!mintingAccountResult.Ok) {
      return { Err: 'No minting account found for burning' };
    }

    return await transferTokens(
      ledgerCanisterId,
      mintingAccountResult.Ok.owner,
      amount,
      fromSubaccount,
      mintingAccountResult.Ok.subaccount,
      memo
    );
  } catch (error) {
    console.error('❌ Error burning tokens:', error);
    return { Err: error.message };
  }
}

/**
 * Calculate transaction cost (amount + fee)
 * @param {string} ledgerCanisterId - Ledger canister ID
 * @param {string|bigint} amount - Transfer amount
 * @returns {Promise<{Ok: {totalCost: string, amount: string, fee: string}} | {Err: string}>}
 */
async function calculateTransactionCost(ledgerCanisterId, amount) {
  try {
    const feeResult = await getTransferFee(ledgerCanisterId);
    if (feeResult.Err) {
      return feeResult;
    }

    const fee = BigInt(feeResult.Ok);
    const transferAmount = BigInt(amount);
    const totalCost = transferAmount + fee;

    return {
      Ok: {
        totalCost: totalCost.toString(),
        amount: transferAmount.toString(),
        fee: fee.toString(),
      },
    };
  } catch (error) {
    console.error('❌ Error calculating transaction cost:', error);
    return { Err: error.message };
  }
}

module.exports = {
  init,
  getLedgerActor,

  // ICRC-1 Standard Methods
  getTokenName,
  getTokenSymbol,
  getTokenDecimals,
  getTransferFee,
  getTokenMetadata,
  getTotalSupply,
  getMintingAccount,
  getBalance,
  transferTokens,
  mintTokens,
  getSupportedStandards,

  // ICRC-2 Standard Methods
  approveAllowance,
  getAllowance,
  transferFrom,

  // Utility Methods
  getTokenInfo,
  checkSufficientBalance,
  revokeAllowance,
  burnTokens,
  calculateTransactionCost,
};
