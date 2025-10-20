import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './ProjectTable.css';

const ProjectTable = () => {
  const { 
    projects, 
    loading, 
    error, 
    setSelectedProject, 
    setFormMode,
    setCurrentView 
  } = useApp();
  
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('fechaInicio');
  const [sortDirection, setSortDirection] = useState('desc');

  const safeProjects = Array.isArray(projects) ? projects : [];

  // Filtrar y ordenar proyectos
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = safeProjects.filter(project => {
      // Validar que project existe y tiene las propiedades necesarias
      if (!project || typeof project !== 'object') return false;
      
      const nombre = project.nombre || '';
      const descripcion = project.descripcion || '';
      const estado = project.estado || '';
      
      const matchesSearch = nombre.toLowerCase().includes(filter.toLowerCase()) ||
                           descripcion.toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || estado === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (sortField === 'fechaInicio' || sortField === 'fechaFin') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, filter, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormMode('edit');
    setCurrentView('form');
  };

  const handleViewAnalysis = () => {
    setCurrentView('analysis');
  };

  const handleViewCharts = () => {
    setCurrentView('charts');
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      PENDIENTE: { class: 'status-pending', label: 'Pendiente' },
      EN_PROGRESO: { class: 'status-in-progress', label: 'En Progreso' },
      FINALIZADO: { class: 'status-completed', label: 'Finalizado' },
      CANCELADO: { class: 'status-cancelled', label: 'Cancelado' }
    };
    
    const config = statusConfig[estado] || { class: 'status-default', label: estado };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-container">
        <div className="error-state">
          <h3>❌ Error al cargar proyectos</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>📋 Lista de Proyectos</h2>
        <div className="table-actions">
          <button 
            onClick={() => { setFormMode('create'); setCurrentView('form'); }}
            className="btn-primary"
          >
            + Nuevo Proyecto
          </button>
          <button onClick={handleViewAnalysis} className="btn-secondary">
            🤖 Análisis IA
          </button>
          <button onClick={handleViewCharts} className="btn-secondary">
            📊 Ver Gráficos
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar proyectos..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="results-info">
        <p>
          Mostrando {filteredAndSortedProjects.length} de {projects.length} proyectos
        </p>
      </div>

      {/* Tabla responsive */}
      <div className="table-wrapper">
        <table className="projects-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('nombre')} className="sortable">
                Nombre {sortField === 'nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Descripción</th>
              <th onClick={() => handleSort('estado')} className="sortable">
                Estado {sortField === 'estado' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('fechaInicio')} className="sortable">
                Fecha Inicio {sortField === 'fechaInicio' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('fechaFin')} className="sortable">
                Fecha Fin {sortField === 'fechaFin' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProjects.map((project) => (
              <tr key={project.id}>
                <td className="project-id">#{project.id}</td>
                <td className="project-name">{project.nombre}</td>
                <td className="project-description">
                  {project.descripcion.length > 100 
                    ? `${project.descripcion.substring(0, 100)}...` 
                    : project.descripcion}
                </td>
                <td>{getStatusBadge(project.estado)}</td>
                <td className="project-date">
                  {new Date(project.fechaInicio).toLocaleDateString()}
                </td>
                <td className="project-date">
                  {project.fechaFin 
                    ? new Date(project.fechaFin).toLocaleDateString()
                    : '—'}
                </td>
                <td className="project-actions">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="btn-edit"
                    title="Editar proyecto"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-view"
                    title="Ver detalles"
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentView('detail');
                    }}
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedProjects.length === 0 && (
          <div className="empty-state">
            <p>📭 No se encontraron proyectos</p>
            <button 
              onClick={() => { setFormMode('create'); setCurrentView('form'); }}
              className="btn-primary"
            >
              Crear primer proyecto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;