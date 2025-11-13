<?php
/**
 * Property User Management
 *
 * Manages user creation and editing restrictions for property_admin role
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_User_Management {

    /**
     * Initialize user management restrictions
     */
    public static function init() {
        // Filter roles dropdown to only show allowed roles
        add_filter('editable_roles', [__CLASS__, 'filter_editable_roles']);

        // Validate user role on save
        add_action('user_profile_update_errors', [__CLASS__, 'validate_user_role'], 10, 3);

        // Prevent editing users with prohibited roles
        add_action('admin_init', [__CLASS__, 'prevent_editing_prohibited_users']);

        // Prevent deleting users with prohibited roles
        add_filter('user_has_cap', [__CLASS__, 'prevent_deleting_prohibited_users'], 10, 4);
    }

    /**
     * Filter roles dropdown to only show allowed roles for property_admin
     *
     * @param array $roles
     * @return array
     */
    public static function filter_editable_roles($roles) {
        $current_user = wp_get_current_user();

        // Only apply filter for property_admin role
        if (!in_array('property_admin', $current_user->roles)) {
            return $roles;
        }

        // Only allow property_admin to see these roles
        $allowed_roles = [
            'property_admin',
            'property_manager',
            'property_associate'
        ];

        return array_intersect_key($roles, array_flip($allowed_roles));
    }

    /**
     * Validate user role when saving
     * Prevents property_admin from assigning prohibited roles
     *
     * @param WP_Error $errors
     * @param bool     $update
     * @param WP_User  $user
     */
    public static function validate_user_role($errors, $update, $user) {
        $current_user = wp_get_current_user();

        // Only apply validation for property_admin role
        if (!in_array('property_admin', $current_user->roles)) {
            return;
        }

        // Get the role being assigned
        $new_role = isset($_POST['role']) ? $_POST['role'] : '';

        // Allowed roles for property_admin
        $allowed_roles = ['property_admin', 'property_manager', 'property_associate'];

        // Check if trying to assign a prohibited role
        if (!empty($new_role) && !in_array($new_role, $allowed_roles)) {
            $errors->add(
                'invalid_role',
                __('No tienes permisos para asignar este rol.', 'property-dashboard')
            );
        }

        // If editing existing user, check if they currently have a prohibited role
        if ($update && !empty($user->ID)) {
            $existing_user = get_user_by('id', $user->ID);
            if ($existing_user && !empty($existing_user->roles)) {
                $existing_role = $existing_user->roles[0];

                // If user has a prohibited role, prevent any changes
                if (!in_array($existing_role, $allowed_roles)) {
                    $errors->add(
                        'cannot_edit_user',
                        __('No tienes permisos para editar este usuario.', 'property-dashboard')
                    );
                }
            }
        }

        // Prevent property_admin from changing their own role
        if ($update && $user->ID === $current_user->ID && !empty($new_role)) {
            $current_role = $current_user->roles[0];
            if ($new_role !== $current_role) {
                $errors->add(
                    'cannot_change_own_role',
                    __('No puedes cambiar tu propio rol.', 'property-dashboard')
                );
            }
        }
    }

    /**
     * Prevent property_admin from accessing edit page of prohibited users
     */
    public static function prevent_editing_prohibited_users() {
        $current_user = wp_get_current_user();

        // Only apply for property_admin role
        if (!in_array('property_admin', $current_user->roles)) {
            return;
        }

        // Check if we're on user edit page
        $screen = get_current_screen();
        if (!$screen || ($screen->id !== 'user-edit' && $screen->id !== 'profile')) {
            return;
        }

        // Get the user being edited
        $user_id = isset($_GET['user_id']) ? absint($_GET['user_id']) : get_current_user_id();

        // Allow editing own profile
        if ($user_id === $current_user->ID) {
            return;
        }

        $user = get_user_by('id', $user_id);
        if (!$user || empty($user->roles)) {
            return;
        }

        $user_role = $user->roles[0];
        $allowed_roles = ['property_admin', 'property_manager', 'property_associate'];

        // If user has prohibited role, redirect with error
        if (!in_array($user_role, $allowed_roles)) {
            wp_die(
                __('No tienes permisos para editar este usuario.', 'property-dashboard'),
                __('Acceso Denegado', 'property-dashboard'),
                ['response' => 403]
            );
        }
    }

    /**
     * Prevent property_admin from deleting users with prohibited roles
     *
     * @param array   $allcaps All capabilities
     * @param array   $caps    Required capabilities
     * @param array   $args    Arguments
     * @param WP_User $user    Current user
     * @return array
     */
    public static function prevent_deleting_prohibited_users($allcaps, $caps, $args, $user) {
        // Only apply for delete_user capability
        if (!isset($args[0]) || $args[0] !== 'delete_user') {
            return $allcaps;
        }

        // Only apply for property_admin role
        if (!in_array('property_admin', $user->roles)) {
            return $allcaps;
        }

        // Get the user being deleted
        if (!isset($args[2])) {
            return $allcaps;
        }

        $user_id = $args[2];
        $target_user = get_user_by('id', $user_id);

        if (!$target_user || empty($target_user->roles)) {
            return $allcaps;
        }

        $target_role = $target_user->roles[0];
        $allowed_roles = ['property_admin', 'property_manager', 'property_associate'];

        // If target user has prohibited role, remove delete capability
        if (!in_array($target_role, $allowed_roles)) {
            $allcaps['delete_user'] = false;
            $allcaps['delete_users'] = false;
        }

        return $allcaps;
    }

    /**
     * Get list of users with allowed roles
     *
     * @return array
     */
    public static function get_dashboard_users() {
        return get_users([
            'role__in' => ['property_admin', 'property_manager', 'property_associate'],
            'orderby' => 'registered',
            'order' => 'DESC'
        ]);
    }

    /**
     * Check if current user can manage dashboard users
     *
     * @return bool
     */
    public static function can_manage_users() {
        return current_user_can('manage_dashboard_users');
    }
}
