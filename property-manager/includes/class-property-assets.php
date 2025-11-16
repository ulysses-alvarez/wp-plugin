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
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_admin_styles']);
    }

    /**
     * Enqueue admin styles for property post type
     */
    public static function enqueue_admin_styles($hook) {
        // Only load on property edit/new screens
        global $post_type;
        if ('property' !== $post_type) {
            return;
        }

        // Add inline CSS for admin
        $admin_css = "
            /* Required field asterisk */
            .property-meta-table .required {
                color: #dc3232;
                font-weight: bold;
            }

            /* Smaller input fields */
            .property-meta-table input[type='text'],
            .property-meta-table input[type='number'],
            .property-meta-table input[type='url'],
            .property-meta-table select {
                height: 36px;
                padding: 6px 10px;
                font-size: 14px;
                line-height: 1.4;
            }

            /* Full width fields */
            .property-meta-table .widefat {
                width: 100%;
                max-width: 100%;
            }

            /* Smaller labels */
            .property-meta-table th label {
                font-size: 13px;
                font-weight: 600;
            }

            /* Smaller descriptions */
            .property-meta-table .description {
                font-size: 12px;
                line-height: 1.4;
                margin-top: 4px;
            }

            /* Reduce table row padding */
            .property-meta-table tr th,
            .property-meta-table tr td {
                padding: 12px 0;
            }

            /* Attachment preview styles */
            .property-attachment-container .attachment-preview {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }

            .property-attachment-container .attachment-link {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                text-decoration: none;
                font-size: 14px;
            }

            .property-attachment-container .dashicons {
                font-size: 20px;
                width: 20px;
                height: 20px;
            }

            .property-attachment-container img {
                max-width: 150px;
                max-height: 150px;
                object-fit: contain;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
        ";

        wp_add_inline_style('common', $admin_css);
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
        $dist_url = PROPERTY_MANAGER_URL . 'dist/';

        // Version based on file modification time for proper browser caching
        $js_file = PROPERTY_MANAGER_PATH . 'dist/assets/index.js';
        $css_file = PROPERTY_MANAGER_PATH . 'dist/assets/index.css';
        $js_version = file_exists($js_file) ? filemtime($js_file) : PROPERTY_MANAGER_VERSION;
        $css_version = file_exists($css_file) ? filemtime($css_file) : PROPERTY_MANAGER_VERSION;

        // Enqueue CSS normally
        wp_enqueue_style(
            'property-manager-app',
            $dist_url . 'assets/index.css',
            [],
            $css_version
        );

        // Add inline CSS for fullscreen mode
        $fullscreen_css = "
            /* Fullscreen mode styles */
            .property-dashboard-fullscreen-mode {
                width: 100% !important;
                min-height: 100vh !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Remove any container constraints in fullscreen */
            .property-dashboard-fullscreen .entry-content,
            .property-dashboard-fullscreen .site-main,
            .property-dashboard-fullscreen .content-area,
            .property-dashboard-fullscreen article {
                max-width: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Ensure React app fills available space */
            .property-dashboard-fullscreen-mode #property-dashboard-root {
                min-height: 100vh;
            }
        ";

        wp_add_inline_style('property-manager-app', $fullscreen_css);

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
        add_action('wp_footer', function() use ($wp_data, $dist_url, $js_version) {
            // Output wpPropertyDashboard data
            echo '<script id="property-manager-data">';
            echo 'window.wpPropertyDashboard = ' . wp_json_encode($wp_data) . ';';
            echo '</script>';

            // Load ES modules with type="module" and version param
            echo '<script type="module" crossorigin src="' . esc_url($dist_url . 'assets/index.js?ver=' . $js_version) . '"></script>';
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
            'manage_dashboard_users',
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

}
