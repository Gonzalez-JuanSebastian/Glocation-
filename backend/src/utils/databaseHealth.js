const prismaService = require('./prisma');

const checkDatabaseHealth = async () => {
  try {
    // Verificar conexión básica
    await prismaService.client.$queryRaw`SELECT 1`;
    
    // Verificar que la tabla projects existe y es accesible
    const tableExists = await prismaService.client.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      );
    `;
    
    // Contar proyectos para verificar datos
    const projectCount = await prismaService.client.project.count();
    
    return {
      status: 'healthy',
      database: 'connected',
      tableExists: tableExists[0].exists,
      projectCount,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Health check de base de datos falló:', error);
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

const performDatabaseDiagnostics = async () => {
  const diagnostics = {
    connection: false,
    tables: [],
    migrations: [],
    performance: {}
  };

  try {
    // Test de conexión
    await prismaService.client.$queryRaw`SELECT 1`;
    diagnostics.connection = true;

    // Listar tablas
    const tables = await prismaService.client.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    diagnostics.tables = tables.map(t => t.table_name);

    // Verificar migraciones
    const migrations = await prismaService.client.$queryRaw`
      SELECT * FROM _prisma_migrations 
      ORDER BY finished_at DESC
    `;
    diagnostics.migrations = migrations;

    // Test de performance simple
    const startTime = Date.now();
    await prismaService.client.project.findMany({ take: 1 });
    diagnostics.performance.simpleQuery = Date.now() - startTime;

    console.log('🔍 Diagnóstico de base de datos completado:', diagnostics);
    return diagnostics;

  } catch (error) {
    console.error('❌ Diagnóstico de base de datos falló:', error);
    diagnostics.error = error.message;
    return diagnostics;
  }
};

module.exports = { checkDatabaseHealth, performDatabaseDiagnostics };