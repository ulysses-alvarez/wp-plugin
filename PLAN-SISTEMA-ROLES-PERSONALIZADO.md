# 📋 Plan de Implementación: Sistema de Roles Personalizado

**Fecha:** 13 de Noviembre, 2025
**Estado:** 📝 En Planificación

---

## 🎯 OBJETIVO GENERAL

Implementar 3 roles personalizados independientes de los roles estándar de WordPress con permisos específicos, gestión de usuarios desde el dashboard, y campos de auditoría para rastrear modificaciones.

---

## 📊 ANÁLISIS DE SITUACIÓN ACTUAL

### Sistema de Roles Existente

El plugin **YA TIENE** un sistema de roles implementado con capacidades personalizadas:

**Roles actuales:**
1. **Administrator** (admin de WordPress) - Control total
2. **property_manager** (Gerente) - Ver/editar todas, eliminar solo las suyas
3. **property_associate** (Asociado) - Ver/editar solo las suyas, NO eliminar

**Capacidades implementadas:**
```php
- view_properties
- view_all_properties
- create_properties
- edit_properties
- edit_others_properties
- delete_properties
- delete_others_properties
- assign_properties
- manage_property_roles
- export_properties
- view_statistics
- view_team_statistics
- view_own_statistics
```

### ⚠️ Diferencias con el Sistema Solicitado

| Característica | Sistema Actual | Sistema Solicitado |
|----------------|----------------|-------------------|
| **Gerente: Eliminar** | Puede eliminar las suyas | NO puede eliminar ni las suyas |
| **Admin personalizado** | No existe | Necesario - NO es el admin de WP |
| **Acceso al WP Admin** | Gerentes y Asociados tienen acceso | Solo el nuevo rol "Admin" lo tiene |
| **Barra de admin WP** | Visible para todos | Ocultar para todos los roles custom |
| **Gestión de usuarios** | No implementada en dashboard | El rol "Admin" puede crear/editar/eliminar |
| **Tabs visibles** | Todas visibles | Restringidas por rol |
| **Auditoría** | Solo "última actualización" | + "Quién modificó por última vez" |

---

## 🏗️ ARQUITECTURA PROPUESTA

### 1. Nuevos Roles y Permisos

#### **Rol: `property_associate_v2` (Asociado)**

**Permisos:**
```php
✅ view_properties          // Ver propiedades
✅ create_properties        // Crear propiedades
✅ edit_properties          // Editar sus propiedades
✅ view_own_statistics      // Ver sus propias estadísticas
❌ view_all_properties     // NO ver propiedades de otros
❌ edit_others_properties  // NO editar propiedades de otros
❌ delete_properties       // NO eliminar (ni siquiera las suyas)
❌ delete_others_properties
❌ assign_properties
❌ manage_property_roles
❌ export_properties
❌ access_wp_admin         // NUEVO - NO acceso al admin de WP
```

**Restricciones:**
- Solo puede acceder al dashboard (`/propiedades`)
- NO acceso al admin de WordPress
- Solo ve/edita propiedades donde él es el autor
- NO puede eliminar propiedades
- Solo ve la tab de "Propiedades" en el dashboard

---

#### **Rol: `property_manager_v2` (Gerente)**

**Permisos:**
```php
✅ view_properties
✅ view_all_properties      // Ver TODAS las propiedades
✅ create_properties
✅ edit_properties
✅ edit_others_properties   // Editar propiedades de otros
✅ assign_properties        // Asignar propiedades a asociados
✅ view_team_statistics     // Ver estadísticas del equipo
❌ delete_properties       // NO eliminar (ni siquiera las suyas)
❌ delete_others_properties
❌ manage_property_roles
❌ export_properties
❌ access_wp_admin         // NUEVO - NO acceso al admin de WP
```

**Restricciones:**
- Solo puede acceder al dashboard (`/propiedades`)
- NO acceso al admin de WordPress
- Puede editar TODAS las propiedades
- NO puede eliminar propiedades
- Solo ve la tab de "Propiedades" en el dashboard

---

#### **Rol: `property_admin` (Admin)**

**Permisos:**
```php
✅ view_properties
✅ view_all_properties
✅ create_properties
✅ edit_properties
✅ edit_others_properties
✅ delete_properties        // Puede eliminar
✅ delete_others_properties // Puede eliminar cualquier propiedad
✅ assign_properties
✅ manage_property_roles    // Gestionar roles y usuarios
✅ export_properties
✅ view_statistics
✅ access_wp_admin_limited  // NUEVO - Acceso limitado al admin de WP
✅ manage_dashboard_users   // NUEVO - Gestionar usuarios desde dashboard
```

**Restricciones:**
- Acceso completo al dashboard (Propiedades, Usuarios, Configuración)
- Acceso al admin de WordPress pero SOLO al CPT de "property"
- Ocultar barra de admin de WordPress (opcional)
- Puede crear usuarios con roles: Gerente y Asociado ÚNICAMENTE
- NO puede crear otros Admin ni Administradores de WP

---

### 2. Visibilidad de Tabs en el Dashboard

| Tab | Asociado | Gerente | Admin |
|-----|----------|---------|-------|
| **Propiedades** | ✅ | ✅ | ✅ |
| **Usuarios** | ❌ | ❌ | ✅ |
| **Configuración** | ❌ | ❌ | ✅ |
| **Perfil (Dropdown)** | ✅ | ✅ | ✅ |

---

### 3. Gestión de Usuarios (Nueva Funcionalidad)

**Solo visible para el rol "Admin".**

#### Funcionalidades:

1. **Listar usuarios:**
   - Tabla con usuarios del sistema
   - Filtros: Por rol, por estado
   - Mostrar: Nombre, Email, Rol, Fecha de creación

2. **Crear usuario:**
   - Formulario con campos: Nombre, Email, Contraseña, Rol
   - Solo puede asignar roles: `property_manager_v2` o `property_associate_v2`
   - Validación de email único
   - Generación automática de contraseña (opcional)

3. **Editar usuario:**
   - Cambiar nombre, email, rol
   - Resetear contraseña (opcional)
   - NO puede editar administradores de WordPress

4. **Eliminar usuario:**
   - Confirmación antes de eliminar
   - Reasignar propiedades del usuario eliminado a otro usuario
   - NO puede eliminar administradores de WordPress

#### Restricciones de seguridad:
- NO puede crear usuarios con rol `property_admin` (solo Gerente/Asociado)
- NO puede crear usuarios con rol `administrator` de WordPress
- NO puede editar/eliminar usuarios con rol `administrator`
- Solo puede gestionar usuarios con roles del plugin

---

### 4. Ajustes de Perfil de Usuario

**Ubicación:** Dropdown del avatar en el header (esquina superior derecha)

**Campos editables por el usuario:**
```
✅ Nombre completo
✅ Email
✅ Contraseña (cambiar)
✅ Avatar (opcional)
❌ Rol (solo lectura)
❌ Capacidades (solo lectura)
```

**Formulario:**
```
┌──────────────────────────────┐
│ Mi Perfil                    │
├──────────────────────────────┤
│ Nombre: [________________]   │
│ Email:  [________________]   │
│ Rol:     Gerente (readonly)  │
│                              │
│ Cambiar Contraseña:          │
│ Actual:  [________________]  │
│ Nueva:   [________________]  │
│ Repetir: [________________]  │
│                              │
│ [Cancelar] [Guardar Cambios] │
└──────────────────────────────┘
```

---

### 5. Campos de Auditoría

#### Nuevos Meta Fields

**Campo 1: `_property_last_modified_by`**
- Tipo: User ID (integer)
- Descripción: ID del usuario que modificó por última vez
- Actualización: Cada vez que se edita la propiedad
- Visible: Admin de WP (readonly) y Dashboard (readonly)

**Campo 2: `_property_last_modified_date`** (ya existe como `_property_last_dashboard_update`)
- Tipo: Timestamp (ISO 8601)
- Descripción: Fecha/hora de la última modificación
- Actualización: Cada vez que se edita la propiedad
- Visible: Admin de WP (readonly) y Dashboard (readonly)

#### Implementación en la base de datos:

```php
// Meta fields adicionales
update_post_meta($property_id, '_property_last_modified_by', get_current_user_id());
update_post_meta($property_id, '_property_last_modified_date', current_time('c'));
```

#### Visualización en el Dashboard:

**Modal de Vista de Propiedad:**
```
┌────────────────────────────────────────────────┐
│ Ver Propiedad - Patente: 12345                 │
├────────────────────────────────────────────────┤
│ ...campos de la propiedad...                   │
│                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 📋 AUDITORÍA                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                │
│ Creado por:      Juan Pérez                    │
│ Fecha creación:  10/11/2025 14:30             │
│                                                │
│ Modificado por:  María González                │
│ Última modificación: 12/11/2025 09:15         │
│                                                │
└────────────────────────────────────────────────┘
```

**Admin de WordPress:**
- Agregar metabox "Auditoría" en la página de edición
- Mostrar: Creado por, Fecha creación, Modificado por, Última modificación
- Solo lectura (readonly)

---

## 📂 ESTRUCTURA DE ARCHIVOS

### Archivos a Crear:

```
property-manager-plugin/
├── includes/
│   ├── class-property-roles-v2.php           # NUEVO - Nuevos roles
│   ├── class-property-user-management.php    # NUEVO - Gestión de usuarios
│   ├── class-property-audit.php              # NUEVO - Sistema de auditoría
│   └── class-property-admin-restrictions.php # NUEVO - Restricciones de admin WP
└── templates/
    └── (sin cambios)

src/
├── pages/
│   ├── UsersPage.tsx                         # NUEVO - Gestión de usuarios
│   └── UserProfilePage.tsx                   # NUEVO - Perfil de usuario
├── components/
│   ├── users/
│   │   ├── UserTable.tsx                     # NUEVO - Tabla de usuarios
│   │   ├── UserForm.tsx                      # NUEVO - Formulario crear/editar
│   │   ├── UserDeleteModal.tsx               # NUEVO - Confirmar eliminación
│   │   └── UserFilters.tsx                   # NUEVO - Filtros de usuarios
│   └── profile/
│       └── UserProfileForm.tsx               # NUEVO - Formulario de perfil
├── services/
│   └── userService.ts                        # NUEVO - API de usuarios
├── stores/
│   └── useUserStore.ts                       # NUEVO - Estado de usuarios
├── types/
│   └── user.types.ts                         # NUEVO - Tipos de usuarios
└── utils/
    ├── permissions.ts                        # MODIFICAR - Nuevas capacidades
    └── roleUtils.ts                          # NUEVO - Utilidades de roles
```

### Archivos a Modificar:

```
property-manager-plugin/
├── property-manager.php                      # Incluir nuevas clases
├── includes/
│   ├── class-property-rest-api.php           # Agregar endpoints de usuarios
│   ├── class-property-meta.php               # Agregar campos de auditoría
│   └── class-property-assets.php             # Pasar datos de usuarios al frontend

src/
├── router.tsx                                # Agregar rutas de usuarios y perfil
├── App.tsx                                   # Verificar permisos de rutas
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx                    # Ocultar items por rol
│   │   └── AppHeader.tsx                     # Agregar item "Mi Perfil"
│   └── properties/
│       └── PropertySidebar.tsx               # Actualizar campos de auditoría
├── utils/
│   ├── constants.ts                          # Agregar nuevos roles
│   └── permissions.ts                        # Agregar nuevas verificaciones
└── types/
    └── property.types.ts                     # Agregar campos de auditoría
```

---

## 🎨 IMPLEMENTACIÓN DETALLADA

### FASE 1: Backend - Nuevos Roles y Capacidades

**Archivo:** `includes/class-property-roles-v2.php`

#### Paso 1.1: Definir nuevos roles

```php
class Property_Roles_V2 {

    public static function register_roles() {
        // Rol: Asociado V2
        add_role(
            'property_associate_v2',
            'Asociado',
            [
                'read' => true,
                'view_properties' => true,
                'create_properties' => true,
                'edit_properties' => true,
                'view_own_statistics' => true,
                // Explícitamente denegar
                'view_all_properties' => false,
                'edit_others_properties' => false,
                'delete_properties' => false,
                'access_wp_admin' => false,
            ]
        );

        // Rol: Gerente V2
        add_role(
            'property_manager_v2',
            'Gerente',
            [
                'read' => true,
                'view_properties' => true,
                'view_all_properties' => true,
                'create_properties' => true,
                'edit_properties' => true,
                'edit_others_properties' => true,
                'assign_properties' => true,
                'view_team_statistics' => true,
                // Explícitamente denegar
                'delete_properties' => false,
                'access_wp_admin' => false,
            ]
        );

        // Rol: Admin del Plugin
        add_role(
            'property_admin',
            'Administrador de Propiedades',
            [
                'read' => true,
                'view_properties' => true,
                'view_all_properties' => true,
                'create_properties' => true,
                'edit_properties' => true,
                'edit_others_properties' => true,
                'delete_properties' => true,
                'delete_others_properties' => true,
                'assign_properties' => true,
                'manage_property_roles' => true,
                'export_properties' => true,
                'view_statistics' => true,
                'access_wp_admin_limited' => true,
                'manage_dashboard_users' => true,
            ]
        );
    }

    /**
     * Verifica si un usuario puede eliminar una propiedad
     */
    public static function can_delete_property($user_id, $property_id) {
        $user = get_user_by('id', $user_id);

        // Solo el rol property_admin puede eliminar
        if (in_array('property_admin', $user->roles)) {
            return true;
        }

        return false;
    }

    /**
     * Verifica si un usuario puede acceder al admin de WordPress
     */
    public static function can_access_wp_admin($user_id) {
        $user = get_user_by('id', $user_id);

        // Solo property_admin y administrator pueden acceder
        if (in_array('property_admin', $user->roles) ||
            in_array('administrator', $user->roles)) {
            return true;
        }

        return false;
    }
}
```

#### Paso 1.2: Restricciones de acceso al Admin de WP

**Archivo:** `includes/class-property-admin-restrictions.php`

```php
class Property_Admin_Restrictions {

    public function __construct() {
        add_action('admin_init', [$this, 'restrict_admin_access']);
        add_action('admin_menu', [$this, 'hide_admin_menu_items'], 999);
        add_filter('show_admin_bar', [$this, 'hide_admin_bar']);
    }

    /**
     * Redirigir a dashboard si no tiene acceso al admin
     */
    public function restrict_admin_access() {
        $user = wp_get_current_user();

        // Asociados y Gerentes V2 no pueden acceder al admin
        if (in_array('property_associate_v2', $user->roles) ||
            in_array('property_manager_v2', $user->roles)) {

            // Permitir AJAX
            if (defined('DOING_AJAX') && DOING_AJAX) {
                return;
            }

            // Redirigir al dashboard
            wp_redirect(home_url('/propiedades'));
            exit;
        }
    }

    /**
     * Ocultar items del menú de admin para property_admin
     */
    public function hide_admin_menu_items() {
        $user = wp_get_current_user();

        // Solo aplicar a property_admin
        if (!in_array('property_admin', $user->roles)) {
            return;
        }

        // Ocultar todos los items excepto el CPT de propiedades
        global $menu, $submenu;

        // Whitelist: Solo estos items son visibles
        $allowed_menu_items = [
            'edit.php?post_type=property', // CPT de propiedades
            'profile.php',                 // Perfil
        ];

        foreach ($menu as $key => $item) {
            $menu_slug = $item[2];

            if (!in_array($menu_slug, $allowed_menu_items)) {
                unset($menu[$key]);
            }
        }
    }

    /**
     * Ocultar barra de admin para roles custom
     */
    public function hide_admin_bar($show) {
        $user = wp_get_current_user();

        // Ocultar para todos los roles del plugin
        if (in_array('property_associate_v2', $user->roles) ||
            in_array('property_manager_v2', $user->roles) ||
            in_array('property_admin', $user->roles)) {
            return false;
        }

        return $show;
    }
}
```

---

### FASE 2: Backend - Sistema de Auditoría

**Archivo:** `includes/class-property-audit.php`

```php
class Property_Audit {

    public function __construct() {
        // Hook para guardar auditoría al crear/actualizar
        add_action('save_post_property', [$this, 'save_audit_trail'], 10, 3);

        // Metabox en admin de WP
        add_action('add_meta_boxes', [$this, 'add_audit_metabox']);
    }

    /**
     * Guardar información de auditoría
     */
    public function save_audit_trail($post_id, $post, $update) {
        // No guardar en autoguardado
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Verificar permisos
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        $user_id = get_current_user_id();
        $current_time = current_time('c'); // ISO 8601

        // Actualizar "quién modificó por última vez"
        update_post_meta($post_id, '_property_last_modified_by', $user_id);
        update_post_meta($post_id, '_property_last_modified_date', $current_time);

        // Si es creación nueva, también guardar creador
        if (!$update) {
            update_post_meta($post_id, '_property_created_by', $user_id);
            update_post_meta($post_id, '_property_created_date', $current_time);
        }
    }

    /**
     * Agregar metabox de auditoría en admin de WP
     */
    public function add_audit_metabox() {
        add_meta_box(
            'property_audit_metabox',
            'Auditoría',
            [$this, 'render_audit_metabox'],
            'property',
            'side',
            'default'
        );
    }

    /**
     * Renderizar metabox de auditoría
     */
    public function render_audit_metabox($post) {
        $created_by_id = get_post_meta($post->ID, '_property_created_by', true);
        $created_date = get_post_meta($post->ID, '_property_created_date', true);
        $modified_by_id = get_post_meta($post->ID, '_property_last_modified_by', true);
        $modified_date = get_post_meta($post->ID, '_property_last_modified_date', true);

        $created_by = get_user_by('id', $created_by_id);
        $modified_by = get_user_by('id', $modified_by_id);

        ?>
        <div class="property-audit-info">
            <p>
                <strong>Creado por:</strong><br>
                <?php echo $created_by ? esc_html($created_by->display_name) : 'N/A'; ?><br>
                <small><?php echo $created_date ? date('d/m/Y H:i', strtotime($created_date)) : 'N/A'; ?></small>
            </p>
            <hr>
            <p>
                <strong>Modificado por:</strong><br>
                <?php echo $modified_by ? esc_html($modified_by->display_name) : 'N/A'; ?><br>
                <small><?php echo $modified_date ? date('d/m/Y H:i', strtotime($modified_date)) : 'N/A'; ?></small>
            </p>
        </div>
        <?php
    }

    /**
     * Obtener información de auditoría para API
     */
    public static function get_audit_info($property_id) {
        $created_by_id = get_post_meta($property_id, '_property_created_by', true);
        $created_date = get_post_meta($property_id, '_property_created_date', true);
        $modified_by_id = get_post_meta($property_id, '_property_last_modified_by', true);
        $modified_date = get_post_meta($property_id, '_property_last_modified_date', true);

        $created_by = get_user_by('id', $created_by_id);
        $modified_by = get_user_by('id', $modified_by_id);

        return [
            'created_by' => [
                'id' => $created_by_id,
                'name' => $created_by ? $created_by->display_name : null,
                'email' => $created_by ? $created_by->user_email : null,
            ],
            'created_date' => $created_date,
            'modified_by' => [
                'id' => $modified_by_id,
                'name' => $modified_by ? $modified_by->display_name : null,
                'email' => $modified_by ? $modified_by->user_email : null,
            ],
            'modified_date' => $modified_date,
        ];
    }
}
```

---

### FASE 3: Backend - Gestión de Usuarios

**Archivo:** `includes/class-property-user-management.php`

```php
class Property_User_Management {

    /**
     * Crear un nuevo usuario
     */
    public static function create_user($data) {
        // Verificar permisos
        if (!current_user_can('manage_dashboard_users')) {
            return new WP_Error('forbidden', 'No tienes permisos para crear usuarios.');
        }

        // Validar que el rol sea válido
        $allowed_roles = ['property_associate_v2', 'property_manager_v2'];
        if (!in_array($data['role'], $allowed_roles)) {
            return new WP_Error('invalid_role', 'Rol no válido.');
        }

        // Crear usuario
        $user_id = wp_create_user(
            $data['username'],
            $data['password'],
            $data['email']
        );

        if (is_wp_error($user_id)) {
            return $user_id;
        }

        // Asignar rol
        $user = get_user_by('id', $user_id);
        $user->set_role($data['role']);

        // Actualizar nombre
        wp_update_user([
            'ID' => $user_id,
            'display_name' => $data['display_name'],
            'first_name' => $data['first_name'] ?? '',
            'last_name' => $data['last_name'] ?? '',
        ]);

        return $user_id;
    }

    /**
     * Actualizar un usuario existente
     */
    public static function update_user($user_id, $data) {
        // Verificar permisos
        if (!current_user_can('manage_dashboard_users')) {
            return new WP_Error('forbidden', 'No tienes permisos para editar usuarios.');
        }

        $user = get_user_by('id', $user_id);

        // No permitir editar administradores de WP
        if (in_array('administrator', $user->roles)) {
            return new WP_Error('forbidden', 'No puedes editar administradores de WordPress.');
        }

        // Actualizar datos
        $user_data = [
            'ID' => $user_id,
        ];

        if (isset($data['email'])) {
            $user_data['user_email'] = $data['email'];
        }

        if (isset($data['display_name'])) {
            $user_data['display_name'] = $data['display_name'];
        }

        if (isset($data['password'])) {
            $user_data['user_pass'] = $data['password'];
        }

        wp_update_user($user_data);

        // Actualizar rol si se proporciona
        if (isset($data['role'])) {
            $allowed_roles = ['property_associate_v2', 'property_manager_v2'];
            if (in_array($data['role'], $allowed_roles)) {
                $user->set_role($data['role']);
            }
        }

        return true;
    }

    /**
     * Eliminar un usuario
     */
    public static function delete_user($user_id, $reassign_to = null) {
        // Verificar permisos
        if (!current_user_can('manage_dashboard_users')) {
            return new WP_Error('forbidden', 'No tienes permisos para eliminar usuarios.');
        }

        $user = get_user_by('id', $user_id);

        // No permitir eliminar administradores de WP
        if (in_array('administrator', $user->roles)) {
            return new WP_Error('forbidden', 'No puedes eliminar administradores de WordPress.');
        }

        // Eliminar usuario
        require_once(ABSPATH . 'wp-admin/includes/user.php');
        return wp_delete_user($user_id, $reassign_to);
    }

    /**
     * Listar usuarios gestionables
     */
    public static function get_manageable_users($args = []) {
        // Solo usuarios con roles del plugin
        $roles = ['property_associate_v2', 'property_manager_v2', 'property_admin'];

        $defaults = [
            'role__in' => $roles,
            'orderby' => 'registered',
            'order' => 'DESC',
        ];

        $args = wp_parse_args($args, $defaults);

        $users = get_users($args);

        // Formatear respuesta
        $formatted_users = [];
        foreach ($users as $user) {
            $formatted_users[] = [
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'role' => $user->roles[0] ?? '',
                'role_label' => self::get_role_label($user->roles[0] ?? ''),
                'registered' => $user->user_registered,
            ];
        }

        return $formatted_users;
    }

    /**
     * Obtener etiqueta del rol
     */
    private static function get_role_label($role) {
        $labels = [
            'property_associate_v2' => 'Asociado',
            'property_manager_v2' => 'Gerente',
            'property_admin' => 'Administrador',
        ];

        return $labels[$role] ?? $role;
    }
}
```

---

### FASE 4: Backend - API REST Endpoints

**Archivo:** `includes/class-property-rest-api.php` (modificar existente)

```php
// Agregar a la clase existente Property_REST_API

/**
 * Registrar endpoints de usuarios
 */
public function register_user_endpoints() {
    // GET /wp-json/property-manager/v1/users
    register_rest_route('property-manager/v1', '/users', [
        'methods' => 'GET',
        'callback' => [$this, 'get_users'],
        'permission_callback' => function() {
            return current_user_can('manage_dashboard_users');
        },
    ]);

    // POST /wp-json/property-manager/v1/users
    register_rest_route('property-manager/v1', '/users', [
        'methods' => 'POST',
        'callback' => [$this, 'create_user'],
        'permission_callback' => function() {
            return current_user_can('manage_dashboard_users');
        },
    ]);

    // PUT /wp-json/property-manager/v1/users/{id}
    register_rest_route('property-manager/v1', '/users/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => [$this, 'update_user'],
        'permission_callback' => function() {
            return current_user_can('manage_dashboard_users');
        },
    ]);

    // DELETE /wp-json/property-manager/v1/users/{id}
    register_rest_route('property-manager/v1', '/users/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => [$this, 'delete_user'],
        'permission_callback' => function() {
            return current_user_can('manage_dashboard_users');
        },
    ]);

    // GET /wp-json/property-manager/v1/profile (perfil del usuario actual)
    register_rest_route('property-manager/v1', '/profile', [
        'methods' => 'GET',
        'callback' => [$this, 'get_profile'],
        'permission_callback' => 'is_user_logged_in',
    ]);

    // PUT /wp-json/property-manager/v1/profile (actualizar perfil)
    register_rest_route('property-manager/v1', '/profile', [
        'methods' => 'PUT',
        'callback' => [$this, 'update_profile'],
        'permission_callback' => 'is_user_logged_in',
    ]);
}

// Callbacks de los endpoints...
public function get_users($request) {
    $params = $request->get_params();
    return Property_User_Management::get_manageable_users($params);
}

public function create_user($request) {
    $data = $request->get_json_params();
    $result = Property_User_Management::create_user($data);

    if (is_wp_error($result)) {
        return new WP_REST_Response($result, 400);
    }

    return new WP_REST_Response(['id' => $result], 201);
}

// ... más callbacks
```

---

### FASE 5: Frontend - Gestión de Usuarios

#### Archivo: `src/types/user.types.ts`

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  role: 'property_associate_v2' | 'property_manager_v2' | 'property_admin';
  role_label: string;
  registered: string;
}

export interface UserFormData {
  username: string;
  email: string;
  display_name: string;
  password: string;
  role: 'property_associate_v2' | 'property_manager_v2';
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  display_name: string;
  role: string;
  role_label: string;
}

export interface UserProfileUpdateData {
  display_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}
```

#### Archivo: `src/services/userService.ts`

```typescript
import api from './api';
import { User, UserFormData, UserProfile, UserProfileUpdateData } from '@/types/user.types';

class UserService {
  /**
   * Obtener lista de usuarios
   */
  async getUsers(params?: {
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<User[]> {
    const response = await api.get('/users', { params });
    return response.data;
  }

  /**
   * Crear usuario
   */
  async createUser(data: UserFormData): Promise<{ id: number }> {
    const response = await api.post('/users', data);
    return response.data;
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id: number, data: Partial<UserFormData>): Promise<void> {
    await api.put(`/users/${id}`, data);
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(id: number, reassignTo?: number): Promise<void> {
    await api.delete(`/users/${id}`, {
      params: { reassign: reassignTo },
    });
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/profile');
    return response.data;
  }

  /**
   * Actualizar perfil del usuario actual
   */
  async updateProfile(data: UserProfileUpdateData): Promise<void> {
    await api.put('/profile', data);
  }
}

export default new UserService();
```

#### Archivo: `src/stores/useUserStore.ts`

```typescript
import { create } from 'zustand';
import userService from '@/services/userService';
import { User, UserFormData } from '@/types/user.types';

interface UserStore {
  users: User[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUsers: () => Promise<void>;
  createUser: (data: UserFormData) => Promise<void>;
  updateUser: (id: number, data: Partial<UserFormData>) => Promise<void>;
  deleteUser: (id: number, reassignTo?: number) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar usuarios', isLoading: false });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await userService.createUser(data);
      await get().loadUsers(); // Recargar lista
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al crear usuario', isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await userService.updateUser(id, data);
      await get().loadUsers(); // Recargar lista
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al actualizar usuario', isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id, reassignTo) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteUser(id, reassignTo);
      await get().loadUsers(); // Recargar lista
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al eliminar usuario', isLoading: false });
      throw error;
    }
  },
}));
```

#### Archivo: `src/pages/UsersPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { Button } from '@/components/ui/button';
import UserTable from '@/components/users/UserTable';
import UserForm from '@/components/users/UserForm';
import UserDeleteModal from '@/components/users/UserDeleteModal';
import { User, UserFormData } from '@/types/user.types';

export default function UsersPage() {
  const { users, isLoading, loadUsers, createUser, updateUser, deleteUser } = useUserStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
    } else {
      await createUser(data);
    }
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async (reassignTo?: number) => {
    if (deletingUser) {
      await deleteUser(deletingUser.id, reassignTo);
      setDeletingUser(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={handleCreateClick}>
          Agregar Usuario
        </Button>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {deletingUser && (
        <UserDeleteModal
          user={deletingUser}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
```

---

### FASE 6: Frontend - Restricciones por Rol

#### Modificar: `src/components/layout/AppSidebar.tsx`

```typescript
import { canAccessUsers, canAccessSettings } from '@/utils/permissions';

export default function AppSidebar() {
  const navigationItems = [
    {
      name: 'Propiedades',
      href: '/properties',
      icon: Home,
      visible: true, // Todos pueden ver
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      visible: canAccessUsers(), // Solo Admin
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      visible: canAccessSettings(), // Solo Admin
    },
  ];

  const visibleItems = navigationItems.filter(item => item.visible);

  return (
    <nav>
      {visibleItems.map(item => (
        <NavItem key={item.name} {...item} />
      ))}
    </nav>
  );
}
```

#### Modificar: `src/utils/permissions.ts`

```typescript
// Agregar nuevas funciones de verificación

/**
 * Verifica si el usuario puede acceder a la gestión de usuarios
 */
export function canAccessUsers(): boolean {
  return can('manage_dashboard_users');
}

/**
 * Verifica si el usuario puede acceder a configuración
 */
export function canAccessSettings(): boolean {
  // Solo Admin puede acceder
  return getCurrentUser()?.role === 'property_admin';
}

/**
 * Verifica si el usuario puede gestionar usuarios
 */
export function canManageUsers(): boolean {
  return can('manage_dashboard_users');
}

/**
 * Verifica si el usuario puede eliminar propiedades
 */
export function canDeleteProperty(property: Property): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  // Solo property_admin puede eliminar
  return user.role === 'property_admin';
}
```

---

## 📊 EVALUACIÓN DE COMPLEJIDAD

### Complejidad General: ⭐⭐⭐⭐ (Alta - 4/5)

### Desglose por Componente:

| Componente | Complejidad | Tiempo Estimado | Justificación |
|------------|-------------|-----------------|---------------|
| **Nuevos roles y capacidades** | ⭐⭐⭐ Media | 4-6 horas | WordPress tiene APIs sólidas para roles. El sistema actual ya implementa roles custom. |
| **Restricciones de Admin WP** | ⭐⭐⭐⭐ Alta | 6-8 horas | Requiere múltiples hooks y filtros. Ocultar menús selectivamente es complejo. |
| **Sistema de auditoría** | ⭐⭐ Baja | 3-4 horas | Agregar meta fields y hooks de guardado es relativamente simple. |
| **API REST de usuarios** | ⭐⭐⭐ Media | 5-7 horas | REST API de WP es robusta pero requiere validación de permisos cuidadosa. |
| **Frontend - Gestión usuarios** | ⭐⭐⭐⭐ Alta | 10-12 horas | Crear CRUD completo con formularios, tabla, modales, validaciones. |
| **Frontend - Perfil usuario** | ⭐⭐ Baja | 3-4 horas | Formulario simple con pocos campos. |
| **Frontend - Restricciones UI** | ⭐⭐ Baja | 2-3 horas | Usar utilities de permisos para ocultar/mostrar elementos. |
| **Integración y testing** | ⭐⭐⭐⭐ Alta | 8-10 horas | Testing exhaustivo de permisos, edge cases, seguridad. |

### **Total Estimado: 41-54 horas (5-7 días de trabajo)**

---

## ⚠️ RIESGOS Y CONSIDERACIONES

### 1. Seguridad

**Riesgos:**
- Escalada de privilegios si los permisos no están bien implementados
- Usuarios creando otros Admin sin autorización
- Bypass de restricciones de admin WP

**Mitigaciones:**
- Verificar permisos en TODOS los endpoints de API
- Usar `current_user_can()` de WordPress en lugar de verificar roles directamente
- Testing exhaustivo de edge cases
- Validar en backend, nunca solo en frontend

### 2. Compatibilidad con Plugins

**Riesgos:**
- Otros plugins pueden interferir con las restricciones del admin
- Conflictos con plugins de gestión de roles (User Role Editor, etc.)

**Mitigaciones:**
- Usar hooks con prioridad alta
- Documentar incompatibilidades conocidas
- Probar con plugins comunes

### 3. Migración de Roles Existentes

**Riesgos:**
- Usuarios actuales con roles `property_manager` y `property_associate` quedarán sin acceso
- Pérdida de datos de permisos

**Mitigaciones:**
- Script de migración para actualizar roles existentes
- Backup de base de datos antes de activar
- Interfaz para asignar roles manualmente

### 4. Performance

**Riesgos:**
- Verificaciones de permisos en cada request pueden ralentizar
- Queries adicionales para obtener datos de auditoría

**Mitigaciones:**
- Cachear capacidades del usuario
- Usar `WP_Query` eficientemente
- Índices en meta fields de auditoría

---

## 🧪 PLAN DE TESTING

### 1. Testing de Roles y Permisos

**Casos de prueba:**
- [ ] Asociado puede crear propiedades
- [ ] Asociado puede editar solo sus propiedades
- [ ] Asociado NO puede editar propiedades de otros
- [ ] Asociado NO puede eliminar propiedades (ni las suyas)
- [ ] Asociado NO puede acceder al admin de WP
- [ ] Gerente puede editar TODAS las propiedades
- [ ] Gerente NO puede eliminar propiedades
- [ ] Gerente NO puede acceder al admin de WP
- [ ] Admin puede eliminar propiedades
- [ ] Admin puede acceder al admin de WP pero solo al CPT
- [ ] Admin puede ver tabs de Usuarios y Configuración
- [ ] Asociado y Gerente NO ven tabs de Usuarios y Configuración

### 2. Testing de Gestión de Usuarios

**Casos de prueba:**
- [ ] Admin puede crear usuario Asociado
- [ ] Admin puede crear usuario Gerente
- [ ] Admin NO puede crear otro Admin
- [ ] Admin NO puede crear Administrator de WP
- [ ] Admin puede editar usuarios Asociado/Gerente
- [ ] Admin NO puede editar Administrators de WP
- [ ] Admin puede eliminar usuarios con reasignación
- [ ] Validación de email único
- [ ] Validación de contraseña fuerte

### 3. Testing de Auditoría

**Casos de prueba:**
- [ ] Al crear propiedad, se guarda "Creado por"
- [ ] Al editar propiedad, se actualiza "Modificado por"
- [ ] Campos de auditoría son readonly en admin WP
- [ ] Campos de auditoría son readonly en dashboard
- [ ] Información correcta en modal de Vista

### 4. Testing de Seguridad

**Casos de prueba:**
- [ ] No se puede hacer request directo a API sin permisos
- [ ] No se puede editar URL para acceder a admin WP sin permisos
- [ ] No se puede manipular nonce de WordPress
- [ ] No se puede crear usuario con rol no autorizado
- [ ] SQL injection en campos de usuario
- [ ] XSS en campos de texto

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend

- [ ] Crear `class-property-roles-v2.php`
  - [ ] Definir 3 nuevos roles
  - [ ] Registrar capacidades personalizadas
  - [ ] Funciones de verificación de permisos
- [ ] Crear `class-property-admin-restrictions.php`
  - [ ] Bloquear acceso al admin WP para Asociado/Gerente
  - [ ] Ocultar menús para Admin (solo CPT)
  - [ ] Ocultar barra de admin
- [ ] Crear `class-property-audit.php`
  - [ ] Hook para guardar auditoría
  - [ ] Metabox en admin WP
  - [ ] Función para API
- [ ] Crear `class-property-user-management.php`
  - [ ] Crear usuario
  - [ ] Actualizar usuario
  - [ ] Eliminar usuario
  - [ ] Listar usuarios gestionables
- [ ] Modificar `class-property-rest-api.php`
  - [ ] Agregar endpoints de usuarios
  - [ ] Agregar endpoints de perfil
  - [ ] Agregar campos de auditoría a respuestas de propiedades
- [ ] Modificar `property-manager.php`
  - [ ] Incluir nuevas clases
  - [ ] Activar nuevas clases

### Frontend

- [ ] Crear estructura de archivos
  - [ ] `src/types/user.types.ts`
  - [ ] `src/services/userService.ts`
  - [ ] `src/stores/useUserStore.ts`
  - [ ] `src/pages/UsersPage.tsx`
  - [ ] `src/pages/UserProfilePage.tsx`
  - [ ] `src/components/users/UserTable.tsx`
  - [ ] `src/components/users/UserForm.tsx`
  - [ ] `src/components/users/UserDeleteModal.tsx`
  - [ ] `src/components/profile/UserProfileForm.tsx`
- [ ] Modificar archivos existentes
  - [ ] `src/router.tsx` - Agregar rutas
  - [ ] `src/utils/permissions.ts` - Nuevas funciones
  - [ ] `src/utils/constants.ts` - Nuevos roles
  - [ ] `src/components/layout/AppSidebar.tsx` - Ocultar items
  - [ ] `src/components/layout/AppHeader.tsx` - Agregar "Mi Perfil"
  - [ ] `src/types/property.types.ts` - Campos de auditoría
  - [ ] `src/components/properties/PropertySidebar.tsx` - Mostrar auditoría

### Testing

- [ ] Testing de permisos (backend)
- [ ] Testing de API (endpoints)
- [ ] Testing de UI (componentes)
- [ ] Testing de seguridad
- [ ] Testing de integración

### Documentación

- [ ] Documentar nuevos roles
- [ ] Documentar API de usuarios
- [ ] Documentar campos de auditoría
- [ ] Guía de migración de roles antiguos

---

## 🚀 PLAN DE DESPLIEGUE

### Fase 1: Desarrollo (Semana 1-2)
- Implementar backend (roles, auditoría, API)
- Implementar frontend (gestión de usuarios)

### Fase 2: Testing (Semana 2-3)
- Testing exhaustivo de permisos
- Testing de seguridad
- Corrección de bugs

### Fase 3: Migración (Semana 3)
- Script de migración de roles antiguos
- Backup de base de datos
- Testing en staging

### Fase 4: Despliegue (Semana 4)
- Deploy a producción
- Monitoreo de errores
- Soporte a usuarios

---

## 💡 MEJORAS FUTURAS (Opcional)

### 1. Logs de Auditoría Completos
- Registrar TODAS las acciones (crear, editar, eliminar)
- Tabla dedicada en base de datos
- Interfaz para ver historial de cambios

### 2. Notificaciones por Rol
- Admin recibe notificaciones de nuevas propiedades
- Gerente recibe notificaciones de asignaciones
- Asociado recibe notificaciones de cambios en sus propiedades

### 3. Dashboard de Estadísticas por Rol
- Admin: Estadísticas globales
- Gerente: Estadísticas del equipo
- Asociado: Solo sus estadísticas

### 4. Permisos Granulares
- Permisos a nivel de campo (qué campos puede editar cada rol)
- Permisos por estado de propiedad (no editar vendidas)

### 5. Two-Factor Authentication (2FA)
- Para el rol Admin
- Código por email o autenticador

---

## 📞 CONTACTO Y SOPORTE

**Desarrollador:** [Tu nombre]
**Fecha de creación:** 13 de Noviembre, 2025
**Versión del documento:** 1.0

---

## 📝 RESUMEN EJECUTIVO

### Lo que se va a implementar:
✅ 3 roles personalizados con permisos específicos
✅ Restricciones de acceso al admin de WordPress
✅ Gestión de usuarios desde el dashboard (solo Admin)
✅ Campos de auditoría ("Quién modificó" y "Cuándo")
✅ Perfil de usuario editable
✅ Tabs visibles según rol

### Complejidad: Alta (4/5)
### Tiempo estimado: 5-7 días de desarrollo
### Riesgos principales: Seguridad, migración de roles existentes

### Próximos pasos:
1. Revisar y aprobar este plan
2. Comenzar con Fase 1: Backend
3. Testing exhaustivo antes de deploy
