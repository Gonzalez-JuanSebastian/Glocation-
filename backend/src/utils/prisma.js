const { PrismaClient } = require('@prisma/client');

// Configuración simple y directa
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'minimal'
});

// Función de conexión simple
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL con Prisma');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
};

module.exports = { prisma, connectDB };