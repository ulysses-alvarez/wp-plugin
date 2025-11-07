<?php
/**
 * Debug Helper
 *
 * Instrucciones para habilitar el debug en WordPress:
 *
 * 1. Abre el archivo wp-config.php en la raíz de tu instalación de WordPress
 *
 * 2. Busca estas líneas (generalmente cerca del final, antes de "That's all"):
 *    define('WP_DEBUG', false);
 *
 * 3. Reemplázalas con estas líneas:
 *
 *    // Enable WordPress debug mode
 *    define('WP_DEBUG', true);
 *    define('WP_DEBUG_LOG', true);
 *    define('WP_DEBUG_DISPLAY', false);
 *    @ini_set('display_errors', 0);
 *
 * 4. Guarda el archivo
 *
 * 5. Intenta crear o editar una propiedad nuevamente
 *
 * 6. Ve al directorio wp-content/ y busca un archivo llamado debug.log
 *    La ruta completa será: /wp-content/debug.log
 *
 * 7. Abre debug.log y copia los últimos errores relacionados con "Property"
 *
 * 8. Una vez que hayas identificado el error, puedes deshabilitar el debug
 *    cambiando de nuevo WP_DEBUG a false
 *
 * NOTA: Los error_log() que agregué en class-property-rest-api.php
 * escribirán automáticamente en este debug.log cuando ocurra un error.
 */

// Este archivo es solo para documentación, no ejecuta ningún código.
