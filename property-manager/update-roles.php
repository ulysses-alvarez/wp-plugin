<?php
/**
 * Manual Role Update Script
 *
 * This file can be executed directly to force update roles without deactivating the plugin.
 *
 * USAGE:
 * 1. Upload this file to: wp-content/plugins/property-manager/
 * 2. Visit: https://yoursite.com/wp-content/plugins/property-manager/update-roles.php
 * 3. After successful update, delete this file for security
 *
 * IMPORTANT: Delete this file after use!
 */

// Security: Only allow execution if WordPress is loaded
if (!defined('ABSPATH')) {
    // Load WordPress
    require_once('../../../wp-load.php');
}

// Security: Only allow administrators
if (!current_user_can('manage_options')) {
    wp_die('Unauthorized. You must be an administrator to access this page.', 'Access Denied', ['response' => 403]);
}

// Load required files
require_once(dirname(__FILE__) . '/includes/class-property-roles.php');

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Manager - Update Roles</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #0073aa;
            margin-bottom: 20px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #17a2b8;
        }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .button {
            background: #0073aa;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            margin-top: 10px;
        }
        .button:hover {
            background: #005a87;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
        ul {
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Property Manager - Role Update</h1>

        <?php
        // Check if update was requested
        if (isset($_GET['action']) && $_GET['action'] === 'update' && check_admin_referer('update_roles_nonce')) {
            // Force update roles
            Property_Roles::register_roles();
            update_option('property_manager_roles_version', '1.0.1');

            echo '<div class="success">';
            echo '<strong>✅ Success!</strong> Roles have been updated successfully.';
            echo '<ul>';
            echo '<li><strong>property_admin</strong> (Admin) - Updated</li>';
            echo '<li><strong>property_manager</strong> (Gerente) - Updated</li>';
            echo '<li><strong>property_associate</strong> (Asociado) - Updated</li>';
            echo '</ul>';
            echo '<p>All capabilities have been refreshed. The following issues should now be fixed:</p>';
            echo '<ul>';
            echo '<li>✅ Role selector should appear when creating users</li>';
            echo '<li>✅ Asociado can now edit their own properties</li>';
            echo '<li>✅ Admin can see their profile in WordPress users list</li>';
            echo '</ul>';
            echo '</div>';

            echo '<div class="warning">';
            echo '<strong>⚠️ Important Security Notice:</strong><br>';
            echo 'Please delete this file (<code>update-roles.php</code>) from your server immediately for security reasons.';
            echo '</div>';

            echo '<a href="' . admin_url() . '" class="button">Go to WordPress Admin</a>';

        } else {
            // Show update form
            echo '<div class="info">';
            echo '<strong>ℹ️ About This Tool</strong><br>';
            echo 'This script will force update all Property Manager custom roles and their capabilities without needing to deactivate/reactivate the plugin.';
            echo '</div>';

            echo '<h2>What will be updated?</h2>';
            echo '<ul>';
            echo '<li><strong>property_admin</strong> (Admin) - Can manage properties, users, and settings</li>';
            echo '<li><strong>property_manager</strong> (Gerente) - Can create/edit properties but not delete</li>';
            echo '<li><strong>property_associate</strong> (Asociado) - Can create and edit their own properties only</li>';
            echo '</ul>';

            echo '<h2>Issues this will fix:</h2>';
            echo '<ul>';
            echo '<li>✅ Missing role selector when creating new users</li>';
            echo '<li>✅ Asociado not able to edit their own properties</li>';
            echo '<li>✅ Admin not seeing their own profile in users list</li>';
            echo '</ul>';

            echo '<div class="warning">';
            echo '<strong>⚠️ Before proceeding:</strong><br>';
            echo 'Make sure you have a recent backup of your database. This operation is safe but it\'s always good practice.';
            echo '</div>';

            $nonce_url = wp_nonce_url(add_query_arg('action', 'update'), 'update_roles_nonce');
            echo '<a href="' . $nonce_url . '" class="button">Update Roles Now</a>';
        }
        ?>
    </div>
</body>
</html>
