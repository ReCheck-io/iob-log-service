const { Principal } = require('@dfinity/principal');
const {
  registerBuilding: canisterRegisterBuilding,
  getBuilding: canisterGetBuilding,
  getUserBuildings: canisterGetUserBuildings,
  getAllBuildings: canisterGetAllBuildings,
} = require('../canister/registry');

const {
  mintTokens: canisterMintTokens,
  transferTokens: canisterTransferTokens,
  getBalance: canisterGetBalance,
  getTokenInfo: canisterGetTokenInfo,
} = require('../canister/ledger');

const {
  formatError,
  formatSuccess,
  validateBuildingRegistration,
  validateBuildingTokenization,
  validateTokenMint,
  validateTokenTransfer,
  validatePagination,
  validateTokenBalanceQuery,
  validateUuid,
  validatePrincipal,
} = require('../utils');

/**
 * @swagger
 * /api/buildings:
 *   post:
 *     tags: [Buildings]
 *     summary: Register a new building
 *     description: Register a building in the IoB registry with tokenization support
 *     security:
 *       - mTLS: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/BuildingRegistration'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Created'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
/**
 * Register a building
 */
async function registerBuilding(req, res) {
  try {
    // Validate request body using yup schema
    const validatedData = await validateBuildingRegistration(req.body);
    const { uuid, ledgerCanisterId, owner, name, tokenSymbol, tokenName } =
      validatedData;

    const result = await canisterRegisterBuilding(
      uuid,
      Principal.fromText(ledgerCanisterId),
      Principal.fromText(owner),
      name,
      tokenSymbol,
      tokenName
    );

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    return res
      .status(201)
      .json(formatSuccess(result.Ok, 'Building registered successfully'));
  } catch (error) {
    console.error('Building registration error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    if (error.message.includes('Invalid principal')) {
      return res
        .status(400)
        .json(formatError('Invalid principal format', 'VALIDATION_ERROR'));
    }

    return res
      .status(500)
      .json(formatError('Failed to register building', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/buildings/{uuid}:
 *   get:
 *     tags: [Buildings]
 *     summary: Get building details
 *     description: Retrieve detailed information about a specific building
 *     security:
 *       - mTLS: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Building UUID
 *     responses:
 *       200:
 *         description: Building details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Building'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
/**
 * Get building details
 */
async function getBuilding(req, res) {
  try {
    // Validate UUID parameter
    const uuid = await validateUuid(req.params.uuid);

    const result = await canisterGetBuilding(uuid);

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(404).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    return res.json(
      formatSuccess(result.Ok, `Building details for UUID: ${uuid}`)
    );
  } catch (error) {
    console.error('Get building error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to fetch building', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/buildings/user/{principal}:
 *   get:
 *     tags: [Buildings]
 *     summary: Get buildings owned by a user
 *     description: Retrieve all buildings owned by a specific principal
 *     security:
 *       - mTLS: []
 *     parameters:
 *       - in: path
 *         name: principal
 *         required: true
 *         schema:
 *           type: string
 *         description: User principal ID
 *         example: "rdmx6-jaaaa-aaaah-qcaiq-cai"
 *     responses:
 *       200:
 *         description: User buildings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Building'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
/**
 * Get all buildings for a user
 */
async function getUserBuildings(req, res) {
  try {
    // Validate principal parameter
    const principal = await validatePrincipal(req.params.principal);
    console.log(principal, Principal.fromHex(principal));
    const result = await canisterGetUserBuildings(Principal.fromHex(principal));

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    return res.json(
      formatSuccess(
        result.Ok,
        `Found ${result.Ok.length} building(s) for user: ${principal}`
      )
    );
  } catch (error) {
    console.error('Get user buildings error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to fetch user buildings', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     tags: [Buildings]
 *     summary: Get all buildings (paginated)
 *     description: Retrieve all buildings in the registry with pagination support
 *     security:
 *       - mTLS: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of buildings to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of buildings to skip
 *     responses:
 *       200:
 *         description: Buildings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/PaginatedResponse'
 *                         - type: object
 *                           properties:
 *                             buildings:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Building'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
/**
 * Get all buildings
 */
async function getAllBuildings(req, res) {
  try {
    // Validate pagination parameters
    const paginationData = await validatePagination(req.query);
    const { limit, offset } = paginationData;

    const result = await canisterGetAllBuildings();

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    // Apply pagination to results
    const totalBuildings = result.Ok.length;
    const paginatedBuildings = result.Ok.slice(offset, offset + limit);

    const responseData = {
      buildings: paginatedBuildings,
      total: totalBuildings,
      limit,
      offset,
    };

    return res.json(
      formatSuccess(responseData, `Found ${totalBuildings} total building(s)`)
    );
  } catch (error) {
    console.error('Get all buildings error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to fetch buildings', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/buildings/{uuid}/mint:
 *   post:
 *     tags: [Tokens]
 *     summary: Mint tokens for a building
 *     description: Mint new ICRC-2 tokens for a specific building
 *     security:
 *       - mTLS: []
 *       - ICPPrincipal: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Building UUID
 *     requestBody:
 *       $ref: '#/components/requestBodies/TokenMint'
 *     responses:
 *       201:
 *         description: Tokens minted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         transactionIndex:
 *                           type: string
 *                         amount:
 *                           type: string
 *                         to:
 *                           type: string
 *                         buildingUuid:
 *                           type: string
 *                         ledgerCanisterId:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
/**
 * Mint tokens for a building
 */
async function mintTokens(req, res) {
  try {
    // Validate UUID parameter
    const uuid = await validateUuid(req.params.uuid);

    // Validate mint data
    const validatedData = await validateTokenMint(req.body);
    const { amount, to } = validatedData;

    // First, get the building to find the ledger canister
    const buildingResult = await canisterGetBuilding(uuid);
    if (buildingResult.Err) {
      const errorMessage = Object.values(buildingResult.Err)[0];
      return res.status(404).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    const building = buildingResult.Ok;

    // Call the ledger canister to mint tokens
    const mintResult = await canisterMintTokens(
      building.ledgerCanisterId.toString(),
      to,
      amount
    );

    if (mintResult.Err) {
      const errorMessage = Object.values(mintResult.Err)[0] || mintResult.Err;
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    const result = {
      transactionIndex: mintResult.Ok,
      amount,
      to,
      buildingUuid: uuid,
      ledgerCanisterId: building.ledgerCanisterId.toString(),
    };

    return res
      .status(201)
      .json(formatSuccess(result, 'Tokens minted successfully'));
  } catch (error) {
    console.error('Mint tokens error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to mint tokens', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/buildings/{uuid}/transfer:
 *   post:
 *     tags: [Tokens]
 *     summary: Transfer tokens for a building
 *     description: Transfer ICRC-2 tokens from authenticated user to another account
 *     security:
 *       - mTLS: []
 *       - ICPPrincipal: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Building UUID
 *     requestBody:
 *       $ref: '#/components/requestBodies/TokenTransfer'
 *     responses:
 *       201:
 *         description: Tokens transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         transactionIndex:
 *                           type: string
 *                         from:
 *                           type: string
 *                         to:
 *                           type: string
 *                         amount:
 *                           type: string
 *                         memo:
 *                           type: string
 *                         buildingUuid:
 *                           type: string
 *                         ledgerCanisterId:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
/**
 * Transfer tokens for a building
 */
async function transferTokens(req, res) {
  try {
    // Validate UUID parameter
    const uuid = await validateUuid(req.params.uuid);

    // Validate transfer data
    const validatedData = await validateTokenTransfer(req.body);
    const { to, amount, memo } = validatedData;

    // First, get the building to find the ledger canister
    const buildingResult = await canisterGetBuilding(uuid);
    if (buildingResult.Err) {
      const errorMessage = Object.values(buildingResult.Err)[0];
      return res.status(404).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    const building = buildingResult.Ok;

    // TODO: Extract ICP principal from request headers (e.g., req.headers['x-icp-principal'])
    // TODO: Validate that the principal has sufficient balance before transfer
    const fromPrincipal = 'principal-from-header-placeholder';

    // Call the ledger canister to transfer tokens
    const transferResult = await canisterTransferTokens(
      building.ledgerCanisterId.toString(),
      to,
      amount,
      null, // fromSubaccount
      null, // toSubaccount
      memo
    );

    if (transferResult.Err) {
      const errorMessage =
        Object.values(transferResult.Err)[0] || transferResult.Err;
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    const result = {
      transactionIndex: transferResult.Ok,
      from: fromPrincipal,
      to,
      amount,
      memo: memo || '',
      buildingUuid: uuid,
      ledgerCanisterId: building.ledgerCanisterId.toString(),
    };

    return res
      .status(201)
      .json(formatSuccess(result, 'Tokens transferred successfully'));
  } catch (error) {
    console.error('Transfer tokens error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to transfer tokens', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/buildings/{uuid}/balance:
 *   get:
 *     tags: [Tokens]
 *     summary: Get token balance for a building
 *     description: Get ICRC-2 token balance for a specific account or authenticated user
 *     security:
 *       - mTLS: []
 *       - ICPPrincipal: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Building UUID
 *       - in: query
 *         name: account
 *         schema:
 *           type: string
 *         description: Account principal to check balance for (defaults to authenticated user)
 *         example: "rdmx6-jaaaa-aaaah-qcaiq-cai"
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TokenBalance'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
/**
 * Get token balance for a building
 */
async function getTokenBalance(req, res) {
  try {
    // Validate UUID parameter
    const uuid = await validateUuid(req.params.uuid);

    // Validate query parameters
    const validatedQuery = await validateTokenBalanceQuery(req.query);
    const { account } = validatedQuery;

    // First, get the building to find the ledger canister
    const buildingResult = await canisterGetBuilding(uuid);
    if (buildingResult.Err) {
      const errorMessage = Object.values(buildingResult.Err)[0];
      return res.status(404).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    const building = buildingResult.Ok;

    // Determine the account to check balance for
    let targetAccount;
    if (account) {
      targetAccount = account;
    } else {
      // TODO: Extract ICP principal from request headers (e.g., req.headers['x-icp-principal'])
      targetAccount = 'principal-from-header-placeholder';
    }

    // Call the ledger canister to get balance
    const balanceResult = await canisterGetBalance(
      building.ledgerCanisterId.toString(),
      targetAccount
    );

    if (balanceResult.Err) {
      const errorMessage =
        Object.values(balanceResult.Err)[0] || balanceResult.Err;
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    const result = {
      balance: balanceResult.Ok,
      account: targetAccount,
      tokenSymbol: building.tokenSymbol,
      decimals: 8, // ICRC2 standard
      buildingUuid: uuid,
      ledgerCanisterId: building.ledgerCanisterId.toString(),
    };

    return res.json(formatSuccess(result, 'Balance retrieved successfully'));
  } catch (error) {
    console.error('Get token balance error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to get token balance', 'INTERNAL_ERROR'));
  }
}

module.exports = {
  registerBuilding,
  getBuilding,
  getUserBuildings,
  getAllBuildings,
  mintTokens,
  transferTokens,
  getTokenBalance,
};
