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

        // Get price ranges
        register_rest_route($this->namespace, '/price-ranges', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'get_price_ranges'],
            'permission_callback' => [$this, 'check_read_permission'],
        ]);

        // Get unique patents
        register_rest_route($this->namespace, '/properties/patents', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'get_unique_patents'],
            'permission_callback' => [$this, 'check_read_permission'],
        ]);

        // Bulk delete properties
        register_rest_route($this->namespace, '/properties/bulk-delete', [
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => [$this, 'bulk_delete_properties'],
            'permission_callback' => [$this, 'check_read_permission'],
            'args'                => [
                'property_ids' => [
                    'required'          => true,
                    'type'              => 'array',
                    'items'             => ['type' => 'integer'],
                    'sanitize_callback' => function($ids) {
                        return array_map('absint', $ids);
                    },
                ],
            ],
        ]);

        // Bulk update status
        register_rest_route($this->namespace, '/properties/bulk-update-status', [
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => [$this, 'bulk_update_status'],
            'permission_callback' => [$this, 'check_read_permission'],
            'args'                => [
                'property_ids' => [
                    'required'          => true,
                    'type'              => 'array',
                    'items'             => ['type' => 'integer'],
                    'sanitize_callback' => function($ids) {
                        return array_map('absint', $ids);
                    },
                ],
                'status' => [
                    'required' => true,
                    'type'     => 'string',
                    'enum'     => ['available', 'sold', 'rented', 'reserved'],
                ],
            ],
        ]);

        // Bulk update patent
        register_rest_route($this->namespace, '/properties/bulk-update-patent', [
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => [$this, 'bulk_update_patent'],
            'permission_callback' => [$this, 'check_read_permission'],
            'args'                => [
                'property_ids' => [
                    'required'          => true,
                    'type'              => 'array',
                    'items'             => ['type' => 'integer'],
                    'sanitize_callback' => function($ids) {
                        return array_map('absint', $ids);
                    },
                ],
                'patent' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // Bulk download property sheets as ZIP
        register_rest_route($this->namespace, '/properties/bulk-download', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'bulk_download_sheets'],
            'permission_callback' => [$this, 'check_read_permission'],
            'args'                => [
                'property_ids' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
    }

    /**
     * Get properties collection
     */
    public function get_properties($request) {
        $current_user = wp_get_current_user();

        // Use date as default orderby to match WordPress admin default behavior
        // This orders by post_date (publication date) in descending order (newest first)
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
                    // Search in post title only (not content/description)
                    $args['s'] = sanitize_text_field($search_value);
                    // Mark this query for title-only search filter
                    $args['property_title_search'] = true;
                    break;

                case 'description':
                    // Search in post content/description only (not title)
                    $args['s'] = sanitize_text_field($search_value);
                    // Mark this query for description-only search filter
                    $args['property_description_search'] = true;
                    break;

                case 'patent':
                    // Partial match for patent
                    $args['meta_query'][] = [
                        'key'     => '_property_patent',
                        'value'   => sanitize_text_field($search_value),
                        'compare' => 'LIKE'
                    ];
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
                    // Mark for custom postal code filter
                    $args['property_postal_code_search'] = sanitize_text_field($search_value);
                    break;

                case 'price':
                    // Parse "min-max" format from the frontend
                    if (strpos($search_value, '-') !== false) {
                        $range_parts = explode('-', $search_value, 2);
                        $range_min = floatval($range_parts[0]);
                        $range_max = floatval($range_parts[1]);

                        // Use the exact values from the frontend (already rounded)
                        $args['meta_query'][] = [
                            'key'     => '_property_price',
                            'value'   => [$range_min, $range_max],
                            'type'    => 'DECIMAL(10,2)',
                            'compare' => 'BETWEEN'
                        ];
                    }
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
                // IMPORTANT: Include post_status check to ensure only published posts are included
                $meta_where = $wpdb->prepare(
                    "OR EXISTS (
                        SELECT 1 FROM {$wpdb->postmeta} pm
                        WHERE pm.post_id = {$wpdb->posts}.ID
                        AND {$wpdb->posts}.post_status = 'publish'
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

        // Add filter for title-only search if needed
        $title_search_filter = null;
        if (!empty($args['property_title_search'])) {
            $search_term = $args['s'];
            unset($args['property_title_search']); // Remove the marker as it's not a valid WP_Query arg

            $title_search_filter = function($search, $wp_query) use ($search_term) {
                global $wpdb;

                if (empty($search_term)) {
                    return $search;
                }

                // Override default search to only search in post_title (not post_content)
                $search = $wpdb->prepare(
                    " AND ({$wpdb->posts}.post_title LIKE %s) ",
                    '%' . $wpdb->esc_like($search_term) . '%'
                );

                return $search;
            };

            add_filter('posts_search', $title_search_filter, 10, 2);
        }

        // Add filter for description-only search if needed
        $description_search_filter = null;
        if (!empty($args['property_description_search'])) {
            $search_term = $args['s'];
            unset($args['property_description_search']); // Remove the marker as it's not a valid WP_Query arg

            $description_search_filter = function($search, $wp_query) use ($search_term) {
                global $wpdb;

                if (empty($search_term)) {
                    return $search;
                }

                // Override default search to only search in post_content (not post_title)
                $search = $wpdb->prepare(
                    " AND ({$wpdb->posts}.post_content LIKE %s) ",
                    '%' . $wpdb->esc_like($search_term) . '%'
                );

                return $search;
            };

            add_filter('posts_search', $description_search_filter, 10, 2);
        }

        // Add filter for postal code search if needed
        $postal_code_filter = null;
        if (!empty($args['property_postal_code_search'])) {
            $postal_code_value = $args['property_postal_code_search'];
            unset($args['property_postal_code_search']); // Remove the marker as it's not a valid WP_Query arg

            $postal_code_filter = function($where, $wp_query) use ($postal_code_value) {
                global $wpdb;

                if (empty($postal_code_value)) {
                    return $where;
                }

                // Search for postal codes starting with the input value
                $pattern = $wpdb->esc_like($postal_code_value) . '%';

                $postal_where = $wpdb->prepare(
                    " AND EXISTS (
                        SELECT 1 FROM {$wpdb->postmeta} pm
                        WHERE pm.post_id = {$wpdb->posts}.ID
                        AND pm.meta_key = '_property_postal_code'
                        AND pm.meta_value LIKE %s
                    )",
                    $pattern
                );

                $where .= $postal_where;
                return $where;
            };

            add_filter('posts_where', $postal_code_filter, 10, 2);
        }

        // Execute query
        $query = new WP_Query($args);

        // Remove the filters if they were added
        if ($general_search_filter !== null) {
            remove_filter('posts_where', $general_search_filter, 10);
        }
        if ($title_search_filter !== null) {
            remove_filter('posts_search', $title_search_filter, 10);
        }
        if ($description_search_filter !== null) {
            remove_filter('posts_search', $description_search_filter, 10);
        }
        if ($postal_code_filter !== null) {
            remove_filter('posts_where', $postal_code_filter, 10);
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
            $post_date = $request->get_param('post_date');

            // Create post
            $post_data = [
                'post_type'    => 'property',
                'post_title'   => sanitize_text_field($title),
                'post_content' => wp_kses_post($description),
                'post_status'  => 'publish',
                'post_author'  => get_current_user_id(),
            ];

            // If post_date is provided (for CSV import), use it
            if (!empty($post_date)) {
                $post_data['post_date'] = sanitize_text_field($post_date);
                $post_data['post_date_gmt'] = get_gmt_from_date($post_date);
            }

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

        // Move to trash instead of permanent delete
        $result = wp_trash_post($property_id);

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
     * Smart rounding for price ranges based on magnitude
     * Rounds to appropriate multiples for better UX
     */
    private function round_price_smart($price) {
        if ($price < 100000) {
            // Under 100k: round to nearest 10k
            return round($price / 10000) * 10000;
        } elseif ($price < 1000000) {
            // 100k-1M: round to nearest 50k
            return round($price / 50000) * 50000;
        } elseif ($price < 5000000) {
            // 1M-5M: round to nearest 100k
            return round($price / 100000) * 100000;
        } else {
            // Over 5M: round to nearest 500k
            return round($price / 500000) * 500000;
        }
    }

    /**
     * Get price ranges (10 dynamic ranges based on min/max prices)
     */
    public function get_price_ranges($request) {
        global $wpdb;

        // Get all published property prices
        $prices = $wpdb->get_col("
            SELECT DISTINCT CAST(pm.meta_value AS DECIMAL(10,2)) as price
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            WHERE pm.meta_key = '_property_price'
            AND p.post_type = 'property'
            AND p.post_status = 'publish'
            AND pm.meta_value != ''
            AND CAST(pm.meta_value AS DECIMAL(10,2)) > 0
            ORDER BY price ASC
        ");

        if (empty($prices)) {
            return rest_ensure_response([]);
        }

        $min_price = floatval($prices[0]);
        $max_price = floatval($prices[count($prices) - 1]);

        // Calculate 10 ranges
        $range_size = ($max_price - $min_price) / 10;
        $ranges = [];

        for ($i = 0; $i < 10; $i++) {
            $range_min = $min_price + ($range_size * $i);
            $range_max = $min_price + ($range_size * ($i + 1));

            // Apply smart rounding for better UX
            $range_min = $this->round_price_smart($range_min);
            $range_max = $this->round_price_smart($range_max);

            // Format numbers for display
            $label = '$' . number_format($range_min, 0, '.', ',') . ' - $' . number_format($range_max, 0, '.', ',');

            $ranges[] = [
                'value' => $range_min . '-' . $range_max,  // Use actual values instead of index
                'label' => $label,
                'min'   => $range_min,
                'max'   => $range_max
            ];
        }

        return rest_ensure_response($ranges);
    }

    /**
     * Get unique patents from all properties
     */
    public function get_unique_patents($request) {
        global $wpdb;

        // Get all unique patents from published properties
        $patents = $wpdb->get_col("
            SELECT DISTINCT meta_value
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            WHERE pm.meta_key = '_property_patent'
            AND p.post_type = 'property'
            AND p.post_status = 'publish'
            AND pm.meta_value != ''
            ORDER BY meta_value ASC
        ");

        // Return empty array if no patents found
        if (empty($patents)) {
            return rest_ensure_response([]);
        }

        return rest_ensure_response($patents);
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
                            // Remove all non-numeric characters, pad with leading zeros to 5 digits
                            $value = preg_replace('/[^0-9]/', '', $value);
                            $value = str_pad($value, 5, '0', STR_PAD_LEFT);
                            $value = substr($value, 0, 5);
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

    /**
     * Bulk delete properties
     */
    public function bulk_delete_properties($request) {
        $property_ids = $request->get_param('property_ids');
        $current_user_id = get_current_user_id();

        $results = [
            'success' => [],
            'failed'  => [],
            'total'   => count($property_ids),
        ];

        foreach ($property_ids as $property_id) {
            $post = get_post($property_id);

            // Validate property exists
            if (!$post || $post->post_type !== 'property') {
                $results['failed'][] = [
                    'id'     => $property_id,
                    'reason' => __('Propiedad no encontrada', 'property-dashboard'),
                ];
                continue;
            }

            // Check individual permissions
            if (!Property_Roles::can_delete_property($current_user_id, $property_id)) {
                $results['failed'][] = [
                    'id'             => $property_id,
                    'reason'         => __('Sin permisos para eliminar', 'property-dashboard'),
                    'property_title' => $post->post_title,
                ];
                continue;
            }

            // Attempt to move to trash (soft delete)
            $trashed = wp_trash_post($property_id);

            if ($trashed) {
                $results['success'][] = $property_id;
            } else {
                $results['failed'][] = [
                    'id'             => $property_id,
                    'reason'         => __('Error al eliminar', 'property-dashboard'),
                    'property_title' => $post->post_title,
                ];
            }
        }

        return rest_ensure_response($results);
    }

    /**
     * Bulk update property status
     */
    public function bulk_update_status($request) {
        $property_ids = $request->get_param('property_ids');
        $new_status = $request->get_param('status');
        $current_user_id = get_current_user_id();

        $results = [
            'success' => [],
            'failed'  => [],
            'total'   => count($property_ids),
        ];

        // Validate status is allowed
        $allowed_statuses = ['available', 'sold', 'rented', 'reserved'];
        if (!in_array($new_status, $allowed_statuses, true)) {
            error_log('Bulk update status - Invalid status: ' . $new_status);
            return new WP_Error(
                'invalid_status',
                __('Estado inválido', 'property-dashboard'),
                ['status' => 400]
            );
        }

        foreach ($property_ids as $property_id) {
            $post = get_post($property_id);

            // Validate property exists
            if (!$post || $post->post_type !== 'property') {
                error_log('Bulk update status - Property not found: ' . $property_id);
                $results['failed'][] = [
                    'id'     => $property_id,
                    'reason' => __('Propiedad no encontrada', 'property-dashboard'),
                ];
                continue;
            }

            // Check individual permissions
            if (!Property_Roles::can_edit_property($current_user_id, $property_id)) {
                error_log('Bulk update status - Permission denied for property: ' . $property_id);
                $results['failed'][] = [
                    'id'             => $property_id,
                    'reason'         => __('Sin permisos para editar', 'property-dashboard'),
                    'property_title' => $post->post_title,
                ];
                continue;
            }

            // Attempt to update
            $updated = update_post_meta($property_id, '_property_status', $new_status);

            // CRITICAL: Clear ALL caches to ensure fresh data is read immediately
            clean_post_cache($property_id);
            wp_cache_delete($property_id, 'post_meta');
            wp_cache_delete($property_id, 'posts');

            if ($updated !== false) {
                $results['success'][] = $property_id;
            } else {
                // Check if it was already the same value (not an error)
                $current_status_check = get_post_meta($property_id, '_property_status', true);
                if ($current_status_check === $new_status) {
                    $results['success'][] = $property_id;
                } else {
                    error_log('Bulk update status - Failed to update property ' . $property_id);
                    $results['failed'][] = [
                        'id'             => $property_id,
                        'reason'         => __('Error al actualizar', 'property-dashboard'),
                        'property_title' => $post->post_title,
                    ];
                }
            }
        }

        // Prevent caching of this response
        $response = rest_ensure_response($results);
        $response->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
        $response->header('Pragma', 'no-cache');

        return $response;
    }

    /**
     * Bulk update property patents
     */
    /**
     * Bulk update patent (simplified version)
     * Changes all selected properties to the same patent value
     */
    public function bulk_update_patent($request) {
        $property_ids = $request->get_param('property_ids');
        $new_patent = strtoupper(trim($request->get_param('patent')));
        $current_user_id = get_current_user_id();

        $results = [
            'success' => [],
            'failed'  => [],
            'total'   => count($property_ids),
        ];

        // Validate patent is not empty
        if (empty($new_patent)) {
            error_log('Bulk update patent - Empty patent provided');
            return new WP_Error(
                'empty_patent',
                __('La patente no puede estar vacía', 'property-dashboard'),
                ['status' => 400]
            );
        }

        // Update each property
        foreach ($property_ids as $property_id) {
            $post = get_post($property_id);

            // Validate property exists
            if (!$post || $post->post_type !== 'property') {
                error_log('Bulk update patent - Property not found: ' . $property_id);
                $results['failed'][] = [
                    'id'     => $property_id,
                    'reason' => __('Propiedad no encontrada', 'property-dashboard'),
                ];
                continue;
            }

            // Check individual permissions
            if (!Property_Roles::can_edit_property($current_user_id, $property_id)) {
                error_log('Bulk update patent - Permission denied for property: ' . $property_id);
                $results['failed'][] = [
                    'id'             => $property_id,
                    'reason'         => __('Sin permisos para editar', 'property-dashboard'),
                    'property_title' => $post->post_title,
                ];
                continue;
            }

            // Update patent (idempotent - will update even if same value)
            $updated = update_post_meta($property_id, '_property_patent', $new_patent);

            // CRITICAL: Clear ALL caches to ensure fresh data is read immediately
            clean_post_cache($property_id);
            wp_cache_delete($property_id, 'post_meta');
            wp_cache_delete($property_id, 'posts');

            if ($updated !== false) {
                $results['success'][] = $property_id;
            } else {
                // Check if it was already the same value
                $current_patent_check = get_post_meta($property_id, '_property_patent', true);
                if ($current_patent_check === $new_patent) {
                    $results['success'][] = $property_id;
                } else {
                    error_log('Bulk update patent - Failed to update property ' . $property_id);
                    $results['failed'][] = [
                        'id'             => $property_id,
                        'reason'         => __('Error al actualizar', 'property-dashboard'),
                        'property_title' => $post->post_title,
                    ];
                }
            }
        }

        // Prevent caching of this response
        $response = rest_ensure_response($results);
        $response->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
        $response->header('Pragma', 'no-cache');

        return $response;
    }

    /**
     * Bulk download property attachments
     * Downloads the "Ficha Técnica" files attached to properties
     * If 1 file: returns direct download URL
     * If 2+ files: creates a ZIP and returns ZIP URL
     */
    public function bulk_download_sheets($request) {
        $property_ids_param = $request->get_param('property_ids');
        $property_ids = array_map('absint', explode(',', $property_ids_param));
        $current_user_id = get_current_user_id();

        error_log('Bulk download attachments - IDs: ' . json_encode($property_ids));

        // Validate we have IDs
        if (empty($property_ids)) {
            return new WP_Error(
                'no_properties',
                __('No se proporcionaron propiedades para descargar', 'property-dashboard'),
                ['status' => 400]
            );
        }

        $attachments = [];
        $files_without_attachment = 0;

        // Collect all attachment IDs
        foreach ($property_ids as $property_id) {
            $post = get_post($property_id);

            // Validate property exists and user can view it
            if (!$post || $post->post_type !== 'property') {
                $files_without_attachment++;
                continue;
            }

            if (!Property_Roles::can_view_property($current_user_id, $property_id)) {
                error_log('Bulk download - Permission denied for property: ' . $property_id);
                $files_without_attachment++;
                continue;
            }

            // Get attachment ID
            $attachment_id = get_post_meta($property_id, '_property_attachment_id', true);

            if (empty($attachment_id)) {
                error_log('Bulk download - Property ' . $property_id . ' has no attachment');
                $files_without_attachment++;
                continue;
            }

            // Get attachment file path and URL
            $file_path = get_attached_file($attachment_id);
            $file_url = wp_get_attachment_url($attachment_id);

            if (!$file_path || !file_exists($file_path)) {
                error_log('Bulk download - Attachment file not found for property ' . $property_id);
                $files_without_attachment++;
                continue;
            }

            $attachments[] = [
                'property_id' => $property_id,
                'attachment_id' => $attachment_id,
                'file_path' => $file_path,
                'file_url' => $file_url,
                'filename' => basename($file_path)
            ];
        }

        // Check if we have any attachments
        if (empty($attachments)) {
            // Return 200 with success=false instead of 404 error
            // This way frontend doesn't log it as an error in console
            return rest_ensure_response([
                'success' => false,
                'message' => __('Ninguna propiedad tiene ficha técnica adjunta', 'property-dashboard'),
                'files_count' => 0,
                'files_without_attachment' => $files_without_attachment
            ]);
        }

        // If only 1 attachment, return direct download URL
        if (count($attachments) === 1) {
            error_log('Bulk download - Single file, returning direct URL');
            return rest_ensure_response([
                'success' => true,
                'single_file' => true,
                'download_url' => $attachments[0]['file_url'],
                'filename' => $attachments[0]['filename'],
                'files_count' => 1,
                'files_without_attachment' => $files_without_attachment
            ]);
        }

        // Multiple attachments: create ZIP
        $upload_dir = wp_upload_dir();
        $zip_filename = 'fichas-tecnicas-' . date('Y-m-d-His') . '.zip';
        $zip_filepath = $upload_dir['basedir'] . '/' . $zip_filename;

        $zip = new ZipArchive();
        if ($zip->open($zip_filepath, ZipArchive::CREATE) !== true) {
            error_log('Bulk download - Failed to create ZIP: ' . $zip_filepath);
            return new WP_Error(
                'zip_failed',
                __('Error al crear archivo ZIP', 'property-dashboard'),
                ['status' => 500]
            );
        }

        // Add files to ZIP
        foreach ($attachments as $attachment) {
            // Use unique filename with property ID to avoid conflicts
            $zip_entry_name = $attachment['property_id'] . '-' . $attachment['filename'];
            $zip->addFile($attachment['file_path'], $zip_entry_name);
            error_log('Bulk download - Added to ZIP: ' . $zip_entry_name);
        }

        $zip->close();
        error_log('Bulk download - ZIP created with ' . count($attachments) . ' files');

        // Return ZIP download URL
        $zip_url = $upload_dir['baseurl'] . '/' . $zip_filename;

        return rest_ensure_response([
            'success' => true,
            'single_file' => false,
            'download_url' => $zip_url,
            'filename' => $zip_filename,
            'files_count' => count($attachments),
            'files_without_attachment' => $files_without_attachment
        ]);
    }
}
