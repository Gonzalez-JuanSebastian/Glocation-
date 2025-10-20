const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getChartsData = async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    
    // Datos para gráfico de torta
    const statusCount = projects.reduce((acc, project) => {
      acc[project.estado] = (acc[project.estado] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = {
      labels: Object.keys(statusCount).map(estado => {
        const estados = {
          'PENDIENTE': 'Pendiente',
          'EN_PROGRESO': 'En Progreso', 
          'FINALIZADO': 'Finalizado',
          'CANCELADO': 'Cancelado'
        };
        return estados[estado] || estado;
      }),
      datasets: [{
        data: Object.values(statusCount),
        backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0', '#FFCE56']
      }]
    };

    res.json({
      success: true,
      data: {
        pieChart: pieChartData,
        stats: {
          total: projects.length,
          completed: statusCount['FINALIZADO'] || 0,
          inProgress: statusCount['EN_PROGRESO'] || 0,
          pending: statusCount['PENDIENTE'] || 0
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error obteniendo datos de gráficos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo datos para gráficos',
      message: error.message
    });
  }
};

module.exports = {
  getChartsData
};