const {
  addLog: canisterRegisterLog,
  verifyLog: canisterVerifyLog,
  getLogsByUuid: getCanisterLogsByUuid,
  getLogsByAction: getCanisterLogsByAction,
} = require('../canister/log');
const {
  computeHash,
  validateLogData,
  validateUuid,
  validateAction,
  formatError,
  formatSuccess,
  extractCertificateFingerprint,
} = require('../utils');

/**
 * @swagger
 * /api/logs:
 *   post:
 *     tags: [Logs]
 *     summary: Create a new log entry
 *     description: Create an immutable audit log entry with cryptographic integrity
 *     security:
 *       - mTLS: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/LogCreation'
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
async function register(req, res) {
  try {
    const userFingerprint = extractCertificateFingerprint(req);

    const validatedData = await validateLogData(req.body);
    const { uuid, action, data } = validatedData;

    // Compute hash: uuid + action + userFingerprint
    const hash = computeHash(uuid, action, userFingerprint);

    const result = await canisterRegisterLog(
      uuid,
      action,
      userFingerprint,
      hash,
      data
    );

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    res
      .status(201)
      .json(formatSuccess(result.Ok, 'Log entry registered successfully'));
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to register log entry', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/logs/verify:
 *   post:
 *     tags: [Logs]
 *     summary: Verify a log entry
 *     description: Verify the integrity and authenticity of a log entry using cryptographic hash
 *     security:
 *       - mTLS: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [uuid, action]
 *             properties:
 *               uuid:
 *                 type: string
 *                 format: uuid
 *               action:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *           example:
 *             uuid: "123e4567-e89b-12d3-a456-426614174000"
 *             action: "building_tokenized"
 *     responses:
 *       200:
 *         description: Log verification result
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
 *                         verified:
 *                           type: boolean
 *                         expectedHash:
 *                           type: string
 *                         actualHash:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
async function verify(req, res) {
  try {
    const userFingerprint = extractCertificateFingerprint(req);

    const validatedData = await validateLogData(req.body);
    const { uuid, action } = validatedData;

    // Compute hash to search for the log entry
    const hash = computeHash(uuid, action, userFingerprint);

    const result = await canisterVerifyLog(hash, uuid, action, userFingerprint);

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    const { valid, hash: returnedHash } = result.Ok;

    return res.json(
      formatSuccess(
        {
          verified: valid,
          hash: returnedHash,
          uuid,
          action,
          userFingerprint,
        },
        valid
          ? 'Log entry verified successfully'
          : 'Log entry verification failed'
      )
    );
  } catch (error) {
    console.error('Verify error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to verify log entry', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/logs/uuid/{uuid}:
 *   get:
 *     tags: [Logs]
 *     summary: Get logs by UUID
 *     description: Retrieve all log entries associated with a specific UUID
 *     security:
 *       - mTLS: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID to filter logs by
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
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
 *                         $ref: '#/components/schemas/LogEntry'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
async function getLogsByUuid(req, res) {
  try {
    const uuid = await validateUuid(req.params.uuid);

    const result = await getCanisterLogsByUuid(uuid);

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    return res.json(
      formatSuccess(
        result.Ok,
        `Found ${result.Ok.length} log(s) for UUID: ${uuid}`
      )
    );
  } catch (error) {
    console.error('Get logs by UUID error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to retrieve logs by UUID', 'INTERNAL_ERROR'));
  }
}

/**
 * @swagger
 * /api/logs/action/{action}:
 *   get:
 *     tags: [Logs]
 *     summary: Get logs by action
 *     description: Retrieve all log entries for a specific action type
 *     security:
 *       - mTLS: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Action type to filter logs by
 *         example: "building_tokenized"
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
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
 *                         $ref: '#/components/schemas/LogEntry'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
async function getLogsByAction(req, res) {
  try {
    const action = await validateAction(req.params.action);

    const result = await getCanisterLogsByAction(action);

    if (result.Err) {
      const errorMessage = Object.values(result.Err)[0];
      return res.status(400).json(formatError(errorMessage, 'CANISTER_ERROR'));
    }

    return res.json(
      formatSuccess(
        result.Ok,
        `Found ${result.Ok.length} log(s) for action: ${action}`
      )
    );
  } catch (error) {
    console.error('Get logs by action error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res
        .status(400)
        .json(formatError(error.message, error.code, error.details));
    }

    return res
      .status(500)
      .json(formatError('Failed to retrieve logs by action', 'INTERNAL_ERROR'));
  }
}

module.exports = {
  register,
  verify,
  getLogsByUuid,
  getLogsByAction,
};
