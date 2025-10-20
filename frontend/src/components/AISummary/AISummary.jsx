import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getAIAnalysis, regenerateAIAnalysis } from '../../services/api';
import './AISummary.css';

const AISummary = () => {
  const { 
    analysis, 
    loading, 
    error, 
    loadAnalysis, 
    setCurrentView,
    projects,
    setAnalysis 
  } = useApp();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [localAnalysis, setLocalAnalysis] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);

  // Cache key basado en el estado actual de proyectos
  const getCacheKey = () => {
    const projectsHash = projects
      .map(p => `${p.id}-${p.estado}-${p.updatedAt}`)
      .join('|');
    return `ai-analysis-${btoa(projectsHash)}`;
  };

  // Cargar análisis al montar el componente o cuando cambien los proyectos
  useEffect(() => {
    const loadInitialAnalysis = async () => {
      // Verificar cache primero
      const cacheKey = getCacheKey();
      const cachedAnalysis = localStorage.getItem(cacheKey);
      
      if (cachedAnalysis) {
        try {
          const parsed = JSON.parse(cachedAnalysis);
          if (Date.now() - new Date(parsed.cacheTimestamp).getTime() < 5 * 60 * 1000) { // 5 minutos
            setLocalAnalysis(parsed.data);
            setCacheTimestamp(parsed.data.timestamp);
            return;
          }
        } catch (e) {
          console.warn('Error loading cached analysis:', e);
        }
      }

      // Si no hay cache válido, cargar nuevo análisis
      await fetchAnalysis();
    };

    if (projects.length > 0) {
      loadInitialAnalysis();
    }
  }, [projects.length]);

  const fetchAnalysis = async () => {
    setIsGenerating(true);
    
    try {
      const analysisData = await getAIAnalysis();
      
      // Validar respuesta
      if (analysisData && analysisData.raw) {
        setLocalAnalysis(analysisData);
        setCacheTimestamp(analysisData.timestamp);
        
        // Guardar en cache
        const cacheKey = getCacheKey();
        localStorage.setItem(cacheKey, JSON.stringify({
          data: analysisData,
          cacheTimestamp: new Date().toISOString()
        }));
      } else {
        throw new Error('Respuesta de análisis inválida');
      }
      
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      
      // Usar fallback si está disponible
      if (err.response?.data?.fallbackAnalysis) {
        setLocalAnalysis(err.response.data.fallbackAnalysis);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Forzar regeneración sin cache
      const analysisData = await regenerateAIAnalysis();
      
      if (analysisData && analysisData.raw) {
        setLocalAnalysis(analysisData);
        setCacheTimestamp(analysisData.timestamp);
        
        // Actualizar cache
        const cacheKey = getCacheKey();
        localStorage.setItem(cacheKey, JSON.stringify({
          data: analysisData,
          cacheTimestamp: new Date().toISOString(),
          forcedRefresh: true
        }));
      }
      
    } catch (err) {
      console.error('Error regenerating analysis:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatAnalysisText = (text) => {
    if (!text) return '';
    
    // Dividir en párrafos basados en puntos y saltos de línea
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      // Detectar si es un título (termina con :)
      if (paragraph.trim().endsWith(':')) {
        return (
          <h4 key={index} className="analysis-subtitle">
            {paragraph}
          </h4>
        );
      }
      
      // Detectar listas
      if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
        return (
          <li key={index} className="analysis-list-item">
            {paragraph.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      
      // Párrafos normales
      return (
        <p key={index} className="analysis-paragraph">
          {paragraph}
        </p>
      );
    });
  };

  const getAnalysisStatus = () => {
    if (!localAnalysis && !analysis) return 'empty';
    if (isGenerating) return 'loading';
    if (error) return 'error';
    return 'success';
  };

  const status = getAnalysisStatus();
  const displayAnalysis = localAnalysis || analysis;

  return (
    <div className="ai-summary-container">
      <div className="ai-header">
        <div className="ai-title">
          <h2>🤖 Análisis Inteligente de Proyectos</h2>
          <p>Resumen ejecutivo generado por DeepSeek AI</p>
        </div>
        <div className="ai-actions">
          <button 
            onClick={() => setCurrentView('table')}
            className="btn-secondary"
          >
            ← Volver a Proyectos
          </button>
        </div>
      </div>

      {/* Panel de información mejorado */}
      <div className="info-panel">
        <div className="info-item">
          <span className="info-label">Proyectos analizados:</span>
          <span className="info-value">{projects.length} proyectos</span>
        </div>
        <div className="info-item">
          <span className="info-label">Última actualización:</span>
          <span className="info-value">
            {cacheTimestamp 
              ? new Date(cacheTimestamp).toLocaleTimeString()
              : 'No generado'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Motor de IA:</span>
          <span className="info-value">DeepSeek API</span>
        </div>
      </div>

      {/* Botones de acción mejorados */}
      <div className="generation-section">
        <button
          onClick={fetchAnalysis}
          disabled={isGenerating || projects.length === 0}
          className={`generate-btn ${isGenerating ? 'generating' : ''}`}
        >
          {isGenerating ? (
            <>
              <div className="spinner"></div>
              Generando análisis...
            </>
          ) : (
            '🚀 Generar Análisis con IA'
          )}
        </button>

        {displayAnalysis && (
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="regenerate-btn"
          >
            🔄 Regenerar
          </button>
        )}
        
        {projects.length === 0 && (
          <p className="warning-text">
            ⚠️ Necesitas tener proyectos creados para generar un análisis.
          </p>
        )}
      </div>

      {/* Estados del análisis */}
      {status === 'empty' && (
        <div className="analysis-state empty-state">
          <div className="state-icon">📊</div>
          <h3>Análisis No Generado</h3>
          <p>
            Haz clic en "Generar Análisis con IA" para obtener insights 
            inteligentes sobre tus proyectos basados en los datos actuales.
          </p>
          <ul className="features-list">
            <li>✅ Resumen ejecutivo de proyectos</li>
            <li>✅ Identificación de patrones</li>
            <li>✅ Recomendaciones estratégicas</li>
            <li>✅ Análisis de tendencias</li>
          </ul>
        </div>
      )}

      {status === 'loading' && (
        <div className="analysis-state loading-state">
          <div className="spinner-large"></div>
          <h3>Generando Análisis con IA</h3>
          <p>DeepSeek AI está procesando tus proyectos...</p>
          <div className="loading-steps">
            <div className="step active">📥 Recopilando datos</div>
            <div className="step active">🤖 Procesando con IA</div>
            <div className="step">📊 Generando insights</div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="analysis-state error-state">
          <div className="state-icon">❌</div>
          <h3>Error al Generar Análisis</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchAnalysis} className="retry-btn">
              🔄 Reintentar
            </button>
            <button 
              onClick={() => setCurrentView('table')}
              className="btn-secondary"
            >
              Ver Proyectos
            </button>
          </div>
        </div>
      )}

      {/* Análisis generado - MEJORADO */}
      {status === 'success' && displayAnalysis && (
        <div className="analysis-content">
          <div className="analysis-header">
            <h3>📈 Análisis Generado</h3>
            <div className="analysis-meta">
              <span className="timestamp">
                {displayAnalysis.isFallback ? '🔧 Análisis Básico' : '🤖 IA Generativo'} • 
                Generado: {cacheTimestamp ? new Date(cacheTimestamp).toLocaleString() : 'Recientemente'}
              </span>
              {displayAnalysis.wordCount && (
                <span className="word-count">
                  {displayAnalysis.wordCount} palabras
                </span>
              )}
            </div>
          </div>

          {displayAnalysis.isFallback && (
            <div className="fallback-warning">
              ⚠️ Análisis básico - Servicio de IA temporalmente no disponible
            </div>
          )}

          <div className="analysis-body">
            {displayAnalysis.raw ? (
              <div className="analysis-text">
                {formatAnalysisText(displayAnalysis.raw)}
              </div>
            ) : displayAnalysis.analisis ? (
              <div className="analysis-text">
                {formatAnalysisText(displayAnalysis.analisis)}
              </div>
            ) : displayAnalysis.resumen ? (
              <div className="analysis-text">
                <div className="fallback-analysis">
                  <h4>Resumen Automático:</h4>
                  <p>{displayAnalysis.resumen}</p>
                  <div className="fallback-note">
                    <small>
                      💡 <strong>Nota:</strong> Este es un resumen automático. 
                      Para análisis con IA, configura tu API key de DeepSeek.
                    </small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-analysis">
                <p>No se pudo generar el análisis. Intenta nuevamente.</p>
              </div>
            )}
          </div>

          {/* Insights destacados - MEJORADO */}
          {displayAnalysis.structured && (
            <div className="analysis-highlights">
              <h4>💡 Insights Estructurados</h4>
              <div className="highlights-grid">
                {displayAnalysis.structured.recommendations && (
                  <div className="highlight-card featured">
                    <div className="highlight-icon">🎯</div>
                    <div className="highlight-content">
                      <strong>Recomendaciones Principales</strong>
                      <ul>
                        {displayAnalysis.structured.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                <div className="highlight-card">
                  <div className="highlight-icon">📅</div>
                  <div className="highlight-content">
                    <strong>Timeline Analysis</strong>
                    <p>Revisa las fechas de tus proyectos activos</p>
                  </div>
                </div>
                <div className="highlight-card">
                  <div className="highlight-icon">⚡</div>
                  <div className="highlight-content">
                    <strong>Eficiencia</strong>
                    <p>Optimiza recursos en proyectos en progreso</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información de la API - MEJORADO */}
      <div className="api-info">
        <details>
          <summary>🔧 Información Técnica del Servicio IA</summary>
          <div className="api-details">
            <p><strong>Endpoint:</strong> GET /api/analisis</p>
            <p><strong>Proveedor IA:</strong> DeepSeek API</p>
            <p><strong>Modelo:</strong> deepseek-chat</p>
            <p><strong>Cache:</strong> 5 minutos (basado en hash de proyectos)</p>
            <p><strong>Datos analizados:</strong> {projects.length} proyectos con estados y fechas</p>
            <div className="cache-actions">
              <button 
                onClick={() => {
                  // Limpiar cache
                  Object.keys(localStorage)
                    .filter(key => key.startsWith('ai-analysis-'))
                    .forEach(key => localStorage.removeItem(key));
                  setLocalAnalysis(null);
                }}
                className="btn-small"
              >
                🗑️ Limpiar Cache
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AISummary;