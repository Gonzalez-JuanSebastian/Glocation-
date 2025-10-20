const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET todos los proyectos
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener proyectos',
      message: error.message
    });
  }
};

// GET proyecto por ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado',
        message: `No se encontró un proyecto con el ID ${id}`
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error getting project by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el proyecto',
      message: error.message
    });
  }
};

// POST crear proyecto (MEJORADO con validación)
const createProject = async (req, res) => {
  try {
    const { nombre, descripcion, estado = 'PENDIENTE', fechaInicio, fechaFin } = req.body;

    // VALIDACIÓN MEJORADA
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        message: 'El campo "nombre" es obligatorio'
      });
    }

    if (!fechaInicio) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida', 
        message: 'El campo "fechaInicio" es obligatorio'
      });
    }

    // Validar fecha
    const fechaInicioDate = new Date(fechaInicio);
    if (isNaN(fechaInicioDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        message: 'La fecha de inicio no es válida'
      });
    }

    // Validar estado
    const estadosValidos = ['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
      });
    }

    const project = await prisma.project.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : '',
        estado,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear proyecto',
      message: 'Error interno del servidor'
    });
  }
};

// PUT actualizar proyecto (NUEVO)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado, fechaInicio, fechaFin } = req.body;

    // Verificar si el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado',
        message: `No se encontró un proyecto con el ID ${id}`
      });
    }

    // Validaciones
    if (nombre && nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        message: 'El campo "nombre" no puede estar vacío'
      });
    }

    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio);
      if (isNaN(fechaInicioDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          message: 'La fecha de inicio no es válida'
        });
      }
    }

    if (estado) {
      const estadosValidos = ['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
        });
      }
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(descripcion && { descripcion: descripcion.trim() }),
        ...(estado && { estado }),
        ...(fechaInicio && { fechaInicio: new Date(fechaInicio) }),
        ...(fechaFin !== undefined && { 
          fechaFin: fechaFin ? new Date(fechaFin) : null 
        }),
      },
    });

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar proyecto',
      message: 'Error interno del servidor'
    });
  }
};

// DELETE eliminar proyecto (NUEVO)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado',
        message: `No se encontró un proyecto con el ID ${id}`
      });
    }

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar proyecto',
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject, 
  updateProject,
  deleteProject
};