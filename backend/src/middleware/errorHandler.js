/**
 * Middleware global para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('💥 Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Error de validación de express-validator
  if (err.type === 'validation-error') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      message: 'Datos de entrada inválidos',
      details: err.details
    });
  }

  // Errores de Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: 'Conflicto de datos únicos',
          message: 'Ya existe un registro con esos valores',
          field: err.meta?.target?.[0] || 'desconocido'
        });
      
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Recurso no encontrado',
          message: err.meta?.cause || 'El recurso solicitado no existe'
        });
      
      case 'P2014':
        return res.status(400).json({
          success: false,
          error: 'Violación de restricción',
          message: 'La operación viola una restricción de la base de datos'
        });
      
      case 'P2003':
        return res.status(400).json({
          success: false,
          error: 'Error de clave foránea',
          message: 'La operación viola una restricción de clave foránea'
        });

      case 'P1012':
        return res.status(400).json({
          success: false,
          error: 'Error de esquema Prisma',
          message: 'El esquema de la base de datos es inválido'
        });

      case 'P1001':
        return res.status(503).json({
          success: false,
          error: 'Base de datos no disponible',
          message: 'No se puede conectar con la base de datos'
        });
      
      default:
        return res.status(500).json({
          success: false,
          error: 'Error de base de datos',
          code: err.code,
          message: 'Error interno del servidor en la base de datos'
        });
    }
  }

  // Error de sintaxis JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'JSON inválido',
      message: 'El cuerpo de la solicitud contiene JSON malformado'
    });
  }

  // Error de límite de tamaño
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Payload demasiado grande',
      message: 'El cuerpo de la solicitud excede el tamaño permitido'
    });
  }

  // Error JWT (si se implementa autenticación después)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: 'El token de autenticación no es válido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      message: 'El token de autenticación ha expirado'
    });
  }

  // Error de timeout de IA
  if (err.message.includes('timeout') || err.code === 'ECONNABORTED') {
    return res.status(504).json({
      success: false,
      error: 'Timeout del servicio de IA',
      message: 'El servicio de IA tardó demasiado en responder'
    });
  }

  // Error de conexión de IA
  if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
    return res.status(502).json({
      success: false,
      error: 'Error de conexión con el servicio de IA',
      message: 'No se pudo conectar con el servicio de IA'
    });
  }

  // Error de API key de IA
  if (err.message.includes('API key') || err.message.includes('authentication')) {
    return res.status(401).json({
      success: false,
      error: 'Configuración de IA inválida',
      message: err.message
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  const errorResponse = {
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? message : 'Algo salió mal en el servidor'
  };

  // Solo incluir stack trace en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      originalError: message,
      url: req.originalUrl,
      method: req.method
    };
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;