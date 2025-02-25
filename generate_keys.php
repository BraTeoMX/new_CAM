<?php
// Generar clave de cifrado y vector de inicialización
$key = base64_encode(random_bytes(32)); // Genera una clave de 32 bytes y la codifica en base64
$iv = base64_encode(random_bytes(32));  // Genera un IV de 32 bytes y lo codifica en base64

// Imprimir las claves generadas
echo 'ENCRYPTION_KEY=' . $key . PHP_EOL;
echo 'ENCRYPTION_IV=' . $iv . PHP_EOL;
