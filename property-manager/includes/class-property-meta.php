<?php
/**
 * Property Meta Fields
 *
 * Registers all custom meta fields for the property post type
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_Meta {

    /**
     * Allowed property statuses
     */
    const ALLOWED_STATUSES = ['available', 'sold', 'rented', 'reserved'];

    /**
     * Initialize meta boxes
     */
    public static function init() {
        // Add meta boxes to property edit screen
        add_action('add_meta_boxes', [self::class, 'add_meta_boxes']);

        // Save meta data when property is saved
        add_action('save_post_property', [self::class, 'save_meta_boxes'], 10, 2);

        // Enqueue admin assets (scripts and styles)
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_admin_assets']);
    }

    /**
     * Enqueue admin assets for property edit screens
     */
    public static function enqueue_admin_assets($hook) {
        global $post_type;

        // Only load on property edit/new screens
        if (('post.php' === $hook || 'post-new.php' === $hook) && 'property' === $post_type) {
            wp_enqueue_media();

            // Enqueue admin CSS
            wp_enqueue_style(
                'property-admin-styles',
                plugin_dir_url(dirname(__FILE__)) . 'assets/property-admin.css',
                [],
                filemtime(plugin_dir_path(dirname(__FILE__)) . 'assets/property-admin.css')
            );
        }
    }

    /**
     * Register all meta fields
     */
    public static function register_fields() {
        // Status (available, sold, rented, reserved)
        register_post_meta('property', '_property_status', [
            'type'              => 'string',
            'description'       => __('Estado de la propiedad', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'default'           => 'available',
            'sanitize_callback' => [self::class, 'sanitize_status'],
        ]);

        // State (Estado de la República)
        register_post_meta('property', '_property_state', [
            'type'              => 'string',
            'description'       => __('Estado de la República', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'sanitize_text_field',
        ]);

        // Municipality (Municipio)
        register_post_meta('property', '_property_municipality', [
            'type'              => 'string',
            'description'       => __('Municipio', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'sanitize_text_field',
        ]);

        // Neighborhood (Colonia)
        register_post_meta('property', '_property_neighborhood', [
            'type'              => 'string',
            'description'       => __('Colonia', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'sanitize_text_field',
        ]);

        // Postal Code (Código Postal)
        register_post_meta('property', '_property_postal_code', [
            'type'              => 'string',
            'description'       => __('Código Postal', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => [self::class, 'sanitize_postal_code'],
        ]);

        // Street (Calle)
        register_post_meta('property', '_property_street', [
            'type'              => 'string',
            'description'       => __('Calle', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'sanitize_text_field',
        ]);

        // Patent (Patente - número único)
        register_post_meta('property', '_property_patent', [
            'type'              => 'string',
            'description'       => __('Patente', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => [self::class, 'sanitize_patent'],
        ]);

        // Price (Precio en MXN)
        register_post_meta('property', '_property_price', [
            'type'              => 'number',
            'description'       => __('Precio', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => [self::class, 'sanitize_price'],
        ]);

        // Google Maps URL
        register_post_meta('property', '_property_google_maps_url', [
            'type'              => 'string',
            'description'       => __('URL de Google Maps', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => [self::class, 'sanitize_url'],
        ]);

        // Attachment ID (Ficha técnica PDF)
        register_post_meta('property', '_property_attachment_id', [
            'type'              => 'integer',
            'description'       => __('ID de ficha técnica', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => [self::class, 'sanitize_attachment_id'],
        ]);
    }

    /**
     * Sanitize status field
     *
     * @param string $value
     * @return string
     */
    public static function sanitize_status($value) {
        return in_array($value, self::ALLOWED_STATUSES, true) ? $value : 'available';
    }

    /**
     * Sanitize postal code (5 digits)
     *
     * @param string $value
     * @return string
     */
    public static function sanitize_postal_code($value) {
        // Remove all non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $value);

        // Ensure exactly 5 digits
        return substr($cleaned, 0, 5);
    }

    /**
     * Sanitize price field
     *
     * @param mixed $value
     * @return float
     */
    public static function sanitize_price($value) {
        return floatval($value);
    }

    /**
     * Sanitize patent field (always uppercase)
     *
     * @param string $value
     * @return string
     */
    public static function sanitize_patent($value) {
        // Sanitize and convert to uppercase
        return strtoupper(sanitize_text_field($value));
    }

    /**
     * Sanitize URL field
     *
     * @param string $value
     * @return string
     */
    public static function sanitize_url($value) {
        return esc_url_raw($value);
    }

    /**
     * Sanitize attachment ID
     *
     * @param mixed $value
     * @return int
     */
    public static function sanitize_attachment_id($value) {
        return absint($value);
    }

    /**
     * Add meta boxes to property edit screen
     */
    public static function add_meta_boxes() {
        add_meta_box(
            'property_details',
            __('Detalles de la Propiedad', 'property-dashboard'),
            [self::class, 'render_details_meta_box'],
            'property',
            'normal',
            'high'
        );

        add_meta_box(
            'property_location',
            __('Ubicación', 'property-dashboard'),
            [self::class, 'render_location_meta_box'],
            'property',
            'normal',
            'high'
        );

        add_meta_box(
            'property_last_update',
            __('Información de Actualización', 'property-dashboard'),
            [self::class, 'render_last_update_meta_box'],
            'property',
            'side',
            'default'
        );
    }

    /**
     * Render property details meta box
     */
    public static function render_details_meta_box($post) {
        // Add nonce for security
        wp_nonce_field('property_meta_box', 'property_meta_box_nonce');

        // Get current values
        $status = get_post_meta($post->ID, '_property_status', true) ?: 'available';
        $patent = get_post_meta($post->ID, '_property_patent', true);
        $price = get_post_meta($post->ID, '_property_price', true);
        $google_maps_url = get_post_meta($post->ID, '_property_google_maps_url', true);
        $attachment_id = get_post_meta($post->ID, '_property_attachment_id', true);

        // Get attachment details if exists
        $attachment_url = '';
        $attachment_filename = '';
        if ($attachment_id) {
            $attachment_url = wp_get_attachment_url($attachment_id);
            $attachment_filename = basename($attachment_url);
        }

        ?>
        <table class="form-table property-meta-table">
            <tr>
                <th scope="row">
                    <label for="property_status"><?php _e('Estado', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <select name="property_status" id="property_status" class="widefat" required>
                        <?php foreach (Property_CPT::get_status_options() as $value => $label): ?>
                            <option value="<?php echo esc_attr($value); ?>" <?php selected($status, $value); ?>>
                                <?php echo esc_html($label); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description"><?php _e('Estado actual de la propiedad', 'property-dashboard'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_patent"><?php _e('Patente', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <input type="text"
                           name="property_patent"
                           id="property_patent"
                           value="<?php echo esc_attr($patent); ?>"
                           class="widefat"
                           required>
                    <p class="description"><?php _e('Número único de identificación', 'property-dashboard'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_price"><?php _e('Precio (MXN)', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <input type="number"
                           name="property_price"
                           id="property_price"
                           value="<?php echo esc_attr($price); ?>"
                           class="widefat"
                           step="0.01"
                           min="0"
                           required>
                    <p class="description"><?php _e('Precio en pesos mexicanos', 'property-dashboard'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_google_maps_url"><?php _e('Google Maps URL', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="url"
                           name="property_google_maps_url"
                           id="property_google_maps_url"
                           value="<?php echo esc_attr($google_maps_url); ?>"
                           class="widefat"
                           placeholder="https://maps.google.com/...">
                    <p class="description"><?php _e('URL de Google Maps de la ubicación (opcional)', 'property-dashboard'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_attachment"><?php _e('Ficha Técnica', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="hidden" name="property_attachment_id" id="property_attachment_id" value="<?php echo esc_attr($attachment_id); ?>">

                    <div class="property-attachment-container">
                        <?php if ($attachment_id && $attachment_url): ?>
                            <div id="property-attachment-preview" class="attachment-preview">
                                <a href="<?php echo esc_url($attachment_url); ?>" target="_blank" class="attachment-link">
                                    <span class="dashicons dashicons-media-document"></span>
                                    <?php echo esc_html($attachment_filename); ?>
                                </a>
                                <button type="button" class="button property-remove-attachment" style="margin-left: 10px;">
                                    <?php _e('Eliminar', 'property-dashboard'); ?>
                                </button>
                            </div>
                        <?php else: ?>
                            <div id="property-attachment-preview" class="attachment-preview" style="display: none;">
                                <a href="" target="_blank" class="attachment-link">
                                    <span class="dashicons dashicons-media-document"></span>
                                    <span class="attachment-filename"></span>
                                </a>
                                <button type="button" class="button property-remove-attachment" style="margin-left: 10px;">
                                    <?php _e('Eliminar', 'property-dashboard'); ?>
                                </button>
                            </div>
                        <?php endif; ?>

                        <button type="button" class="button property-upload-attachment" id="property-upload-attachment" <?php echo $attachment_id ? 'style="display:none;"' : ''; ?>>
                            <?php _e('Subir Archivo', 'property-dashboard'); ?>
                        </button>
                    </div>

                    <p class="description"><?php _e('PDF, PNG o JPG (opcional)', 'property-dashboard'); ?></p>
                </td>
            </tr>
        </table>

        <script type="text/javascript">
        jQuery(document).ready(function($) {
            var mediaUploader;

            // Upload button click
            $('#property-upload-attachment').on('click', function(e) {
                e.preventDefault();

                // If the uploader object has already been created, reopen the dialog
                if (mediaUploader) {
                    mediaUploader.open();
                    return;
                }

                // Create the media uploader
                mediaUploader = wp.media({
                    title: '<?php _e('Seleccionar Ficha Técnica', 'property-dashboard'); ?>',
                    button: {
                        text: '<?php _e('Usar este archivo', 'property-dashboard'); ?>'
                    },
                    library: {
                        type: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
                    },
                    multiple: false
                });

                // When a file is selected
                mediaUploader.on('select', function() {
                    var attachment = mediaUploader.state().get('selection').first().toJSON();

                    // Set the attachment ID
                    $('#property_attachment_id').val(attachment.id);

                    // Update preview
                    var preview = $('#property-attachment-preview');
                    preview.find('.attachment-link').attr('href', attachment.url);
                    preview.find('.attachment-filename').text(attachment.filename);
                    preview.show();

                    // Hide upload button
                    $('#property-upload-attachment').hide();
                });

                // Open the uploader dialog
                mediaUploader.open();
            });

            // Remove button click
            $('.property-remove-attachment').on('click', function(e) {
                e.preventDefault();

                // Clear the attachment ID
                $('#property_attachment_id').val('');

                // Hide preview and show upload button
                $('#property-attachment-preview').hide();
                $('#property-upload-attachment').show();
            });
        });
        </script>
        <?php
    }

    /**
     * Render location meta box
     */
    public static function render_location_meta_box($post) {
        // Get current values
        $state = get_post_meta($post->ID, '_property_state', true);
        $municipality = get_post_meta($post->ID, '_property_municipality', true);
        $neighborhood = get_post_meta($post->ID, '_property_neighborhood', true);
        $postal_code = get_post_meta($post->ID, '_property_postal_code', true);
        $street = get_post_meta($post->ID, '_property_street', true);

        ?>
        <table class="form-table property-meta-table">
            <tr>
                <th scope="row">
                    <label for="property_state"><?php _e('Estado', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <select name="property_state" id="property_state" class="widefat" required>
                        <option value=""><?php _e('Seleccione un estado', 'property-dashboard'); ?></option>
                        <?php foreach (Property_CPT::get_states_options() as $value => $label): ?>
                            <option value="<?php echo esc_attr($value); ?>" <?php selected($state, $value); ?>>
                                <?php echo esc_html($label); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_municipality"><?php _e('Municipio', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <input type="text"
                           name="property_municipality"
                           id="property_municipality"
                           value="<?php echo esc_attr($municipality); ?>"
                           class="widefat"
                           required
                           placeholder="Ej: Guadalajara">
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_neighborhood"><?php _e('Colonia', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <input type="text"
                           name="property_neighborhood"
                           id="property_neighborhood"
                           value="<?php echo esc_attr($neighborhood); ?>"
                           class="widefat"
                           required
                           placeholder="Ej: Colonia Americana">
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_postal_code"><?php _e('Código Postal', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <input type="text"
                           name="property_postal_code"
                           id="property_postal_code"
                           value="<?php echo esc_attr($postal_code); ?>"
                           class="widefat"
                           maxlength="5"
                           pattern="[0-9]{5}"
                           required
                           placeholder="44100">
                    <p class="description"><?php _e('5 dígitos', 'property-dashboard'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_street"><?php _e('Dirección', 'property-dashboard'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <input type="text"
                           name="property_street"
                           id="property_street"
                           value="<?php echo esc_attr($street); ?>"
                           class="widefat"
                           required>
                    <p class="description"><?php _e('Dirección completa', 'property-dashboard'); ?></p>
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * Render last update meta box (read-only)
     */
    public static function render_last_update_meta_box($post) {
        // Get last dashboard update
        $last_dashboard_update = get_post_meta($post->ID, '_property_last_dashboard_update', true);
        
        ?>
        <div class="property-last-update-info">
            <?php if ($last_dashboard_update): ?>
                <p>
                    <strong><?php _e('Última actualización:', 'property-dashboard'); ?></strong><br>
                    <span style="color: #666; font-size: 13px;">
                        <?php 
                        // Format date in Spanish using WordPress date_i18n
                        $timestamp = strtotime($last_dashboard_update);
                        $formatted_date = date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $timestamp);
                        echo esc_html($formatted_date);
                        ?>
                    </span>
                </p>
            <?php else: ?>
                <p style="color: #999; font-style: italic;">
                    <?php _e('Esta propiedad aún no ha sido actualizada desde el Dashboard.', 'property-dashboard'); ?>
                </p>
            <?php endif; ?>
            
            <p class="description" style="margin-top: 10px; font-size: 12px; color: #666;">
                <?php _e('Este campo muestra la última vez que la propiedad fue actualizada desde el Dashboard de Propiedades. Es solo informativo y no se puede editar.', 'property-dashboard'); ?>
            </p>
        </div>
        <?php
    }

    /**
     * Save meta box data
     */
    public static function save_meta_boxes($post_id, $post) {
        // Skip if this is a REST API request
        if (defined('REST_REQUEST') && REST_REQUEST) {
            return;
        }

        // Verify nonce
        if (!isset($_POST['property_meta_box_nonce']) ||
            !wp_verify_nonce($_POST['property_meta_box_nonce'], 'property_meta_box')) {
            return;
        }

        // Check autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Required fields validation
        $required_fields = [
            'property_status'       => __('Estado', 'property-dashboard'),
            'property_state'        => __('Estado', 'property-dashboard'),
            'property_municipality' => __('Municipio', 'property-dashboard'),
            'property_neighborhood' => __('Colonia', 'property-dashboard'),
            'property_postal_code'  => __('Código Postal', 'property-dashboard'),
            'property_street'       => __('Dirección', 'property-dashboard'),
            'property_patent'       => __('Patente', 'property-dashboard'),
            'property_price'        => __('Precio', 'property-dashboard'),
        ];

        $errors = [];
        foreach ($required_fields as $field => $label) {
            if (empty($_POST[$field])) {
                $errors[] = sprintf(__('El campo "%s" es requerido', 'property-dashboard'), $label);
            }
        }

        // If there are errors, prevent save and show error
        if (!empty($errors)) {
            // Store errors in transient to show after redirect
            set_transient('property_validation_errors_' . $post_id, $errors, 45);

            // Prevent post status from changing to publish
            remove_action('save_post_property', [self::class, 'save_meta_boxes']);
            wp_update_post([
                'ID' => $post_id,
                'post_status' => 'draft'
            ]);
            add_action('save_post_property', [self::class, 'save_meta_boxes'], 10, 2);

            return;
        }

        // Save fields
        $fields = [
            'property_status'          => '_property_status',
            'property_state'           => '_property_state',
            'property_municipality'    => '_property_municipality',
            'property_neighborhood'    => '_property_neighborhood',
            'property_postal_code'     => '_property_postal_code',
            'property_street'          => '_property_street',
            'property_patent'          => '_property_patent',
            'property_price'           => '_property_price',
            'property_google_maps_url' => '_property_google_maps_url',
            'property_attachment_id'   => '_property_attachment_id',
        ];

        foreach ($fields as $field => $meta_key) {
            if (isset($_POST[$field])) {
                $value = $_POST[$field];

                // Sanitize based on field type
                switch ($meta_key) {
                    case '_property_status':
                        $value = self::sanitize_status($value);
                        break;
                    case '_property_postal_code':
                        $value = self::sanitize_postal_code($value);
                        break;
                    case '_property_price':
                        $value = floatval($value);
                        break;
                    case '_property_google_maps_url':
                        $value = esc_url_raw($value);
                        break;
                    case '_property_attachment_id':
                        $value = absint($value);
                        break;
                    default:
                        $value = sanitize_text_field($value);
                        break;
                }

                update_post_meta($post_id, $meta_key, $value);
            }
        }
    }

    /**
     * Get all meta fields for a property
     *
     * @param int $post_id
     * @return array
     */
    public static function get_property_meta($post_id) {
        return [
            'status'          => get_post_meta($post_id, '_property_status', true) ?: 'available',
            'state'           => get_post_meta($post_id, '_property_state', true),
            'municipality'    => get_post_meta($post_id, '_property_municipality', true),
            'neighborhood'    => get_post_meta($post_id, '_property_neighborhood', true),
            'postal_code'     => get_post_meta($post_id, '_property_postal_code', true),
            'street'          => get_post_meta($post_id, '_property_street', true),
            'patent'          => get_post_meta($post_id, '_property_patent', true),
            'price'           => floatval(get_post_meta($post_id, '_property_price', true)),
            'google_maps_url' => get_post_meta($post_id, '_property_google_maps_url', true),
            'attachment_id'   => absint(get_post_meta($post_id, '_property_attachment_id', true)),
        ];
    }

    /**
     * Update all meta fields for a property
     *
     * @param int   $post_id
     * @param array $meta_data
     * @return bool
     */
    public static function update_property_meta($post_id, $meta_data) {
        $fields = [
            'status'          => '_property_status',
            'state'           => '_property_state',
            'municipality'    => '_property_municipality',
            'neighborhood'    => '_property_neighborhood',
            'postal_code'     => '_property_postal_code',
            'street'          => '_property_street',
            'patent'          => '_property_patent',
            'price'           => '_property_price',
            'google_maps_url' => '_property_google_maps_url',
            'attachment_id'   => '_property_attachment_id',
        ];

        foreach ($fields as $key => $meta_key) {
            if (isset($meta_data[$key])) {
                update_post_meta($post_id, $meta_key, $meta_data[$key]);
            }
        }

        return true;
    }
}
