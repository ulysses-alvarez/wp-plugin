<?php
/**
 * Diagnostic Script for Role Selector Issue
 *
 * Usage: Access this file directly in your browser:
 * https://your-site.com/wp-content/plugins/property-manager/diagnose-role-selector.php
 *
 * This will show you exactly why the role selector is not appearing.
 */

// Load WordPress
require_once('../../../wp-load.php');

// Check if user is logged in
if (!is_user_logged_in()) {
    wp_die('You must be logged in to run this diagnostic.');
}

$current_user = wp_get_current_user();

?>
<!DOCTYPE html>
<html>
<head>
    <title>Role Selector Diagnostic</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            background: #f0f0f1;
        }
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1d2327;
            border-bottom: 3px solid #2271b1;
            padding-bottom: 10px;
        }
        h2 {
            color: #2271b1;
            margin-top: 0;
        }
        .ok {
            color: #00a32a;
            font-weight: bold;
        }
        .warning {
            color: #dba617;
            font-weight: bold;
        }
        .error {
            color: #d63638;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f6f7f7;
            font-weight: 600;
        }
        .code {
            background: #f6f7f7;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
            overflow-x: auto;
            margin: 10px 0;
        }
        .capability-yes {
            color: #00a32a;
        }
        .capability-no {
            color: #d63638;
        }
    </style>
</head>
<body>
    <h1>🔍 Role Selector Diagnostic Report</h1>

    <!-- Current User Info -->
    <div class="section">
        <h2>1. Current User Information</h2>
        <table>
            <tr>
                <th>Property</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Username</td>
                <td><?php echo esc_html($current_user->user_login); ?></td>
            </tr>
            <tr>
                <td>Display Name</td>
                <td><?php echo esc_html($current_user->display_name); ?></td>
            </tr>
            <tr>
                <td>User ID</td>
                <td><?php echo esc_html($current_user->ID); ?></td>
            </tr>
            <tr>
                <td>Current Role(s)</td>
                <td><strong><?php echo esc_html(implode(', ', $current_user->roles)); ?></strong></td>
            </tr>
        </table>
    </div>

    <!-- User Capabilities -->
    <div class="section">
        <h2>2. User Management Capabilities</h2>
        <p>These capabilities are required to see and use the role selector:</p>
        <table>
            <tr>
                <th>Capability</th>
                <th>Status</th>
            </tr>
            <?php
            $required_caps = [
                'create_users' => 'Create new users',
                'edit_users' => 'Edit existing users',
                'list_users' => 'List users',
                'promote_users' => 'Change user roles (CRITICAL)',
                'delete_users' => 'Delete users',
            ];

            foreach ($required_caps as $cap => $description) {
                $has_cap = current_user_can($cap);
                $status_class = $has_cap ? 'capability-yes' : 'capability-no';
                $status_text = $has_cap ? '✓ YES' : '✗ NO';

                echo '<tr>';
                echo '<td>' . esc_html($cap) . '<br><small>' . esc_html($description) . '</small></td>';
                echo '<td class="' . $status_class . '">' . $status_text . '</td>';
                echo '</tr>';
            }
            ?>
        </table>

        <?php if (!current_user_can('promote_users')): ?>
        <div class="code error">
            ❌ CRITICAL ISSUE: You don't have 'promote_users' capability!
            <br><br>
            <strong>This is why the role selector is hidden.</strong>
            <br><br>
            WordPress REQUIRES 'promote_users' capability to show the role selector.
            <br>
            Without it, the &lt;select&gt; element for roles is never rendered in the HTML.
        </div>
        <?php endif; ?>
    </div>

    <!-- All Available Roles -->
    <div class="section">
        <h2>3. All Available Roles in WordPress</h2>
        <table>
            <tr>
                <th>Role Key</th>
                <th>Display Name</th>
                <th>User Count</th>
            </tr>
            <?php
            $wp_roles = wp_roles();
            $all_roles = $wp_roles->roles;
            $user_count = count_users();

            foreach ($all_roles as $role_key => $role_data) {
                $count = isset($user_count['avail_roles'][$role_key]) ? $user_count['avail_roles'][$role_key] : 0;
                echo '<tr>';
                echo '<td><code>' . esc_html($role_key) . '</code></td>';
                echo '<td>' . esc_html($role_data['name']) . '</td>';
                echo '<td>' . esc_html($count) . '</td>';
                echo '</tr>';
            }
            ?>
        </table>
    </div>

    <!-- editable_roles Filter Test -->
    <div class="section">
        <h2>4. editable_roles Filter Test</h2>
        <p>This shows what roles are visible after applying the 'editable_roles' filter:</p>
        <?php
        $wp_roles = wp_roles();
        $all_roles = $wp_roles->roles;
        $editable_roles = apply_filters('editable_roles', $all_roles);
        ?>

        <h3>Before Filter (All Roles):</h3>
        <div class="code">
            <?php echo esc_html(implode(', ', array_keys($all_roles))); ?>
        </div>

        <h3>After Filter (Editable Roles):</h3>
        <div class="code">
            <?php
            if (empty($editable_roles)) {
                echo '<span class="error">⚠️ EMPTY! No roles are visible.</span>';
            } else {
                echo esc_html(implode(', ', array_keys($editable_roles)));
            }
            ?>
        </div>

        <?php if (count($editable_roles) < count($all_roles)): ?>
        <p class="warning">
            ⚠️ The filter is hiding <?php echo (count($all_roles) - count($editable_roles)); ?> role(s).
        </p>
        <?php endif; ?>
    </div>

    <!-- Active Filters on editable_roles -->
    <div class="section">
        <h2>5. Active Filters on 'editable_roles'</h2>
        <?php
        global $wp_filter;

        if (isset($wp_filter['editable_roles'])) {
            echo '<p>These filters are modifying which roles you can see:</p>';
            echo '<table>';
            echo '<tr><th>Priority</th><th>Function</th></tr>';

            foreach ($wp_filter['editable_roles']->callbacks as $priority => $callbacks) {
                foreach ($callbacks as $callback) {
                    $function_name = 'Unknown';

                    if (is_string($callback['function'])) {
                        $function_name = $callback['function'];
                    } elseif (is_array($callback['function'])) {
                        if (is_object($callback['function'][0])) {
                            $function_name = get_class($callback['function'][0]) . '::' . $callback['function'][1];
                        } else {
                            $function_name = $callback['function'][0] . '::' . $callback['function'][1];
                        }
                    }

                    echo '<tr>';
                    echo '<td>' . esc_html($priority) . '</td>';
                    echo '<td><code>' . esc_html($function_name) . '</code></td>';
                    echo '</tr>';
                }
            }

            echo '</table>';
        } else {
            echo '<p class="ok">✓ No filters found on editable_roles.</p>';
        }
        ?>
    </div>

    <!-- Solution Recommendations -->
    <div class="section">
        <h2>6. Recommended Solutions</h2>

        <?php if (!current_user_can('promote_users')): ?>
        <div class="code error">
            <strong>PRIMARY ISSUE: Missing 'promote_users' capability</strong>
            <br><br>
            <strong>Solution:</strong> Add 'promote_users' capability to the property_admin role.
            <br><br>
            Edit this file: <code>property-manager/includes/class-property-roles.php</code>
            <br><br>
            In the <code>create_property_admin_role()</code> function (around line 53), add:
            <pre style="margin-top: 10px; background: white; padding: 10px;">
// User management capabilities
'list_users'             => true,
'create_users'           => true,
'edit_users'             => true,
'delete_users'           => true,
<strong style="color: #00a32a;">'promote_users'          => true,  // ← ADD THIS LINE</strong>
'manage_dashboard_users' => true,
</pre>
            <br>
            Then run: <code>property-manager/update-roles.php</code> to apply the changes.
        </div>
        <?php else: ?>
        <div class="code ok">
            ✓ You have 'promote_users' capability. The role selector should be visible.
        </div>
        <?php endif; ?>

        <?php if (empty($editable_roles)): ?>
        <div class="code error">
            <strong>SECONDARY ISSUE: editable_roles filter is hiding ALL roles</strong>
            <br><br>
            Check the filters listed in section 5 above.
            <br>
            One of them is returning an empty array.
        </div>
        <?php endif; ?>
    </div>

    <div class="section">
        <h2>7. Quick Test Links</h2>
        <p>After making changes, test these pages:</p>
        <ul>
            <li><a href="<?php echo admin_url('user-new.php'); ?>" target="_blank">Add New User</a></li>
            <li><a href="<?php echo admin_url('users.php'); ?>" target="_blank">All Users</a></li>
            <li><a href="<?php echo admin_url('profile.php'); ?>" target="_blank">Your Profile</a></li>
        </ul>
    </div>

</body>
</html>
