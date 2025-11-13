<?php
/**
 * Property Template Handler
 *
 * Handles fullscreen mode for the property dashboard
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Template {

    /**
     * Initialize template handling
     */
    public static function init() {
        // Load the custom fullscreen template when needed
        add_filter('template_include', [self::class, 'load_template'], 99);

        // Add body class for fullscreen pages
        add_filter('body_class', [self::class, 'add_body_class']);
    }

    /**
     * Load custom template file for fullscreen mode
     *
     * @param string $template Current template path
     * @return string Modified template path
     */
    public static function load_template($template) {
        global $post;

        // Check if this is a page
        if (!is_page() || !$post) {
            return $template;
        }

        // Check if page content has fullscreen shortcode
        if (self::has_fullscreen_shortcode($post->post_content)) {
            $plugin_template = PROPERTY_MANAGER_PATH . 'templates/page-template-dashboard.php';

            if (file_exists($plugin_template)) {
                return $plugin_template;
            }
        }

        return $template;
    }

    /**
     * Check if content has property_dashboard shortcode
     * Always returns true if shortcode is present (fullscreen is always active)
     *
     * @param string $content Post content
     * @return bool
     */
    private static function has_fullscreen_shortcode($content) {
        // Simply check if the property_dashboard shortcode exists
        return has_shortcode($content, 'property_dashboard');
    }

    /**
     * Add body class for fullscreen pages
     *
     * @param array $classes Existing body classes
     * @return array Modified body classes
     */
    public static function add_body_class($classes) {
        global $post;

        if (is_page() && $post) {
            // Add class if content has fullscreen shortcode
            if (self::has_fullscreen_shortcode($post->post_content)) {
                $classes[] = 'property-dashboard-fullscreen';
                $classes[] = 'no-header';
                $classes[] = 'no-footer';
            }
        }

        return $classes;
    }

    /**
     * Check if current page is fullscreen
     *
     * @return bool
     */
    public static function is_fullscreen() {
        global $post;

        if (!is_page() || !$post) {
            return false;
        }

        return self::has_fullscreen_shortcode($post->post_content);
    }
}
