# 🚀 Plan Final Ajustado - Sistema de Roles Personalizado

**Fecha:** 13 de Noviembre, 2025
**Versión:** Final (ajustado por usuario)
**Tiempo estimado:** 3-4 días (24-35 horas)

---

## 📋 AJUSTES REALIZADOS AL PLAN ORIGINAL

### ✅ Cambios Confirmados:
1. **Roles sin "_v2":** Eliminar roles actuales y crear nuevos con mismos nombres
2. **Auditoría simplificada:** Solo agregar campo "quién modificó", reutilizar campos existentes
3. **Gestión de usuarios:** Solo listado + links al admin WP (NO CRUD completo)
4. **Perfil simplificado:** Solo nombre, apellido y contraseña
5. **Ocultar campos en admin WP:** Preguntar cuáles antes de implementar
6. **Opción B para permisos:** Admin VE todos los usuarios pero solo EDITA roles permitidos

### 💰 Ahorro de tiempo:
- Plan original: 41-54 horas (5-7 días)
- Plan ajustado: 24-35 horas (3-4 días)
- **Ahorro: ~16-19 horas**

---

## 🎯 FASES DE IMPLEMENTACIÓN

### **FASE 1: Backend - Fundamentos** (6-8 horas / Día 1)

#### 1.1 Roles y Capacidades (3-4 horas)

**Objetivo:** Crear 3 roles personalizados con permisos específicos

**Tareas:**
- [ ] Eliminar roles actuales: `property_manager`, `property_associate`
- [ ] Crear rol `property_associate` (Asociado) con capacidades:
  - `view_properties` (solo las suyas)
  - `create_properties`
  - `edit_properties` (solo las suyas)
  - NO `delete_properties`
  - NO `edit_others_properties`
- [ ] Crear rol `property_manager` (Gerente) con capacidades:
  - `view_all_properties`
  - `create_properties`
  - `edit_properties`
  - `edit_others_properties`
  - NO `delete_properties`
- [ ] Crear rol `property_admin` (Admin) con capacidades:
  - Todas las capacidades de propiedades
  - `delete_properties`
  - `delete_others_properties`
  - `manage_dashboard_users`
  - `access_wp_admin_limited`
- [ ] Implementar función `can_delete_property($user_id, $property_id)`
- [ ] Implementar función `can_edit_property($user_id, $property_id)`
- [ ] Testing: Crear usuarios de prueba con cada rol

**Archivos:**
- `property-manager-plugin/includes/class-property-roles.php` (modificar)
- `property-manager-plugin/property-manager.php` (actualizar hook de activación)

**Código clave:**
```php
// Eliminar roles antiguos
remove_role('property_manager');
remove_role('property_associate');

// Crear nuevos roles
add_role('property_associate', 'Asociado', [
    'read' => true,
    'view_properties' => true,
    'create_properties' => true,
    'edit_properties' => true,
]);

add_role('property_manager', 'Gerente', [
    'read' => true,
    'view_properties' => true,
    'view_all_properties' => true,
    'create_properties' => true,
    'edit_properties' => true,
    'edit_others_properties' => true,
]);

add_role('property_admin', 'Administrador', [
    'read' => true,
    'view_properties' => true,
    'view_all_properties' => true,
    'create_properties' => true,
    'edit_properties' => true,
    'edit_others_properties' => true,
    'delete_properties' => true,
    'delete_others_properties' => true,
    'manage_dashboard_users' => true,
    'list_users' => true,
    'create_users' => true,
    'edit_users' => true,
    'delete_users' => true,
]);
```

---

#### 1.2 Sistema de Auditoría (1-2 horas)

**Objetivo:** Rastrear quién modificó cada propiedad por última vez

**Campos a utilizar:**
- `post_author` (creador) - **YA EXISTE en WordPress**
- `post_date` (fecha creación) - **YA EXISTE en WordPress**
- `_property_last_dashboard_update` (fecha última modificación) - **YA EXISTE en el plugin**
- `_property_last_modified_by` (quién modificó) - **NUEVO - A CREAR**

**Tareas:**
- [ ] Agregar meta field `_property_last_modified_by` que guarde user ID
- [ ] Hook `save_post_property` para actualizar el campo al editar
- [ ] Crear función `get_audit_info($property_id)` que retorne:
  ```php
  [
      'created_by' => [user data],
      'created_date' => post_date,
      'modified_by' => [user data],
      'modified_date' => _property_last_dashboard_update,
  ]
  ```
- [ ] Agregar metabox "Auditoría" en admin de WP (solo lectura)
- [ ] Incluir datos de auditoría en API REST (endpoint de propiedades)
- [ ] Testing: Editar propiedad y verificar que se actualiza

**Archivos:**
- `property-manager-plugin/includes/class-property-audit.php` (crear o modificar)
- `property-manager-plugin/includes/class-property-rest-api.php` (agregar campos)

**Código clave:**
```php
// Hook para actualizar auditoría
add_action('save_post_property', function($post_id, $post, $update) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    // Actualizar quién modificó
    update_post_meta($post_id, '_property_last_modified_by', get_current_user_id());

    // La fecha ya se actualiza con _property_last_dashboard_update
}, 10, 3);

// En API REST
'audit' => [
    'created_by' => get_user_by('id', $property->post_author),
    'created_date' => $property->post_date,
    'modified_by' => get_user_by('id', get_post_meta($property_id, '_property_last_modified_by', true)),
    'modified_date' => get_post_meta($property_id, '_property_last_dashboard_update', true),
]
```

---

#### 1.3 Restricciones Básicas Admin WP (2-3 horas)

**Objetivo:** Controlar acceso al admin de WordPress según rol

**Reglas:**
- Asociado y Gerente: NO acceden a `/wp-admin` (redirigir al dashboard)
- Admin del plugin: SÍ accede pero solo ve CPT de propiedades
- Barra de admin oculta para todos los roles custom

**Tareas:**
- [ ] Redirigir Asociado/Gerente si intentan acceder a `/wp-admin`
- [ ] Permitir AJAX para todos los roles
- [ ] Ocultar barra de admin para roles custom
- [ ] Configurar capacidades de `property_admin` (sin acceso a Posts, Páginas, Plugins)
- [ ] Ocultar menús del admin WP para `property_admin` (solo dejar CPT)
- [ ] Testing: Intentar acceder como cada rol

**Archivos:**
- `property-manager-plugin/includes/class-property-admin-restrictions.php` (crear)

**Código clave:**
```php
class Property_Admin_Restrictions {
    public function __construct() {
        add_action('admin_init', [$this, 'restrict_admin_access'], 1);
        add_action('admin_menu', [$this, 'hide_admin_menu_items'], 999);
        add_filter('show_admin_bar', [$this, 'hide_admin_bar'], 999);
    }

    public function restrict_admin_access() {
        $user = wp_get_current_user();

        if (in_array('property_associate', $user->roles) ||
            in_array('property_manager', $user->roles)) {

            if (defined('DOING_AJAX') && DOING_AJAX) return;

            wp_redirect(home_url('/propiedades'));
            exit;
        }
    }

    public function hide_admin_menu_items() {
        $user = wp_get_current_user();

        if (!in_array('property_admin', $user->roles)) return;

        global $menu;

        $allowed = [
            'edit.php?post_type=property',
            'profile.php',
        ];

        foreach ($menu as $key => $item) {
            if (!in_array($item[2], $allowed)) {
                unset($menu[$key]);
            }
        }
    }

    public function hide_admin_bar($show) {
        $user = wp_get_current_user();

        if (in_array('property_associate', $user->roles) ||
            in_array('property_manager', $user->roles) ||
            in_array('property_admin', $user->roles)) {
            return false;
        }

        return $show;
    }
}
```

---

### **FASE 2: Backend - Gestión de Usuarios** (4-6 horas / Día 1-2)

#### 2.1 Restricciones de Usuarios en Admin WP (3-4 horas)

**Objetivo:** Admin solo puede crear/editar usuarios con roles Asociado y Gerente

**Implementación:** Opción B Simplificada
- Admin VE todos los usuarios en `/wp-admin/users.php`
- Admin solo puede EDITAR usuarios con roles permitidos
- Si intenta editar otro rol → mensaje de error

**Tareas:**
- [ ] Filtrar dropdown de roles en formulario de usuario
- [ ] Validación al guardar usuario (prevenir asignar roles prohibidos)
- [ ] Prevenir que Admin edite/elimine Administradores de WP
- [ ] Prevenir que Admin cambie su propio rol
- [ ] Testing: Intentar crear usuario con rol `administrator`
- [ ] Testing: Intentar editar usuario con rol `administrator`

**Archivos:**
- `property-manager-plugin/includes/class-property-user-management.php` (crear)

**Código clave:**
```php
// Filtrar roles en dropdown
add_filter('editable_roles', function($roles) {
    $user = wp_get_current_user();

    if (in_array('property_admin', $user->roles)) {
        return array_intersect_key($roles, array_flip([
            'property_associate',
            'property_manager'
        ]));
    }

    return $roles;
});

// Validar al guardar
add_action('user_profile_update_errors', function($errors, $update, $user) {
    $current_user = wp_get_current_user();

    if (!in_array('property_admin', $current_user->roles)) return;

    $allowed_roles = ['property_associate', 'property_manager'];
    $new_role = $_POST['role'] ?? '';

    if (!in_array($new_role, $allowed_roles)) {
        $errors->add('invalid_role', 'No puedes asignar este rol.');
    }
}, 10, 3);

// Prevenir edición de otros roles
add_action('admin_init', function() {
    $current_user = wp_get_current_user();

    if (!in_array('property_admin', $current_user->roles)) return;

    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];
        $user = get_user_by('id', $user_id);

        if (!in_array($user->roles[0], ['property_associate', 'property_manager', 'property_admin'])) {
            wp_die('No tienes permisos para editar este usuario.');
        }
    }
});
```

---

#### 2.2 API REST de Usuarios (1-2 horas)

**Objetivo:** Endpoints para listado de usuarios y perfil

**Endpoints:**
1. `GET /wp-json/property-manager/v1/users` - Listar usuarios
2. `GET /wp-json/property-manager/v1/profile` - Perfil del usuario actual
3. `PUT /wp-json/property-manager/v1/profile` - Actualizar perfil

**Tareas:**
- [ ] Endpoint GET /users (filtrar solo roles permitidos)
- [ ] Endpoint GET /profile (usuario actual)
- [ ] Endpoint PUT /profile (actualizar nombre, apellido, contraseña)
- [ ] Verificaciones de permisos en cada endpoint
- [ ] Testing con Postman/Thunder Client

**Archivos:**
- `property-manager-plugin/includes/class-property-rest-api.php` (modificar)

**Código clave:**
```php
// GET /users
register_rest_route('property-manager/v1', '/users', [
    'methods' => 'GET',
    'callback' => function($request) {
        $users = get_users([
            'role__in' => ['property_admin', 'property_manager', 'property_associate']
        ]);

        return array_map(function($user) {
            return [
                'id' => $user->ID,
                'name' => $user->display_name,
                'email' => $user->user_email,
                'role' => $user->roles[0],
                'registered' => $user->user_registered,
            ];
        }, $users);
    },
    'permission_callback' => function() {
        return current_user_can('manage_dashboard_users');
    },
]);

// PUT /profile
register_rest_route('property-manager/v1', '/profile', [
    'methods' => 'PUT',
    'callback' => function($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();

        $update_data = ['ID' => $user_id];

        if (isset($data['first_name'])) {
            $update_data['first_name'] = sanitize_text_field($data['first_name']);
        }

        if (isset($data['last_name'])) {
            $update_data['last_name'] = sanitize_text_field($data['last_name']);
        }

        if (!empty($data['password'])) {
            $update_data['user_pass'] = $data['password'];
        }

        $result = wp_update_user($update_data);

        if (is_wp_error($result)) {
            return new WP_REST_Response(['error' => $result->get_error_message()], 400);
        }

        return new WP_REST_Response(['success' => true], 200);
    },
    'permission_callback' => 'is_user_logged_in',
]);
```

---

### **FASE 3: Frontend - Listado de Usuarios** (2-3 horas / Día 2)

#### 3.1 Página de Usuarios (2-3 horas)

**Objetivo:** Tabla simple con usuarios y links al admin WP

**Características:**
- Tabla con columnas: Nombre, Email, Rol, Fecha registro, Acciones
- Botón "Editar" → abre `/wp-admin/user-edit.php?user_id=X` en nueva pestaña
- Botón "Agregar Usuario" → abre `/wp-admin/user-new.php` en nueva pestaña
- Filtrar usuarios: mostrar solo Admin, Gerente, Asociado
- Loading state y error handling

**Tareas:**
- [ ] Crear tipos TypeScript (`user.types.ts`)
- [ ] Crear servicio de API (`userService.ts`)
- [ ] Crear página `UsersPage.tsx`
- [ ] Crear componente `UserTable.tsx`
- [ ] Integrar con API GET /users
- [ ] Implementar links a admin WP
- [ ] Loading skeleton
- [ ] Error handling
- [ ] Testing: Verificar links funcionan

**Archivos:**
- `src/types/user.types.ts` (crear)
- `src/services/userService.ts` (crear)
- `src/pages/UsersPage.tsx` (crear)
- `src/components/users/UserTable.tsx` (crear)
- `src/router.tsx` (agregar ruta)

**Código clave:**
```typescript
// src/types/user.types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'property_admin' | 'property_manager' | 'property_associate';
  role_label: string;
  registered: string;
}

// src/services/userService.ts
class UserService {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  }
}

// src/components/users/UserTable.tsx
export default function UserTable({ users }: { users: User[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role_label}</td>
            <td>
              <a
                href={`/wp-admin/user-edit.php?user_id=${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Editar
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// src/pages/UsersPage.tsx
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await userService.getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1>Usuarios</h1>
        <button
          onClick={() => window.open('/wp-admin/user-new.php', '_blank')}
        >
          Agregar Usuario
        </button>
      </div>

      {isLoading ? <Skeleton /> : <UserTable users={users} />}
    </div>
  );
}
```

---

### **FASE 4: Frontend - Perfil de Usuario** (2-3 horas / Día 2)

#### 4.1 Formulario de Perfil (2-3 horas)

**Objetivo:** Permitir que usuarios editen su nombre, apellido y contraseña

**Campos:**
- Nombre (first_name)
- Apellido (last_name)
- Contraseña (opcional)
- Rol (solo lectura)

**Tareas:**
- [ ] Agregar item "Mi Perfil" en dropdown del avatar
- [ ] Crear modal/página `UserProfilePage.tsx`
- [ ] Crear formulario `UserProfileForm.tsx`
- [ ] Validación de contraseña (mínimo 8 caracteres)
- [ ] Integración con API PUT /profile
- [ ] Toast de éxito/error
- [ ] Testing: Cambiar nombre y verificar

**Archivos:**
- `src/pages/UserProfilePage.tsx` (crear)
- `src/components/profile/UserProfileForm.tsx` (crear)
- `src/components/layout/AppHeader.tsx` (modificar dropdown)

**Código clave:**
```typescript
// src/components/layout/AppHeader.tsx
<DropdownMenu>
  <DropdownMenuItem onClick={() => navigate('/profile')}>
    Mi Perfil
  </DropdownMenuItem>
  <DropdownMenuItem onClick={handleLogout}>
    Cerrar Sesión
  </DropdownMenuItem>
</DropdownMenu>

// src/components/profile/UserProfileForm.tsx
export default function UserProfileForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userService.updateProfile(formData);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nombre"
        value={formData.first_name}
        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
      />

      <Input
        label="Apellido"
        value={formData.last_name}
        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
      />

      <Input
        label="Nueva Contraseña (opcional)"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <Button type="submit">Guardar Cambios</Button>
    </form>
  );
}
```

---

### **FASE 5: Frontend - Restricciones UI** (2-3 horas / Día 2-3)

#### 5.1 Visibilidad de Tabs (1-2 horas)

**Objetivo:** Mostrar/ocultar tabs según rol del usuario

**Reglas:**
- Asociado/Gerente: solo "Propiedades"
- Admin: "Propiedades", "Usuarios", "Configuración"

**Tareas:**
- [ ] Agregar funciones en `permissions.ts`:
  - `canAccessUsers()`
  - `canAccessSettings()`
- [ ] Modificar `AppSidebar` para filtrar items
- [ ] Agregar guardas de ruta en `router.tsx`
- [ ] Testing: Verificar con cada rol

**Archivos:**
- `src/utils/permissions.ts` (modificar)
- `src/components/layout/AppSidebar.tsx` (modificar)
- `src/router.tsx` (agregar guardas)

**Código clave:**
```typescript
// src/utils/permissions.ts
export function canAccessUsers(): boolean {
  return can('manage_dashboard_users');
}

export function canAccessSettings(): boolean {
  const user = getCurrentUser();
  return user?.role === 'property_admin';
}

// src/components/layout/AppSidebar.tsx
const navigationItems = [
  {
    name: 'Propiedades',
    href: '/properties',
    icon: Home,
    visible: true,
  },
  {
    name: 'Usuarios',
    href: '/users',
    icon: Users,
    visible: canAccessUsers(),
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    visible: canAccessSettings(),
  },
];

const visibleItems = navigationItems.filter(item => item.visible);
```

---

#### 5.2 Mostrar Auditoría en Dashboard (1 hora)

**Objetivo:** Mostrar quién creó/modificó la propiedad en el modal de Vista

**Tareas:**
- [ ] Agregar campos de auditoría al tipo `Property`
- [ ] Modificar componente de vista de propiedad
- [ ] Mostrar sección "Auditoría" (solo lectura)
- [ ] Testing: Verificar datos correctos

**Archivos:**
- `src/types/property.types.ts` (agregar campos)
- `src/components/properties/PropertySidebar.tsx` (modificar)

**Código clave:**
```typescript
// src/types/property.types.ts
export interface Property {
  // ... campos existentes
  audit?: {
    created_by: {
      id: number;
      name: string;
    };
    created_date: string;
    modified_by: {
      id: number;
      name: string;
    };
    modified_date: string;
  };
}

// En el modal de vista
<div className="mt-6 pt-6 border-t">
  <h3 className="font-semibold mb-2">Auditoría</h3>

  <div className="text-sm space-y-2">
    <div>
      <span className="text-gray-600">Creado por:</span>
      <span className="ml-2">{property.audit.created_by.name}</span>
      <div className="text-xs text-gray-500">
        {formatDate(property.audit.created_date)}
      </div>
    </div>

    <div>
      <span className="text-gray-600">Modificado por:</span>
      <span className="ml-2">{property.audit.modified_by.name}</span>
      <div className="text-xs text-gray-500">
        {formatDate(property.audit.modified_date)}
      </div>
    </div>
  </div>
</div>
```

---

### **FASE 6: Optimización Admin WP** (1-2 horas / Día 3)

#### 6.1 Ocultar Campos Innecesarios (1-2 horas)

⚠️ **ANTES DE IMPLEMENTAR: PREGUNTAR AL USUARIO**

**Pregunta para el usuario:**
¿Qué campos quieres ocultar en los formularios de usuario del admin WP?

**Ubicaciones:**
- A) `/wp-admin/user-new.php` (crear usuario)
- B) `/wp-admin/user-edit.php` (editar usuario)

**Campos candidatos a ocultar:**
- [ ] Sitio web (URL)
- [ ] Idioma del admin
- [ ] "Enviar notificación al usuario"
- [ ] Información biográfica
- [ ] Esquema de color del admin
- [ ] Atajos de teclado
- [ ] Barra de herramientas al ver el sitio

**Implementación (después de confirmar):**

```php
// includes/class-property-assets.php
add_action('admin_head-user-new.php', function() {
    ?>
    <style>
        /* Ocultar campos seleccionados */
        .user-url-wrap,
        .user-language-wrap,
        .user-description-wrap,
        .user-admin-color-wrap {
            display: none !important;
        }
    </style>
    <?php
});

add_action('admin_footer-user-new.php', function() {
    ?>
    <script>
    jQuery(document).ready(function($) {
        // Ocultar checkbox de notificación
        $('#send_user_notification').closest('tr').hide();

        // Ocultar otros campos dinámicos
        $('.user-profile-picture').hide();
    });
    </script>
    <?php
});
```

---

### **FASE 7: Testing y Ajustes** (6-8 horas / Día 3-4)

#### 7.1 Testing de Permisos (3-4 horas)

**Casos de prueba:**

**Asociado:**
- [ ] Puede crear propiedad
- [ ] Puede editar su propiedad
- [ ] NO puede editar propiedad de otro
- [ ] NO puede eliminar su propiedad
- [ ] NO puede eliminar propiedad de otro
- [ ] Al acceder a `/wp-admin` → redirige al dashboard
- [ ] Solo ve tab "Propiedades"
- [ ] Puede editar su perfil

**Gerente:**
- [ ] Puede crear propiedad
- [ ] Puede editar cualquier propiedad
- [ ] NO puede eliminar ninguna propiedad
- [ ] Al acceder a `/wp-admin` → redirige al dashboard
- [ ] Solo ve tab "Propiedades"
- [ ] Puede editar su perfil

**Admin:**
- [ ] Puede crear propiedad
- [ ] Puede editar cualquier propiedad
- [ ] Puede eliminar cualquier propiedad
- [ ] Puede acceder a `/wp-admin`
- [ ] Solo ve CPT de properties en admin WP
- [ ] Ve tabs "Propiedades", "Usuarios", "Configuración"
- [ ] Puede crear usuario Asociado
- [ ] Puede crear usuario Gerente
- [ ] NO puede crear usuario Administrator
- [ ] NO puede editar usuario Administrator
- [ ] Puede editar su perfil

---

#### 7.2 Testing de Auditoría (1 hora)

**Casos de prueba:**
- [ ] Al crear propiedad → `post_author` se guarda correctamente
- [ ] Al editar propiedad → `_property_last_modified_by` se actualiza
- [ ] Modal de vista muestra datos de auditoría correctos
- [ ] Metabox en admin WP muestra datos correctos
- [ ] API REST incluye datos de auditoría

---

#### 7.3 Testing de UI (2-3 horas)

**Casos de prueba:**
- [ ] Tabla de usuarios carga correctamente
- [ ] Links "Editar" abren admin WP en nueva pestaña
- [ ] Botón "Agregar Usuario" abre admin WP
- [ ] Perfil de usuario se actualiza correctamente
- [ ] Cambio de contraseña funciona
- [ ] Tabs se ocultan según rol
- [ ] Rutas protegidas redirigen correctamente
- [ ] Loading states funcionan
- [ ] Error handling funciona

---

#### 7.4 Testing de Seguridad (1 hora)

**Casos de prueba:**
- [ ] Request sin nonce → rechazado
- [ ] Request con nonce inválido → rechazado
- [ ] Asociado intenta eliminar vía API → rechazado
- [ ] Gerente intenta eliminar vía API → rechazado
- [ ] Admin intenta crear usuario `administrator` → rechazado
- [ ] Intentar cambiar propio rol vía API → rechazado
- [ ] XSS en campos de texto → sanitizado
- [ ] SQL Injection → protegido (WordPress lo maneja)

---

### **FASE 8: Documentación** (1-2 horas / Día 4)

#### 8.1 Documentación Técnica

**Tareas:**
- [ ] Documentar nuevos roles y capacidades
- [ ] Documentar endpoints de API
- [ ] Documentar campos de auditoría
- [ ] Guía para Admin: cómo crear usuarios
- [ ] Notas sobre cambios de roles

**Archivos:**
- `docs/ROLES.md` (crear)
- `docs/API-USERS.md` (crear)
- `README.md` (actualizar)

---

### **FASE 9: Pendiente para Análisis Futuro** ⏸️

#### 9.1 Filtrado Visual de Usuarios (5-7 horas)

**Descripción:**
Admin solo VE usuarios con roles específicos en `/wp-admin/users.php`.
No ve Administradores de WP ni otros roles nativos.

**Estado:** Pendiente de decisión
**Alternativa actual:** Opción B - Admin ve todos pero solo edita roles permitidos

**Si se decide implementar:**
- Filtrar query de usuarios (`pre_get_users`)
- Filtrar contadores de usuarios (`views_users`)
- Filtrar búsquedas de usuarios
- Filtrar AJAX de autocompletar
- Testing exhaustivo

---

## 📊 RESUMEN DE TIEMPOS

```
┌────────┬────────────────────────────────────┬──────────┬─────────┐
│ FASE   │ DESCRIPCIÓN                        │ TIEMPO   │ DÍA     │
├────────┼────────────────────────────────────┼──────────┼─────────┤
│ 1      │ Backend - Fundamentos              │  6-8 hr  │ Día 1   │
│ 2      │ Backend - Gestión de Usuarios      │  4-6 hr  │ Día 1-2 │
│ 3      │ Frontend - Listado de Usuarios     │  2-3 hr  │ Día 2   │
│ 4      │ Frontend - Perfil de Usuario       │  2-3 hr  │ Día 2   │
│ 5      │ Frontend - Restricciones UI        │  2-3 hr  │ Día 2-3 │
│ 6      │ Optimización Admin WP              │  1-2 hr  │ Día 3   │
│ 7      │ Testing y Ajustes                  │  6-8 hr  │ Día 3-4 │
│ 8      │ Documentación                      │  1-2 hr  │ Día 4   │
├────────┼────────────────────────────────────┼──────────┼─────────┤
│ TOTAL  │                                    │ 24-35 hr │ 3-4 días│
└────────┴────────────────────────────────────┴──────────┴─────────┘
```

---

## ✅ CHECKLIST GENERAL

### Pre-requisitos
- [ ] Backup de la base de datos
- [ ] Entorno de desarrollo/staging listo
- [ ] Usuarios de prueba con roles actuales documentados

### Fase 1 - Backend Fundamentos
- [ ] Roles creados
- [ ] Auditoría implementada
- [ ] Restricciones admin WP funcionando

### Fase 2 - Backend Usuarios
- [ ] Restricciones de usuarios implementadas
- [ ] API REST de usuarios funcionando

### Fase 3 - Frontend Usuarios
- [ ] Tabla de usuarios muestra datos
- [ ] Links a admin WP funcionan

### Fase 4 - Frontend Perfil
- [ ] Formulario de perfil funciona
- [ ] Actualización de perfil funciona

### Fase 5 - Frontend UI
- [ ] Tabs se ocultan por rol
- [ ] Auditoría visible en dashboard

### Fase 6 - Admin WP
- [ ] Campos innecesarios ocultos

### Fase 7 - Testing
- [ ] Todos los casos de prueba pasan

### Fase 8 - Documentación
- [ ] Documentación completa

---

## 🎯 PRÓXIMO PASO

**Comenzar con FASE 1: Backend - Fundamentos**

---

**Fecha de creación:** 13 de Noviembre, 2025
**Última actualización:** 13 de Noviembre, 2025
**Estado:** ✅ Listo para implementación
