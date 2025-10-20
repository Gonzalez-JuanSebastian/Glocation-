const aiService = require('../utils/aiService.js');
const { FallbackStrategy } = require('../utils/fallbackStrategies.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const analysisController = {
  /**
   * Obtiene análisis de IA para todos los proyectos
   */
  getAnalysis: async (req, res) => {
    try {
      console.log('📊 Solicitando análisis de IA...');
      
      // Obtener proyectos de la base de datos
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' }
      });

      if (!projects || projects.length === 0) {
        return res.json(FallbackStrategy.generateBasicAnalysis([]));
      }

      // Generar análisis con IA
      const analysis = await aiService.generateProjectSummary(projects);
      
      console.log('✅ Análisis de IA generado exitosamente');
      res.json(analysis);

    } catch (error) {
      console.error('❌ Error en getAnalysis:', error);
      
      // Fallback a análisis básico
      try {
        const projects = await prisma.project.findMany();
        const fallbackAnalysis = FallbackStrategy.generateBasicAnalysis(projects);
        
        res.status(200).json({
          ...fallbackAnalysis,
          error: `Servicio de IA temporalmente no disponible: ${error.message}`
        });
      } catch (fallbackError) {
        res.status(500).json({
          error: 'Error crítico en el servicio de análisis',
          details: fallbackError.message
        });
      }
    }
  },

  /**
   * Regenera análisis forzando nueva llamada a IA
   */
  regenerateAnalysis: async (req, res) => {
    try {
      console.log('🔄 Regenerando análisis de IA...');
      
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' }
      });

      // Forzar nuevo análisis sin considerar cache
      const analysis = await aiService.generateProjectSummary(projects);
      
      console.log('✅ Análisis regenerado exitosamente');
      res.json(analysis);

    } catch (error) {
      console.error('❌ Error en regenerateAnalysis:', error);
      
      const projects = await prisma.project.findMany();
      const fallbackAnalysis = FallbackStrategy.generateBasicAnalysis(projects);
      
      res.status(200).json({
        ...fallbackAnalysis,
        error: `No se pudo regenerar análisis: ${error.message}`
      });
    }
  },

  /**
   * Limpia cache de análisis
   */
  clearAnalysisCache: async (req, res) => {
    try {
      // En una implementación real, aquí limpiaríamos cache de Redis o similar
      console.log('🗑️ Cache de análisis limpiado');
      
      res.json({ 
        message: 'Cache de análisis limpiado exitosamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error clearing analysis cache:', error);
      res.status(500).json({ error: 'Error clearing cache' });
    }
  },

  /**
   * Health check del servicio de IA
   */
  healthCheck: async (req, res) => {
    try {
      // Test simple de la API de DeepSeek
      const testPrompt = 'Responde con "OK" si estás funcionando.';
      
      const response = await aiService.executeWithRetry(testPrompt, 1);
      
      res.json({
        status: 'healthy',
        service: 'DeepSeek AI',
        response: response.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        service: 'DeepSeek AI',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = { analysisController };