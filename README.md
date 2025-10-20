# 🚀 Proyecto FullStack - Gestión de Proyectos con IA Generativa

[![Node.js](https://img.shields.io/badge/Node.js-18.20.4-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-alpine)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com/)
[![DeepSeek AI](https://img.shields.io/badge/IA-DeepSeek-orange)](https://deepseek.com/)

Una aplicación completa de gestión de proyectos que integra **IA generativa** para análisis ejecutivo automático, con interfaz moderna y completamente contenerizada.

## ✨ Características Principales

### 🎯 Gestión de Proyectos
- **CRUD Completo**: Crear, leer, actualizar y eliminar proyectos
- **Filtros Avanzados**: Búsqueda en tiempo real y filtrado por estado
- **Validación**: Validación en frontend y backend
- **Interfaz Responsiva**: Diseño mobile-first para todos los dispositivos

### 🤖 IA Generativa Integrada
- **Análisis Automático**: Resumen ejecutivo generado por DeepSeek AI
- **Cache Inteligente**: Análisis cacheado por 5 minutos
- **Sistema de Fallbacks**: Análisis básico cuando IA no está disponible
- **Regeneración**: Capacidad de regenerar análisis on-demand

### 📊 Dashboard Interactivo
- **Gráficos en Tiempo Real**: Chart.js con datos actualizados
- **Métricas Visuales**: Distribución de proyectos por estado
- **Timeline**: Evolución temporal de los proyectos
- **Responsive**: Gráficos adaptables a diferentes pantallas

### 🐳 Infraestructura Moderna
- **Docker Compose**: Contenerización completa
- **PostgreSQL**: Base de datos robusta y escalable
- **API REST**: Arquitectura separada frontend/backend
- **Documentación Swagger**: API completamente documentada

## 🛠 Stack Tecnológico

### Backend
- **Runtime**: Node.js 18.20.4 (LTS)
- **Framework**: Express.js 4.18.2
- **Base de datos**: PostgreSQL 13-alpine
- **ORM**: Prisma 5.22.0
- **IA Generativa**: DeepSeek API
- **Documentación**: Swagger UI
- **Seguridad**: Helmet, CORS

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 4.5.0
- **Gráficos**: Chart.js 4.4.0 + react-chartjs-2
- **Estado**: Context API + useReducer
- **HTTP Client**: Axios 1.6.0
- **Estilos**: CSS3 Responsivo (Mobile-first)

### DevOps
- **Contenerización**: Docker + Docker Compose
- **Base de datos**: PostgreSQL 13-alpine
- **Orquestación**: Docker Compose 2.24.5

## 🚀 Comenzando

### Prerrequisitos
- Docker y Docker Compose instalados
- API Key de DeepSeek (gratuita en [deepseek.com](https://platform.deepseek.com/))

### Instalación Rápida

1. **Clonar y configurar:**
```bash
git clone <repository-url>
cd proyecto-fullstack
cp .env.example .env
```

2. **Configurar variables de entorno:**
```env
# Editar .env y agregar tu API Key de DeepSeek
DEEPSEEK_API_KEY=tu_api_key_aqui
```

3. **Iniciar la aplicación:**
```bash
docker compose up -d
```

4. **Inicializar base de datos:**
```bash
docker compose exec backend npm run db:init
```

5. **¡Listo! Accede a:**
   - 🌐 **Frontend**: http://localhost:3000
   - 🔧 **Backend API**: http://localhost:3001
   - 📚 **Documentación API**: http://localhost:3001/api-docs
   - 🗄 **Prisma Studio**: http://localhost:5555 (después de ejecutar `npx prisma studio`)

## 📁 Estructura del Proyecto

```
proyecto-fullstack/
├── 📂 backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Definición de endpoints
│   │   ├── utils/           # Servicios (IA, BD, etc.)
│   │   └── server.js        # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de base de datos
│   │   └── seed.js          # Datos de prueba
│   └── Dockerfile
├── 📂 frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── context/         # Estado global
│   │   ├── services/        # Comunicación con API
│   │   └── styles/          # Estilos CSS
│   └── Dockerfile
└── docker-compose.yml
```

## 🎯 Uso de la Aplicación

### Gestión de Proyectos
1. **Ver proyectos**: Navega a la pestaña "Proyectos" para ver la lista completa
2. **Crear proyecto**: Click en "Nuevo Proyecto" y completa el formulario
3. **Editar proyecto**: Click en el ícono de edición en cualquier proyecto
4. **Eliminar proyecto**: Click en el ícono de eliminar (con confirmación)
5. **Filtrar**: Usa la barra de búsqueda y filtros por estado

### Análisis con IA
1. **Generar análisis**: Ve a la pestaña "Análisis IA"
2. **Ver resumen**: Lee el análisis ejecutivo generado automáticamente
3. **Regenerar**: Click en "Regenerar Análisis" para obtener uno nuevo
4. **Cache**: El análisis se mantiene en cache por 5 minutos

### Dashboard y Gráficos
1. **Ver métricas**: Navega a la pestaña "Gráficos"
2. **Gráfico de estados**: Distribución visual de proyectos por estado
3. **Timeline**: Evolución temporal de creación de proyectos
4. **Interactuar**: Pasa el mouse sobre gráficos para ver detalles

## 📡 API Reference

### Endpoints Principales

#### Proyectos
- `GET /api/projects` - Listar todos los proyectos
- `POST /api/projects` - Crear nuevo proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

#### Análisis IA
- `GET /api/analisis` - Obtener análisis generado por IA
- `POST /api/analisis/regenerate` - Regenerar análisis

#### Gráficos
- `GET /api/graficos` - Datos para gráficos y métricas

#### Sistema
- `GET /health` - Health check del sistema
- `GET /api-docs` - Documentación Swagger UI

### Ejemplos de Uso

```bash
# Listar proyectos
curl http://localhost:3001/api/projects

# Crear proyecto
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mi Proyecto",
    "descripcion": "Descripción del proyecto",
    "estado": "PENDIENTE",
    "fechaInicio": "2024-01-15"
  }'

# Obtener análisis IA
curl http://localhost:3001/api/analisis
```

## 🗄 Modelo de Datos

```prisma
model Project {
  id          Int      @id @default(autoincrement())
  nombre      String   @db.VarChar(255)
  descripcion String   @db.Text
  estado      Estado   @default(PENDIENTE)
  fechaInicio DateTime
  fechaFin    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Estado {
  PENDIENTE
  EN_PROGRESO
  FINALIZADO
  CANCELADO
}
```

## 🤖 Integración con DeepSeek AI

La aplicación utiliza **DeepSeek API** para generar análisis ejecutivos automáticos:

### Características de la IA
- **Prompt Engineering**: Optimizado para análisis de proyectos
- **Rate Limiting**: 50 requests por minuto
- **Retry Logic**: Reintentos automáticos con backoff exponencial
- **Cache**: Resultados cacheados por 5 minutos
- **Fallbacks**: Análisis básico cuando la IA no está disponible

### Estructura del Análisis
```javascript
{
  raw: "## Análisis Ejecutivo...",    // Markdown generado
  structured: {                       // Datos estructurados
    visionGeneral: "...",
    recomendaciones: ["...", "..."],
    riesgos: ["..."]
  },
  timestamp: "2024-01-15T10:30:00.000Z",
  wordCount: 250,
  isFallback: false
}
```

## 🐳 Docker

### Estructura de Contenedores
```yaml
services:
  postgres:     # Base de datos PostgreSQL
  backend:      # API Express.js
  frontend:     # Aplicación React
```

### Comandos Docker Útiles

```bash
# Iniciar aplicación
docker compose up -d

# Ver logs
docker compose logs -f backend

# Detener aplicación
docker compose down

# Reconstruir contenedores
docker compose up -d --build

# Acceder a contenedores
docker compose exec backend sh
docker compose exec frontend sh
```

### Variables de Entorno

```env
# DeepSeek API
DEEPSEEK_API_KEY=tu_api_key

# Base de datos
DATABASE_URL=postgresql://admin:password123@postgres:5432/proyectos_db

# Backend
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001
```

## 🛠 Desarrollo

### Comandos de Desarrollo

```bash
# Backend - Dentro del contenedor
npm run dev              # Modo desarrollo
npm run db:init          # Inicializar BD
npx prisma studio        # Interfaz visual de BD

# Frontend - Dentro del contenedor
npm run dev              # Servidor desarrollo
npm run build            # Build producción
npm run preview          # Preview build
```

### Estructura de Estado Frontend

```javascript
// Estado global de la aplicación
{
  projects: [],           // Lista de proyectos
  loading: false,         // Estados de carga
  error: null,            // Manejo de errores
  aiAnalysis: {           // Análisis de IA
    raw: "...",
    timestamp: "...",
    isFallback: false
  },
  chartsData: {           // Datos para gráficos
    estados: [],
    timeline: []
  }
}
```

## 🚀 Despliegue

### Producción con Docker
1. Configurar variables de entorno de producción
2. Construir imágenes optimizadas
3. Configurar reverse proxy (Nginx)
4. Establecer SSL/HTTPS
5. Configurar backups de base de datos

### Variables de Producción
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
DEEPSEEK_API_KEY=tu_api_key_produccion
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a base de datos**
```bash
docker compose ps
docker compose logs postgres
```

2. **Error de API de IA**
- Verificar que la API key sea válida
- Revisar logs: `docker compose logs backend | grep "DeepSeek"`

3. **Problemas de CORS**
- Verificar que FRONTEND_URL esté configurada correctamente

4. **Contenedores no inician**
```bash
docker compose down
docker system prune -a
docker compose up -d
```

### Logs y Debugging

```bash
# Ver todos los logs
docker compose logs

# Logs específicos
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Seguir logs en tiempo real
docker compose logs -f backend

# Buscar errores
docker compose logs backend | grep -i error
```

## 📈 Roadmap

### Próximas Características
- [ ] Autenticación y autorización (JWT)
- [ ] Subida de archivos para proyectos
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Exportación de datos (PDF, Excel)
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

### Mejoras Técnicas
- [ ] Tests automatizados (Jest, Cypress)
- [ ] Cache Redis para consultas
- [ ] Paginación para grandes datasets
- [ ] Monitorización y métricas
- [ ] CDN para assets estáticos

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Guía de Estilo
- Usar ESLint y Prettier
- Seguir convenciones de commits semánticos
- Incluir tests para nuevas funcionalidades
- Actualizar documentación

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa los logs con `docker compose logs`
2. Verifica las variables de entorno
3. Revisa la documentación en `/api-docs`
4. Abre un issue en el repositorio

## 🙏 Agradecimientos

- [DeepSeek](https://deepseek.com/) por la API de IA generativa
- [Prisma](https://www.prisma.io/) por el ORM
- [Chart.js](https://www.chartjs.org/) por las visualizaciones
- [Vite](https://vitejs.dev/) por el tooling de frontend

---

**¿Listo para comenzar?** 🚀

```bash
docker compose up -d
# Abre http://localhost:3000 y comienza a gestionar tus proyectos!
```

---

<div align="center">

**¿Te gusta este proyecto? ¡Dale una estrella! ⭐**

</div>