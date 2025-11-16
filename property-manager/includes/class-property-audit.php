<?php
/**
 * Property Audit System
 *
 * Tracks who created and last modified each property
 * Reutiliza campos existentes de WordPress y del plugin
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Audit {

    /**
     * Initialize the audit system
     */
    public static function init() {
        // Hook para guardar auditoría al crear/actualizar
        add_action('save_post_property', [__CLASS__, 'save_audit_trail'], 10, 3);

        // Metabox en admin de WP
        add_action('add_meta_boxes', [__CLASS__, 'add_audit_metabox']);
    }

    /**
     * Guardar información de auditoría al crear/editar propiedad
     *
     * @param int     $post_id Post ID
     * @param WP_Post $post    Post object
     * @param bool    $update  Whether this is an update
     */
    public static function save_audit_trail($post_id, $post, $update) {
        // No guardar en autoguardado
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Verificar permisos
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Verificar que sea una propiedad
        if ($post->post_type !== 'property') {
            return;
        }

        $user_id = get_current_user_id();

        // Actualizar "quién modificó por última vez"
        update_post_meta($post_id, '_property_last_modified_by', $user_id);

        // NOTA: La fecha ya se actualiza automáticamente con _property_last_dashboard_update
        // por el código existente del plugin
    }

    /**
     * Agregar metabox de auditoría en admin de WP
     */
    public static function add_audit_metabox() {
        add_meta_box(
            'property_audit_metabox',
            __('Auditoría', 'property-dashboard'),
            [__CLASS__, 'render_audit_metabox'],
            'property',
            'side',
            'default'
        );
    }

    /**
     * Renderizar metabox de auditoría
     *
     * @param WP_Post $post Post object
     */
    public static function render_audit_metabox($post) {
        // Obtener datos de auditoría
        $created_by_id = $post->post_author;
        $created_date = $post->post_date;
        $modified_by_id = get_post_meta($post->ID, '_property_last_modified_by', true);
        $modified_date = get_post_meta($post->ID, '_property_last_dashboard_update', true);

        $created_by = get_user_by('id', $created_by_id);
        $modified_by = $modified_by_id ? get_user_by('id', $modified_by_id) : null;

        ?>
        <div class="property-audit-info">
            <p>
                <strong><?php _e('Creado por:', 'property-dashboard'); ?></strong><br>
                <?php echo $created_by ? esc_html($created_by->display_name) : __('N/A', 'property-dashboard'); ?><br>
                <small><?php echo $created_date ? date_i18n('d/m/Y H:i', strtotime($created_date)) : __('N/A', 'property-dashboard'); ?></small>
            </p>
            <hr style="margin: 10px 0;">
            <?php if ($modified_by_id): ?>
            <p>
                <strong><?php _e('Modificado por:', 'property-dashboard'); ?></strong><br>
                <?php echo $modified_by ? esc_html($modified_by->display_name) : __('N/A', 'property-dashboard'); ?><br>
                <small><?php echo $modified_date ? date_i18n('d/m/Y H:i', strtotime($modified_date)) : __('N/A', 'property-dashboard'); ?></small>
            </p>
            <?php else: ?>
            <p>
                <em><?php _e('Sin modificaciones desde el dashboard', 'property-dashboard'); ?></em>
            </p>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Obtener información de auditoría para API REST
     *
     * @param int $property_id Property ID
     * @return array Audit information
     */
    public static function get_audit_info($property_id) {
        $post = get_post($property_id);

        if (!$post) {
            return null;
        }

        $created_by_id = $post->post_author;
        $created_date = $post->post_date;
        $modified_by_id = get_post_meta($property_id, '_property_last_modified_by', true);
        $modified_date = get_post_meta($property_id, '_property_last_dashboard_update', true);

        $created_by = get_user_by('id', $created_by_id);
        $modified_by = $modified_by_id ? get_user_by('id', $modified_by_id) : null;

        return [
            'created_by' => [
                'id' => $created_by_id,
                'name' => $created_by ? $created_by->display_name : null,
                'email' => $created_by ? $created_by->user_email : null,
            ],
            'created_date' => $created_date,
            'modified_by' => [
                'id' => $modified_by_id ? (int) $modified_by_id : null,
                'name' => $modified_by ? $modified_by->display_name : null,
                'email' => $modified_by ? $modified_by->user_email : null,
            ],
            'modified_date' => $modified_date,
        ];
    }
}
