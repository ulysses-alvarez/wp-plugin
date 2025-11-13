<?php
/**
 * Template Name: Property Dashboard (Fullscreen)
 * Description: Template fullscreen para el dashboard de propiedades sin header, footer ni márgenes
 *
 * @package Property_Manager
 */

if (!defined('ABSPATH')) {
    exit;
}

// Prevent caching
nocache_headers();

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title><?php wp_title('|', true, 'right'); ?> <?php bloginfo('name'); ?></title>

    <?php wp_head(); ?>

    <style>
        /* Reset all margins and padding */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        /* Hide admin bar spacing */
        body.admin-bar {
            margin-top: 0 !important;
        }

        body.admin-bar #wpadminbar {
            position: fixed;
            top: 0;
            z-index: 99999;
        }

        /* Main container takes full viewport */
        .property-dashboard-fullscreen-container {
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: auto;
            background: #ffffff;
        }

        /* Adjust for admin bar if present */
        body.admin-bar .property-dashboard-fullscreen-container {
            height: calc(100vh - 32px);
            top: 32px;
        }

        /* Mobile admin bar adjustment */
        @media screen and (max-width: 782px) {
            body.admin-bar .property-dashboard-fullscreen-container {
                height: calc(100vh - 46px);
                top: 46px;
            }
        }

        /* Ensure the dashboard wrapper fills the container */
        .property-dashboard-wrapper {
            width: 100%;
            height: 100%;
            min-height: 100%;
        }

        #property-dashboard-root {
            width: 100%;
            height: 100%;
        }

        /* Hide common theme elements */
        .site-header,
        .site-footer,
        .site-navigation,
        header.header,
        footer.footer,
        .breadcrumbs,
        .site-branding,
        .navigation,
        #masthead,
        #colophon {
            display: none !important;
        }
    </style>
</head>

<body <?php body_class('property-dashboard-fullscreen-page'); ?>>

<?php wp_body_open(); ?>

<div class="property-dashboard-fullscreen-container">
    <?php
    // Start the Loop
    while (have_posts()) :
        the_post();

        // Check if content has the shortcode
        if (has_shortcode(get_the_content(), 'property_dashboard')) {
            // Render the content (which includes the shortcode)
            the_content();
        } else {
            // If no shortcode found, render it manually
            echo do_shortcode('[property_dashboard]');
        }

    endwhile;
    ?>
</div>

<?php wp_footer(); ?>

</body>
</html>
