export const PROMPT_TEMPLATES = {
  EXECUTIVE_SUMMARY: {
    name: 'Resumen Ejecutivo',
    system: `Eres un consultor senior de gestión de proyectos con 15 años de experiencia.
Tu especialidad es transformar datos de proyectos en insights accionables para la alta dirección.
    
CRITERIOS DE CALIDAD:
- Insights basados en datos concretos
- Recomendaciones prácticas y realizables
- Lenguaje ejecutivo pero accesible
- Máximo 500 palabras
- Formato markdown estructurado`,

    user: (projects) => `Analiza este portafolio de ${projects.length} proyectos:

DATOS CRUDOS:
${projects.map((p, i) => `
PROYECTO ${i + 1}:
• Nombre: ${p.nombre}
• Estado: ${p.estado}
• Descripción: ${p.descripcion.substring(0, 200)}${p.descripcion.length > 200 ? '...' : ''}
• Timeline: ${p.fechaInicio} → ${p.fechaFin || 'Sin fecha fin'}
• Duración: ${p.fechaFin ? Math.ceil((new Date(p.fechaFin) - new Date(p.fechaInicio)) / (1000 * 60 * 60 * 24)) + ' días' : 'Indefinida'}
`).join('')}

GENERA UN INFORME EJECUTIVO CON:
1. **PANORAMA GENERAL** - Estado del portafolio completo
2. **MÉTRICAS CLAVE** - Distribución de estados, cumplimiento de plazos
3. **SEÑALES DE ALERTA** - Proyectos en riesgo o atrasados
4. **OPORTUNIDADES** - Áreas de mejora identificadas
5. **RECOMENDACIONES PRIORIZADAS** - 3-5 acciones concretas

Formato de respuesta: Markdown con secciones claras.`
  },

  RISK_ANALYSIS: {
    name: 'Análisis de Riesgos',
    system: `Eres un analista de riesgos especializado en gestión de proyectos.
Identificas proactivamente riesgos potenciales y proporcionas planes de mitigación.`,

    user: (projects) => `Analiza riesgos potenciales en estos proyectos:

${projects.map(p => `
- ${p.nombre} (${p.estado}): ${p.descripcion}
  Timeline: ${p.fechaInicio} a ${p.fechaFin || '???'}
`).join('')}

Identifica:
• Riesgos de plazo
• Riesgos de recursos
• Riesgos de calidad
• Planes de mitigación`
  }
};

export class PromptOptimizer {
  /**
   * Optimiza el prompt según el contexto length
   */
  static optimizeForContext(projects, maxTokens = 4000) {
    // Si hay muchos proyectos, seleccionar los más relevantes
    if (projects.length > 10) {
      const prioritizedProjects = this.prioritizeProjects(projects);
      return prioritizedProjects.slice(0, 8); // Máximo 8 proyectos para análisis
    }
    
    return projects;
  }

  /**
   * Prioriza proyectos para el análisis
   */
  static prioritizeProjects(projects) {
    return projects
      .sort((a, b) => {
        // Priorizar proyectos en progreso sobre finalizados
        const statePriority = { 'EN_PROGRESO': 3, 'PENDIENTE': 2, 'FINALIZADO': 1, 'CANCELADO': 0 };
        
        // Proyectos sin fecha fin tienen mayor prioridad (riesgo)
        const datePriority = a.fechaFin ? 0 : 1;
        
        return (statePriority[b.estado] - statePriority[a.estado]) + datePriority;
      });
  }

  /**
   * Maneja context length excedido
   */
  static handleContextLength(projects, promptTemplate) {
    const estimatedTokens = this.estimateTokens(JSON.stringify(projects) + promptTemplate);
    
    if (estimatedTokens > 12000) { // Margen de seguridad
      console.warn('Context length excedido, optimizando...');
      return this.optimizeForContext(projects);
    }
    
    return projects;
  }

  static estimateTokens(text) {
    // Estimación simple: ~4 tokens por palabra en español
    return text.split(/\s+/).length * 4;
  }
}
