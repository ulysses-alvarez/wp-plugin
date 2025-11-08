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
                'siteName' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => function($value) {
                        return strlen($value) >= 3 && strlen($value) <= 50;
                    }
                ],
                'logoUrl' => [
                    'type' => 'string',
                    'sanitize_callback' => 'esc_url_raw'
                ],
                'primaryColor' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_hex_color',
                    'validate_callback' => [__CLASS__, 'validate_hex_color']
                ]
            ]
        ]);
    }

    /**
     * Get current settings
     */
    public static function get_settings($request) {
        $defaults = [
            'siteName' => get_bloginfo('name'),
            'logoUrl' => '',
            'primaryColor' => '#216121'
        ];

        $settings = get_option('property_dashboard_settings', $defaults);

        // Ensure all default keys exist
        $settings = wp_parse_args($settings, $defaults);

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

        if (isset($params['siteName'])) {
            $updated['siteName'] = sanitize_text_field($params['siteName']);
        }

        if (isset($params['logoUrl'])) {
            $updated['logoUrl'] = esc_url_raw($params['logoUrl']);
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

        return rest_ensure_response($updated);
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
