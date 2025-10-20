import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Crear instancia de axios con configuración mejorada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 segundos para llamadas de IA
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente MEJORADO
api.interceptors.response.use(
  (response) => {
    // Asegurar que la respuesta tenga data
    return response && response.data ? response : { data: [] };
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response,
      request: error.request
    });

    if (error.response) {
      // Error del servidor (4xx, 5xx)
      const status = error.response.status;
      const message = error.response.data?.message || `Error ${status}`;
      
      if (status === 404) {
        throw new Error('Recurso no encontrado');
      } else if (status === 500) {
        throw new Error('Error interno del servidor');
      } else {
        throw new Error(message);
      }
    } else if (error.request) {
      // Error de red (sin respuesta)
      throw new Error('Error de conexión. Verifique que el servidor esté ejecutándose.');
    } else {
      // Error en la configuración
      throw new Error('Error en la configuración de la solicitud');
    }
  }
);

// Servicios específicos MEJORADOS
export const projectService = {
  // Obtener todos los proyectos con manejo de errores mejorado
  getProjects: async () => {
    try {
      const response = await api.get('/api/projects');
      // Asegurar que siempre devolvemos un array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error in getProjects:', error);
      // En caso de error, devolver array vacío
      return [];
    }
  },

  // Crear nuevo proyecto
  createProject: async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      return response;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  },

  // Actualizar proyecto
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      return response;
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  },

  // Eliminar proyecto
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/api/projects/${id}`);
      return response;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  },
};

// SERVICIO DE ANÁLISIS DE IA MEJORADO
export const analysisService = {
  // Obtener análisis de IA con manejo mejorado (compatibilidad)
  getAnalysis: async () => {
    try {
      const response = await api.get('/api/analisis');
      return response;
    } catch (error) {
      console.error('Error in getAnalysis:', error);
      // En caso de error, devolver resumen básico
      return {
        resumen: "No se pudo generar el análisis. Verifique la conexión con el servidor.",
        timestamp: new Date().toISOString()
      };
    }
  },

  // Nuevos endpoints de IA mejorados
  getAIAnalysis: async () => {
    try {
      const response = await api.get('/api/analisis');
      return response.data;
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      throw error;
    }
  },

  regenerateAIAnalysis: async () => {
    try {
      const response = await api.post('/api/analisis/regenerate');
      return response.data;
    } catch (error) {
      console.error('Error regenerating AI analysis:', error);
      throw error;
    }
  },

  clearAICache: async () => {
    try {
      await api.delete('/api/analisis/cache');
    } catch (error) {
      console.error('Error clearing AI cache:', error);
    }
  },

  // Health check del servicio IA
  checkIAHealth: async () => {
    try {
      const response = await api.get('/api/analisis/health');
      return response.data;
    } catch (error) {
      console.error('Error checking IA health:', error);
      throw error;
    }
  }
};

export const chartsService = {
  // Obtener datos para gráficos con manejo mejorado
  getChartsData: async () => {
    try {
      const response = await api.get('/api/graficos');
      
      // ✅ Validación exhaustiva de la respuesta
      if (response && 
          Array.isArray(response.estados) && 
          Array.isArray(response.timeline)) {
        return response;
      } else {
        console.warn('Estructura de datos inválida, usando valores por defecto');
        return {
          estados: [],
          timeline: []
        };
      }
    } catch (error) {
      console.error('Error in getChartsData:', error);
      // ✅ Estructura por defecto consistente
      return {
        estados: [
          { estado: 'PENDIENTE', cantidad: 0 },
          { estado: 'EN_PROGRESO', cantidad: 0 },
          { estado: 'FINALIZADO', cantidad: 0 },
          { estado: 'CANCELADO', cantidad: 0 }
        ],
        timeline: []
      };
    }
  },
};

// Servicio de salud del sistema MEJORADO
export const healthService = {
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('El servidor no está respondiendo');
    }
  },
};

// ALIAS PARA COMPATIBILIDAD CON NUEVO CÓDIGO
export const getAIAnalysis = analysisService.getAIAnalysis;
export const regenerateAIAnalysis = analysisService.regenerateAIAnalysis;
export const clearAICache = analysisService.clearAICache;

export default api;