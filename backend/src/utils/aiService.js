const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 segundos timeout
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Configuración de rate limiting
    this.rateLimit = {
      requests: 0,
      lastReset: Date.now(),
      maxRequests: 50, // Límite por minuto
      windowMs: 60000
    };
  }

  /**
   * Verifica y maneja los límites de tasa
   */
  checkRateLimit() {
    const now = Date.now();
    const timePassed = now - this.rateLimit.lastReset;
    
    if (timePassed > this.rateLimit.windowMs) {
      // Reiniciar contador si ha pasado el período
      this.rateLimit.requests = 0;
      this.rateLimit.lastReset = now;
    }
    
    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      throw new Error('Límite de tasa excedido. Por favor, espere un momento.');
    }
    
    this.rateLimit.requests++;
  }

  /**
   * Función principal para generar resumen de proyectos
   * @param {Array} projects - Array de proyectos para analizar
   * @returns {Promise<Object>} - Análisis generado por IA
   */
  async generateProjectSummary(projects) {
    try {
      this.checkRateLimit();
      
      if (!projects || projects.length === 0) {
        return this.getFallbackResponse();
      }

      const prompt = this.buildOptimizedPrompt(projects);
      
      // Intentar con retry logic
      const analysis = await this.executeWithRetry(prompt);
      
      return this.parseAIResponse(analysis);

    } catch (error) {
      console.error('Error en generateProjectSummary:', error);
      return this.handleAIError(error);
    }
  }

  /**
   * Construye prompt optimizado para análisis de proyectos
   */
  buildOptimizedPrompt(projects) {
    const projectsSummary = projects.map((project, index) => 
      `Proyecto ${index + 1}:
       - Nombre: ${project.nombre}
       - Estado: ${project.estado}
       - Descripción: ${project.descripcion}
       - Fecha Inicio: ${project.fechaInicio}
       - Fecha Fin: ${project.fechaFin || 'No definida'}`
    ).join('\n\n');

    return `Eres un experto en gestión de proyectos y análisis empresarial. 
Analiza la siguiente lista de proyectos y genera un resumen ejecutivo que incluya:

**INSTRUCCIONES ESPECÍFICAS:**
1. **VISIÓN GENERAL**: Resumen conciso del portafolio completo
2. **ANÁLISIS DE ESTADOS**: Distribución y significado de los estados actuales
3. **TENDENCIAS TEMPORALES**: Patrones en fechas y plazos
4. **RIESGOS IDENTIFICADOS**: Posibles problemas o áreas de atención
5. **RECOMENDACIONES ACCIONABLES**: 3-5 sugerencias específicas para mejorar

**FORMATO DE RESPUESTA REQUERIDO:**
- Usar markdown para mejor legibilidad
- Máximo 500 palabras
- Lenguaje profesional pero accesible
- Enfocado en insights accionables

**DATOS DE PROYECTOS:**
${projectsSummary}

Por favor, genera un análisis que sea útil para la toma de decisiones ejecutivas:`;
  }

  /**
   * Ejecuta la llamada a la API con retry logic
   */
  async executeWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.post('/chat/completions', {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente experto en análisis de proyectos empresariales. Proporcionas insights valiosos y recomendaciones prácticas basadas en datos.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 0.9
        });

        return response.data.choices[0].message.content;

      } catch (error) {
        console.warn(`Intento ${attempt} fallido:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Esperar tiempo exponencial antes de reintentar
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Parsea y estructura la respuesta de la IA
   */
  parseAIResponse(aiResponse) {
    try {
      // Extraer secciones clave del markdown
      const sections = {
        visionGeneral: this.extractSection(aiResponse, 'VISIÓN GENERAL', 'ANÁLISIS DE ESTADOS'),
        analisisEstados: this.extractSection(aiResponse, 'ANÁLISIS DE ESTADOS', 'TENDENCIAS TEMPORALES'),
        tendencias: this.extractSection(aiResponse, 'TENDENCIAS TEMPORALES', 'RIESGOS IDENTIFICADOS'),
        riesgos: this.extractSection(aiResponse, 'RIESGOS IDENTIFICADOS', 'RECOMENDACIONES'),
        recomendaciones: this.extractSection(aiResponse, 'RECOMENDACIONES', null)
      };

      return {
        raw: aiResponse,
        structured: sections,
        timestamp: new Date().toISOString(),
        wordCount: aiResponse.split(/\s+/).length
      };

    } catch (error) {
      console.error('Error parseando respuesta IA:', error);
      return {
        raw: aiResponse,
        structured: null,
        timestamp: new Date().toISOString(),
        error: 'Error en parsing'
      };
    }
  }

  /**
   * Extrae secciones específicas del texto
   */
  extractSection(text, startMarker, endMarker) {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return null;

    let endIndex = endMarker ? text.indexOf(endMarker) : text.length;
    if (endIndex === -1) endIndex = text.length;

    return text.substring(startIndex + startMarker.length, endIndex).trim();
  }

  /**
   * Maneja errores de la API de IA
   */
  handleAIError(error) {
    const errorMap = {
      'ENOTFOUND': 'Error de conexión con el servicio de IA',
      'ETIMEDOUT': 'Timeout en la conexión con IA',
      'ECONNREFUSED': 'Servicio de IA no disponible',
      '429': 'Límite de tasa excedido. Intente en 1 minuto',
      '401': 'Error de autenticación con el servicio de IA',
      '500': 'Error interno del servicio de IA'
    };

    const errorCode = error.code || error.response?.status;
    const userMessage = errorMap[errorCode] || 'Error temporal del servicio de IA';

    return {
      raw: `## Análisis No Disponible\n\n${userMessage}\n\n**Sugerencia:** Por favor, intente nuevamente en unos minutos.`,
      structured: null,
      timestamp: new Date().toISOString(),
      error: userMessage,
      isFallback: true
    };
  }

  /**
   * Respuesta de fallback cuando la IA no está disponible
   */
  getFallbackResponse() {
    const fallbackText = `## Análisis de Proyectos - Vista General

**VISIÓN GENERAL**
No hay proyectos disponibles para analizar en este momento. 

**RECOMENDACIONES**
1. Comience agregando proyectos al sistema
2. Defina estados claros (Pendiente, En Progreso, Finalizado)
3. Establezca fechas realistas para cada proyecto

**PRÓXIMOS PASOS**
Una vez que agregue proyectos, podré proporcionar un análisis más detallado y recomendaciones específicas.`;

    return {
      raw: fallbackText,
      structured: null,
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }
}

// Exportar instancia singleton
module.exports = new AIService();