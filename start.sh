#!/bin/bash

# Script para iniciar la aplicación Tracker Sites

echo "🚀 Iniciando Tracker Sites..."
echo ""

# Verificar MongoDB
echo "📊 Verificando MongoDB..."
if pgrep -x mongod > /dev/null; then
    echo "✓ MongoDB está ejecutándose"
else
    echo "⚠️  MongoDB no está ejecutándose"
    echo "   Intenta iniciar MongoDB con: sudo systemctl start mongod"
    echo "   o simplemente ejecuta: mongod"
    exit 1
fi

echo ""
echo "🌐 Configuración:"
echo "   - URL: http://localhost:3000"
echo "   - Usuario: admin (cambiar en .env)"
echo "   - Contraseña: admin123 (cambiar en .env)"
echo ""

# Iniciar la aplicación
echo "▶️  Iniciando servidor..."
npm start
