<?php
/**
 * Property Dashboard Installer
 *
 * Handles plugin activation and deactivation
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Installer {

    /**
     * Run on plugin activation
     */
    public static function activate() {
        // Register CPT first (needed before flush)
        Property_CPT::register();

        // Register roles and capabilities
        Property_Roles::register_roles();

        // Save roles version
        update_option('property_manager_roles_version', PROPERTY_MANAGER_ROLES_VERSION);

        // Flush rewrite rules to enable CPT URLs
        flush_rewrite_rules();

        // Set default options
        self::set_default_options();

        // Create example page (optional)
        self::create_example_page();
    }

    /**
     * Run on plugin deactivation
     */
    public static function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();

        // Note: We don't remove roles on deactivation
        // to preserve user data. Only remove on uninstall.
    }

    /**
     * Set default plugin options
     */
    private static function set_default_options() {
        $defaults = [
            'properties_per_page' => 20,
            'enable_google_maps' => true,
            'currency_symbol' => 'MXN',
            'date_format' => 'd/m/Y',
            'enable_statistics' => true,
            'enable_export' => true
        ];

        // Only add if doesn't exist
        if (!get_option('property_dashboard_settings')) {
            add_option('property_dashboard_settings', $defaults);
        }
    }

    /**
     * Create example page with shortcode
     */
    private static function create_example_page() {
        // Check if page already exists
        $page_check = get_page_by_path('dashboard-propiedades');

        if (!$page_check) {
            $page_data = [
                'post_title'    => __('Dashboard de Propiedades', 'property-dashboard'),
                'post_content'  => '[property_dashboard]',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'post_author'   => 1,
                'post_name'     => 'dashboard-propiedades',
                'comment_status' => 'closed',
                'ping_status'   => 'closed'
            ];

            $page_id = wp_insert_post($page_data);

            if ($page_id && !is_wp_error($page_id)) {
                // Store page ID in options
                update_option('property_dashboard_page_id', $page_id);
            }
        }
    }

    /**
     * Run on plugin uninstall (separate file: uninstall.php)
     * This method is for reference only
     */
    public static function uninstall() {
        // Remove roles
        Property_Roles::remove_roles();

        // Delete options
        delete_option('property_dashboard_settings');
        delete_option('property_dashboard_page_id');

        // Optionally delete all property posts
        // (commented out for safety - admin should decide)
        /*
        $properties = get_posts([
            'post_type' => 'property',
            'numberposts' => -1,
            'post_status' => 'any'
        ]);

        foreach ($properties as $property) {
            wp_delete_post($property->ID, true);
        }
        */
    }
}
