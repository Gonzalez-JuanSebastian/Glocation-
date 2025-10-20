const { body, param, query } = require('express-validator');

// Validaciones para creación de proyectos
const validateCreateProject = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del proyecto es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .escape(),
  
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción del proyecto es requerida')
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres')
    .escape(),
  
  body('estado')
    .optional()
    .isIn(['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'])
    .withMessage('Estado debe ser: PENDIENTE, EN_PROGRESO, FINALIZADO o CANCELADO'),
  
  body('fechaInicio')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('La fecha de inicio no puede ser en el futuro');
      }
      return true;
    }),
  
  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.fechaInicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    })
];

// Validaciones para actualización de proyectos
const validateUpdateProject = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .escape(),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres')
    .escape(),
  
  body('estado')
    .optional()
    .isIn(['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'])
    .withMessage('Estado debe ser: PENDIENTE, EN_PROGRESO, FINALIZADO o CANCELADO'),
  
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
  
  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)')
];

// Validaciones para parámetros de query
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100'),
  
  query('estado')
    .optional()
    .isIn(['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO', 'pendiente', 'en_progreso', 'finalizado', 'cancelado'])
    .withMessage('Estado de filtro inválido'),
  
  query('sortBy')
    .optional()
    .isIn(['nombre', 'estado', 'fechaInicio', 'fechaFin', 'createdAt', 'updatedAt'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('Orden debe ser asc o desc')
];

// Validaciones para parámetros de ruta
const validateProjectId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
];

module.exports = {
  validateCreateProject,
  validateUpdateProject,
  validateQueryParams,
  validateProjectId
};