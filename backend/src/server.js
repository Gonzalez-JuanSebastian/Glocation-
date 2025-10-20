const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Importar y configurar Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Conectar a la base de datos
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL con Prisma');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
}

// Rutas básicas
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await connectDB();
    res.status(200).json({ 
      status: dbStatus ? 'OK' : 'WARNING',
      message: dbStatus ? 'Servidor y base de datos funcionando correctamente' : 'Servidor funcionando pero BD no disponible',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error en el servidor: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta raíz con información de endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Gestión de Proyectos - BACKEND FUNCIONANDO',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      projects: '/api/projects',
      analysis: '/api/analisis',
      charts: '/api/graficos'
    },
    timestamp: new Date().toISOString()
  });
});

// Importar rutas con manejo de errores
try {
  app.use('/api/projects', require('./routes/projects'));
  console.log('✅ Ruta /api/projects cargada');
} catch (error) {
  console.error('❌ Error cargando ruta /api/projects:', error.message);
}

try {
  app.use('/api/analisis', require('./routes/analysis'));
  console.log('✅ Ruta /api/analisis cargada');
} catch (error) {
  console.error('❌ Error cargando ruta /api/analisis:', error.message);
}

try {
  app.use('/api/graficos', require('./routes/charts'));
  console.log('✅ Ruta /api/graficos cargada');
} catch (error) {
  console.error('❌ Error cargando ruta /api/graficos:', error.message);
}

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`,
    availableEndpoints: [
      'GET /health',
      'GET /',
      'GET /api/projects',
      'GET /api/projects/:id',
      'POST /api/projects', 
      'PUT /api/projects/:id',
      'DELETE /api/projects/:id',
      'GET /api/analisis',
      'POST /api/analisis/regenerate',
      'GET /api/graficos'
    ]
  });
});

// Manejo básico de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
async function startServer() {
  try {
    console.log('🔄 Iniciando servidor...');
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor backend ejecutándose en http://0.0.0.0:${PORT}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Conectar a BD después de iniciar el servidor
    setTimeout(async () => {
      await connectDB();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar la aplicación
startServer();

module.exports = app;
