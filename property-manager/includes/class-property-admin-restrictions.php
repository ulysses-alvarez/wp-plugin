<?php
/**
 * Property Admin Restrictions
 *
 * Maneja las restricciones de acceso al admin de WordPress según rol
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Admin_Restrictions {

    /**
     * Initialize the restrictions
     */
    public static function init() {
        // Redirigir Asociado y Gerente si intentan acceder al admin de WP
        add_action('admin_init', [__CLASS__, 'restrict_admin_access'], 1);

        // Ocultar menús del admin para property_admin
        add_action('admin_menu', [__CLASS__, 'hide_admin_menu_items'], 999);

        // Ocultar barra de admin para roles custom
        add_filter('show_admin_bar', [__CLASS__, 'hide_admin_bar'], 999);
    }

    /**
     * Redirigir al dashboard si el usuario no debe acceder al admin de WP
     */
    public static function restrict_admin_access() {
        $user = wp_get_current_user();

        if (!$user || !$user->ID) {
            return;
        }

        // Permitir AJAX requests
        if (defined('DOING_AJAX') && DOING_AJAX) {
            return;
        }

        // Asociado y Gerente no pueden acceder al admin de WP
        if (in_array('property_associate', $user->roles) ||
            in_array('property_manager', $user->roles)) {

            // Redirigir al dashboard React
            wp_redirect(home_url('/propiedades'));
            exit;
        }
    }

    /**
     * Ocultar items del menú de admin para property_admin
     * Solo mostrar CPT de properties y perfil
     */
    public static function hide_admin_menu_items() {
        $user = wp_get_current_user();

        if (!$user || !$user->ID) {
            return;
        }

        // Solo aplicar a property_admin
        if (!in_array('property_admin', $user->roles)) {
            return;
        }

        global $menu;

        // Whitelist: Solo estos items son visibles
        $allowed_menu_items = [
            'edit.php?post_type=property', // CPT de propiedades
            'profile.php',                 // Perfil
            'users.php',                   // Usuarios (para gestión)
        ];

        // Iterar sobre todos los items del menú
        foreach ($menu as $key => $item) {
            $menu_slug = isset($item[2]) ? $item[2] : '';

            // Si no está en la whitelist, ocultarlo
            if (!in_array($menu_slug, $allowed_menu_items)) {
                unset($menu[$key]);
            }
        }
    }

    /**
     * Ocultar barra de admin de WordPress para todos los roles custom
     *
     * @param bool $show Whether to show the admin bar
     * @return bool
     */
    public static function hide_admin_bar($show) {
        $user = wp_get_current_user();

        if (!$user || !$user->ID) {
            return $show;
        }

        // Ocultar para todos los roles del plugin
        if (in_array('property_associate', $user->roles) ||
            in_array('property_manager', $user->roles) ||
            in_array('property_admin', $user->roles)) {
            return false;
        }

        return $show;
    }
}
