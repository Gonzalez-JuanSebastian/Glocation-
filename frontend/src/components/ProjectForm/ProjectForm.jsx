import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { projectService } from '../../services/api';
import './ProjectForm.css';

const ProjectForm = () => {
  const { 
    selectedProject, 
    formMode, 
    setCurrentView, 
    addProject, 
    updateProject,
    setError,
    setLoading 
  } = useApp();
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'PENDIENTE',
    fechaInicio: '',
    fechaFin: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario con datos del proyecto si estamos en modo edición
  useEffect(() => {
    if (formMode === 'edit' && selectedProject) {
      const projectData = {
        ...selectedProject,
        fechaInicio: selectedProject.fechaInicio.split('T')[0],
        fechaFin: selectedProject.fechaFin ? selectedProject.fechaFin.split('T')[0] : ''
      };
      setFormData(projectData);
    } else {
      // Resetear formulario para modo creación
      setFormData({
        nombre: '',
        descripcion: '',
        estado: 'PENDIENTE',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: ''
      });
    }
  }, [formMode, selectedProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del proyecto es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    } else {
      const startDate = new Date(formData.fechaInicio);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.fechaInicio = 'La fecha de inicio no puede ser en el pasado';
      }
    }
    
    if (formData.fechaFin) {
      const startDate = new Date(formData.fechaInicio);
      const endDate = new Date(formData.fechaFin);
      
      if (endDate <= startDate) {
        newErrors.fechaFin = 'La fecha fin debe ser posterior a la fecha de inicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      const projectToSubmit = {
        ...formData,
        // Asegurar que las fechas estén en formato ISO
        fechaInicio: new Date(formData.fechaInicio).toISOString(),
        fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString() : null
      };
      
      if (formMode === 'edit' && selectedProject) {
        const updatedProject = await projectService.updateProject(selectedProject.id, projectToSubmit);
        updateProject(updatedProject);
      } else {
        const newProject = await projectService.createProject(projectToSubmit);
        addProject(newProject);
      }
      
      // Regresar a la vista de tabla
      setCurrentView('table');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('table');
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>
          {formMode === 'edit' ? '✏️ Editar Proyecto' : '➕ Crear Nuevo Proyecto'}
        </h2>
        <button onClick={handleCancel} className="btn-cancel">
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-grid">
          {/* Campo Nombre */}
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`form-input ${errors.nombre ? 'error' : ''}`}
              placeholder="Ej: Sistema de Gestión E-commerce"
              maxLength={255}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          {/* Campo Descripción */}
          <div className="form-group full-width">
            <label htmlFor="descripcion" className="form-label">
              Descripción del Proyecto *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className={`form-textarea ${errors.descripcion ? 'error' : ''}`}
              placeholder="Describe los objetivos, características y alcance del proyecto..."
              rows={4}
            />
            {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
            <div className="character-count">
              {formData.descripcion.length} caracteres
            </div>
          </div>

          {/* Campo Estado */}
          <div className="form-group">
            <label htmlFor="estado" className="form-label">
              Estado del Proyecto *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="form-select"
            >
              <option value="PENDIENTE">⏳ Pendiente</option>
              <option value="EN_PROGRESO">🚀 En Progreso</option>
              <option value="FINALIZADO">✅ Finalizado</option>
              <option value="CANCELADO">❌ Cancelado</option>
            </select>
          </div>

          {/* Campo Fecha Inicio */}
          <div className="form-group">
            <label htmlFor="fechaInicio" className="form-label">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              className={`form-input ${errors.fechaInicio ? 'error' : ''}`}
            />
            {errors.fechaInicio && <span className="error-message">{errors.fechaInicio}</span>}
          </div>

          {/* Campo Fecha Fin */}
          <div className="form-group">
            <label htmlFor="fechaFin" className="form-label">
              Fecha de Finalización
            </label>
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              className={`form-input ${errors.fechaFin ? 'error' : ''}`}
              min={formData.fechaInicio}
            />
            {errors.fechaFin && <span className="error-message">{errors.fechaFin}</span>}
            <div className="help-text">
              Opcional - Solo para proyectos finalizados o cancelados
            </div>
          </div>
        </div>

        {/* Resumen del proyecto */}
        <div className="form-summary">
          <h4>📋 Resumen del Proyecto</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Nombre:</span>
              <span className="summary-value">{formData.nombre || '—'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Estado:</span>
              <span className="summary-value">
                {formData.estado === 'PENDIENTE' && '⏳ Pendiente'}
                {formData.estado === 'EN_PROGRESO' && '🚀 En Progreso'}
                {formData.estado === 'FINALIZADO' && '✅ Finalizado'}
                {formData.estado === 'CANCELADO' && '❌ Cancelado'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Fecha Inicio:</span>
              <span className="summary-value">
                {formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Fecha Fin:</span>
              <span className="summary-value">
                {formData.fechaFin ? new Date(formData.fechaFin).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-small"></div>
                {formMode === 'edit' ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              formMode === 'edit' ? '💾 Actualizar Proyecto' : '🚀 Crear Proyecto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;