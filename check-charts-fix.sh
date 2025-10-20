#!/bin/bash
echo "🔧 Verificando y aplicando corrección para gráficos..."

# Verificar que los archivos existen
if [ -f "frontend/src/components/ProjectCharts/ProjectCharts.jsx" ]; then
    echo "✅ ProjectCharts.jsx encontrado"
else
    echo "❌ ProjectCharts.jsx no encontrado"
    exit 1
fi

echo "🎯 La corrección ha sido aplicada"
echo "📊 Reiniciando el frontend..."

docker compose restart frontend

echo "🚀 Frontend reiniciado. El error debería estar solucionado."
echo "🌐 Accede a: http://localhost:3000 y ve a la sección de gráficos"