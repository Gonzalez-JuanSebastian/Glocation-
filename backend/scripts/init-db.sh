#!/bin/sh

echo "🔧 Inicializando base de datos..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL está listo"

# Generar cliente Prisma
echo "🔨 Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
npx prisma db push --accept-data-loss

# Sembrar datos de prueba
echo "🌱 Sembrando datos de prueba..."
node prisma/seed.js

echo "🎉 Base de datos inicializada correctamente"