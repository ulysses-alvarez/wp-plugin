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
            'capability_type'       => 'post',
            'map_meta_cap'          => true,
            'capabilities'          => [
                'edit_post'             => 'edit_properties',
                'read_post'             => 'view_properties',
                'delete_post'           => 'delete_properties',
                'edit_posts'            => 'edit_properties',
                'edit_others_posts'     => 'edit_others_properties',
                'publish_posts'         => 'create_properties',
                'read_private_posts'    => 'view_properties',
                'delete_posts'          => 'delete_properties',
                'delete_private_posts'  => 'delete_properties',
                'delete_published_posts'=> 'delete_properties',
                'delete_others_posts'   => 'delete_others_properties',
                'edit_private_posts'    => 'edit_properties',
                'edit_published_posts'  => 'edit_properties',
            ],
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
            'mexico'              => 'México',
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
}
