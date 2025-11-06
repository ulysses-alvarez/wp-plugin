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

        // Create Manager role (Gerente)
        self::create_manager_role();

        // Create Associate role (Asociado)
        self::create_associate_role();
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

            // Property capabilities
            'view_properties'        => true,
            'view_all_properties'    => true,
            'create_properties'      => true,
            'edit_properties'        => true,
            'edit_others_properties' => true,
            'delete_properties'      => true,
            'delete_others_properties' => false, // Can't delete others
            'assign_properties'      => true,
            'view_team_statistics'   => true,
            'export_properties'      => true,

            // Can't manage roles
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

            // Property capabilities - limited to own properties
            'view_properties'        => true,
            'view_all_properties'    => false, // Only own properties
            'create_properties'      => true,
            'edit_properties'        => true,
            'edit_others_properties' => false,
            'delete_properties'      => false,
            'delete_others_properties' => false,
            'assign_properties'      => false,
            'view_own_statistics'    => true,
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
                'assign_properties'
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
        remove_role('property_manager');
        remove_role('property_associate');

        // Remove capabilities from administrator
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $capabilities = [
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
                'assign_properties'
            ];

            foreach ($capabilities as $cap) {
                $admin_role->remove_cap($cap);
            }
        }
    }

    /**
     * Check if user can view property
     *
     * @param int $user_id
     * @param int $property_id
     * @return bool
     */
    public static function can_view_property($user_id, $property_id) {
        $user = get_user_by('id', $user_id);

        if (!$user) {
            return false;
        }

        // Admin and Manager can view all
        if (user_can($user_id, 'view_all_properties')) {
            return true;
        }

        // Associate can only view own properties
        if (user_can($user_id, 'view_properties')) {
            $property = get_post($property_id);
            return $property && (int) $property->post_author === (int) $user_id;
        }

        return false;
    }

    /**
     * Check if user can edit property
     *
     * @param int $user_id
     * @param int $property_id
     * @return bool
     */
    public static function can_edit_property($user_id, $property_id) {
        // Admin and Manager can edit all
        if (user_can($user_id, 'edit_others_properties')) {
            return true;
        }

        // Associate can only edit own
        if (user_can($user_id, 'edit_properties')) {
            $property = get_post($property_id);
            return $property && (int) $property->post_author === (int) $user_id;
        }

        return false;
    }

    /**
     * Check if user can delete property
     *
     * @param int $user_id
     * @param int $property_id
     * @return bool
     */
    public static function can_delete_property($user_id, $property_id) {
        // Only admin can delete others' properties
        if (user_can($user_id, 'delete_others_properties')) {
            return true;
        }

        // Manager can delete own
        if (user_can($user_id, 'delete_properties')) {
            $property = get_post($property_id);
            return $property && (int) $property->post_author === (int) $user_id;
        }

        // Associate cannot delete
        return false;
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
}
