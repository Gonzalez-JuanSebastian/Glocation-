import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import './ProjectCharts.css';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ProjectCharts = () => {
  const { chartsData, loading, error, loadChartsData, setCurrentView } = useApp();
  const [activeChart, setActiveChart] = useState('doughnut');

  // ✅ Validar que chartsData tenga la estructura correcta
  const safeChartsData = {
    estados: Array.isArray(chartsData?.estados) ? chartsData.estados : [],
    timeline: Array.isArray(chartsData?.timeline) ? chartsData.timeline : []
  };

  useEffect(() => {
    // ✅ Solo cargar datos si no existen o están vacíos
    if (safeChartsData.estados.length === 0 && !loading) {
      loadChartsData();
    }
  }, [safeChartsData.estados.length, loading, loadChartsData]);

  if (loading) {
    return (
      <div className="charts-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos para gráficos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-container">
        <div className="error-state">
          <h3>❌ Error al cargar gráficos</h3>
          <p>{error}</p>
          <button onClick={loadChartsData} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ✅ Verificar que tenemos datos para mostrar
  if (safeChartsData.estados.length === 0 && safeChartsData.timeline.length === 0) {
    return (
      <div className="charts-container">
        <div className="empty-state">
          <p>📊 No hay datos disponibles para mostrar gráficos</p>
          <button onClick={loadChartsData} className="btn-primary">
            Cargar Datos
          </button>
        </div>
      </div>
    );
  }

  // ✅ Configuración para gráfico de doughnut (estados) con validación
  const doughnutData = {
    labels: safeChartsData.estados.map(item => {
      const estados = {
        'PENDIENTE': '⏳ Pendiente',
        'EN_PROGRESO': '🚀 En Progreso',
        'FINALIZADO': '✅ Finalizado',
        'CANCELADO': '❌ Cancelado'
      };
      return item?.estado ? estados[item.estado] || item.estado : 'Desconocido';
    }),
    datasets: [
      {
        data: safeChartsData.estados.map(item => item?.cantidad || 0),
        backgroundColor: [
          '#FF6384', // Pendiente - Rosa
          '#36A2EB', // En Progreso - Azul
          '#4BC0C0', // Finalizado - Verde azulado
          '#FFCE56', // Cancelado - Amarillo
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#4BC0C0',
          '#FFCE56',
        ],
        borderWidth: 2,
        hoverOffset: 15
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Proyectos por Estado',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%'
  };

  // ✅ Configuración para gráfico de barras (timeline) con validación
  const barData = {
    labels: safeChartsData.timeline.map(item => {
      if (!item?.mes) return 'Fecha desconocida';
      const [year, month] = item.mes.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[parseInt(month) - 1] || 'Inv'} ${year}`;
    }),
    datasets: [
      {
        label: 'Proyectos Activos',
        data: safeChartsData.timeline.map(item => item?.cantidad || 0),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolución de Proyectos por Mes',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Proyectos: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Cantidad de Proyectos'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mes'
        }
      }
    }
  };

  // ✅ Estadísticas resumidas con validación
  const totalProjects = safeChartsData.estados.reduce((sum, item) => sum + (item?.cantidad || 0), 0);
  const completedProjects = safeChartsData.estados.find(item => item?.estado === 'FINALIZADO')?.cantidad || 0;
  const completedPercentage = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // ✅ Encontrar mes más productivo con validación
  const mostProductiveMonth = safeChartsData.timeline.reduce((max, item) => {
    const currentCount = item?.cantidad || 0;
    const maxCount = max?.cantidad || 0;
    return currentCount > maxCount ? item : max;
  }, { cantidad: 0, mes: 'N/A' });

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h2>📊 Dashboard de Proyectos</h2>
        <div className="charts-actions">
          <button 
            onClick={() => setCurrentView('table')}
            className="btn-secondary"
          >
            ← Volver a Proyectos
          </button>
        </div>
      </div>

      {/* ✅ Estadísticas rápidas con validación */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{totalProjects}</h3>
            <p>Total Proyectos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{completedPercentage}%</h3>
            <p>Tasa de Finalización</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <h3>
              {safeChartsData.estados.find(item => item?.estado === 'EN_PROGRESO')?.cantidad || 0}
            </h3>
            <p>En Progreso</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>
              {safeChartsData.estados.find(item => item?.estado === 'PENDIENTE')?.cantidad || 0}
            </h3>
            <p>Pendientes</p>
          </div>
        </div>
      </div>

      {/* Selector de gráficos */}
      <div className="chart-selector">
        <button 
          onClick={() => setActiveChart('doughnut')}
          className={`chart-btn ${activeChart === 'doughnut' ? 'active' : ''}`}
        >
          🎯 Por Estado
        </button>
        <button 
          onClick={() => setActiveChart('bar')}
          className={`chart-btn ${activeChart === 'bar' ? 'active' : ''}`}
        >
          📅 Timeline
        </button>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-wrapper">
          <div className="chart-title">
            {activeChart === 'doughnut' ? 'Distribución por Estado' : 'Evolución Temporal'}
          </div>
          <div className="chart-container">
            {activeChart === 'doughnut' ? (
              safeChartsData.estados.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="no-data-message">
                  <p>No hay datos de estados para mostrar</p>
                </div>
              )
            ) : (
              safeChartsData.timeline.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="no-data-message">
                  <p>No hay datos de timeline para mostrar</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* ✅ Leyenda de datos con validación */}
        <div className="chart-legend">
          <h4>📋 Resumen de Estados</h4>
          <div className="legend-list">
            {safeChartsData.estados.map((item, index) => (
              <div key={item?.estado || index} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ 
                    backgroundColor: doughnutData.datasets[0].backgroundColor[index] 
                  }}
                ></div>
                <span className="legend-label">
                  {doughnutData.labels[index]}
                </span>
                <span className="legend-value">
                  {item?.cantidad || 0} proyectos
                </span>
              </div>
            ))}
          </div>
          
          <div className="insights">
            <h4>💡 Insights</h4>
            <ul>
              <li>
                <strong>Proyectos activos:</strong> {
                  (safeChartsData.estados.find(item => item?.estado === 'EN_PROGRESO')?.cantidad || 0) +
                  (safeChartsData.estados.find(item => item?.estado === 'PENDIENTE')?.cantidad || 0)
                } en curso
              </li>
              <li>
                <strong>Tasa de éxito:</strong> {completedPercentage}% de proyectos finalizados
              </li>
              <li>
                <strong>Mes más productivo:</strong> {
                  mostProductiveMonth.mes !== 'N/A' 
                    ? mostProductiveMonth.mes 
                    : 'No hay datos'
                }
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCharts;