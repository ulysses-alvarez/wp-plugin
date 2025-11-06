<?php
/**
 * Property Dashboard Shortcode
 *
 * Handles the [property_dashboard] shortcode
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Shortcode {

    /**
     * Register shortcode
     */
    public static function register() {
        add_shortcode('property_dashboard', [self::class, 'render']);
    }

    /**
     * Render shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public static function render($atts = []) {
        // Parse attributes
        $atts = shortcode_atts([
            'view'     => 'grid',     // grid or list
            'per_page' => 20,         // Properties per page
        ], $atts, 'property_dashboard');

        // Check if user is logged in
        if (!is_user_logged_in()) {
            return self::render_login_message();
        }

        // Check if user has permissions
        if (!current_user_can('view_properties')) {
            return self::render_no_permission_message();
        }

        // Enqueue assets (JS and CSS)
        Property_Assets::enqueue_app($atts);

        // Return root div where React will mount
        return '<div id="property-dashboard-root" class="property-dashboard-wrapper"></div>';
    }

    /**
     * Render login message for non-authenticated users
     *
     * @return string
     */
    private static function render_login_message() {
        $login_url = wp_login_url(get_permalink());

        ob_start();
        ?>
        <div class="property-dashboard-message">
            <div class="notice notice-warning">
                <p>
                    <strong><?php _e('Acceso Restringido', 'property-dashboard'); ?></strong>
                </p>
                <p>
                    <?php _e('Debes iniciar sesión para acceder al dashboard de propiedades.', 'property-dashboard'); ?>
                </p>
                <p>
                    <a href="<?php echo esc_url($login_url); ?>" class="button button-primary">
                        <?php _e('Iniciar Sesión', 'property-dashboard'); ?>
                    </a>
                </p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render no permission message
     *
     * @return string
     */
    private static function render_no_permission_message() {
        ob_start();
        ?>
        <div class="property-dashboard-message">
            <div class="notice notice-error">
                <p>
                    <strong><?php _e('Sin Permisos', 'property-dashboard'); ?></strong>
                </p>
                <p>
                    <?php _e('No tienes permisos para acceder al dashboard de propiedades.', 'property-dashboard'); ?>
                </p>
                <p>
                    <?php _e('Por favor, contacta al administrador si crees que esto es un error.', 'property-dashboard'); ?>
                </p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}
