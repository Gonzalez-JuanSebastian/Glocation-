const express = require('express');
const router = express.Router();
const { getChartsData } = require('../controllers/chartController');

// GET /api/graficos - Datos para gráficos
router.get('/', getChartsData);

module.exports = router;