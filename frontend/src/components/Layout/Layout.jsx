import React from 'react';
import { useApp } from '../../context/AppContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { currentView, setCurrentView, projects } = useApp();

  const navigationItems = [
    { key: 'table', label: '📋 Proyectos', icon: '📋', badge: projects.length },
    { key: 'charts', label: '📊 Dashboard', icon: '📊' },
    { key: 'analysis', label: '🤖 Análisis IA', icon: '🤖' },
  ];

  const getViewTitle = () => {
    const titles = {
      table: 'Gestión de Proyectos',
      form: 'Nuevo Proyecto',
      charts: 'Dashboard de Proyectos',
      analysis: 'Análisis con IA',
      detail: 'Detalles del Proyecto'
    };
    return titles[currentView] || 'Gestión de Proyectos';
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <h1 className="logo">
              🚀 {getViewTitle()}
            </h1>
            <div className="header-subtitle">
              Sistema de gestión integral de proyectos
            </div>
          </div>
          
          <nav className="nav">
            {navigationItems.map(item => (
              <button
                key={item.key}
                className={`nav-item ${currentView === item.key ? 'active' : ''}`}
                onClick={() => setCurrentView(item.key)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="header-status">
            <div className="status-item">
              <span className="status-dot online"></span>
              <span>Sistema Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <div className="breadcrumb-content">
          <button 
            onClick={() => setCurrentView('table')}
            className="breadcrumb-home"
          >
            🏠 Inicio
          </button>
          {currentView !== 'table' && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{getViewTitle()}</span>
            </>
          )}
        </div>
      </div>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>&copy; 2024 Sistema de Gestión de Proyectos. v1.0.0</p>
            <div className="footer-tech">
              <span>React 18</span>
              <span>Express.js</span>
              <span>PostgreSQL</span>
              <span>DeepSeek AI</span>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <strong>Estado del Sistema</strong>
              <div className="status-list">
                <span className="status online">Backend: Operativo</span>
                <span className="status online">Base de datos: Conectada</span>
                <span className="status online">IA: Configurada</span>
              </div>
            </div>
            
            <div className="footer-section">
              <strong>Estadísticas</strong>
              <div className="stats-list">
                <span>Proyectos: {projects.length}</span>
                <span>En progreso: {projects.filter(p => p.estado === 'EN_PROGRESO').length}</span>
                <span>Finalizados: {projects.filter(p => p.estado === 'FINALIZADO').length}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;