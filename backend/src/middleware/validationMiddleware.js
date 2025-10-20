const { validationResult } = require('express-validator');

/**
 * Middleware para manejar resultados de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      error: 'Error de validación de datos',
      details: errorDetails
    });
  }
  
  next();
};

/**
 * Middleware para sanitizar datos de entrada
 */
const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
        
        // Remover caracteres potencialmente peligrosos
        if (key !== 'descripcion') { // No aplicar a descripciones largas
          req.body[key] = req.body[key].replace(/[<>]/g, '');
        }
      }
    });
  }
  
  // Sanitizar query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim().replace(/[<>]/g, '');
      }
    });
  }
  
  // Sanitizar params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].trim().replace(/[<>]/g, '');
      }
    });
  }
  
  next();
};

/**
 * Middleware para validar tipos de contenido
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Tipo de contenido no soportado',
        message: 'Solo se acepta application/json'
      });
    }
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateContentType
};