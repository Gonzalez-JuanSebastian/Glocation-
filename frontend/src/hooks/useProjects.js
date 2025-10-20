import { useState, useEffect, useCallback } from 'react';
import { projectService, analysisService, chartsService } from '../services/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [chartsData, setChartsData] = useState(null);

  // Cargar proyectos
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear proyecto
  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    setError(null);
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar análisis de IA
  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analysisData = await analysisService.getAnalysis();
      setAnalysis(analysisData);
      return analysisData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos para gráficos
  const loadChartsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const charts = await chartsService.getChartsData();
      setChartsData(charts);
      return charts;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar todos los datos al inicializar
  useEffect(() => {
    loadProjects();
    loadChartsData();
  }, [loadProjects, loadChartsData]);

  return {
    // Estado
    projects,
    loading,
    error,
    analysis,
    chartsData,
    
    // Acciones
    loadProjects,
    createProject,
    loadAnalysis,
    loadChartsData,
    
    // Utilidades
    hasProjects: projects.length > 0,
    projectsCount: projects.length,
  };
};