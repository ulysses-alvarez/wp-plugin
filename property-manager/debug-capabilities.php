<?php
/**
 * Debug Capabilities Script
 *
 * This script checks the current capabilities of property roles
 *
 * USAGE:
 * 1. Upload to: wp-content/plugins/property-manager/
 * 2. Visit: https://yoursite.com/wp-content/plugins/property-manager/debug-capabilities.php
 * 3. Delete after use for security
 */

// Load WordPress
if (!defined('ABSPATH')) {
    require_once('../../../wp-load.php');
}

// Security check
if (!current_user_can('manage_options')) {
    wp_die('Unauthorized', 'Access Denied', ['response' => 403]);
}

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Debug Capabilities</title>
    <style>
        body {
            font-family: monospace;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .role-section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #0073aa; }
        h2 { color: #333; border-bottom: 2px solid #0073aa; padding-bottom: 5px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
        }
        th {
            background: #0073aa;
            color: white;
        }
        .yes { color: green; font-weight: bold; }
        .no { color: red; font-weight: bold; }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>🔍 Property Manager - Capabilities Debug</h1>

    <div class="info">
        <strong>Current User:</strong> <?php echo wp_get_current_user()->display_name; ?><br>
        <strong>Current Role:</strong> <?php echo implode(', ', wp_get_current_user()->roles); ?><br>
        <strong>Roles Version:</strong> <?php echo get_option('property_manager_roles_version', 'Not set'); ?>
    </div>

    <?php
    $roles_to_check = [
        'property_admin' => 'Admin',
        'property_manager' => 'Gerente',
        'property_associate' => 'Asociado'
    ];

    $important_caps = [
        'read',
        'edit_posts',
        'edit_others_posts',
        'delete_posts',
        'upload_files',
        'view_properties',
        'view_all_properties',
        'create_properties',
        'edit_properties',
        'edit_others_properties',
        'delete_properties',
        'delete_others_properties',
        'assign_properties',
        'manage_dashboard_users',
        'manage_property_roles',
        'export_properties',
        'view_statistics',
        'view_team_statistics',
        'view_own_statistics',
    ];

    foreach ($roles_to_check as $role_slug => $role_name) {
        $role = get_role($role_slug);

        if (!$role) {
            echo "<div class='warning'><strong>⚠️ Role '{$role_name}' ({$role_slug}) does NOT exist!</strong></div>";
            continue;
        }

        echo "<div class='role-section'>";
        echo "<h2>{$role_name} ({$role_slug})</h2>";

        echo "<table>";
        echo "<tr><th>Capability</th><th>Has Permission</th></tr>";

        foreach ($important_caps as $cap) {
            $has_cap = isset($role->capabilities[$cap]) && $role->capabilities[$cap];
            $status = $has_cap ? '<span class="yes">✓ YES</span>' : '<span class="no">✗ NO</span>';
            echo "<tr><td>{$cap}</td><td>{$status}</td></tr>";
        }

        echo "</table>";
        echo "</div>";
    }
    ?>

    <div class="role-section">
        <h2>Test with Current Logged User</h2>
        <?php
        $current_user = wp_get_current_user();
        $test_caps = [
            'edit_properties',
            'edit_others_properties',
            'view_all_properties',
            'manage_dashboard_users'
        ];

        echo "<table>";
        echo "<tr><th>Capability</th><th>Can User Do This?</th></tr>";
        foreach ($test_caps as $cap) {
            $can = current_user_can($cap);
            $status = $can ? '<span class="yes">✓ YES</span>' : '<span class="no">✗ NO</span>';
            echo "<tr><td>{$cap}</td><td>{$status}</td></tr>";
        }
        echo "</table>";
        ?>
    </div>

    <div class="role-section">
        <h2>Property Edit Test (Asociado)</h2>
        <?php
        // Get a sample property
        $properties = get_posts([
            'post_type' => 'property',
            'posts_per_page' => 1,
            'orderby' => 'date',
            'order' => 'DESC'
        ]);

        if (!empty($properties)) {
            $property = $properties[0];
            $property_id = $property->ID;
            $author_id = $property->post_author;

            echo "<p><strong>Test Property:</strong> {$property->post_title} (ID: {$property_id})</p>";
            echo "<p><strong>Property Author:</strong> " . get_user_by('id', $author_id)->display_name . " (ID: {$author_id})</p>";

            // Load the Property_Roles class
            require_once(dirname(__FILE__) . '/includes/class-property-roles.php');

            echo "<table>";
            echo "<tr><th>User</th><th>Can Edit?</th></tr>";

            // Check for Asociado users
            $asociados = get_users(['role' => 'property_associate']);

            if (empty($asociados)) {
                echo "<tr><td colspan='2'><span class='warning'>No Asociado users found</span></td></tr>";
            } else {
                foreach ($asociados as $asociado) {
                    $can_edit = Property_Roles::can_edit_property($asociado->ID, $property_id);
                    $is_author = ($asociado->ID == $author_id);
                    $status = $can_edit ? '<span class="yes">✓ CAN EDIT</span>' : '<span class="no">✗ CANNOT EDIT</span>';
                    $author_label = $is_author ? ' <strong>(IS AUTHOR)</strong>' : '';

                    echo "<tr>";
                    echo "<td>{$asociado->display_name} (ID: {$asociado->ID}){$author_label}</td>";
                    echo "<td>{$status}</td>";
                    echo "</tr>";

                    // Debug info
                    if ($is_author && !$can_edit) {
                        echo "<tr><td colspan='2' style='background:#fff3cd;'>";
                        echo "<strong>🐛 DEBUG:</strong><br>";
                        echo "User has 'edit_properties' cap: " . (user_can($asociado->ID, 'edit_properties') ? 'YES' : 'NO') . "<br>";
                        echo "User has 'edit_others_properties' cap: " . (user_can($asociado->ID, 'edit_others_properties') ? 'YES' : 'NO') . "<br>";
                        echo "Property author_id: {$author_id}<br>";
                        echo "Asociado user_id: {$asociado->ID}<br>";
                        echo "Are they equal? " . ($author_id == $asociado->ID ? 'YES' : 'NO');
                        echo "</td></tr>";
                    }
                }
            }
            echo "</table>";
        } else {
            echo "<p><em>No properties found in database</em></p>";
        }
        ?>
    </div>

    <div class="warning">
        <strong>⚠️ Security:</strong> Delete this file after use!
    </div>
</body>
</html>
