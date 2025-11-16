<?php
/**
 * Property Login Handler
 *
 * Handles custom login page rendering with React
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Login {

    /**
     * Initialize login functionality
     */
    public static function init() {
        // Register shortcode for login page
        add_shortcode('property_login', [__CLASS__, 'render_login_shortcode']);
    }

    /**
     * Render login shortcode
     *
     * Usage: [property_login]
     */
    public static function render_login_shortcode($atts) {
        // If user is already logged in, redirect to dashboard
        if (is_user_logged_in()) {
            wp_redirect(home_url('/dashboard/#/properties'));
            exit;
        }

        $redirect_to = home_url('/dashboard/#/properties');
        $login_error = isset($_GET['login']) && $_GET['login'] === 'failed' ? true : false;

        // Return the login form HTML
        ob_start();
        ?>
        <div style="min-height: 100vh; background: linear-gradient(to bottom right, #f9fafb, #f3f4f6); display: flex; align-items: center; justify-content: center; padding: 1rem;">
            <div style="width: 100%; max-width: 28rem;">
                <!-- Card -->
                <div style="background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 2rem;">
                    <!-- Logo/Title -->
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h1 style="font-size: 1.5rem; font-weight: bold; color: #111827;">Property Manager</h1>
                        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">Sistema de gestión de propiedades</p>
                    </div>

                    <!-- Login Form -->
                    <form method="post" action="<?php echo esc_url(wp_login_url()); ?>" style="margin-bottom: 0;">
                        <input type="hidden" name="redirect_to" value="<?php echo esc_attr($redirect_to); ?>" />

                        <?php if ($login_error): ?>
                        <!-- Error Message -->
                        <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; margin-bottom: 1.25rem;">
                            Usuario o contraseña incorrectos
                        </div>
                        <?php endif; ?>

                        <!-- Username/Email Field -->
                        <div style="margin-bottom: 1.25rem;">
                            <label for="user_login" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem;">
                                Usuario o Correo Electrónico
                            </label>
                            <input
                                type="text"
                                name="log"
                                id="user_login"
                                required
                                autocomplete="username"
                                placeholder="usuario@ejemplo.com"
                                style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; outline: none; transition: all 0.15s;"
                                onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 1px #000';"
                                onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none';"
                            />
                        </div>

                        <!-- Password Field -->
                        <div style="margin-bottom: 1.25rem;">
                            <label for="user_pass" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem;">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="pwd"
                                id="user_pass"
                                required
                                autocomplete="current-password"
                                placeholder="••••••••"
                                style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; outline: none; transition: all 0.15s;"
                                onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 1px #000';"
                                onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none';"
                            />
                        </div>

                        <!-- Remember Me Checkbox -->
                        <div style="display: flex; align-items: center; margin-bottom: 1.25rem;">
                            <input
                                type="checkbox"
                                name="rememberme"
                                id="rememberme"
                                value="forever"
                                style="width: 1rem; height: 1rem; color: #000; border: 1px solid #d1d5db; border-radius: 0.25rem;"
                            />
                            <label for="rememberme" style="margin-left: 0.5rem; font-size: 0.875rem; color: #374151;">
                                Recordarme
                            </label>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            name="wp-submit"
                            style="width: 100%; padding: 0.5rem 1rem; background: #000; color: white; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.15s;"
                            onmouseover="this.style.background='#1f2937';"
                            onmouseout="this.style.background='#000';"
                        >
                            Iniciar Sesión
                        </button>
                    </form>

                    <!-- Divider -->
                    <div style="position: relative; margin: 1.5rem 0;">
                        <div style="position: absolute; inset: 0; display: flex; align-items: center;">
                            <div style="width: 100%; border-top: 1px solid #e5e7eb;"></div>
                        </div>
                        <div style="position: relative; display: flex; justify-content: center; font-size: 0.875rem;">
                            <span style="padding: 0 0.5rem; background: white; color: #6b7280;">O continuar con</span>
                        </div>
                    </div>

                    <!-- Google Login -->
                    <div style="text-align: center;">
                        <?php echo do_shortcode('[nextend_social_login provider="google" style="icon" redirect="' . esc_attr($redirect_to) . '"]'); ?>
                    </div>

                    <!-- Lost Password Link -->
                    <div style="margin-top: 1.5rem; text-align: center;">
                        <a
                            href="<?php echo esc_url(wp_lostpassword_url()); ?>"
                            style="font-size: 0.875rem; color: #000; text-decoration: none; transition: color 0.15s;"
                            onmouseover="this.style.color='#1f2937';"
                            onmouseout="this.style.color='#000';"
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280;">
                    <p>&copy; <?php echo date('Y'); ?> Property Manager. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}
