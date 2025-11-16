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
        // Filter roles dropdown to only show allowed roles (high priority to override other plugins)
        add_filter('editable_roles', [__CLASS__, 'filter_editable_roles'], 999);

        // Validate user role on save
        add_action('user_profile_update_errors', [__CLASS__, 'validate_user_role'], 10, 3);

        // Prevent editing users with prohibited roles
        add_action('admin_init', [__CLASS__, 'prevent_editing_prohibited_users']);

        // Prevent deleting users with prohibited roles
        add_filter('user_has_cap', [__CLASS__, 'prevent_deleting_prohibited_users'], 10, 4);

        // Filter users list in WordPress admin
        add_action('pre_get_users', [__CLASS__, 'filter_users_list']);

        // Filter user count views
        add_filter('views_users', [__CLASS__, 'filter_user_count_views']);

        // Clear user count cache when users are created, updated, or deleted
        add_action('user_register', [__CLASS__, 'clear_user_count_cache']);
        add_action('profile_update', [__CLASS__, 'clear_user_count_cache']);
        add_action('delete_user', [__CLASS__, 'clear_user_count_cache']);
        add_action('set_user_role', [__CLASS__, 'clear_user_count_cache']);
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

        // Only allow property_admin to see these roles (for creating new users)
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

        // Get the role being assigned and sanitize it
        $new_role = isset($_POST['role']) ? sanitize_text_field($_POST['role']) : '';

        // Allowed roles for property_admin to assign
        $allowed_roles_to_assign = ['property_admin', 'property_manager', 'property_associate'];

        // Check if trying to assign a prohibited role (including property_admin)
        if (!empty($new_role) && !in_array($new_role, $allowed_roles_to_assign, true)) {
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

                // Prevent editing users with property_admin role or other prohibited roles
                if (!in_array($existing_role, $allowed_roles_to_assign)) {
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
        $allowed_roles_to_edit = ['property_admin', 'property_manager', 'property_associate'];

        // Property admin can now edit other property admins and allowed roles
        if (!in_array($user_role, $allowed_roles_to_edit)) {
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
        $allowed_roles_to_delete = ['property_admin', 'property_manager', 'property_associate'];

        // Property admin can now delete other property admins and allowed roles
        if (!in_array($target_role, $allowed_roles_to_delete)) {
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

    /**
     * Filter users list in WordPress admin
     * Property admin can only see users with allowed roles
     *
     * @param WP_User_Query $query
     */
    public static function filter_users_list($query) {
        // Only apply on admin users screen
        if (!is_admin() || !function_exists('get_current_screen')) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || $screen->id !== 'users') {
            return;
        }

        $current_user = wp_get_current_user();

        // Only apply for property_admin role
        if (!in_array('property_admin', $current_user->roles)) {
            return;
        }

        // Filter to only show allowed roles plus current user
        $allowed_roles = ['property_admin', 'property_manager', 'property_associate'];

        // IMPORTANT: Remove this filter temporarily to avoid infinite loop
        remove_action('pre_get_users', [__CLASS__, 'filter_users_list']);

        // Get all user IDs with allowed roles
        $allowed_users = get_users([
            'role__in' => $allowed_roles,
            'fields' => 'ID',
        ]);

        // Re-add the filter
        add_action('pre_get_users', [__CLASS__, 'filter_users_list']);

        // Always include current user (property_admin)
        $include_ids = array_merge($allowed_users, [$current_user->ID]);

        // Use include to show only these users
        $query->query_vars['include'] = $include_ids;

        // Remove any role filters that might conflict
        unset($query->query_vars['role']);
        unset($query->query_vars['role__in']);
        unset($query->query_vars['role__not_in']);
    }

    /**
     * Filter user count views in WordPress admin
     * Hide counts for prohibited roles
     *
     * @param array $views
     * @return array
     */
    public static function filter_user_count_views($views) {
        $current_user = wp_get_current_user();

        // Only apply for property_admin role
        if (!in_array('property_admin', $current_user->roles)) {
            return $views;
        }

        // Get allowed roles
        $allowed_roles = ['property_admin', 'property_manager', 'property_associate'];

        // Get all WordPress roles
        $wp_roles = wp_roles()->roles;

        // Remove views for prohibited roles
        foreach ($wp_roles as $role_key => $role_data) {
            if (!in_array($role_key, $allowed_roles)) {
                unset($views[$role_key]);
            }
        }

        // Recalculate "All" count with caching to improve performance
        $cache_key = 'property_user_count_' . md5(serialize($allowed_roles));
        $total_allowed = get_transient($cache_key);

        if (false === $total_allowed) {
            $users = count_users();
            $total_allowed = 0;

            foreach ($allowed_roles as $role) {
                if (isset($users['avail_roles'][$role])) {
                    $total_allowed += $users['avail_roles'][$role];
                }
            }

            // Cache for 1 hour
            set_transient($cache_key, $total_allowed, HOUR_IN_SECONDS);
        }

        // Update "All" link with correct count
        if (isset($views['all'])) {
            $class = empty($_REQUEST['role']) ? ' class="current"' : '';
            $views['all'] = sprintf(
                '<a href="%s"%s>%s <span class="count">(%s)</span></a>',
                admin_url('users.php'),
                $class,
                __('All'),
                number_format_i18n($total_allowed)
            );
        }

        return $views;
    }

    /**
     * Clear user count cache when users are modified
     * This ensures the cached count stays accurate
     */
    public static function clear_user_count_cache() {
        $allowed_roles = ['property_admin', 'property_manager', 'property_associate'];
        $cache_key = 'property_user_count_' . md5(serialize($allowed_roles));
        delete_transient($cache_key);
    }
}
