<?php
/**
 * Property Roles and Capabilities Manager
 *
 * Manages custom roles and permissions for the property system
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Roles {

    /**
     * Register roles on plugin activation
     */
    public static function register_roles() {
        // Add property capabilities to administrator role
        $admin_role = get_role('administrator');
        if ($admin_role) {
            self::add_property_capabilities($admin_role, 'admin');
        }

        // Create Property Admin role (Admin del plugin)
        self::create_property_admin_role();

        // Create Manager role (Gerente)
        self::create_manager_role();

        // Create Associate role (Asociado)
        self::create_associate_role();

        // Add capability filters
        self::init_capability_filters();
    }

    /**
     * Initialize capability filters for fine-grained permission control
     */
    public static function init_capability_filters() {
        // Filter for controlling delete permissions (Gerente and Asociado cannot delete)
        add_filter('map_meta_cap', [self::class, 'filter_property_deletion'], 10, 4);
    }

    /**
     * Create property admin role (Admin del plugin)
     * Can do everything including delete properties and manage users
     */
    private static function create_property_admin_role() {
        // Remove role if exists to update capabilities
        remove_role('property_admin');

        add_role('property_admin', __('Admin', 'property-dashboard'), [
            // Basic WordPress capabilities
            'read' => true,

            // Standard WordPress post capabilities for properties
            'edit_posts' => true,
            'edit_others_posts' => true,
            'edit_published_posts' => true,
            'publish_posts' => true,
            'delete_posts' => true,
            'delete_published_posts' => true,
            'delete_others_posts' => true,
            'read_private_posts' => true,

            // Media/Upload capabilities
            'upload_files'           => true,

            // Custom property capabilities
            'manage_properties'      => true,
            'view_properties'        => true,
            'view_all_properties'    => true,
            'create_properties'      => true,
            'edit_properties'        => true,
            'edit_others_properties' => true,
            'delete_properties'      => true,
            'delete_others_properties' => true,
            'assign_properties'      => true,
            'manage_property_roles'  => true,
            'export_properties'      => true,
            'view_statistics'        => true,

            // User management capabilities
            'list_users'             => true,
            'create_users'           => true,
            'edit_users'             => true,
            'delete_users'           => true,
            'promote_users'          => true,
            'manage_dashboard_users' => true,

            // Settings access
            'manage_options'         => true,

            // Limited WP admin access
            'access_wp_admin_limited' => true,
        ]);
    }

    /**
     * Create property manager role
     */
    private static function create_manager_role() {
        // Remove role if exists to update capabilities
        remove_role('property_manager');

        add_role('property_manager', __('Gerente', 'property-dashboard'), [
            // Basic WordPress capabilities
            'read' => true,

            // Standard WordPress post capabilities
            'edit_posts' => true,
            'edit_others_posts' => true,
            'edit_published_posts' => true,
            'publish_posts' => true,
            'read_private_posts' => true,

            // CANNOT delete properties (not even their own)
            'delete_posts' => false,
            'delete_published_posts' => false,
            'delete_others_posts' => false,

            // Media/Upload capabilities
            'upload_files'           => true,

            // Custom property capabilities for additional features
            'view_properties'        => true,
            'view_all_properties'    => true,
            'create_properties'      => true,
            'edit_properties'        => true,
            'edit_others_properties' => true,
            'assign_properties'      => true,
            'view_team_statistics'   => true,
            'export_properties'      => false,

            // Restrictions (used in REST API and custom checks)
            'delete_properties'      => false,
            'delete_others_properties' => false,
            'manage_property_roles'  => false,
        ]);
    }

    /**
     * Create property associate role
     */
    private static function create_associate_role() {
        // Remove role if exists to update capabilities
        remove_role('property_associate');

        add_role('property_associate', __('Asociado', 'property-dashboard'), [
            // Basic WordPress capabilities
            'read' => true,

            // Standard WordPress post capabilities (limited)
            'edit_posts' => true,
            'edit_published_posts' => true,
            'publish_posts' => true,
            'read_private_posts' => false,

            // Cannot edit or delete others' posts
            'edit_others_posts' => false,
            'delete_posts' => false,
            'delete_published_posts' => false,
            'delete_others_posts' => false,

            // Media/Upload capabilities
            'upload_files'           => true,

            // Custom property capabilities
            'view_properties'        => true,
            'view_all_properties'    => true, // Can view all properties (but only edit own)
            'create_properties'      => true,
            'edit_properties'        => true,
            'view_own_statistics'    => true,

            // Restrictions
            'edit_others_properties' => false,
            'delete_properties'      => false,
            'assign_properties'      => false,
            'export_properties'      => false,
            'manage_property_roles'  => false,
        ]);
    }

    /**
     * Add property capabilities to a role
     *
     * @param WP_Role $role
     * @param string  $level (admin, manager, associate)
     */
    private static function add_property_capabilities($role, $level = 'admin') {
        if (!$role) {
            return;
        }

        $capabilities = [];

        if ($level === 'admin') {
            $capabilities = [
                'manage_properties',
                'view_properties',
                'view_all_properties',
                'create_properties',
                'edit_properties',
                'edit_others_properties',
                'delete_properties',
                'delete_others_properties',
                'manage_property_roles',
                'export_properties',
                'view_statistics',
                'assign_properties',
                'manage_dashboard_users'  // Allow administrator to manage users in dashboard
            ];
        }

        foreach ($capabilities as $cap) {
            $role->add_cap($cap);
        }
    }

    /**
     * Remove roles on plugin deactivation/uninstall
     */
    public static function remove_roles() {
        // Remove custom roles
        remove_role('property_admin');
        remove_role('property_manager');
        remove_role('property_associate');

        // Remove capabilities from administrator
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $capabilities = [
                'manage_properties',
                'view_properties',
                'view_all_properties',
                'create_properties',
                'edit_properties',
                'edit_others_properties',
                'delete_properties',
                'delete_others_properties',
                'manage_property_roles',
                'export_properties',
                'view_statistics',
                'assign_properties',
                'manage_dashboard_users'
            ];

            foreach ($capabilities as $cap) {
                $admin_role->remove_cap($cap);
            }
        }
    }

    /**
     * Generic method to check property permissions
     * Validates property and checks user permissions based on action
     *
     * @param int    $user_id User ID to check
     * @param int    $property_id Property ID
     * @param string $action Action to check: 'view', 'edit', or 'delete'
     * @return bool Whether user can perform the action
     */
    private static function check_property_permission($user_id, $property_id, $action) {
        // Validate property exists and is correct type
        $property = get_post($property_id);
        if (!$property || $property->post_type !== 'property') {
            return false;
        }

        $is_author = (int) $property->post_author === (int) $user_id;

        // Check permissions based on action
        switch ($action) {
            case 'view':
                // Can view all properties?
                if (user_can($user_id, 'view_all_properties')) {
                    return true;
                }
                // Can only view own properties?
                if (user_can($user_id, 'view_properties')) {
                    return $is_author;
                }
                return false;

            case 'edit':
                // Can edit others' properties?
                if (user_can($user_id, 'edit_others_properties')) {
                    return true;
                }
                // Can only edit own properties?
                if (user_can($user_id, 'edit_properties')) {
                    return $is_author;
                }
                return false;

            case 'delete':
                // Delete is restricted to admin roles only
                // Using capability check instead of hardcoded roles
                return user_can($user_id, 'delete_others_properties');

            default:
                return false;
        }
    }

    /**
     * Check if user can view property
     *
     * @param int $user_id User ID
     * @param int $property_id Property ID
     * @return bool
     */
    public static function can_view_property($user_id, $property_id) {
        return self::check_property_permission($user_id, $property_id, 'view');
    }

    /**
     * Check if user can edit property
     *
     * @param int $user_id User ID
     * @param int $property_id Property ID
     * @return bool
     */
    public static function can_edit_property($user_id, $property_id) {
        return self::check_property_permission($user_id, $property_id, 'edit');
    }

    /**
     * Check if user can delete property
     *
     * @param int $user_id User ID
     * @param int $property_id Property ID
     * @return bool
     */
    public static function can_delete_property($user_id, $property_id) {
        return self::check_property_permission($user_id, $property_id, 'delete');
    }

    /**
     * Get user role label in Spanish
     *
     * @param string $role_slug
     * @return string
     */
    public static function get_role_label($role_slug) {
        $labels = [
            'administrator'       => __('Administrador', 'property-dashboard'),
            'property_admin'      => __('Admin', 'property-dashboard'),
            'property_manager'    => __('Gerente', 'property-dashboard'),
            'property_associate'  => __('Asociado', 'property-dashboard')
        ];

        return isset($labels[$role_slug]) ? $labels[$role_slug] : $role_slug;
    }

    /**
     * Get all property-related roles
     *
     * @return array
     */
    public static function get_property_roles() {
        return [
            'administrator' => [
                'slug'  => 'administrator',
                'label' => __('Administrador', 'property-dashboard'),
            ],
            'property_admin' => [
                'slug'  => 'property_admin',
                'label' => __('Admin', 'property-dashboard'),
            ],
            'property_manager' => [
                'slug'  => 'property_manager',
                'label' => __('Gerente', 'property-dashboard'),
            ],
            'property_associate' => [
                'slug'  => 'property_associate',
                'label' => __('Asociado', 'property-dashboard'),
            ],
        ];
    }

    /**
     * Filter property deletion capabilities
     * Ensures consistent deletion permissions across WordPress
     *
     * @param array  $caps    Required capabilities
     * @param string $cap     Capability being checked
     * @param int    $user_id User ID
     * @param array  $args    Additional arguments
     * @return array Modified capabilities
     */
    public static function filter_property_deletion($caps, $cap, $user_id, $args) {
        // Only apply to delete_post capability
        if ($cap !== 'delete_post' && $cap !== 'delete_published_post') {
            return $caps;
        }

        // Get the post being deleted
        if (!isset($args[0])) {
            return $caps;
        }

        $property_id = (int) $args[0];
        $post = get_post($property_id);

        // Only filter property post type
        if (!$post || $post->post_type !== 'property') {
            return $caps;
        }

        // Use our centralized permission check
        if (!self::can_delete_property($user_id, $property_id)) {
            return ['do_not_allow'];
        }

        return $caps;
    }
}
