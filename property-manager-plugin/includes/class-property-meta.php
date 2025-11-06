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
     * Initialize meta boxes
     */
    public static function init() {
        // Add meta boxes to property edit screen
        add_action('add_meta_boxes', [self::class, 'add_meta_boxes']);

        // Save meta data when property is saved
        add_action('save_post_property', [self::class, 'save_meta_boxes'], 10, 2);
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
            'sanitize_callback' => 'sanitize_text_field',
        ]);

        // Price (Precio en MXN)
        register_post_meta('property', '_property_price', [
            'type'              => 'number',
            'description'       => __('Precio', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'floatval',
        ]);

        // Google Maps URL
        register_post_meta('property', '_property_google_maps_url', [
            'type'              => 'string',
            'description'       => __('URL de Google Maps', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'esc_url_raw',
        ]);

        // Attachment ID (Ficha técnica PDF)
        register_post_meta('property', '_property_attachment_id', [
            'type'              => 'integer',
            'description'       => __('ID de ficha técnica', 'property-dashboard'),
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'absint',
        ]);
    }

    /**
     * Sanitize status field
     *
     * @param string $value
     * @return string
     */
    public static function sanitize_status($value) {
        $allowed = ['available', 'sold', 'rented', 'reserved'];
        return in_array($value, $allowed, true) ? $value : 'available';
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

        ?>
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="property_status"><?php _e('Estado', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <select name="property_status" id="property_status" class="regular-text">
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
                    <label for="property_patent"><?php _e('Patente', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="text"
                           name="property_patent"
                           id="property_patent"
                           value="<?php echo esc_attr($patent); ?>"
                           class="regular-text">
                    <p class="description"><?php _e('Número único de identificación', 'property-dashboard'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_price"><?php _e('Precio (MXN)', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="number"
                           name="property_price"
                           id="property_price"
                           value="<?php echo esc_attr($price); ?>"
                           class="regular-text"
                           step="0.01"
                           min="0">
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
                           class="large-text">
                    <p class="description"><?php _e('URL de Google Maps de la ubicación', 'property-dashboard'); ?></p>
                </td>
            </tr>
        </table>
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
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="property_state"><?php _e('Estado de la República', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <select name="property_state" id="property_state" class="regular-text">
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
                    <label for="property_municipality"><?php _e('Municipio', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="text"
                           name="property_municipality"
                           id="property_municipality"
                           value="<?php echo esc_attr($municipality); ?>"
                           class="regular-text">
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_neighborhood"><?php _e('Colonia', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="text"
                           name="property_neighborhood"
                           id="property_neighborhood"
                           value="<?php echo esc_attr($neighborhood); ?>"
                           class="regular-text">
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_postal_code"><?php _e('Código Postal', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="text"
                           name="property_postal_code"
                           id="property_postal_code"
                           value="<?php echo esc_attr($postal_code); ?>"
                           class="regular-text"
                           maxlength="5"
                           pattern="[0-9]{5}">
                    <p class="description"><?php _e('5 dígitos', 'property-dashboard'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="property_street"><?php _e('Calle y Número', 'property-dashboard'); ?></label>
                </th>
                <td>
                    <input type="text"
                           name="property_street"
                           id="property_street"
                           value="<?php echo esc_attr($street); ?>"
                           class="large-text">
                    <p class="description"><?php _e('Dirección completa de la calle', 'property-dashboard'); ?></p>
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * Save meta box data
     */
    public static function save_meta_boxes($post_id, $post) {
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
