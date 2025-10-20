const express = require('express');
const { analysisController } = require('./../controllers/analysisController.js');

const router = express.Router();

/**
 * @swagger
 * /api/analisis:
 *   get:
 *     summary: Obtiene análisis de IA de todos los proyectos
 *     tags: [Análisis IA]
 *     responses:
 *       200:
 *         description: Análisis generado por IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 raw:
 *                   type: string
 *                 structured:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                 isFallback:
 *                   type: boolean
 *       500:
 *         description: Error en el servicio de análisis
 */
router.get('/', analysisController.getAnalysis);

/**
 * @swagger
 * /api/analisis/regenerate:
 *   post:
 *     summary: Regenera el análisis de IA forzando nueva generación
 *     tags: [Análisis IA]
 *     responses:
 *       200:
 *         description: Análisis regenerado exitosamente
 *       500:
 *         description: Error al regenerar análisis
 */
router.post('/regenerate', analysisController.regenerateAnalysis);

/**
 * @swagger
 * /api/analisis/cache:
 *   delete:
 *     summary: Limpia el cache de análisis
 *     tags: [Análisis IA]
 *     responses:
 *       200:
 *         description: Cache limpiado exitosamente
 */
router.delete('/cache', analysisController.clearAnalysisCache);

/**
 * @swagger
 * /api/analisis/health:
 *   get:
 *     summary: Health check del servicio de IA
 *     tags: [Análisis IA]
 *     responses:
 *       200:
 *         description: Servicio de IA funcionando
 *       503:
 *         description: Servicio de IA no disponible
 */
router.get('/health', analysisController.healthCheck);

module.exports = router;