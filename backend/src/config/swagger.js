const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Proyectos',
      version: '1.0.0',
      description: 'API REST completa para gestión de proyectos con operaciones CRUD, IA generativa y análisis de datos',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@empresa.com'
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'https://api.tudominio.com',
        description: 'Servidor de Producción'
      }
    ],
    tags: [
      {
        name: 'Projects',
        description: 'Endpoints para gestión de proyectos (CRUD)'
      },
      {
        name: 'Analysis',
        description: 'Endpoints para análisis con IA generativa'
      },
      {
        name: 'Charts',
        description: 'Endpoints para datos de gráficos y estadísticas'
      },
      {
        name: 'Health',
        description: 'Endpoints de monitoreo y estado del sistema'
      }
    ],
    components: {
      schemas: {
        Project: {
          type: 'object',
          required: ['nombre', 'descripcion', 'fechaInicio'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID autoincremental del proyecto',
              example: 1
            },
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del proyecto',
              example: 'Sistema de Gestión de Proyectos'
            },
            descripcion: {
              type: 'string',
              maxLength: 2000,
              description: 'Descripción detallada del proyecto',
              example: 'Desarrollo de una plataforma fullstack para gestión de proyectos'
            },
            estado: {
              type: 'string',
              enum: ['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'],
              description: 'Estado actual del proyecto',
              example: 'EN_PROGRESO'
            },
            fechaInicio: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de inicio del proyecto',
              example: '2024-01-15T00:00:00.000Z'
            },
            fechaFin: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de finalización del proyecto (opcional)',
              example: '2024-06-30T00:00:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del registro',
              example: '2024-01-10T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
              example: '2024-01-20T15:45:00.000Z'
            }
          }
        },
        ProjectInput: {
          type: 'object',
          required: ['nombre', 'descripcion', 'fechaInicio'],
          properties: {
            nombre: {
              type: 'string',
              maxLength: 255,
              example: 'Nuevo Proyecto'
            },
            descripcion: {
              type: 'string',
              maxLength: 2000,
              example: 'Descripción del nuevo proyecto'
            },
            estado: {
              type: 'string',
              enum: ['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'],
              example: 'PENDIENTE'
            },
            fechaInicio: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T00:00:00.000Z'
            },
            fechaFin: {
              type: 'string',
              format: 'date-time',
              example: '2024-06-30T00:00:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Tipo de error',
              example: 'Error de validación'
            },
            message: {
              type: 'string',
              description: 'Mensaje de error descriptivo',
              example: 'El nombre del proyecto es requerido'
            },
            details: {
              type: 'array',
              description: 'Detalles específicos del error',
              items: {
                type: 'object'
              }
            }
          }
        },
        AnalysisResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  example: 'Los proyectos analizados muestran un enfoque en desarrollo fullstack...'
                },
                metadata: {
                  type: 'object',
                  properties: {
                    totalProjects: {
                      type: 'integer',
                      example: 10
                    },
                    activeProjects: {
                      type: 'integer',
                      example: 7
                    },
                    completedProjects: {
                      type: 'integer',
                      example: 3
                    },
                    recentProjects: {
                      type: 'integer',
                      example: 2
                    },
                    statusCount: {
                      type: 'object',
                      example: {
                        'EN_PROGRESO': 5,
                        'PENDIENTE': 2,
                        'FINALIZADO': 3
                      }
                    },
                    generatedAt: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                },
                projectsPreview: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer'
                      },
                      nombre: {
                        type: 'string'
                      },
                      estado: {
                        type: 'string'
                      },
                      descripcionCorta: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        ChartsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                pieChart: {
                  type: 'object',
                  description: 'Datos para gráfico de torta'
                },
                barChart: {
                  type: 'object',
                  description: 'Datos para gráfico de barras'
                },
                activeCompletedChart: {
                  type: 'object',
                  description: 'Datos para gráfico activos vs completados'
                },
                stats: {
                  type: 'object',
                  properties: {
                    total: {
                      type: 'integer'
                    },
                    completed: {
                      type: 'integer'
                    },
                    inProgress: {
                      type: 'integer'
                    },
                    pending: {
                      type: 'integer'
                    },
                    completionRate: {
                      type: 'number'
                    },
                    avgDurationDays: {
                      type: 'number'
                    },
                    activeRate: {
                      type: 'number'
                    }
                  }
                },
                lastUpdated: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            message: {
              type: 'string',
              example: 'Servidor y base de datos funcionando correctamente'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación de datos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // rutas de los archivos que contienen la documentación
};

module.exports = swaggerOptions;