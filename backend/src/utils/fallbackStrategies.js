class FallbackStrategy {
  /**
   * Genera análisis básico cuando IA no responde
   */
  static generateBasicAnalysis(projects) {
    if (!projects || projects.length === 0) {
      return this.getEmptyProjectsAnalysis();
    }

    const stateDistribution = this.calculateStateDistribution(projects);
    const timelineAnalysis = this.analyzeTimelines(projects);
    const riskProjects = this.identifyRiskProjects(projects);

    return {
      raw: this.formatBasicAnalysis(stateDistribution, timelineAnalysis, riskProjects),
      structured: {
        stateDistribution,
        timelineAnalysis,
        riskProjects,
        recommendations: this.generateBasicRecommendations(stateDistribution, riskProjects)
      },
      isFallback: true,
      timestamp: new Date().toISOString()
    };
  }

  static calculateStateDistribution(projects) {
    const distribution = {};
    projects.forEach(project => {
      distribution[project.estado] = (distribution[project.estado] || 0) + 1;
    });
    return distribution;
  }

  static analyzeTimelines(projects) {
    const now = new Date();
    const upcomingDeadlines = projects.filter(p => 
      p.fechaFin && new Date(p.fechaFin) > now
    ).length;

    const overdueProjects = projects.filter(p =>
      p.fechaFin && new Date(p.fechaFin) < now && p.estado !== 'FINALIZADO'
    ).length;

    return { upcomingDeadlines, overdueProjects };
  }

  static identifyRiskProjects(projects) {
    const now = new Date();
    return projects.filter(project => {
      // Proyectos sin fecha fin
      if (!project.fechaFin) return true;
      
      // Proyectos atrasados
      if (new Date(project.fechaFin) < now && project.estado !== 'FINALIZADO') return true;
      
      // Proyectos en progreso por mucho tiempo
      const startDate = new Date(project.fechaInicio);
      const daysInProgress = (now - startDate) / (1000 * 60 * 60 * 24);
      if (project.estado === 'EN_PROGRESO' && daysInProgress > 90) return true;
      
      return false;
    }).map(p => p.nombre);
  }

  static formatBasicAnalysis(distribution, timelines, risks) {
    return `## Análisis Básico de Proyectos

### Distribución de Estados
${Object.entries(distribution).map(([state, count]) => `- **${state}**: ${count} proyectos`).join('\n')}

### Situación de Plazos
- **Próximos vencimientos**: ${timelines.upcomingDeadlines} proyectos
- **Proyectos atrasados**: ${timelines.overdueProjects} proyectos

### Proyectos en Riesgo
${risks.length > 0 ? risks.map(risk => `- ${risk}`).join('\n') : '- No se identificaron riesgos críticos'}

### Recomendaciones
${this.generateBasicRecommendations(distribution, risks).join('\n')}

*Nota: Este es un análisis automático básico. Para insights más profundos, utilice el servicio de IA cuando esté disponible.*`;
  }

  static generateBasicRecommendations(distribution, risks) {
    const recommendations = [];
    
    if (distribution['PENDIENTE'] > distribution['EN_PROGRESO']) {
      recommendations.push('• Considere iniciar más proyectos pendientes para equilibrar la carga');
    }
    
    if (risks.length > 0) {
      recommendations.push(`• Revise los ${risks.length} proyectos identificados con posibles riesgos`);
    }
    
    if (!distribution['FINALIZADO'] || distribution['FINALIZADO'] < 2) {
      recommendations.push('• Enfoque en finalizar proyectos para demostrar progreso');
    }
    
    return recommendations.length > 0 ? recommendations : ['• El portafolio parece estar en buen estado general'];
  }

  static getEmptyProjectsAnalysis() {
    return {
      raw: `## Bienvenido al Sistema de Análisis de Proyectos

Actualmente no hay proyectos para analizar.

**Para comenzar:**
1. Agregue nuevos proyectos usando el formulario
2. Defina estados y fechas realistas
3. Vuelva a esta sección para obtener análisis inteligente

**Beneficios del análisis con IA:**
- Identificación de riesgos proactiva
- Recomendaciones personalizadas
- Insights de tendencias
- Optimización de recursos`,
      structured: null,
      isFallback: true,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { FallbackStrategy };