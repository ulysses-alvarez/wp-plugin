<?php
/**
 * Plugin Name: Property Manager
 * Plugin URI: https://github.com/tu-usuario/property-manager
 * Description: Sistema de gestión de propiedades inmobiliarias con interfaz React
 * Version: 1.0.0
 * Author: Tu Nombre
 * Author URI: https://tu-sitio.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: property-manager
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('PROPERTY_MANAGER_VERSION', '1.0.0');
define('PROPERTY_MANAGER_ROLES_VERSION', '1.0.1'); // Increment this when roles/capabilities change
define('PROPERTY_MANAGER_PATH', plugin_dir_path(__FILE__));
define('PROPERTY_MANAGER_URL', plugin_dir_url(__FILE__));
define('PROPERTY_MANAGER_FILE', __FILE__);

// Autoload classes
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-installer.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-cpt.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-meta.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-roles.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-audit.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-admin-restrictions.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-user-management.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-rest-api.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-profile-api.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-settings.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-shortcode.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-assets.php';
require_once PROPERTY_MANAGER_PATH . 'includes/class-property-template.php';

/**
 * Activation hook
 */
register_activation_hook(__FILE__, ['Property_Installer', 'activate']);

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, ['Property_Installer', 'deactivate']);

/**
 * Check and update roles if needed
 * This runs on every plugin load to ensure roles are up to date
 */
function property_manager_check_roles_version() {
    $current_roles_version = get_option('property_manager_roles_version', '0');

    // If roles version is outdated, recreate roles
    if (version_compare($current_roles_version, PROPERTY_MANAGER_ROLES_VERSION, '<')) {
        Property_Roles::register_roles();
        update_option('property_manager_roles_version', PROPERTY_MANAGER_ROLES_VERSION);
        error_log('Property Manager: Roles updated to version ' . PROPERTY_MANAGER_ROLES_VERSION);
    }
}
add_action('admin_init', 'property_manager_check_roles_version');

/**
 * Initialize plugin
 */
function property_manager_init() {
    // Register Custom Post Type
    Property_CPT::register();

    // Register meta fields
    Property_Meta::register_fields();

    // Initialize meta boxes
    Property_Meta::init();

    // Initialize capability filters (for role-based permissions)
    Property_Roles::init_capability_filters();

    // Initialize audit system
    Property_Audit::init();

    // Initialize admin restrictions
    Property_Admin_Restrictions::init();

    // Initialize user management restrictions
    Property_User_Management::init();

    // Initialize REST API
    $rest_api = new Property_REST_API();
    add_action('rest_api_init', [$rest_api, 'register_routes']);

    // Initialize Profile API
    add_action('rest_api_init', ['Property_Profile_API', 'register_routes']);

    // Initialize Settings API
    Property_Settings::init();

    // Register shortcode
    Property_Shortcode::register();

    // Initialize assets
    Property_Assets::init();

    // Initialize template handler
    Property_Template::init();
}
add_action('init', 'property_manager_init');

/**
 * Load plugin text domain for translations
 */
function property_manager_load_textdomain() {
    load_plugin_textdomain(
        'property-manager',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
}
add_action('plugins_loaded', 'property_manager_load_textdomain');
