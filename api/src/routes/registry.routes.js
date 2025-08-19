const express = require('express');
const registryController = require('../controllers/registry.controller');

const router = express.Router();

// Building registry routes
router.post('/', registryController.registerBuilding);
router.get('/', registryController.getAllBuildings);
router.get('/:uuid', registryController.getBuilding);
router.get('/user/:principal', registryController.getUserBuildings);

// Token operation routes
router.post('/:uuid/mint', registryController.mintTokens);
router.post('/:uuid/transfer', registryController.transferTokens);
router.get('/:uuid/balance', registryController.getTokenBalance);

module.exports = router;
