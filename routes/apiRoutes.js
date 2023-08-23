// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

router.get('/units/:id', unitController.getUnitById);

module.exports = router;