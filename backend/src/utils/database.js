const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty'
});

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
    
    // Verificar la conexión con una consulta simple
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Verificación de conexión a BD exitosa');
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
};

// Función para desconectar
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado de la base de datos');
  } catch (error) {
    console.error('❌ Error desconectando de la base de datos:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGINT', disconnectDB);
process.on('SIGTERM', disconnectDB);

module.exports = { prisma, connectDB, disconnectDB };