#!/bin/bash

# --- Script de Limpieza Total para Laravel ---

echo "Limpiando cachés de Laravel..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear
php artisan clear-compiled
php artisan schedule:clear-cache

echo "Limpiando logs de la aplicación..."
# Elimina los archivos de log, pero no el directorio
rm -f storage/logs/*.log

echo "Limpiando sesiones de la aplicación..."
# Elimina los archivos de sesión, pero no el directorio
rm -f storage/framework/sessions/*

echo "Regenerando el autoloader de Composer..."
composer dump-autoload -o

echo "Limpiando dependencias y assets de frontend..."
# Elimina el directorio de build de Vite/Mix
rm -rf public/build
# Elimina las dependencias de Node (opcional, pero efectivo)
# rm -rf node_modules
# echo "Dependencias de Node eliminadas. Ejecuta 'npm install' para reinstalar."

echo "✅ ¡Limpieza completa!"
echo "Si eliminaste node_modules, no olvides ejecutar: npm install && npm run dev"