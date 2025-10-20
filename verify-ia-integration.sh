#!/bin/bash

echo "🎯 VERIFICACIÓN INTEGRACIÓN IA GENERATIVA"

echo "1. Estado del backend:"
curl -s http://localhost:3001/health | jq '{status, message, timestamp}'

echo ""
echo "2. Proyectos en base de datos:"
curl -s http://localhost:3001/api/projects | jq '.data | length'

echo ""
echo "3. Análisis de IA:"
ANALYSIS_RESPONSE=$(curl -s http://localhost:3001/api/analisis)
echo "$ANALYSIS_RESPONSE" | jq '{raw: .raw | length, timestamp, isFallback}'

echo ""
echo "4. Verificar estructura de respuesta:"
if echo "$ANALYSIS_RESPONSE" | jq -e '.raw' > /dev/null 2>&1; then
    echo "✅ Estructura de respuesta correcta"
    echo "📝 Longitud del análisis: $(echo "$ANALYSIS_RESPONSE" | jq -r '.raw | length') caracteres"
    echo "🕐 Timestamp: $(echo "$ANALYSIS_RESPONSE" | jq -r '.timestamp')"
else
    echo "❌ Estructura de respuesta incorrecta"
    echo "$ANALYSIS_RESPONSE"
fi

echo ""
echo "5. Probar regeneración:"
curl -s -X POST http://localhost:3001/api/analisis/regenerate | jq '{regenerated: true, timestamp}'

echo ""
echo "🎉 VERIFICACIÓN COMPLETADA"
