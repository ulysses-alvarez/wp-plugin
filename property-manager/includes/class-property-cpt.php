<?php
/**
 * Property Custom Post Type
 *
 * Registers the 'property' custom post type
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_CPT {

    /**
     * Register the property post type
     */
    public static function register() {
        $labels = [
            'name'                  => __('Propiedades', 'property-dashboard'),
            'singular_name'         => __('Propiedad', 'property-dashboard'),
            'menu_name'             => __('Propiedades', 'property-dashboard'),
            'name_admin_bar'        => __('Propiedad', 'property-dashboard'),
            'add_new'               => __('Agregar Nueva', 'property-dashboard'),
            'add_new_item'          => __('Agregar Nueva Propiedad', 'property-dashboard'),
            'new_item'              => __('Nueva Propiedad', 'property-dashboard'),
            'edit_item'             => __('Editar Propiedad', 'property-dashboard'),
            'view_item'             => __('Ver Propiedad', 'property-dashboard'),
            'all_items'             => __('Todas las Propiedades', 'property-dashboard'),
            'search_items'          => __('Buscar Propiedades', 'property-dashboard'),
            'parent_item_colon'     => __('Propiedad Padre:', 'property-dashboard'),
            'not_found'             => __('No se encontraron propiedades', 'property-dashboard'),
            'not_found_in_trash'    => __('No hay propiedades en la papelera', 'property-dashboard'),
            'featured_image'        => __('Imagen destacada', 'property-dashboard'),
            'set_featured_image'    => __('Establecer imagen destacada', 'property-dashboard'),
            'remove_featured_image' => __('Eliminar imagen destacada', 'property-dashboard'),
            'use_featured_image'    => __('Usar como imagen destacada', 'property-dashboard'),
            'archives'              => __('Archivo de Propiedades', 'property-dashboard'),
            'insert_into_item'      => __('Insertar en propiedad', 'property-dashboard'),
            'uploaded_to_this_item' => __('Subido a esta propiedad', 'property-dashboard'),
            'filter_items_list'     => __('Filtrar lista de propiedades', 'property-dashboard'),
            'items_list_navigation' => __('Navegación de lista de propiedades', 'property-dashboard'),
            'items_list'            => __('Lista de propiedades', 'property-dashboard'),
        ];

        $args = [
            'labels'                => $labels,
            'description'           => __('Gestión de propiedades inmobiliarias', 'property-dashboard'),
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'query_var'             => true,
            'rewrite'               => ['slug' => 'propiedad'],
            'capability_type'       => 'post', // Use standard 'post' capabilities
            'map_meta_cap'          => true,
            'has_archive'           => false,
            'hierarchical'          => false,
            'menu_position'         => 5,
            'menu_icon'             => 'dashicons-building',
            'supports'              => ['title', 'editor', 'author', 'revisions'],
            'show_in_rest'          => true,
            'rest_base'             => 'properties',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
        ];

        register_post_type('property', $args);

        // Disable Gutenberg for property post type
        add_filter('use_block_editor_for_post_type', [self::class, 'disable_gutenberg'], 10, 2);

        // Add filters for role-based visibility
        add_action('pre_get_posts', [self::class, 'filter_properties_by_role']);
        add_filter('views_edit-property', [self::class, 'filter_property_views']);
    }

    /**
     * Disable Gutenberg editor for property post type
     *
     * @param bool   $use_block_editor
     * @param string $post_type
     * @return bool
     */
    public static function disable_gutenberg($use_block_editor, $post_type) {
        if ($post_type === 'property') {
            return false;
        }
        return $use_block_editor;
    }

    /**
     * Get property status options
     */
    public static function get_status_options() {
        return [
            'available' => __('Disponible', 'property-dashboard'),
            'sold'      => __('Vendida', 'property-dashboard'),
            'rented'    => __('Alquilada', 'property-dashboard'),
            'reserved'  => __('Reservada', 'property-dashboard'),
        ];
    }

    /**
     * Get Mexican states options
     */
    public static function get_states_options() {
        return [
            'aguascalientes'      => 'Aguascalientes',
            'baja_california'     => 'Baja California',
            'baja_california_sur' => 'Baja California Sur',
            'campeche'            => 'Campeche',
            'chiapas'             => 'Chiapas',
            'chihuahua'           => 'Chihuahua',
            'cdmx'                => 'Ciudad de México',
            'coahuila'            => 'Coahuila',
            'colima'              => 'Colima',
            'durango'             => 'Durango',
            'guanajuato'          => 'Guanajuato',
            'guerrero'            => 'Guerrero',
            'hidalgo'             => 'Hidalgo',
            'jalisco'             => 'Jalisco',
            'mexico'              => 'Estado de México',
            'michoacan'           => 'Michoacán',
            'morelos'             => 'Morelos',
            'nayarit'             => 'Nayarit',
            'nuevo_leon'          => 'Nuevo León',
            'oaxaca'              => 'Oaxaca',
            'puebla'              => 'Puebla',
            'queretaro'           => 'Querétaro',
            'quintana_roo'        => 'Quintana Roo',
            'san_luis_potosi'     => 'San Luis Potosí',
            'sinaloa'             => 'Sinaloa',
            'sonora'              => 'Sonora',
            'tabasco'             => 'Tabasco',
            'tamaulipas'          => 'Tamaulipas',
            'tlaxcala'            => 'Tlaxcala',
            'veracruz'            => 'Veracruz',
            'yucatan'             => 'Yucatán',
            'zacatecas'           => 'Zacatecas',
        ];
    }

    /**
     * Filter properties in admin list based on user role
     * Associates can only see their own properties
     * Managers and Admins can see all properties
     */
    public static function filter_properties_by_role($query) {
        // Only apply in admin area
        if (!is_admin()) {
            return;
        }

        // Only apply to property post type
        if (!isset($query->query['post_type']) || $query->query['post_type'] !== 'property') {
            return;
        }

        // Only apply to main query
        if (!$query->is_main_query()) {
            return;
        }

        // Get current user
        $user = wp_get_current_user();
        if (!$user || !$user->ID) {
            return;
        }

        // Check if user is an Associate (property_associate role)
        if (in_array('property_associate', $user->roles)) {
            // Associates can only see their own properties
            $query->set('author', $user->ID);
        }

        // Managers with delete restrictions
        if (in_array('property_manager', $user->roles)) {
            // Managers can see all but have restricted delete permissions
            // We handle this in the delete capability checks
        }

        // Administrators can see everything (no filter needed)
    }

    /**
     * Filter the views (All/Published/Draft counts) for property list
     * to show accurate counts based on user role
     */
    public static function filter_property_views($views) {
        $user = wp_get_current_user();

        // Associates see counts for only their properties
        if (in_array('property_associate', $user->roles)) {
            // Recalculate counts for this user's properties only
            $counts = wp_count_posts('property');

            // Get user's property counts
            global $wpdb;
            $user_counts = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT post_status, COUNT(*) as count
                    FROM {$wpdb->posts}
                    WHERE post_type = 'property'
                    AND post_author = %d
                    GROUP BY post_status",
                    $user->ID
                )
            );

            $user_count_array = [];
            foreach ($user_counts as $count) {
                $user_count_array[$count->post_status] = $count->count;
            }

            // Update the views with accurate counts
            if (isset($views['all'])) {
                $total = array_sum($user_count_array);
                $views['all'] = preg_replace(
                    '/\([^)]+\)/',
                    "({$total})",
                    $views['all']
                );
            }
        }

        return $views;
    }
}
