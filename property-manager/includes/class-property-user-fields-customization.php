<?php
/**
 * Property User Fields Customization
 *
 * Customizes user creation and editing forms in WordPress admin for property_admin role
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_User_Fields_Customization {

    /**
     * Initialize customizations
     */
    public static function init() {
        // Only apply to property_admin role
        if (!self::is_property_admin()) {
            return;
        }

        // Customize new user form
        add_action('user_new_form', [__CLASS__, 'customize_new_user_form'], 10, 1);

        // Customize edit user form
        add_action('show_user_profile', [__CLASS__, 'customize_edit_user_form'], 1);
        add_action('edit_user_profile', [__CLASS__, 'customize_edit_user_form'], 1);

        // Make email readonly
        add_action('admin_footer-user-edit.php', [__CLASS__, 'make_email_readonly']);
        add_action('admin_footer-profile.php', [__CLASS__, 'make_email_readonly']);

        // Auto-set username as email when creating user
        add_filter('pre_user_login', [__CLASS__, 'auto_set_username_from_email']);

        // Set send_user_notification to false by default
        add_action('user_new_form', [__CLASS__, 'set_default_notification'], 999);
    }

    /**
     * Check if current user is property_admin
     *
     * @return bool
     */
    private static function is_property_admin() {
        $current_user = wp_get_current_user();
        return in_array('property_admin', $current_user->roles);
    }

    /**
     * Customize new user form
     * Hide: Website, Language, Send notification checkbox, Username field (auto-filled from email)
     *
     * @param string $type 'add-new-user' or 'add-existing-user'
     */
    public static function customize_new_user_form($type) {
        if ($type !== 'add-new-user') {
            return;
        }
        ?>
        <style>
            /* Hide Username field (will be auto-filled with email) */
            #createuser .form-field.form-required.user-login-wrap {
                display: none !important;
            }

            /* Hide Website field */
            #createuser .form-field.user-url-wrap {
                display: none !important;
            }

            /* Hide Language field */
            #createuser .form-field.user-language-wrap {
                display: none !important;
            }
        </style>

        <script>
        jQuery(document).ready(function($) {
            // Auto-fill username from email
            $('#email').on('input', function() {
                var email = $(this).val();
                $('#user_login').val(email);
            });

            // Set send_user_notification to false by default (but keep it visible)
            $('#send_user_notification').prop('checked', false);
        });
        </script>
        <?php
    }

    /**
     * Customize edit user form
     * Hide: Admin Color Scheme, Keyboard Shortcuts, Toolbar, Language,
     *       Display name publicly, Nickname, Website, Biographical Info, Profile Picture
     * Hide section headers: Personal Options, Name, Contact Info, About Yourself
     *
     * @param WP_User $user
     */
    public static function customize_edit_user_form($user) {
        ?>
        <style>
            /* Hide Personal Options section fields */
            #your-profile .user-admin-color-wrap,
            #your-profile .user-comment-shortcuts-wrap,
            #your-profile .show-admin-bar,
            #your-profile .user-language-wrap {
                display: none !important;
            }

            /* Hide Name section fields */
            #your-profile .user-display-name-wrap,
            #your-profile .user-nickname-wrap {
                display: none !important;
            }

            /* Hide Contact Info section fields */
            #your-profile .user-url-wrap {
                display: none !important;
            }

            /* Hide About Yourself section */
            #your-profile .user-description-wrap,
            #your-profile .user-profile-picture {
                display: none !important;
            }
        </style>

        <script>
        jQuery(document).ready(function($) {
            // Set toolbar to false by default
            $('input[name="admin_bar_front"]').prop('checked', false);

            // Hide section headers (h2/h3) that we don't want to show
            // Note: Individual fields are hidden via CSS for better performance
            var headersToHide = ['opciones', 'personales', 'nombre', 'contacto',
                                 'acerca', 'personal', 'información', 'informacion'];

            $('#your-profile h2, #your-profile h3').each(function() {
                var text = $(this).text().toLowerCase();
                if (headersToHide.some(function(keyword) { return text.includes(keyword); })) {
                    $(this).hide();
                }
            });
        });
        </script>
        <?php
    }

    /**
     * Make email field readonly
     */
    public static function make_email_readonly() {
        ?>
        <style>
            #email {
                background-color: #f0f0f1;
                cursor: not-allowed;
            }
        </style>

        <script>
        jQuery(document).ready(function($) {
            // Make email field readonly
            $('#email').prop('readonly', true).attr('readonly', 'readonly');

            // Add visual indicator
            $('#email').closest('tr').find('th label').append(' <span style="color: #646970; font-weight: normal;">(solo lectura)</span>');
        });
        </script>
        <?php
    }

    /**
     * Auto-set username from email when creating user
     *
     * @param string $user_login
     * @return string
     */
    public static function auto_set_username_from_email($user_login) {
        // Only apply when creating new user
        if (!isset($_POST['action']) || $_POST['action'] !== 'createuser') {
            return $user_login;
        }

        // If email is provided, use it as username
        if (isset($_POST['email']) && !empty($_POST['email'])) {
            return sanitize_email($_POST['email']);
        }

        return $user_login;
    }

    /**
     * Set send_user_notification to false by default
     *
     * @param string $type
     */
    public static function set_default_notification($type) {
        if ($type !== 'add-new-user') {
            return;
        }

        // Add hidden input to force send_user_notification to false
        echo '<input type="hidden" name="send_user_notification_forced" value="0">';
    }
}
