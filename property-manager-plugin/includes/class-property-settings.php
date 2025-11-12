<?php
/**
 * Property Settings REST API
 *
 * Maneja la configuración del dashboard (logo, nombre, colores)
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Settings {

    /**
     * Initialize the settings API
     */
    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        // GET /settings
        register_rest_route('property-dashboard/v1', '/settings', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_settings'],
            'permission_callback' => [__CLASS__, 'check_permissions']
        ]);

        // POST /settings
        register_rest_route('property-dashboard/v1', '/settings', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'update_settings'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
            'args' => [
                'logoId' => [
                    'type' => 'integer',
                    'sanitize_callback' => 'absint'
                ],
                'primaryColor' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_hex_color',
                    'validate_callback' => [__CLASS__, 'validate_hex_color']
                ]
            ]
        ]);

        // POST /settings/upload-logo
        register_rest_route('property-dashboard/v1', '/settings/upload-logo', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'upload_logo'],
            'permission_callback' => [__CLASS__, 'check_permissions']
        ]);

        // DELETE /settings/delete-logo
        register_rest_route('property-dashboard/v1', '/settings/delete-logo', [
            'methods' => 'DELETE',
            'callback' => [__CLASS__, 'delete_logo'],
            'permission_callback' => [__CLASS__, 'check_permissions']
        ]);
    }

    /**
     * Get current settings
     */
    public static function get_settings($request) {
        $defaults = [
            'logoId' => 0,
            'primaryColor' => '#000000'
        ];

        $settings = get_option('property_dashboard_settings', $defaults);

        // Ensure all default keys exist
        $settings = wp_parse_args($settings, $defaults);

        // Add WordPress site name (read-only)
        $settings['wpSiteName'] = get_bloginfo('name');

        // Calculate logo URL from logo ID
        $settings['logoUrl'] = '';
        if (!empty($settings['logoId'])) {
            $logoUrl = wp_get_attachment_url($settings['logoId']);
            if ($logoUrl) {
                // Add timestamp to prevent caching issues
                $settings['logoUrl'] = add_query_arg('v', time(), $logoUrl);
            }
        }

        return rest_ensure_response($settings);
    }

    /**
     * Update settings
     */
    public static function update_settings($request) {
        $params = $request->get_json_params();

        // Get current settings
        $current = get_option('property_dashboard_settings', []);

        // Prepare updated settings
        $updated = $current;

        if (isset($params['logoId'])) {
            $updated['logoId'] = absint($params['logoId']);
        }

        if (isset($params['primaryColor'])) {
            $color = sanitize_hex_color($params['primaryColor']);
            if ($color) {
                $updated['primaryColor'] = $color;
            } else {
                return new WP_Error(
                    'invalid_color',
                    'Color primario inválido. Debe ser un color hexadecimal válido (ej: #216121)',
                    ['status' => 400]
                );
            }
        }

        // Save settings
        update_option('property_dashboard_settings', $updated);

        // Return settings with calculated fields
        return self::get_settings($request);
    }

    /**
     * Upload logo
     */
    public static function upload_logo($request) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        $files = $request->get_file_params();

        if (empty($files['logo'])) {
            return new WP_Error(
                'no_file',
                'No se ha proporcionado ningún archivo',
                ['status' => 400]
            );
        }

        // Validate file type
        $file = $files['logo'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];

        if (!in_array($file['type'], $allowed_types)) {
            return new WP_Error(
                'invalid_file_type',
                'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, SVG, WEBP)',
                ['status' => 400]
            );
        }

        // Validate file size (max 2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            return new WP_Error(
                'file_too_large',
                'El archivo es demasiado grande. El tamaño máximo es 2MB',
                ['status' => 400]
            );
        }

        // Upload file
        $upload = wp_handle_upload($file, ['test_form' => false]);

        if (isset($upload['error'])) {
            return new WP_Error(
                'upload_failed',
                $upload['error'],
                ['status' => 500]
            );
        }

        // Create attachment
        $attachment_id = wp_insert_attachment([
            'post_mime_type' => $upload['type'],
            'post_title' => 'Dashboard Logo',
            'post_content' => '',
            'post_status' => 'inherit'
        ], $upload['file']);

        if (is_wp_error($attachment_id)) {
            return $attachment_id;
        }

        // Generate metadata
        $attach_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
        wp_update_attachment_metadata($attachment_id, $attach_data);

        // Delete old logo if exists
        $settings = get_option('property_dashboard_settings', []);
        if (!empty($settings['logoId'])) {
            wp_delete_attachment($settings['logoId'], true);
        }

        // Update settings with new logo ID
        $settings['logoId'] = $attachment_id;
        update_option('property_dashboard_settings', $settings);

        $logoUrl = wp_get_attachment_url($attachment_id);

        return rest_ensure_response([
            'id' => $attachment_id,
            'url' => add_query_arg('v', time(), $logoUrl)
        ]);
    }

    /**
     * Delete logo
     */
    public static function delete_logo($request) {
        $settings = get_option('property_dashboard_settings', []);

        if (!empty($settings['logoId'])) {
            wp_delete_attachment($settings['logoId'], true);
            $settings['logoId'] = 0;
            update_option('property_dashboard_settings', $settings);
        }

        return rest_ensure_response(['success' => true]);
    }

    /**
     * Validate hex color
     */
    public static function validate_hex_color($value, $request, $key) {
        if (empty($value)) {
            return true;
        }

        // Check if it's a valid hex color
        if (preg_match('/^#[0-9A-F]{6}$/i', $value)) {
            return true;
        }

        return false;
    }

    /**
     * Check if user has permission to manage settings
     */
    public static function check_permissions() {
        return current_user_can('manage_properties') ||
               current_user_can('administrator');
    }
}
