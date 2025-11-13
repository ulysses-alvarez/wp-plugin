<?php
/**
 * Change User Role Script
 *
 * Allows changing a user's role to test functionality
 *
 * USAGE:
 * 1. Upload to: wp-content/plugins/property-manager/
 * 2. Visit: https://yoursite.com/wp-content/plugins/property-manager/change-user-role.php
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

$message = '';
$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['user_id']) && isset($_POST['new_role'])) {
    check_admin_referer('change_role_action', 'change_role_nonce');

    $user_id = intval($_POST['user_id']);
    $new_role = sanitize_text_field($_POST['new_role']);

    $user = get_user_by('id', $user_id);

    if (!$user) {
        $error = 'User not found';
    } else {
        $allowed_roles = ['property_admin', 'property_manager', 'property_associate'];

        if (!in_array($new_role, $allowed_roles)) {
            $error = 'Invalid role';
        } else {
            // Remove all current roles
            $user->set_role($new_role);
            $message = "✅ Successfully changed {$user->display_name}'s role to {$new_role}";
        }
    }
}

// Get all users
$all_users = get_users([
    'orderby' => 'display_name',
    'order' => 'ASC'
]);

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Change User Role</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #0073aa; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f9f9f9;
            font-weight: 600;
        }
        .role-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 600;
        }
        .role-property_admin { background: #e74c3c; color: white; }
        .role-property_manager { background: #3498db; color: white; }
        .role-property_associate { background: #2ecc71; color: white; }
        .role-administrator { background: #9b59b6; color: white; }
        .role-other { background: #95a5a6; color: white; }
        select, button {
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-size: 14px;
        }
        button {
            background: #0073aa;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 600;
        }
        button:hover {
            background: #005a87;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #dc3545;
        }
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
    <div class="container">
        <h1>👤 Change User Role</h1>

        <?php if ($message): ?>
            <div class="success"><?php echo $message; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="error">❌ Error: <?php echo $error; ?></div>
        <?php endif; ?>

        <div class="info">
            <strong>ℹ️ Instructions:</strong><br>
            Use this tool to change a user's role to test functionality.
            Recommended: Create a test user and change to "Asociado" to test editing permissions.
        </div>

        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Change To</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($all_users as $user): ?>
                    <?php
                    $roles = $user->roles;
                    $current_role = !empty($roles) ? $roles[0] : 'none';
                    $role_labels = [
                        'property_admin' => 'Admin',
                        'property_manager' => 'Gerente',
                        'property_associate' => 'Asociado',
                        'administrator' => 'Administrator'
                    ];
                    $role_label = isset($role_labels[$current_role]) ? $role_labels[$current_role] : $current_role;

                    // Determine badge class
                    $badge_class = 'role-' . (in_array($current_role, array_keys($role_labels)) ? $current_role : 'other');
                    ?>
                    <tr>
                        <td><strong><?php echo esc_html($user->display_name); ?></strong></td>
                        <td><?php echo esc_html($user->user_email); ?></td>
                        <td>
                            <span class="role-badge <?php echo $badge_class; ?>">
                                <?php echo esc_html($role_label); ?>
                            </span>
                        </td>
                        <td>
                            <form method="post" style="display: inline;">
                                <?php wp_nonce_field('change_role_action', 'change_role_nonce'); ?>
                                <input type="hidden" name="user_id" value="<?php echo $user->ID; ?>">
                                <select name="new_role">
                                    <option value="property_admin" <?php selected($current_role, 'property_admin'); ?>>Admin</option>
                                    <option value="property_manager" <?php selected($current_role, 'property_manager'); ?>>Gerente</option>
                                    <option value="property_associate" <?php selected($current_role, 'property_associate'); ?>>Asociado</option>
                                </select>
                        </td>
                        <td>
                                <button type="submit">Change</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div class="warning">
            <strong>⚠️ Recommendations:</strong>
            <ul>
                <li>Don't change your own admin account - you might lose access!</li>
                <li>Create a test user first (e.g., "Test Asociado")</li>
                <li>Change the test user to "Asociado" role</li>
                <li>Login with that user to test functionality</li>
            </ul>
        </div>

        <div class="warning">
            <strong>⚠️ Security:</strong> Delete this file after use!
        </div>
    </div>
</body>
</html>
