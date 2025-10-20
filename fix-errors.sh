#!/bin/bash
echo "🔧 Aplicando correcciones de errores..."

# 1. Corregir error CSS en ProjectTable
sed -i '367s/.*/  line-clamp: 2; \/* Propiedad estándar *\//' frontend/src/components/ProjectTable/ProjectTable.css
sed -i '368s/.*/  box-orient: vertical; \/* Propiedad estándar *\//' frontend/src/components/ProjectTable/ProjectTable.css

echo "✅ Correcciones aplicadas"
echo "🎯 Reiniciando la aplicación..."

docker compose restart frontend

echo "🚀 Aplicación reiniciada. Los errores deberían estar solucionados."