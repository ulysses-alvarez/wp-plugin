<?php
/**
 * Property REST API
 *
 * Registers custom REST API endpoints for property CRUD operations
 */

if (!defined('ABSPATH')) {
    exit;
}

class Property_REST_API {

    private $namespace = 'property-dashboard/v1';

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Get all properties
        register_rest_route($this->namespace, '/properties', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'get_properties'],
            'permission_callback' => [$this, 'check_read_permission'],
            'args'                => $this->get_collection_params(),
        ]);

        // Get single property
        register_rest_route($this->namespace, '/properties/(?P<id>\d+)', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'get_property'],
            'permission_callback' => [$this, 'check_read_permission'],
            'args'                => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Create property
        register_rest_route($this->namespace, '/properties', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [$this, 'create_property'],
            'permission_callback' => [$this, 'check_create_permission'],
            'args'                => $this->get_property_schema(),
        ]);

        // Update property
        register_rest_route($this->namespace, '/properties/(?P<id>\d+)', [
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => [$this, 'update_property'],
            'permission_callback' => [$this, 'check_edit_permission'],
            'args'                => $this->get_property_schema(),
        ]);

        // Delete property
        register_rest_route($this->namespace, '/properties/(?P<id>\d+)', [
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => [$this, 'delete_property'],
            'permission_callback' => [$this, 'check_delete_permission'],
        ]);

        // Get current user info
        register_rest_route($this->namespace, '/user/me', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'get_current_user'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Get properties collection
     */
    public function get_properties($request) {
        $current_user = wp_get_current_user();

        $args = [
            'post_type'      => 'property',
            'posts_per_page' => $request->get_param('per_page') ?: 20,
            'paged'          => $request->get_param('page') ?: 1,
            'post_status'    => 'publish',
            'orderby'        => $request->get_param('orderby') ?: 'date',
            'order'          => $request->get_param('order') ?: 'DESC',
        ];

        // If user can't view all properties, only show their own
        if (!current_user_can('view_all_properties')) {
            $args['author'] = $current_user->ID;
        }

        // Search filter
        $search = $request->get_param('search');
        if (!empty($search)) {
            $args['s'] = sanitize_text_field($search);
        }

        // Status filter
        $status = $request->get_param('status');
        if (!empty($status)) {
            $args['meta_query'][] = [
                'key'   => '_property_status',
                'value' => sanitize_text_field($status),
            ];
        }

        // State filter
        $state = $request->get_param('state');
        if (!empty($state)) {
            $args['meta_query'][] = [
                'key'   => '_property_state',
                'value' => sanitize_text_field($state),
            ];
        }

        $query = new WP_Query($args);
        $properties = [];

        foreach ($query->posts as $post) {
            $properties[] = $this->prepare_property_response($post);
        }

        $response = rest_ensure_response($properties);

        // Add pagination headers
        $response->header('X-WP-Total', $query->found_posts);
        $response->header('X-WP-TotalPages', $query->max_num_pages);

        return $response;
    }

    /**
     * Get single property
     */
    public function get_property($request) {
        $property_id = (int) $request->get_param('id');
        $post = get_post($property_id);

        if (!$post || $post->post_type !== 'property') {
            return new WP_Error(
                'property_not_found',
                __('Propiedad no encontrada', 'property-dashboard'),
                ['status' => 404]
            );
        }

        // Check if user can view this property
        if (!Property_Roles::can_view_property(get_current_user_id(), $property_id)) {
            return new WP_Error(
                'forbidden',
                __('No tienes permisos para ver esta propiedad', 'property-dashboard'),
                ['status' => 403]
            );
        }

        return rest_ensure_response($this->prepare_property_response($post));
    }

    /**
     * Create property
     */
    public function create_property($request) {
        $title = $request->get_param('title');
        $description = $request->get_param('description');

        if (empty($title)) {
            return new WP_Error(
                'missing_title',
                __('El título es requerido', 'property-dashboard'),
                ['status' => 400]
            );
        }

        // Create post
        $post_data = [
            'post_type'    => 'property',
            'post_title'   => sanitize_text_field($title),
            'post_content' => wp_kses_post($description),
            'post_status'  => 'publish',
            'post_author'  => get_current_user_id(),
        ];

        $property_id = wp_insert_post($post_data, true);

        if (is_wp_error($property_id)) {
            return $property_id;
        }

        // Update meta fields
        $this->update_property_meta($property_id, $request);

        $post = get_post($property_id);
        return rest_ensure_response($this->prepare_property_response($post));
    }

    /**
     * Update property
     */
    public function update_property($request) {
        $property_id = (int) $request->get_param('id');
        $post = get_post($property_id);

        if (!$post || $post->post_type !== 'property') {
            return new WP_Error(
                'property_not_found',
                __('Propiedad no encontrada', 'property-dashboard'),
                ['status' => 404]
            );
        }

        // Check if user can edit this property
        if (!Property_Roles::can_edit_property(get_current_user_id(), $property_id)) {
            return new WP_Error(
                'forbidden',
                __('No tienes permisos para editar esta propiedad', 'property-dashboard'),
                ['status' => 403]
            );
        }

        // Update post
        $post_data = [
            'ID' => $property_id,
        ];

        if ($request->has_param('title')) {
            $post_data['post_title'] = sanitize_text_field($request->get_param('title'));
        }

        if ($request->has_param('description')) {
            $post_data['post_content'] = wp_kses_post($request->get_param('description'));
        }

        $result = wp_update_post($post_data, true);

        if (is_wp_error($result)) {
            return $result;
        }

        // Update meta fields
        $this->update_property_meta($property_id, $request);

        $updated_post = get_post($property_id);
        return rest_ensure_response($this->prepare_property_response($updated_post));
    }

    /**
     * Delete property
     */
    public function delete_property($request) {
        $property_id = (int) $request->get_param('id');
        $post = get_post($property_id);

        if (!$post || $post->post_type !== 'property') {
            return new WP_Error(
                'property_not_found',
                __('Propiedad no encontrada', 'property-dashboard'),
                ['status' => 404]
            );
        }

        // Check if user can delete this property
        if (!Property_Roles::can_delete_property(get_current_user_id(), $property_id)) {
            return new WP_Error(
                'forbidden',
                __('No tienes permisos para eliminar esta propiedad', 'property-dashboard'),
                ['status' => 403]
            );
        }

        $result = wp_delete_post($property_id, true);

        if (!$result) {
            return new WP_Error(
                'delete_failed',
                __('No se pudo eliminar la propiedad', 'property-dashboard'),
                ['status' => 500]
            );
        }

        return rest_ensure_response([
            'deleted' => true,
            'id'      => $property_id,
        ]);
    }

    /**
     * Get current user info
     */
    public function get_current_user($request) {
        $user = wp_get_current_user();

        if (!$user->ID) {
            return new WP_Error(
                'not_logged_in',
                __('Usuario no autenticado', 'property-dashboard'),
                ['status' => 401]
            );
        }

        $role = !empty($user->roles) ? $user->roles[0] : '';

        return rest_ensure_response([
            'id'    => $user->ID,
            'name'  => $user->display_name,
            'email' => $user->user_email,
            'role'  => $role,
            'roleLabel' => Property_Roles::get_role_label($role),
            'capabilities' => $this->get_user_capabilities($user),
        ]);
    }

    /**
     * Update property meta fields
     */
    private function update_property_meta($property_id, $request) {
        $meta_fields = [
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

        foreach ($meta_fields as $param => $meta_key) {
            if ($request->has_param($param)) {
                update_post_meta($property_id, $meta_key, $request->get_param($param));
            }
        }
    }

    /**
     * Prepare property for response
     */
    private function prepare_property_response($post) {
        $meta = Property_Meta::get_property_meta($post->ID);
        $author = get_userdata($post->post_author);

        return [
            'id'              => $post->ID,
            'title'           => $post->post_title,
            'description'     => $post->post_content,
            'status'          => $meta['status'],
            'state'           => $meta['state'],
            'municipality'    => $meta['municipality'],
            'neighborhood'    => $meta['neighborhood'],
            'postal_code'     => $meta['postal_code'],
            'street'          => $meta['street'],
            'patent'          => $meta['patent'],
            'price'           => $meta['price'],
            'google_maps_url' => $meta['google_maps_url'],
            'attachment_id'   => $meta['attachment_id'],
            'author_id'       => $post->post_author,
            'author_name'     => $author ? $author->display_name : '',
            'created_at'      => $post->post_date,
            'updated_at'      => $post->post_modified,
        ];
    }

    /**
     * Get user capabilities
     */
    private function get_user_capabilities($user) {
        $capabilities = [];
        $property_caps = [
            'view_properties',
            'view_all_properties',
            'create_properties',
            'edit_properties',
            'edit_others_properties',
            'delete_properties',
            'delete_others_properties',
            'assign_properties',
            'manage_property_roles',
            'export_properties',
            'view_statistics',
            'view_team_statistics',
            'view_own_statistics',
        ];

        foreach ($property_caps as $cap) {
            $capabilities[$cap] = user_can($user, $cap);
        }

        return $capabilities;
    }

    /**
     * Permission callbacks
     */
    public function check_read_permission($request) {
        return current_user_can('view_properties');
    }

    public function check_create_permission($request) {
        return current_user_can('create_properties');
    }

    public function check_edit_permission($request) {
        $property_id = (int) $request->get_param('id');
        return Property_Roles::can_edit_property(get_current_user_id(), $property_id);
    }

    public function check_delete_permission($request) {
        $property_id = (int) $request->get_param('id');
        return Property_Roles::can_delete_property(get_current_user_id(), $property_id);
    }

    /**
     * Get collection parameters
     */
    private function get_collection_params() {
        return [
            'page'     => ['default' => 1],
            'per_page' => ['default' => 20],
            'search'   => ['default' => ''],
            'status'   => ['default' => ''],
            'state'    => ['default' => ''],
            'orderby'  => ['default' => 'date'],
            'order'    => ['default' => 'DESC'],
        ];
    }

    /**
     * Get property schema
     */
    private function get_property_schema() {
        return [
            'title'           => ['required' => false],
            'description'     => ['required' => false],
            'status'          => ['required' => false],
            'state'           => ['required' => false],
            'municipality'    => ['required' => false],
            'neighborhood'    => ['required' => false],
            'postal_code'     => ['required' => false],
            'street'          => ['required' => false],
            'patent'          => ['required' => false],
            'price'           => ['required' => false],
            'google_maps_url' => ['required' => false],
            'attachment_id'   => ['required' => false],
        ];
    }
}
