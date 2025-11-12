#!/bin/bash

echo "🚀 CONFIGURACIÓN COMPLETA DE PRUEBAS DOLIBARR"
echo "=============================================="

cd ~/Descargas/prueba

# Crear carpetas necesarias
mkdir -p scripts test-results/screenshots

echo "📁 Estructura de carpetas creada"

echo "🔧 Paso 1: Activando módulos de Dolibarr..."
node scripts/activate-modules.js

echo "🏗️ Paso 2: Configurando datos básicos..."
node scripts/setup-basic-data.js

echo "🧪 Paso 3: Ejecutando pruebas adaptadas..."
npx playwright test tests/pruebas-dolibarr-real.spec.js --headed

echo "📊 Paso 4: Generando reporte..."
npx playwright show-report

echo "🎉 ¡Proceso completado!"