import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import ProjectTable from './components/ProjectTable/ProjectTable';
import ProjectForm from './components/ProjectForm/ProjectForm';
import ProjectCharts from './components/ProjectCharts/ProjectCharts';
import AISummary from './components/AISummary/AISummary';
import Notifications from './components/Notifications/Notifications';
import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog';
import { useApp } from './context/AppContext';
import './App.css';
import './styles/responsive.css';

// Componente de Error Boundary simple
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>😕 Algo salió mal</h2>
            <p>La aplicación encontró un error inesperado.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Recargar aplicación
            </button>
            <details className="error-details">
              <summary>Detalles técnicos</summary>
              <pre>{this.state.error?.toString()}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente principal que usa el contexto
const AppContent = () => {
  const { currentView, loading, error, isSyncing } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'table':
        return <ProjectTable />;
      case 'form':
        return <ProjectForm />;
      case 'charts':
        return <ProjectCharts />;
      case 'analysis':
        return <AISummary />;
      default:
        return <ProjectTable />;
    }
  };

  return (
    <Layout>
      {/* Componentes globales */}
      <Notifications />
      <ConfirmDialog />

      {/* Indicador de sincronización */}
      {isSyncing && (
        <div className="sync-indicator">
          <div className="sync-spinner"></div>
          <span>Sincronizando datos...</span>
        </div>
      )}

      {/* Indicador de carga global */}
      {loading && (
        <div className="global-loading">
          <div className="loading-overlay">
            <div className="spinner-large"></div>
            <p>Cargando aplicación...</p>
          </div>
        </div>
      )}

      {/* Error global */}
      {error && (
        <div className="global-error">
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">❌</span>
              <div className="error-text">
                <strong>Error del sistema</strong>
                <span>{error}</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="error-retry-btn"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Vista actual */}
      <div className="view-container">
        {renderCurrentView()}
      </div>
    </Layout>
  );
};

// App principal con provider y error boundary
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;