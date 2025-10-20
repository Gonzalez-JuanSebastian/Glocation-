import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { projectService, analysisService, chartsService } from '../services/api';

// Estado inicial mejorado
const initialState = {
  projects: [], // Asegurar que siempre sea array
  loading: false,
  error: null,
  analysis: null, // Análisis legacy (compatibilidad)
  aiAnalysis: null, // Nuevo análisis de IA mejorado
  chartsData: {
    estados: [],
    timeline: []
  },
  currentView: 'table',
  selectedProject: null,
  formMode: 'create',
  notifications: [],
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning'
  },
  syncStatus: 'idle',
  lastSync: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    analysis: false
  }
};

// Action Types expandidos
const ACTION_TYPES = {
  // Estados básicos
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PROJECTS: 'SET_PROJECTS',
  SET_ANALYSIS: 'SET_ANALYSIS',
  SET_AI_ANALYSIS: 'SET_AI_ANALYSIS',
  CLEAR_AI_ANALYSIS: 'CLEAR_AI_ANALYSIS',
  SET_CHARTS_DATA: 'SET_CHARTS_DATA',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  SET_SELECTED_PROJECT: 'SET_SELECTED_PROJECT',
  SET_FORM_MODE: 'SET_FORM_MODE',
  
  // Operaciones CRUD
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  
  // Estados de operaciones específicas
  SET_OPERATION_LOADING: 'SET_OPERATION_LOADING',
  
  // Sincronización
  SET_SYNC_STATUS: 'SET_SYNC_STATUS',
  SET_LAST_SYNC: 'SET_LAST_SYNC',
  
  // Notificaciones y diálogos
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // Diálogo de confirmación
  OPEN_CONFIRM_DIALOG: 'OPEN_CONFIRM_DIALOG',
  CLOSE_CONFIRM_DIALOG: 'CLOSE_CONFIRM_DIALOG',
  
  // Reset estado
  RESET_STATE: 'RESET_STATE'
};

// Reducer mejorado
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        loading: false,
        syncStatus: 'error'
      };
    
    case ACTION_TYPES.SET_PROJECTS:
        return { 
          ...state, 
          projects: Array.isArray(action.payload) ? action.payload : [],
          loading: false,
          syncStatus: 'success',
          lastSync: new Date()
        };
    
    case ACTION_TYPES.SET_ANALYSIS:
      return { 
        ...state, 
        analysis: action.payload,
        operationLoading: { ...state.operationLoading, analysis: false }
      };

    case ACTION_TYPES.SET_AI_ANALYSIS:
      return { 
        ...state, 
        aiAnalysis: action.payload,
        operationLoading: { ...state.operationLoading, analysis: false }
      };

    case ACTION_TYPES.CLEAR_AI_ANALYSIS:
      return { ...state, aiAnalysis: null };
      
    case ACTION_TYPES.SET_CHARTS_DATA:
      const normalizedChartsData = {
        estados: Array.isArray(action.payload?.estados) ? action.payload.estados : [],
        timeline: Array.isArray(action.payload?.timeline) ? action.payload.timeline : []
      };
      return { ...state, chartsData: normalizedChartsData };
    
    case ACTION_TYPES.SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
    
    case ACTION_TYPES.SET_SELECTED_PROJECT:
      return { ...state, selectedProject: action.payload };
    
    case ACTION_TYPES.SET_FORM_MODE:
      return { ...state, formMode: action.payload };
    
    case ACTION_TYPES.ADD_PROJECT:
        return { 
          ...state, 
          projects: Array.isArray(state.projects) 
            ? [...state.projects, action.payload]
            : [action.payload],
          formMode: 'create',
          selectedProject: null,
          operationLoading: { ...state.operationLoading, create: false }
        };
    
    case ACTION_TYPES.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
        selectedProject: null,
        formMode: 'create',
        operationLoading: { ...state.operationLoading, update: false }
      };
    
    case ACTION_TYPES.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        selectedProject: null,
        operationLoading: { ...state.operationLoading, delete: false }
      };
    
    case ACTION_TYPES.SET_OPERATION_LOADING:
      return {
        ...state,
        operationLoading: {
          ...state.operationLoading,
          ...action.payload
        }
      };
    
    case ACTION_TYPES.SET_SYNC_STATUS:
      return { ...state, syncStatus: action.payload };
    
    case ACTION_TYPES.SET_LAST_SYNC:
      return { ...state, lastSync: action.payload };
    
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            ...action.payload
          }
        ]
      };
    
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    
    case ACTION_TYPES.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };
    
    case ACTION_TYPES.OPEN_CONFIRM_DIALOG:
      return {
        ...state,
        confirmDialog: {
          ...state.confirmDialog,
          isOpen: true,
          ...action.payload
        }
      };
    
    case ACTION_TYPES.CLOSE_CONFIRM_DIALOG:
      return {
        ...state,
        confirmDialog: {
          ...initialState.confirmDialog
        }
      };
    
    case ACTION_TYPES.RESET_STATE:
      return { ...initialState };
    
    default:
      return state;
  }
};

// Crear contexto
const AppContext = createContext();

// Provider component mejorado
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions creators
  const actions = {
    // Estados básicos
    setLoading: (loading) => 
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
    
    setError: (error) => 
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error }),
    
    setProjects: (projects) => 
      dispatch({ type: ACTION_TYPES.SET_PROJECTS, payload: projects }),
    
    setAnalysis: (analysis) => 
      dispatch({ type: ACTION_TYPES.SET_ANALYSIS, payload: analysis }),
    
    setAIAnalysis: (aiAnalysis) => 
      dispatch({ type: ACTION_TYPES.SET_AI_ANALYSIS, payload: aiAnalysis }),
    
    clearAIAnalysis: () => 
      dispatch({ type: ACTION_TYPES.CLEAR_AI_ANALYSIS }),
    
    setChartsData: (chartsData) => 
      dispatch({ type: ACTION_TYPES.SET_CHARTS_DATA, payload: chartsData }),
    
    setCurrentView: (view) => 
      dispatch({ type: ACTION_TYPES.SET_CURRENT_VIEW, payload: view }),
    
    setSelectedProject: (project) => 
      dispatch({ type: ACTION_TYPES.SET_SELECTED_PROJECT, payload: project }),
    
    setFormMode: (mode) => 
      dispatch({ type: ACTION_TYPES.SET_FORM_MODE, payload: mode }),
    
    // Operaciones CRUD
    addProject: (project) => 
      dispatch({ type: ACTION_TYPES.ADD_PROJECT, payload: project }),
    
    updateProject: (project) => 
      dispatch({ type: ACTION_TYPES.UPDATE_PROJECT, payload: project }),
    
    deleteProject: (projectId) => 
      dispatch({ type: ACTION_TYPES.DELETE_PROJECT, payload: projectId }),
    
    // Estados de operaciones
    setOperationLoading: (operationState) =>
      dispatch({ type: ACTION_TYPES.SET_OPERATION_LOADING, payload: operationState }),
    
    // Sincronización
    setSyncStatus: (status) =>
      dispatch({ type: ACTION_TYPES.SET_SYNC_STATUS, payload: status }),
    
    setLastSync: (timestamp) =>
      dispatch({ type: ACTION_TYPES.SET_LAST_SYNC, payload: timestamp }),
    
    // Notificaciones
    addNotification: (notification) =>
      dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification }),
    
    removeNotification: (notificationId) =>
      dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: notificationId }),
    
    clearNotifications: () =>
      dispatch({ type: ACTION_TYPES.CLEAR_NOTIFICATIONS }),
    
    // Diálogo de confirmación
    openConfirmDialog: (dialogConfig) =>
      dispatch({ type: ACTION_TYPES.OPEN_CONFIRM_DIALOG, payload: dialogConfig }),
    
    closeConfirmDialog: () =>
      dispatch({ type: ACTION_TYPES.CLOSE_CONFIRM_DIALOG }),
    
    // Reset
    resetState: () =>
      dispatch({ type: ACTION_TYPES.RESET_STATE })
  };

  // Funciones de negocio mejoradas
  const businessActions = {
    // Cargar proyectos con manejo de estado
    loadProjects: async () => {
      actions.setOperationLoading({ create: false, update: false, delete: false });
      actions.setLoading(true);
      actions.setSyncStatus('syncing');
    
      try {
        const projects = await projectService.getProjects();

        // VALIDACIÓN CRÍTICA: Asegurar que projects sea array
        const projectsArray = Array.isArray(projects) ? projects : [];

        actions.setProjects(projectsArray);
        actions.addNotification({
          type: 'success',
          title: 'Datos actualizados',
          message: `Se cargaron ${projectsArray.length} proyectos correctamente.`
        });
      } catch (error) {
        console.error('Error loading projects:', error);
        // En caso de error, establecer array vacío
        actions.setProjects([]);
        actions.setError(error.message);
        actions.setSyncStatus('error');
        actions.addNotification({
          type: 'error',
          title: 'Error al cargar proyectos',
          message: error.message
        });
      }
    },

    // Crear proyecto con confirmación
    createProject: async (projectData) => {
      actions.setOperationLoading({ create: true });
      
      try {
        const newProject = await projectService.createProject(projectData);
        actions.addProject(newProject);
        actions.addNotification({
          type: 'success',
          title: 'Proyecto creado',
          message: `"${newProject.nombre}" se ha creado correctamente.`
        });
        return newProject;
      } catch (error) {
        actions.setError(error.message);
        actions.addNotification({
          type: 'error',
          title: 'Error al crear proyecto',
          message: error.message
        });
        throw error;
      }
    },

    // Actualizar proyecto
    updateProject: async (projectId, projectData) => {
      actions.setOperationLoading({ update: true });
      
      try {
        const updatedProject = await projectService.updateProject(projectId, projectData);
        actions.updateProject(updatedProject);
        actions.addNotification({
          type: 'success',
          title: 'Proyecto actualizado',
          message: `"${updatedProject.nombre}" se ha actualizado correctamente.`
        });
        return updatedProject;
      } catch (error) {
        actions.setError(error.message);
        actions.addNotification({
          type: 'error',
          title: 'Error al actualizar proyecto',
          message: error.message
        });
        throw error;
      }
    },

    // Eliminar proyecto con confirmación
    deleteProject: async (projectId, projectName) => {
      return new Promise((resolve) => {
        actions.openConfirmDialog({
          title: 'Eliminar Proyecto',
          message: `¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger',
          onConfirm: async () => {
            actions.setOperationLoading({ delete: true });
            
            try {
              await projectService.deleteProject(projectId);
              actions.deleteProject(projectId);
              actions.addNotification({
                type: 'success',
                title: 'Proyecto eliminado',
                message: `"${projectName}" se ha eliminado correctamente.`
              });
              resolve(true);
            } catch (error) {
              actions.setError(error.message);
              actions.addNotification({
                type: 'error',
                title: 'Error al eliminar proyecto',
                message: error.message
              });
              resolve(false);
            }
          },
          onCancel: () => resolve(false)
        });
      });
    },

    // Cargar análisis de IA (legacy - compatibilidad)
    loadAnalysis: async () => {
      actions.setOperationLoading({ analysis: true });
      
      try {
        const analysis = await analysisService.getAnalysis();
        actions.setAnalysis(analysis);
        actions.addNotification({
          type: 'success',
          title: 'Análisis generado',
          message: 'El análisis de IA se ha generado correctamente.'
        });
        return analysis;
      } catch (error) {
        actions.setError(error.message);
        actions.addNotification({
          type: 'error',
          title: 'Error al generar análisis',
          message: error.message
        });
        throw error;
      }
    },

    // NUEVO: Cargar análisis de IA mejorado
    loadAIAnalysis: async () => {
      actions.setOperationLoading({ analysis: true });
      
      try {
        const aiAnalysis = await analysisService.getAIAnalysis();
        actions.setAIAnalysis(aiAnalysis);
        actions.addNotification({
          type: 'success',
          title: 'Análisis IA Generado',
          message: 'El análisis inteligente se ha generado correctamente.'
        });
        return aiAnalysis;
      } catch (error) {
        actions.setError(error.message);
        actions.addNotification({
          type: 'error',
          title: 'Error al generar análisis IA',
          message: error.message
        });
        throw error;
      }
    },

    // NUEVO: Regenerar análisis de IA
    regenerateAIAnalysis: async () => {
      actions.setOperationLoading({ analysis: true });
      
      try {
        const aiAnalysis = await analysisService.regenerateAIAnalysis();
        actions.setAIAnalysis(aiAnalysis);
        actions.addNotification({
          type: 'success',
          title: 'Análisis Regenerado',
          message: 'El análisis se ha regenerado correctamente.'
        });
        return aiAnalysis;
      } catch (error) {
        actions.setError(error.message);
        actions.addNotification({
          type: 'error',
          title: 'Error al regenerar análisis',
          message: error.message
        });
        throw error;
      }
    },

    // NUEVO: Limpiar cache de análisis IA
    clearAIAnalysisCache: async () => {
      try {
        await analysisService.clearAICache();
        actions.clearAIAnalysis();
        actions.addNotification({
          type: 'info',
          title: 'Cache Limpiado',
          message: 'El cache de análisis se ha limpiado correctamente.'
        });
      } catch (error) {
        console.error('Error clearing AI cache:', error);
        // Limpiar localmente aunque falle en el servidor
        actions.clearAIAnalysis();
      }
    },

    // Cargar datos para gráficos
    loadChartsData: async () => {
      try {
        const chartsData = await chartsService.getChartsData();
        actions.setChartsData(chartsData);
        return chartsData;
      } catch (error) {
        actions.setError(error.message);
        throw error;
      }
    },

    // Sincronizar todos los datos
    syncAllData: async () => {
      actions.setSyncStatus('syncing');
      
      try {
        await Promise.all([
          businessActions.loadProjects(),
          businessActions.loadChartsData()
        ]);
        actions.setSyncStatus('success');
      } catch (error) {
        actions.setSyncStatus('error');
      }
    },

    // Auto-eliminar notificaciones después de un tiempo
    autoRemoveNotification: (notificationId, delay = 5000) => {
      setTimeout(() => {
        actions.removeNotification(notificationId);
      }, delay);
    },

    // NUEVO: Invalidar cache de IA cuando cambian proyectos
    invalidateAICache: () => {
      // Limpiar cache local relacionado con IA
      Object.keys(localStorage)
        .filter(key => key.startsWith('ai-analysis-'))
        .forEach(key => localStorage.removeItem(key));
      
      actions.clearAIAnalysis();
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    businessActions.loadProjects();
    businessActions.loadChartsData();
  }, []);

  // Efecto para auto-eliminar notificaciones
  useEffect(() => {
    state.notifications.forEach(notification => {
      if (notification.autoClose !== false) {
        businessActions.autoRemoveNotification(notification.id);
      }
    });
  }, [state.notifications]);

  // Efecto para invalidar cache de IA cuando cambian los proyectos
  useEffect(() => {
    if (state.projects.length > 0) {
      businessActions.invalidateAICache();
    }
  }, [state.projects.length]);

  const value = {
    ...state,
    ...actions,
    ...businessActions,
  
    // Computed properties MEJORADAS con validación
    projectsCount: Array.isArray(state.projects) ? state.projects.length : 0,
    activeProjects: Array.isArray(state.projects) 
      ? state.projects.filter(p => p.estado === 'EN_PROGRESO').length 
      : 0,
    completedProjects: Array.isArray(state.projects) 
      ? state.projects.filter(p => p.estado === 'FINALIZADO').length 
      : 0,
  
    // Helper functions MEJORADAS
    getProjectById: (id) => 
      Array.isArray(state.projects) 
        ? state.projects.find(project => project.id === id)
        : null,
    getProjectsByStatus: (status) => 
      Array.isArray(state.projects) 
        ? state.projects.filter(project => project.estado === status)
        : [],
  
    // UI state helpers
    isLoading: state.loading,
    hasError: !!state.error,
    hasProjects: Array.isArray(state.projects) && state.projects.length > 0,
    isSyncing: state.syncStatus === 'syncing',
    
    // NUEVO: Helpers para IA
    hasAIAnalysis: !!state.aiAnalysis,
    isAIAnalysisLoading: state.operationLoading.analysis,
    getAIAnalysisStatus: () => {
      if (state.operationLoading.analysis) return 'loading';
      if (state.error) return 'error';
      if (state.aiAnalysis) return 'success';
      return 'empty';
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};