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

        $orderby = $request->get_param('orderby') ?: 'date';
        $order = strtoupper($request->get_param('order') ?: 'DESC');

        // Store search parameters for use in search filter hook
        $search_field = $request->get_param('search_field');
        $search_value = $request->get_param('search_value');

        $args = [
            'post_type'      => 'property',
            'posts_per_page' => $request->get_param('per_page') ?: 20,
            'paged'          => $request->get_param('page') ?: 1,
            'post_status'    => 'publish',
            'order'          => $order,
        ];

        // Handle different orderby options
        if ($orderby === 'price') {
            // Order by price meta field (numeric)
            $args['meta_key'] = '_property_price';
            $args['orderby'] = 'meta_value_num';
        } elseif ($orderby === 'status') {
            // Order by status meta field (alphabetic)
            $args['meta_key'] = '_property_status';
            $args['orderby'] = 'meta_value';
        } elseif ($orderby === 'state') {
            // Order by state meta field (alphabetic)
            $args['meta_key'] = '_property_state';
            $args['orderby'] = 'meta_value';
        } elseif ($orderby === 'municipality') {
            // Order by municipality meta field (alphabetic)
            $args['meta_key'] = '_property_municipality';
            $args['orderby'] = 'meta_value';
        } else {
            // Default ordering (date, title, etc)
            $args['orderby'] = $orderby;
        }

        // If user can't view all properties, only show their own
        if (!current_user_can('view_all_properties')) {
            $args['author'] = $current_user->ID;
        }

        // Advanced search with field context (already retrieved above)
        if (!empty($search_field) && !empty($search_value)) {
            // Field-specific search
            switch ($search_field) {
                case 'all':
                    // General search across all fields (title, content, and all meta fields)
                    $args['s'] = sanitize_text_field($search_value);
                    // Mark this query for general search filter
                    $args['property_general_search'] = true;
                    break;

                case 'title':
                    // Search in post title only
                    $args['s'] = sanitize_text_field($search_value);
                    break;

                case 'status':
                    // Exact match for status
                    $args['meta_query'][] = [
                        'key'     => '_property_status',
                        'value'   => sanitize_text_field($search_value),
                        'compare' => '='
                    ];
                    break;

                case 'state':
                    // Exact match for state
                    $args['meta_query'][] = [
                        'key'     => '_property_state',
                        'value'   => sanitize_text_field($search_value),
                        'compare' => '='
                    ];
                    break;

                case 'municipality':
                    // Partial match for municipality
                    $args['meta_query'][] = [
                        'key'     => '_property_municipality',
                        'value'   => sanitize_text_field($search_value),
                        'compare' => 'LIKE'
                    ];
                    break;

                case 'street':
                    // Partial match for street
                    $args['meta_query'][] = [
                        'key'     => '_property_street',
                        'value'   => sanitize_text_field($search_value),
                        'compare' => 'LIKE'
                    ];
                    break;

                case 'postal_code':
                    // Exact match for postal code
                    $args['meta_query'][] = [
                        'key'     => '_property_postal_code',
                        'value'   => sanitize_text_field($search_value),
                        'compare' => '='
                    ];
                    break;

                case 'price':
                    // Exact match for price (numeric)
                    $args['meta_query'][] = [
                        'key'     => '_property_price',
                        'value'   => floatval($search_value),
                        'type'    => 'NUMERIC',
                        'compare' => '='
                    ];
                    break;
            }
        } else {
            // Fallback to old filter format for backward compatibility
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
        }

        // Add filter for general search if needed
        $general_search_filter = null;
        if (!empty($args['property_general_search'])) {
            $search_term = $args['s'];
            unset($args['property_general_search']); // Remove the marker as it's not a valid WP_Query arg

            $general_search_filter = function($where, $wp_query) use ($search_term) {
                global $wpdb;

                if (empty($search_term)) {
                    return $where;
                }

                // Build OR conditions for meta fields
                $meta_where = $wpdb->prepare(
                    "OR EXISTS (
                        SELECT 1 FROM {$wpdb->postmeta} pm
                        WHERE pm.post_id = {$wpdb->posts}.ID
                        AND (
                            (pm.meta_key = '_property_status' AND pm.meta_value LIKE %s) OR
                            (pm.meta_key = '_property_state' AND pm.meta_value LIKE %s) OR
                            (pm.meta_key = '_property_municipality' AND pm.meta_value LIKE %s) OR
                            (pm.meta_key = '_property_street' AND pm.meta_value LIKE %s) OR
                            (pm.meta_key = '_property_postal_code' AND pm.meta_value LIKE %s) OR
                            (pm.meta_key = '_property_patent' AND pm.meta_value LIKE %s) OR
                            (pm.meta_key = '_property_neighborhood' AND pm.meta_value LIKE %s)
                        )
                    )",
                    '%' . $wpdb->esc_like($search_term) . '%',
                    '%' . $wpdb->esc_like($search_term) . '%',
                    '%' . $wpdb->esc_like($search_term) . '%',
                    '%' . $wpdb->esc_like($search_term) . '%',
                    '%' . $wpdb->esc_like($search_term) . '%',
                    '%' . $wpdb->esc_like($search_term) . '%',
                    '%' . $wpdb->esc_like($search_term) . '%'
                );

                $where .= " {$meta_where}";

                return $where;
            };

            add_filter('posts_where', $general_search_filter, 10, 2);
        }

        // Execute query
        $query = new WP_Query($args);

        // Remove the filter if it was added
        if ($general_search_filter !== null) {
            remove_filter('posts_where', $general_search_filter, 10);
        }

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
        try {
            // Validate required fields
            $validation_error = $this->validate_required_fields($request);
            if (is_wp_error($validation_error)) {
                return $validation_error;
            }

            $title = $request->get_param('title');
            $description = $request->get_param('description');

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
                error_log('Property Create Error (wp_insert_post): ' . $property_id->get_error_message());
                return $property_id;
            }

            // Update meta fields
            $this->update_property_meta($property_id, $request);

            $post = get_post($property_id);

            if (!$post) {
                error_log('Property Create Error: Post not found after creation. ID: ' . $property_id);
                return new WP_Error(
                    'post_not_found',
                    __('No se pudo recuperar la propiedad después de crearla', 'property-dashboard'),
                    ['status' => 500]
                );
            }

            $response = $this->prepare_property_response($post);
            return rest_ensure_response($response);

        } catch (Exception $e) {
            error_log('Property Create Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return new WP_Error(
                'create_exception',
                __('Error al crear la propiedad: ', 'property-dashboard') . $e->getMessage(),
                ['status' => 500]
            );
        } catch (Error $e) {
            error_log('Property Create Fatal Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return new WP_Error(
                'create_fatal_error',
                __('Error fatal al crear la propiedad: ', 'property-dashboard') . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Update property
     */
    public function update_property($request) {
        try {
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

            // Validate required fields
            $validation_error = $this->validate_required_fields($request);
            if (is_wp_error($validation_error)) {
                return $validation_error;
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
                error_log('Property Update Error (wp_update_post): ' . $result->get_error_message());
                return $result;
            }

            // Update meta fields
            $this->update_property_meta($property_id, $request);

            $updated_post = get_post($property_id);

            if (!$updated_post) {
                error_log('Property Update Error: Post not found after update. ID: ' . $property_id);
                return new WP_Error(
                    'post_not_found',
                    __('No se pudo recuperar la propiedad después de actualizarla', 'property-dashboard'),
                    ['status' => 500]
                );
            }

            $response = $this->prepare_property_response($updated_post);
            return rest_ensure_response($response);

        } catch (Exception $e) {
            error_log('Property Update Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return new WP_Error(
                'update_exception',
                __('Error al actualizar la propiedad: ', 'property-dashboard') . $e->getMessage(),
                ['status' => 500]
            );
        } catch (Error $e) {
            error_log('Property Update Fatal Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return new WP_Error(
                'update_fatal_error',
                __('Error fatal al actualizar la propiedad: ', 'property-dashboard') . $e->getMessage(),
                ['status' => 500]
            );
        }
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
     * Validate required fields
     */
    private function validate_required_fields($request) {
        $required_fields = [
            'title'        => __('El título es obligatorio', 'property-dashboard'),
            'status'       => __('El status es obligatorio', 'property-dashboard'),
            'state'        => __('El estado es obligatorio', 'property-dashboard'),
            'municipality' => __('El municipio es obligatorio', 'property-dashboard'),
            'neighborhood' => __('La colonia es obligatoria', 'property-dashboard'),
            'postal_code'  => __('El código postal es obligatorio', 'property-dashboard'),
            'street'       => __('La dirección es obligatoria', 'property-dashboard'),
            'patent'       => __('La patente es obligatoria', 'property-dashboard'),
            'price'        => __('El precio es obligatorio', 'property-dashboard'),
        ];

        // Return the first missing field error for consistency with frontend validation
        foreach ($required_fields as $field => $error_message) {
            $value = $request->get_param($field);
            if (empty($value) && $value !== '0' && $value !== 0) {
                return new WP_Error(
                    'missing_required_field',
                    $error_message,
                    ['status' => 400]
                );
            }
        }

        return true;
    }

    /**
     * Update property meta fields
     */
    private function update_property_meta($property_id, $request) {
        try {
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
                    $value = $request->get_param($param);

                    // Sanitize based on field type
                    switch ($meta_key) {
                        case '_property_status':
                            $allowed = ['available', 'sold', 'rented', 'reserved'];
                            $value = in_array($value, $allowed, true) ? $value : 'available';
                            break;

                        case '_property_postal_code':
                            // Remove all non-numeric characters and limit to 5 digits
                            $value = substr(preg_replace('/[^0-9]/', '', $value), 0, 5);
                            break;

                        case '_property_price':
                            // Convert to float, handle empty string as 0
                            $value = !empty($value) ? floatval($value) : 0;
                            break;

                        case '_property_google_maps_url':
                            $value = !empty($value) ? esc_url_raw($value) : '';
                            break;

                        case '_property_attachment_id':
                            $value = absint($value);
                            break;

                        default:
                            $value = sanitize_text_field($value);
                            break;
                    }

                    $result = update_post_meta($property_id, $meta_key, $value);
                    if ($result === false) {
                        error_log("update_property_meta: Failed to update meta key {$meta_key} for property {$property_id}");
                    }
                }
            }
        } catch (Exception $e) {
            error_log('update_property_meta Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            throw $e;
        }
    }

    /**
     * Prepare property for response
     */
    private function prepare_property_response($post) {
        try {
            if (!$post || !is_object($post)) {
                error_log('prepare_property_response: Invalid post object');
                throw new Exception('Invalid post object');
            }

            $meta = Property_Meta::get_property_meta($post->ID);

            if (!is_array($meta)) {
                error_log('prepare_property_response: Invalid meta data for post ID ' . $post->ID);
                $meta = [];
            }

            $author = get_userdata($post->post_author);

            // Get attachment URL if attachment_id exists
            $attachment_id = isset($meta['attachment_id']) ? intval($meta['attachment_id']) : 0;
            $attachment_url = '';
            if ($attachment_id > 0) {
                $attachment_url = wp_get_attachment_url($attachment_id);
                if (!$attachment_url) {
                    $attachment_url = '';
                }
            }

            return [
                'id'              => $post->ID,
                'title'           => $post->post_title,
                'description'     => $post->post_content,
                'status'          => isset($meta['status']) ? $meta['status'] : 'available',
                'state'           => isset($meta['state']) ? $meta['state'] : '',
                'municipality'    => isset($meta['municipality']) ? $meta['municipality'] : '',
                'neighborhood'    => isset($meta['neighborhood']) ? $meta['neighborhood'] : '',
                'postal_code'     => isset($meta['postal_code']) ? $meta['postal_code'] : '',
                'street'          => isset($meta['street']) ? $meta['street'] : '',
                'patent'          => isset($meta['patent']) ? $meta['patent'] : '',
                'price'           => isset($meta['price']) ? $meta['price'] : 0,
                'google_maps_url' => isset($meta['google_maps_url']) ? $meta['google_maps_url'] : '',
                'attachment_id'   => $attachment_id,
                'attachment_url'  => $attachment_url,
                'author_id'       => $post->post_author,
                'author_name'     => $author ? $author->display_name : '',
                'created_at'      => $post->post_date,
                'updated_at'      => $post->post_modified,
            ];
        } catch (Exception $e) {
            error_log('prepare_property_response Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            throw $e;
        }
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
            'page'         => ['default' => 1],
            'per_page'     => ['default' => 20],
            'search'       => ['default' => ''],
            'status'       => ['default' => ''],
            'state'        => ['default' => ''],
            'orderby'      => ['default' => 'date'],
            'order'        => ['default' => 'DESC'],
            'search_field' => ['default' => ''],
            'search_value' => ['default' => ''],
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
