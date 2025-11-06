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
