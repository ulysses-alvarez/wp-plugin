<?php
/**
 * Property Profile API
 *
 * REST API endpoint for user profile management
 * Allows users to update their own profile (name, email, password)
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Profile_API {

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        // Update own profile
        register_rest_route('property-dashboard/v1', '/profile', [
            'methods'             => 'PUT',
            'callback'            => [__CLASS__, 'update_profile'],
            'permission_callback' => [__CLASS__, 'check_authentication'],
        ]);

        // Get own profile
        register_rest_route('property-dashboard/v1', '/profile', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'get_profile'],
            'permission_callback' => [__CLASS__, 'check_authentication'],
        ]);
    }

    /**
     * Check if user is authenticated
     */
    public static function check_authentication() {
        return is_user_logged_in();
    }

    /**
     * Get current user profile
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function get_profile($request) {
        $user_id = get_current_user_id();
        $user = get_user_by('id', $user_id);

        if (!$user) {
            return new WP_Error(
                'user_not_found',
                __('Usuario no encontrado.', 'property-dashboard'),
                ['status' => 404]
            );
        }

        return rest_ensure_response(self::format_user_response($user));
    }

    /**
     * Update current user profile
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function update_profile($request) {
        $user_id = get_current_user_id();
        $user = get_user_by('id', $user_id);

        if (!$user) {
            return new WP_Error(
                'user_not_found',
                __('Usuario no encontrado.', 'property-dashboard'),
                ['status' => 404]
            );
        }

        $params = $request->get_json_params();

        // Validate required fields
        if (empty($params['display_name'])) {
            return new WP_Error(
                'missing_display_name',
                __('El nombre es requerido.', 'property-dashboard'),
                ['status' => 400]
            );
        }

        if (empty($params['email'])) {
            return new WP_Error(
                'missing_email',
                __('El email es requerido.', 'property-dashboard'),
                ['status' => 400]
            );
        }

        // Validate email format
        if (!is_email($params['email'])) {
            return new WP_Error(
                'invalid_email',
                __('El formato del email no es válido.', 'property-dashboard'),
                ['status' => 400]
            );
        }

        // Check if email is already in use by another user
        $email_exists = email_exists($params['email']);
        if ($email_exists && $email_exists !== $user_id) {
            return new WP_Error(
                'email_exists',
                __('Este email ya está siendo usado por otro usuario.', 'property-dashboard'),
                ['status' => 400]
            );
        }

        // Update user data
        $user_data = [
            'ID' => $user_id,
            'display_name' => sanitize_text_field($params['display_name']),
            'user_email' => sanitize_email($params['email']),
        ];

        // Update first and last name if provided
        if (isset($params['first_name'])) {
            update_user_meta($user_id, 'first_name', sanitize_text_field($params['first_name']));
        }

        if (isset($params['last_name'])) {
            update_user_meta($user_id, 'last_name', sanitize_text_field($params['last_name']));
        }

        // Update password if provided
        if (!empty($params['new_password'])) {
            // Validate current password if changing password
            if (empty($params['current_password'])) {
                return new WP_Error(
                    'missing_current_password',
                    __('Debes proporcionar tu contraseña actual.', 'property-dashboard'),
                    ['status' => 400]
                );
            }

            // Check current password
            if (!wp_check_password($params['current_password'], $user->user_pass, $user_id)) {
                return new WP_Error(
                    'invalid_current_password',
                    __('La contraseña actual no es correcta.', 'property-dashboard'),
                    ['status' => 400]
                );
            }

            // Validate new password length
            if (strlen($params['new_password']) < 8) {
                return new WP_Error(
                    'weak_password',
                    __('La contraseña debe tener al menos 8 caracteres.', 'property-dashboard'),
                    ['status' => 400]
                );
            }

            // Update password
            $user_data['user_pass'] = $params['new_password'];
        }

        // Perform update
        $result = wp_update_user($user_data);

        if (is_wp_error($result)) {
            return new WP_Error(
                'update_failed',
                $result->get_error_message(),
                ['status' => 500]
            );
        }

        // Get updated user
        $updated_user = get_user_by('id', $user_id);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Perfil actualizado correctamente.', 'property-dashboard'),
            'user' => self::format_user_response($updated_user),
        ]);
    }

    /**
     * Format user data for API response
     *
     * @param WP_User $user WordPress user object
     * @return array Formatted user data
     */
    private static function format_user_response($user) {
        return [
            'id' => $user->ID,
            'name' => $user->display_name,  // Add 'name' for compatibility
            'display_name' => $user->display_name,
            'first_name' => get_user_meta($user->ID, 'first_name', true),
            'last_name' => get_user_meta($user->ID, 'last_name', true),
            'email' => $user->user_email,
            'role' => !empty($user->roles) ? $user->roles[0] : '',
            'roleLabel' => Property_Roles::get_role_label(!empty($user->roles) ? $user->roles[0] : ''),  // Add camelCase
            'role_label' => Property_Roles::get_role_label(!empty($user->roles) ? $user->roles[0] : ''),
        ];
    }
}
