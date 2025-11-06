<?php
/**
 * Property Dashboard Assets Manager
 *
 * Handles loading of JavaScript and CSS files
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Assets {

    /**
     * Initialize
     */
    public static function init() {
        add_action('wp_enqueue_scripts', [self::class, 'register_assets']);
    }

    /**
     * Register assets (don't enqueue yet - wait for shortcode)
     */
    public static function register_assets() {
        // No hacemos nada aquí porque los módulos ES requieren un manejo especial
        // La carga se hace directamente en enqueue_app()
    }

    /**
     * Enqueue app assets (called by shortcode)
     *
     * @param array $config Configuration passed from shortcode
     */
    public static function enqueue_app($config = []) {
        $dist_url = plugin_dir_url(dirname(__FILE__)) . 'dist/';

        // Enqueue CSS normally
        wp_enqueue_style(
            'property-manager-app',
            $dist_url . 'assets/index.css',
            [],
            '1.0.0'
        );

        // Get current user data
        $current_user = wp_get_current_user();
        $user_role = !empty($current_user->roles) ? $current_user->roles[0] : '';

        // Get user capabilities
        $capabilities = self::get_user_capabilities($current_user);

        // Prepare data to pass to React app
        $wp_data = [
            // API endpoints
            'apiUrl'    => rest_url('property-dashboard/v1'),
            'wpApiUrl'  => rest_url('wp/v2'),
            'nonce'     => wp_create_nonce('wp_rest'),
            'siteUrl'   => get_site_url(),
            'adminUrl'  => admin_url(),

            // Current user info
            'currentUser' => [
                'id'           => $current_user->ID,
                'name'         => $current_user->display_name,
                'email'        => $current_user->user_email,
                'role'         => $user_role,
                'roleLabel'    => Property_Roles::get_role_label($user_role),
                'capabilities' => $capabilities,
            ],

            // App configuration
            'config' => array_merge([
                'perPage' => 20,
                'view'    => 'grid',
            ], $config),

            // Internationalization
            'i18n' => [
                'dateFormat' => get_option('date_format', 'd/m/Y'),
                'timeFormat' => get_option('time_format', 'H:i'),
                'locale'     => get_locale(),
                'currency'   => 'MXN',
            ],

            // Options from WordPress
            'options' => get_option('property_dashboard_settings', []),
        ];

        // Add inline script to set wpPropertyDashboard BEFORE loading ES modules
        add_action('wp_footer', function() use ($wp_data, $dist_url) {
            // Output wpPropertyDashboard data
            echo '<script id="property-manager-data">';
            echo 'window.wpPropertyDashboard = ' . wp_json_encode($wp_data) . ';';
            echo '</script>';

            // Load ES modules with type="module"
            echo '<script type="module" crossorigin src="' . esc_url($dist_url . 'assets/index.js') . '"></script>';
            echo '<link rel="modulepreload" crossorigin href="' . esc_url($dist_url . 'assets/vendor.js') . '">';
        }, 20);
    }

    /**
     * Get user capabilities related to properties
     *
     * @param WP_User $user
     * @return array
     */
    private static function get_user_capabilities($user) {
        if (!$user || !$user->ID) {
            return [];
        }

        $property_caps = [
            'view_properties',
            'view_all_properties',
            'create_properties',
            'edit_properties',
            'edit_others_properties',
            'delete_properties',
            'delete_others_properties',
            'assign_properties',
            'manage_property_roles',
            'export_properties',
            'view_statistics',
            'view_team_statistics',
            'view_own_statistics',
        ];

        $capabilities = [];
        foreach ($property_caps as $cap) {
            $capabilities[$cap] = user_can($user, $cap);
        }

        return $capabilities;
    }

    /**
     * Find file by pattern in directory
     *
     * @param string $dir Directory to search
     * @param string $pattern File pattern (e.g., 'index*.js')
     * @return string|false File path or false if not found
     */
    private static function find_file($dir, $pattern) {
        if (!is_dir($dir)) {
            return false;
        }

        $files = glob($dir . $pattern);
        return !empty($files) ? $files[0] : false;
    }

    /**
     * Get role label in Spanish
     *
     * @param string $role_slug
     * @return string
     */
    private static function get_role_label($role_slug) {
        $labels = [
            'administrator'      => __('Administrador', 'property-dashboard'),
            'property_manager'   => __('Gerente', 'property-dashboard'),
            'property_associate' => __('Asociado', 'property-dashboard'),
        ];

        return isset($labels[$role_slug]) ? $labels[$role_slug] : $role_slug;
    }
}
