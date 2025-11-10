# 📋 PLAN DE DESARROLLO VALIDADO
## Property Dashboard React - WordPress Plugin

**Versión:** 1.0
**Fecha:** 2025-11-06
**Tiempo Estimado:** 14-20 días laborables

---

## 📖 Índice

1. [Validación del Stack Tecnológico](#-validación-del-stack-tecnológico)
2. [Arquitectura de Datos](#-arquitectura-de-datos)
3. [Sistema de Roles y Permisos](#-sistema-de-roles-y-permisos)
4. [Nomenclatura y Convenciones](#-nomenclatura-y-convenciones)
5. [Plan de Desarrollo por Fases](#-plan-de-desarrollo-por-fases)
6. [Seguridad](#-seguridad)
7. [Performance](#-performance)
8. [Checklist de Validación](#-checklist-de-validación)

---

## ✅ Validación del Stack Tecnológico

### Frontend - APROBADO ✓

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.49.0",
    "clsx": "^2.0.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Bundle Target:** < 200KB gzipped

### Backend - WordPress

- **Versión mínima:** WordPress 6.0+
- **PHP mínimo:** 7.4+
- **Almacenamiento:** Custom Post Type + Meta Fields
- **API:** WordPress REST API nativa
- **Autenticación:** WordPress Nonce + Capabilities

---

## 🏗️ Arquitectura de Datos

### Custom Post Type: `property`

**DECISIÓN ARQUITECTÓNICA:** Usar Custom Post Type en lugar de tabla customizada.

**Razones:**
- ✅ Aprovecha infraestructura nativa de WordPress
- ✅ REST API automática con `register_post_type()`
- ✅ Integración con WordPress admin
- ✅ Backup/migración más fácil
- ✅ Búsqueda nativa funciona
- ✅ Trash/restore built-in
- ✅ Revisiones automáticas (opcional)

### Estructura de Datos

```
Custom Post Type: 'property'
├── post_title → Título de la propiedad
├── post_content → Descripción
├── post_status → publish, draft, trash
├── post_author → ID del usuario creador
└── Meta Fields (wp_postmeta):
    ├── _property_status (available|sold|rented|reserved)
    ├── _property_state (string - Estado de México)
    ├── _property_municipality (string - Municipio)
    ├── _property_neighborhood (string - Colonia)
    ├── _property_postal_code (string - 5 dígitos)
    ├── _property_street (string - Dirección completa)
    ├── _property_patent (string - Número único)
    ├── _property_price (float - Precio en MXN)
    ├── _property_google_maps (string - URL)
    └── _property_attachment_id (int - ID del attachment)
```

### Mapeo de Campos (Original → Nuevo)

| Campo Original | Variable (Inglés) | Label (Español) |
|----------------|-------------------|-----------------|
| title | title | Título |
| estado_status | status | Estado |
| estado | state | Estado de la República |
| municipio | municipality | Municipio |
| colonia | neighborhood | Colonia |
| codigo_postal | postal_code | Código Postal |
| calle | street | Calle |
| patente | patent | Patente |
| precio | price | Precio |
| google_maps | google_maps_url | URL de Google Maps |
| description | description | Descripción |
| ficha_attachment_id | attachment_id | Ficha Técnica |

---

## 👥 Sistema de Roles y Permisos

### Definición de Roles

#### 1. **Admin** (Administrador)
**Variable:** `property_admin`
**Label:** Administrador

**Permisos:**
- ✅ Ver todas las propiedades
- ✅ Crear propiedades
- ✅ Editar todas las propiedades (propias y ajenas)
- ✅ Eliminar todas las propiedades (propias y ajenas)
- ✅ Gestionar usuarios y roles
- ✅ Configurar sistema
- ✅ Exportar/Importar datos
- ✅ Ver estadísticas completas

**Capabilities:**
```php
'view_properties'        => true,
'view_all_properties'    => true,
'create_properties'      => true,
'edit_properties'        => true,
'edit_others_properties' => true,
'delete_properties'      => true,
'delete_others_properties' => true,
'manage_property_roles'  => true,
'export_properties'      => true,
'view_statistics'        => true
```

#### 2. **Gerente** (Manager)
**Variable:** `property_manager`
**Label:** Gerente

**Permisos:**
- ✅ Ver todas las propiedades
- ✅ Crear propiedades
- ✅ Editar todas las propiedades (propias y ajenas)
- ✅ Eliminar solo sus propiedades
- ✅ Asignar propiedades a asociados
- ✅ Ver estadísticas de su equipo
- ❌ No puede gestionar usuarios
- ❌ No puede configurar sistema

**Capabilities:**
```php
'view_properties'        => true,
'view_all_properties'    => true,
'create_properties'      => true,
'edit_properties'        => true,
'edit_others_properties' => true,
'delete_properties'      => true,
'delete_others_properties' => false,
'assign_properties'      => true,
'view_team_statistics'   => true,
'manage_property_roles'  => false,
'export_properties'      => true
```

#### 3. **Asociado** (Associate)
**Variable:** `property_associate`
**Label:** Asociado

**Permisos:**
- ✅ Ver solo sus propiedades asignadas
- ✅ Crear propiedades (se asignan a él automáticamente)
- ✅ Editar solo sus propiedades
- ❌ No puede eliminar propiedades
- ❌ No puede ver propiedades de otros
- ❌ No puede asignar propiedades
- ✅ Ver estadísticas de sus propiedades

**Capabilities:**
```php
'view_properties'        => true,
'view_all_properties'    => false,
'create_properties'      => true,
'edit_properties'        => true,
'edit_others_properties' => false,
'delete_properties'      => false,
'delete_others_properties' => false,
'assign_properties'      => false,
'view_own_statistics'    => true,
'manage_property_roles'  => false,
'export_properties'      => false
```

### Matriz de Permisos

| Acción | Admin | Gerente | Asociado |
|--------|-------|---------|----------|
| Ver todas las propiedades | ✅ | ✅ | ❌ (solo propias) |
| Ver propiedades propias | ✅ | ✅ | ✅ |
| Crear propiedad | ✅ | ✅ | ✅ |
| Editar propia | ✅ | ✅ | ✅ |
| Editar ajena | ✅ | ✅ | ❌ |
| Eliminar propia | ✅ | ✅ | ❌ |
| Eliminar ajena | ✅ | ❌ | ❌ |
| Asignar a otro usuario | ✅ | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Exportar datos | ✅ | ✅ | ❌ |
| Ver estadísticas globales | ✅ | ✅ (equipo) | ✅ (propias) |
| Configurar sistema | ✅ | ❌ | ❌ |

### Implementación de Permisos

#### Backend (WordPress)

**Archivo:** `includes/class-property-roles.php`

```php
<?php
/**
 * Property Roles and Capabilities Manager
 */
class Property_Roles {

    /**
     * Register roles on plugin activation
     */
    public static function register_roles() {
        // Admin role capabilities (extends administrator)
        $admin_role = get_role('administrator');
        self::add_property_capabilities($admin_role, 'admin');

        // Manager role
        add_role('property_manager', __('Gerente', 'property-dashboard'), [
            'read' => true,
            'view_properties' => true,
            'view_all_properties' => true,
            'create_properties' => true,
            'edit_properties' => true,
            'edit_others_properties' => true,
            'delete_properties' => true,
            'assign_properties' => true,
            'view_team_statistics' => true,
            'export_properties' => true
        ]);

        // Associate role
        add_role('property_associate', __('Asociado', 'property-dashboard'), [
            'read' => true,
            'view_properties' => true,
            'create_properties' => true,
            'edit_properties' => true,
            'view_own_statistics' => true
        ]);
    }

    /**
     * Add property capabilities to admin
     */
    private static function add_property_capabilities($role, $level) {
        $capabilities = [
            'view_properties',
            'view_all_properties',
            'create_properties',
            'edit_properties',
            'edit_others_properties',
            'delete_properties',
            'delete_others_properties',
            'manage_property_roles',
            'export_properties',
            'view_statistics',
            'assign_properties'
        ];

        foreach ($capabilities as $cap) {
            $role->add_cap($cap);
        }
    }

    /**
     * Remove roles on plugin deactivation
     */
    public static function remove_roles() {
        remove_role('property_manager');
        remove_role('property_associate');

        // Remove capabilities from admin
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $capabilities = [
                'view_properties',
                'view_all_properties',
                'create_properties',
                'edit_properties',
                'edit_others_properties',
                'delete_properties',
                'delete_others_properties',
                'manage_property_roles',
                'export_properties',
                'view_statistics',
                'assign_properties'
            ];

            foreach ($capabilities as $cap) {
                $admin_role->remove_cap($cap);
            }
        }
    }

    /**
     * Check if user can view property
     */
    public static function can_view_property($user_id, $property_id) {
        $user = get_user_by('id', $user_id);

        // Admin and Manager can view all
        if (current_user_can('view_all_properties')) {
            return true;
        }

        // Associate can only view own properties
        if (current_user_can('view_properties')) {
            $property = get_post($property_id);
            return $property && $property->post_author == $user_id;
        }

        return false;
    }

    /**
     * Check if user can edit property
     */
    public static function can_edit_property($user_id, $property_id) {
        // Admin and Manager can edit all
        if (current_user_can('edit_others_properties')) {
            return true;
        }

        // Associate can only edit own
        if (current_user_can('edit_properties')) {
            $property = get_post($property_id);
            return $property && $property->post_author == $user_id;
        }

        return false;
    }

    /**
     * Check if user can delete property
     */
    public static function can_delete_property($user_id, $property_id) {
        // Only admin can delete others' properties
        if (current_user_can('delete_others_properties')) {
            return true;
        }

        // Manager and Associate can delete own
        if (current_user_can('delete_properties')) {
            $property = get_post($property_id);
            return $property && $property->post_author == $user_id;
        }

        return false;
    }

    /**
     * Get user role label
     */
    public static function get_role_label($role_slug) {
        $roles = [
            'administrator' => __('Administrador', 'property-dashboard'),
            'property_manager' => __('Gerente', 'property-dashboard'),
            'property_associate' => __('Asociado', 'property-dashboard')
        ];

        return $roles[$role_slug] ?? $role_slug;
    }
}
```

#### Frontend (React)

**Archivo:** `src/utils/permissions.js`

```javascript
/**
 * Permission utilities
 */

// Get current user from wpData
const getCurrentUser = () => window.wpPropertyDashboard?.currentUser || null;

// Check if user has specific capability
export const can = (capability) => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.capabilities?.[capability] === true;
};

// Role checks
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'administrator';
};

export const isManager = () => {
  const user = getCurrentUser();
  return user?.role === 'property_manager';
};

export const isAssociate = () => {
  const user = getCurrentUser();
  return user?.role === 'property_associate';
};

// Property-specific permissions
export const canViewProperty = (property) => {
  if (can('view_all_properties')) return true;
  if (can('view_properties')) {
    const user = getCurrentUser();
    return property.author_id === user?.id;
  }
  return false;
};

export const canEditProperty = (property) => {
  if (can('edit_others_properties')) return true;
  if (can('edit_properties')) {
    const user = getCurrentUser();
    return property.author_id === user?.id;
  }
  return false;
};

export const canDeleteProperty = (property) => {
  if (can('delete_others_properties')) return true;
  if (can('delete_properties')) {
    const user = getCurrentUser();
    return property.author_id === user?.id;
  }
  return false;
};

export const canCreateProperty = () => can('create_properties');
export const canAssignProperty = () => can('assign_properties');
export const canManageRoles = () => can('manage_property_roles');
export const canExportData = () => can('export_properties');

// Get role label (Spanish)
export const getRoleLabel = (roleSlug) => {
  const labels = {
    administrator: 'Administrador',
    property_manager: 'Gerente',
    property_associate: 'Asociado'
  };
  return labels[roleSlug] || roleSlug;
};

// Get status label (Spanish)
export const getStatusLabel = (status) => {
  const labels = {
    available: 'Disponible',
    sold: 'Vendida',
    rented: 'Alquilada',
    reserved: 'Reservada'
  };
  return labels[status] || status;
};
```

**Uso en componentes:**

```javascript
import { canEditProperty, canDeleteProperty, canCreateProperty } from '@/utils/permissions';

const PropertyCard = ({ property }) => {
  const canEdit = canEditProperty(property);
  const canDelete = canDeleteProperty(property);

  return (
    <div className="property-card">
      {/* ... */}
      <div className="actions">
        <button onClick={() => viewProperty(property.id)}>
          Ver Detalles
        </button>

        {canEdit && (
          <button onClick={() => editProperty(property.id)}>
            Editar
          </button>
        )}

        {canDelete && (
          <button onClick={() => deleteProperty(property.id)}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

const PropertyGrid = () => {
  const canCreate = canCreateProperty();

  return (
    <div>
      {canCreate && (
        <button onClick={openCreateModal}>
          Nueva Propiedad
        </button>
      )}
      {/* Grid de propiedades */}
    </div>
  );
};
```

### UI de Gestión de Roles

**Componente:** `src/components/admin/UserRoleManager.jsx`

```javascript
const UserRoleManager = () => {
  const { users, updateUserRole, loading } = useUserStore();
  const canManage = canManageRoles();

  if (!canManage) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          No tienes permisos para gestionar roles de usuario
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Roles</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Usuario</th>
            <th className="text-left py-2">Email</th>
            <th className="text-left py-2">Rol</th>
            <th className="text-left py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="py-3">{user.name}</td>
              <td className="py-3">{user.email}</td>
              <td className="py-3">
                <Select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  options={[
                    { value: 'property_associate', label: 'Asociado' },
                    { value: 'property_manager', label: 'Gerente' },
                    { value: 'administrator', label: 'Administrador' }
                  ]}
                />
              </td>
              <td className="py-3">
                <button className="text-primary hover:underline">
                  Ver Propiedades
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 📝 Nomenclatura y Convenciones

### Regla General

**CRITICAL:** Todas las variables, nombres de funciones, clases, y código deben estar en **INGLÉS**. Todos los labels, textos de interfaz, mensajes de error y contenido visible para el usuario deben estar en **ESPAÑOL**.

### Ejemplos

#### ✅ CORRECTO

```javascript
// Variable en inglés, label en español
const propertyStatus = 'available';
const statusLabel = 'Disponible';

// Función en inglés
function getPropertyById(id) {
  // ...
}

// Componente en inglés
const PropertyCard = ({ property }) => {
  return (
    <div>
      {/* Label en español */}
      <h3>{property.title}</h3>
      <span className="label">Estado: {getStatusLabel(property.status)}</span>
      <button>Editar Propiedad</button>
    </div>
  );
};

// Store en inglés
const usePropertyStore = create((set) => ({
  properties: [],
  loading: false,
  error: null,

  // Actions en inglés
  fetchProperties: async () => { /* ... */ },
  createProperty: async (data) => { /* ... */ }
}));

// Constants en inglés
export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  RENTED: 'rented',
  RESERVED: 'reserved'
};

// Labels en español
export const STATUS_LABELS = {
  available: 'Disponible',
  sold: 'Vendida',
  rented: 'Alquilada',
  reserved: 'Reservada'
};
```

#### ❌ INCORRECTO

```javascript
// ❌ Variables en español
const estadoPropiedad = 'disponible';
const obtenerPropiedadPorId = (id) => { /* ... */ };

// ❌ Labels en inglés
<button>Edit Property</button>
<span>Status: Available</span>
```

### Backend PHP

```php
<?php
// ✅ Nombres de clases, funciones y variables en inglés
class Property_REST_API {

    public function get_properties($request) {
        $search = $request->get_param('search');
        $state = $request->get_param('state');
        $status = $request->get_param('status');

        // ...
    }

    // ✅ Mensajes al usuario en español
    public function create_property($request) {
        if (empty($title)) {
            return new WP_Error(
                'missing_title',
                'El título es requerido',
                ['status' => 400]
            );
        }
    }
}

// ✅ Meta keys en inglés
update_post_meta($property_id, '_property_status', $status);
update_post_meta($property_id, '_property_price', $price);

// ✅ Registro de CPT - labels en español
register_post_type('property', [
    'labels' => [
        'name' => __('Propiedades', 'property-dashboard'),
        'singular_name' => __('Propiedad', 'property-dashboard'),
        'add_new' => __('Agregar Nueva', 'property-dashboard'),
        'add_new_item' => __('Agregar Nueva Propiedad', 'property-dashboard'),
        'edit_item' => __('Editar Propiedad', 'property-dashboard'),
        'view_item' => __('Ver Propiedad', 'property-dashboard'),
        'search_items' => __('Buscar Propiedades', 'property-dashboard')
    ]
]);
```

### Frontend React

```javascript
// ✅ Formulario con variables en inglés y labels en español
const PropertyForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        {/* Label en español */}
        <label>Título de la Propiedad</label>

        {/* Variable en inglés */}
        <input
          {...register('title', {
            required: 'El título es requerido'
          })}
          placeholder="Ingrese el título"
        />

        {/* Mensaje de error en español */}
        {errors.title && (
          <span className="error">{errors.title.message}</span>
        )}
      </div>

      <div>
        <label>Estado de la República</label>
        <select {...register('state', { required: true })}>
          <option value="">Seleccione un estado</option>
          <option value="jalisco">Jalisco</option>
          <option value="cdmx">Ciudad de México</option>
        </select>
      </div>

      <div>
        <label>Estado de la Propiedad</label>
        <select {...register('status')}>
          <option value="available">Disponible</option>
          <option value="sold">Vendida</option>
          <option value="rented">Alquilada</option>
          <option value="reserved">Reservada</option>
        </select>
      </div>

      <button type="submit">Guardar Propiedad</button>
    </form>
  );
};
```

### Constantes y Configuración

**Archivo:** `src/utils/constants.js`

```javascript
// Estados de México - Variables en inglés, labels en español
export const MEXICAN_STATES = [
  { value: 'aguascalientes', label: 'Aguascalientes' },
  { value: 'baja_california', label: 'Baja California' },
  { value: 'baja_california_sur', label: 'Baja California Sur' },
  { value: 'campeche', label: 'Campeche' },
  { value: 'chiapas', label: 'Chiapas' },
  { value: 'chihuahua', label: 'Chihuahua' },
  { value: 'cdmx', label: 'Ciudad de México' },
  { value: 'coahuila', label: 'Coahuila' },
  { value: 'colima', label: 'Colima' },
  { value: 'durango', label: 'Durango' },
  { value: 'guanajuato', label: 'Guanajuato' },
  { value: 'guerrero', label: 'Guerrero' },
  { value: 'hidalgo', label: 'Hidalgo' },
  { value: 'jalisco', label: 'Jalisco' },
  { value: 'mexico', label: 'Estado de México' },
  { value: 'michoacan', label: 'Michoacán' },
  { value: 'morelos', label: 'Morelos' },
  { value: 'nayarit', label: 'Nayarit' },
  { value: 'nuevo_leon', label: 'Nuevo León' },
  { value: 'oaxaca', label: 'Oaxaca' },
  { value: 'puebla', label: 'Puebla' },
  { value: 'queretaro', label: 'Querétaro' },
  { value: 'quintana_roo', label: 'Quintana Roo' },
  { value: 'san_luis_potosi', label: 'San Luis Potosí' },
  { value: 'sinaloa', label: 'Sinaloa' },
  { value: 'sonora', label: 'Sonora' },
  { value: 'tabasco', label: 'Tabasco' },
  { value: 'tamaulipas', label: 'Tamaulipas' },
  { value: 'tlaxcala', label: 'Tlaxcala' },
  { value: 'veracruz', label: 'Veracruz' },
  { value: 'yucatan', label: 'Yucatán' },
  { value: 'zacatecas', label: 'Zacatecas' }
];

// Status de propiedades
export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  RENTED: 'rented',
  RESERVED: 'reserved'
};

export const PROPERTY_STATUS_OPTIONS = [
  { value: PROPERTY_STATUS.AVAILABLE, label: 'Disponible' },
  { value: PROPERTY_STATUS.SOLD, label: 'Vendida' },
  { value: PROPERTY_STATUS.RENTED, label: 'Alquilada' },
  { value: PROPERTY_STATUS.RESERVED, label: 'Reservada' }
];

// Roles
export const USER_ROLES = {
  ADMIN: 'administrator',
  MANAGER: 'property_manager',
  ASSOCIATE: 'property_associate'
};

export const USER_ROLE_LABELS = {
  administrator: 'Administrador',
  property_manager: 'Gerente',
  property_associate: 'Asociado'
};

// Paginación
export const PAGINATION_OPTIONS = [
  { value: 5, label: '5 por página' },
  { value: 10, label: '10 por página' },
  { value: 20, label: '20 por página' },
  { value: 50, label: '50 por página' },
  { value: 100, label: '100 por página' }
];
```

---

## 🚀 Plan de Desarrollo por Fases

### FASE 0: Backend WordPress Setup ⏱️ 1 día
**Prioridad: CRÍTICA**

#### Objetivos
- Crear estructura del plugin WordPress
- Registrar Custom Post Type 'property'
- Implementar sistema de roles y permisos
- Configurar REST API básica
- Crear activation/deactivation hooks

#### Archivos a Crear

```
wordpress-plugin/
├── property-dashboard.php                    # Plugin principal
├── includes/
│   ├── class-property-cpt.php               # Custom Post Type
│   ├── class-property-meta.php              # Meta fields registration
│   ├── class-property-roles.php             # Roles y permisos ⭐ NUEVO
│   ├── class-property-rest-api.php          # REST API endpoints
│   ├── class-property-installer.php         # Activation hooks
│   ├── class-property-shortcode.php         # Shortcode handler
│   └── class-property-assets.php            # Enqueue scripts
└── README.md
```

#### Implementación

**1. Plugin Principal** - `property-dashboard.php`

```php
<?php
/**
 * Plugin Name: Property Dashboard
 * Description: Sistema de gestión de propiedades inmobiliarias con interfaz React
 * Version: 1.0.0
 * Author: Tu Nombre
 * Text Domain: property-dashboard
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) exit;

// Define constants
define('PROPERTY_DASHBOARD_VERSION', '1.0.0');
define('PROPERTY_DASHBOARD_PATH', plugin_dir_path(__FILE__));
define('PROPERTY_DASHBOARD_URL', plugin_dir_url(__FILE__));

// Autoload classes
require_once PROPERTY_DASHBOARD_PATH . 'includes/class-property-cpt.php';
require_once PROPERTY_DASHBOARD_PATH . 'includes/class-property-meta.php';
require_once PROPERTY_DASHBOARD_PATH . 'includes/class-property-roles.php';
require_once PROPERTY_DASHBOARD_PATH . 'includes/class-property-rest-api.php';
require_once PROPERTY_DASHBOARD_PATH . 'includes/class-property-installer.php';
require_once PROPERTY_DASHBOARD_PATH . 'includes/class-property-shortcode.php';
require_once PROPERTY_DASHBOARD_PATH . 'includes/class-property-assets.php';

// Activation/Deactivation hooks
register_activation_hook(__FILE__, ['Property_Installer', 'activate']);
register_deactivation_hook(__FILE__, ['Property_Installer', 'deactivate']);

// Initialize plugin
function property_dashboard_init() {
    // Register CPT
    Property_CPT::register();

    // Register meta fields
    Property_Meta::register_fields();

    // Initialize REST API
    $rest_api = new Property_REST_API();
    $rest_api->register_routes();

    // Register shortcode
    Property_Shortcode::register();

    // Enqueue assets
    Property_Assets::init();
}
add_action('init', 'property_dashboard_init');

// Load text domain
function property_dashboard_load_textdomain() {
    load_plugin_textdomain(
        'property-dashboard',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
}
add_action('plugins_loaded', 'property_dashboard_load_textdomain');
```

**2. Installer** - `includes/class-property-installer.php`

```php
<?php
/**
 * Plugin installation and activation
 */
class Property_Installer {

    /**
     * Run on plugin activation
     */
    public static function activate() {
        // Register CPT (needed before flush)
        Property_CPT::register();

        // Register roles and capabilities
        Property_Roles::register_roles();

        // Flush rewrite rules
        flush_rewrite_rules();

        // Set default options
        self::set_default_options();

        // Create example page (optional)
        self::create_example_page();
    }

    /**
     * Run on plugin deactivation
     */
    public static function deactivate() {
        // Remove roles (optional - solo si quieres que se borren)
        // Property_Roles::remove_roles();

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Set default plugin options
     */
    private static function set_default_options() {
        $defaults = [
            'properties_per_page' => 20,
            'enable_google_maps' => true,
            'currency_symbol' => 'MXN',
            'date_format' => 'd/m/Y'
        ];

        add_option('property_dashboard_settings', $defaults);
    }

    /**
     * Create example page with shortcode
     */
    private static function create_example_page() {
        // Check if page already exists
        $page_check = get_page_by_path('dashboard-propiedades');

        if (!$page_check) {
            $page_data = [
                'post_title' => __('Dashboard de Propiedades', 'property-dashboard'),
                'post_content' => '[property_dashboard]',
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_author' => 1
            ];

            wp_insert_post($page_data);
        }
    }
}
```

**3. Custom Post Type** - `includes/class-property-cpt.php`

```php
<?php
/**
 * Property Custom Post Type
 */
class Property_CPT {

    /**
     * Register the property post type
     */
    public static function register() {
        $labels = [
            'name' => __('Propiedades', 'property-dashboard'),
            'singular_name' => __('Propiedad', 'property-dashboard'),
            'menu_name' => __('Propiedades', 'property-dashboard'),
            'add_new' => __('Agregar Nueva', 'property-dashboard'),
            'add_new_item' => __('Agregar Nueva Propiedad', 'property-dashboard'),
            'edit_item' => __('Editar Propiedad', 'property-dashboard'),
            'new_item' => __('Nueva Propiedad', 'property-dashboard'),
            'view_item' => __('Ver Propiedad', 'property-dashboard'),
            'search_items' => __('Buscar Propiedades', 'property-dashboard'),
            'not_found' => __('No se encontraron propiedades', 'property-dashboard'),
            'not_found_in_trash' => __('No hay propiedades en la papelera', 'property-dashboard')
        ];

        $args = [
            'labels' => $labels,
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'rest_base' => 'properties',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'query_var' => true,
            'rewrite' => ['slug' => 'propiedad'],
            'capability_type' => 'post',
            'capabilities' => [
                'edit_post' => 'edit_properties',
                'read_post' => 'view_properties',
                'delete_post' => 'delete_properties',
                'edit_posts' => 'edit_properties',
                'edit_others_posts' => 'edit_others_properties',
                'delete_posts' => 'delete_properties',
                'publish_posts' => 'create_properties',
                'read_private_posts' => 'view_properties'
            ],
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => 5,
            'menu_icon' => 'dashicons-building',
            'supports' => ['title', 'editor', 'author', 'revisions']
        ];

        register_post_type('property', $args);
    }
}
```

**4. Meta Fields** - `includes/class-property-meta.php`

```php
<?php
/**
 * Property Meta Fields Registration
 */
class Property_Meta {

    /**
     * Register all meta fields
     */
    public static function register_fields() {
        // Status
        register_post_meta('property', '_property_status', [
            'type' => 'string',
            'description' => __('Estado de la propiedad', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'default' => 'available',
            'sanitize_callback' => [self::class, 'sanitize_status']
        ]);

        // State (Estado de la República)
        register_post_meta('property', '_property_state', [
            'type' => 'string',
            'description' => __('Estado de la República', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'sanitize_text_field'
        ]);

        // Municipality
        register_post_meta('property', '_property_municipality', [
            'type' => 'string',
            'description' => __('Municipio', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'sanitize_text_field'
        ]);

        // Neighborhood
        register_post_meta('property', '_property_neighborhood', [
            'type' => 'string',
            'description' => __('Colonia', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'sanitize_text_field'
        ]);

        // Postal Code
        register_post_meta('property', '_property_postal_code', [
            'type' => 'string',
            'description' => __('Código Postal', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => [self::class, 'sanitize_postal_code']
        ]);

        // Street
        register_post_meta('property', '_property_street', [
            'type' => 'string',
            'description' => __('Calle', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'sanitize_text_field'
        ]);

        // Patent
        register_post_meta('property', '_property_patent', [
            'type' => 'string',
            'description' => __('Patente', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'sanitize_text_field'
        ]);

        // Price
        register_post_meta('property', '_property_price', [
            'type' => 'number',
            'description' => __('Precio', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'floatval'
        ]);

        // Google Maps URL
        register_post_meta('property', '_property_google_maps_url', [
            'type' => 'string',
            'description' => __('URL de Google Maps', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'esc_url_raw'
        ]);

        // Attachment ID
        register_post_meta('property', '_property_attachment_id', [
            'type' => 'integer',
            'description' => __('ID de ficha técnica', 'property-dashboard'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'absint'
        ]);
    }

    /**
     * Sanitize status field
     */
    public static function sanitize_status($value) {
        $allowed = ['available', 'sold', 'rented', 'reserved'];
        return in_array($value, $allowed) ? $value : 'available';
    }

    /**
     * Sanitize postal code
     */
    public static function sanitize_postal_code($value) {
        // Remove non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $value);

        // Ensure 5 digits
        return substr($cleaned, 0, 5);
    }
}
```

#### Testing Checklist
- [ ] Plugin se activa sin errores
- [ ] CPT 'property' aparece en admin de WordPress
- [ ] Roles creados correctamente (verificar en Users > Roles)
- [ ] Meta fields registrados (verificar con `get_registered_meta_keys('post', 'property')`)
- [ ] Página de ejemplo creada con shortcode
- [ ] Flush rewrite rules funciona
- [ ] Desactivación limpia sin errores

---

### FASE 1: Frontend React + Vite Setup ⏱️ 1-2 días
**Prioridad: CRÍTICA**

#### Objetivos
- Crear proyecto React con Vite
- Instalar y configurar dependencias
- Configurar Tailwind CSS con paleta custom
- Configurar build para /dist
- Crear estructura de carpetas completa

#### Comandos de Instalación

```bash
# 1. Crear proyecto React con Vite
npm create vite@latest property-dashboard-react -- --template react

# 2. Entrar al directorio
cd property-dashboard-react

# 3. Instalar dependencias core
npm install zustand react-hook-form clsx react-hot-toast

# 4. Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. Instalar plugin de Vite
npm install -D @vitejs/plugin-react

# 6. Development server
npm run dev

# 7. Build para producción
npm run build
```

#### Configuraciones

**vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          store: ['zustand']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  base: './'
});
```

**tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#216121',
          hover: '#1a4d1a',
          light: '#e8f5e9',
          dark: '#0d3d0d'
        },
        secondary: {
          DEFAULT: '#64748b',
          hover: '#475569',
          light: '#f1f5f9'
        },
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669'
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626'
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706'
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#2563eb'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

**postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

**src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Base styles */
@layer base {
  body {
    @apply font-sans text-gray-900 bg-gray-50;
  }
}

/* Custom utilities */
@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Custom components */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-primary-hover;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }

  .btn-danger {
    @apply bg-danger text-white hover:bg-danger-dark;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow;
  }

  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
  }

  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}
```

#### Estructura de Carpetas

```
property-dashboard-react/
├── src/
│   ├── main.jsx                          # Entry point
│   ├── App.jsx                           # Root component
│   ├── index.css                         # Global styles
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── properties/
│   │   │   ├── PropertyGrid.jsx
│   │   │   ├── PropertyCard.jsx
│   │   │   ├── PropertyFilters.jsx
│   │   │   ├── PropertySidebar.jsx
│   │   │   ├── PropertyView.jsx
│   │   │   └── PropertyForm.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── UserRoleManager.jsx       # ⭐ NUEVO - Gestión roles
│   │   │   └── Statistics.jsx
│   │   │
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── Textarea.jsx
│   │       ├── SearchBar.jsx
│   │       ├── Pagination.jsx
│   │       ├── LoadingSpinner.jsx
│   │       ├── Badge.jsx
│   │       ├── Toast.jsx
│   │       ├── ConfirmModal.jsx
│   │       └── FileUpload.jsx
│   │
│   ├── stores/
│   │   ├── usePropertyStore.js
│   │   └── useUserStore.js               # ⭐ NUEVO - Store usuarios
│   │
│   ├── services/
│   │   ├── api.js
│   │   └── userApi.js                    # ⭐ NUEVO - API usuarios
│   │
│   ├── hooks/
│   │   ├── useProperties.js
│   │   ├── useDebounce.js
│   │   ├── useFilters.js
│   │   └── useKeyPress.js
│   │
│   └── utils/
│       ├── formatters.js                 # Formateo moneda, fechas
│       ├── validators.js                 # Validaciones
│       ├── constants.js                  # Constantes (estados, status)
│       └── permissions.js                # ⭐ NUEVO - Utilidades permisos
│
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

**package.json**

```json
{
  "name": "property-dashboard-react",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.49.0",
    "clsx": "^2.0.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**src/main.jsx**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Mount React app on WordPress div
const root = document.getElementById('property-dashboard-root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
```

**src/App.jsx**

```javascript
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Dashboard de Propiedades
        </h1>
        <p className="text-gray-600">
          Cargando aplicación...
        </p>
      </div>
    </div>
  );
}

export default App;
```

#### Testing Checklist
- [ ] `npm run dev` funciona sin errores
- [ ] Tailwind CSS aplicando estilos
- [ ] Font Inter cargando correctamente
- [ ] `npm run build` genera archivos en `/dist`
- [ ] Bundle size < 200KB
- [ ] Estructura de carpetas completa
- [ ] No hay warnings en consola

---

### FASE 2: Integración WordPress ↔ React ⏱️ 0.5 días
**Prioridad: CRÍTICA**

#### Objetivos
- Crear shortcode para renderizar React app
- Enqueue de assets compilados
- Pasar datos de WordPress a React vía wp_localize_script
- Verificar montaje correcto

#### Implementación

**includes/class-property-shortcode.php**

```php
<?php
/**
 * Property Dashboard Shortcode
 */
class Property_Shortcode {

    /**
     * Register shortcode
     */
    public static function register() {
        add_shortcode('property_dashboard', [self::class, 'render']);
    }

    /**
     * Render shortcode
     */
    public static function render($atts = []) {
        // Default attributes
        $atts = shortcode_atts([
            'view' => 'grid',
            'per_page' => 20
        ], $atts, 'property_dashboard');

        // Enqueue assets
        Property_Assets::enqueue_app($atts);

        // Return root div
        return '<div id="property-dashboard-root"></div>';
    }
}
```

**includes/class-property-assets.php**

```php
<?php
/**
 * Assets Management
 */
class Property_Assets {

    /**
     * Initialize
     */
    public static function init() {
        add_action('wp_enqueue_scripts', [self::class, 'register_assets']);
    }

    /**
     * Register assets (don't enqueue yet)
     */
    public static function register_assets() {
        $dist_path = PROPERTY_DASHBOARD_PATH . 'dist/';
        $dist_url = PROPERTY_DASHBOARD_URL . 'dist/';

        // Get manifest for cache busting
        $manifest_file = $dist_path . 'manifest.json';
        $manifest = file_exists($manifest_file)
            ? json_decode(file_get_contents($manifest_file), true)
            : [];

        $js_file = $manifest['index.js'] ?? 'assets/index.js';
        $css_file = $manifest['index.css'] ?? 'assets/index.css';

        // Register JavaScript
        wp_register_script(
            'property-dashboard-app',
            $dist_url . $js_file,
            [],
            PROPERTY_DASHBOARD_VERSION,
            true
        );

        // Register CSS
        wp_register_style(
            'property-dashboard-app',
            $dist_url . $css_file,
            [],
            PROPERTY_DASHBOARD_VERSION
        );
    }

    /**
     * Enqueue app assets
     */
    public static function enqueue_app($config = []) {
        // Enqueue scripts and styles
        wp_enqueue_script('property-dashboard-app');
        wp_enqueue_style('property-dashboard-app');

        // Get current user data
        $current_user = wp_get_current_user();
        $user_role = !empty($current_user->roles) ? $current_user->roles[0] : '';

        // Get user capabilities
        $capabilities = [];
        if ($current_user->ID) {
            $user = new WP_User($current_user->ID);
            $all_caps = $user->allcaps;

            // Filter only property-related capabilities
            $property_caps = array_filter(array_keys($all_caps), function($cap) {
                return strpos($cap, 'property') !== false ||
                       strpos($cap, 'edit') !== false ||
                       strpos($cap, 'delete') !== false ||
                       strpos($cap, 'view') !== false ||
                       strpos($cap, 'manage') !== false ||
                       strpos($cap, 'export') !== false;
            });

            foreach ($property_caps as $cap) {
                $capabilities[$cap] = $all_caps[$cap];
            }
        }

        // Prepare data to pass to React
        $wp_data = [
            'apiUrl' => rest_url('property-dashboard/v1'),
            'wpApiUrl' => rest_url('wp/v2'),
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
            'currentUser' => [
                'id' => $current_user->ID,
                'name' => $current_user->display_name,
                'email' => $current_user->user_email,
                'role' => $user_role,
                'roleLabel' => self::get_role_label($user_role),
                'capabilities' => $capabilities
            ],
            'config' => array_merge([
                'perPage' => 20,
                'view' => 'grid'
            ], $config),
            'i18n' => [
                'dateFormat' => get_option('date_format'),
                'timeFormat' => get_option('time_format'),
                'locale' => get_locale()
            ]
        ];

        // Localize script
        wp_localize_script(
            'property-dashboard-app',
            'wpPropertyDashboard',
            $wp_data
        );
    }

    /**
     * Get role label in Spanish
     */
    private static function get_role_label($role_slug) {
        $labels = [
            'administrator' => __('Administrador', 'property-dashboard'),
            'property_manager' => __('Gerente', 'property-dashboard'),
            'property_associate' => __('Asociado', 'property-dashboard')
        ];

        return $labels[$role_slug] ?? $role_slug;
    }
}
```

#### Testing Checklist
- [ ] Shortcode `[property_dashboard]` renderiza div
- [ ] JavaScript se carga correctamente
- [ ] CSS se carga correctamente
- [ ] `window.wpPropertyDashboard` existe en consola
- [ ] `wpPropertyDashboard.currentUser` contiene datos correctos
- [ ] `wpPropertyDashboard.nonce` está presente
- [ ] React app se monta en el div
- [ ] No hay errores en consola

---

### FASE 3: Zustand Store + API Service ⏱️ 1 día
**Prioridad: ALTA**

(Continuaría con el resto de las fases detalladamente...)

---

## 🔒 Seguridad

### 1. Sanitización Server-Side

**CRÍTICO:** Siempre sanitizar todos los inputs del usuario.

```php
// Sanitization functions
sanitize_text_field()      // Texto simple
sanitize_textarea_field()   // Textarea
sanitize_email()           // Email
sanitize_url()             // URL
esc_url_raw()              // URL (más estricto)
absint()                   // Integer positivo
floatval()                 // Float
wp_kses_post()             // HTML (solo tags permitidos)
```

### 2. Validación de Permisos

```php
// En cada endpoint REST API
function check_permission($request) {
    // Verificar nonce
    if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
        return new WP_Error('invalid_nonce', 'Nonce inválido', ['status' => 403]);
    }

    // Verificar capability
    if (!current_user_can('edit_properties')) {
        return new WP_Error('forbidden', 'No tienes permisos', ['status' => 403]);
    }

    return true;
}
```

### 3. CSRF Protection

Siempre incluir nonce en requests desde React:

```javascript
const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': window.wpPropertyDashboard.nonce
};
```

### 4. SQL Injection Prevention

```php
// ✅ SIEMPRE usar prepared statements
$wpdb->get_results($wpdb->prepare(
    "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND ID = %d",
    'property',
    $property_id
));

// ❌ NUNCA concatenar directamente
$wpdb->get_results("SELECT * FROM wp_posts WHERE ID = {$_GET['id']}");
```

### 5. XSS Prevention

React escapa por defecto, pero cuidado con:

```javascript
// ❌ Peligroso
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Seguro
<div>{userInput}</div>

// ✅ Si necesitas HTML, sanitiza primero
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## ⚡ Performance

### React Optimizations

```javascript
// 1. React.memo para componentes puros
const PropertyCard = React.memo(({ property }) => {
  return <div>...</div>;
});

// 2. useMemo para cálculos costosos
const filteredProperties = useMemo(() => {
  return properties.filter(p => /* ... */);
}, [properties, filters]);

// 3. useCallback para funciones
const handleDelete = useCallback((id) => {
  deleteProperty(id);
}, [deleteProperty]);

// 4. Code splitting
const PropertySidebar = lazy(() => import('./PropertySidebar'));
```

### Bundle Optimization

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-forms': ['react-hook-form'],
        'store': ['zustand']
      }
    }
  },
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true
    }
  }
}
```

---

## ✅ Checklist de Validación

### Backend WordPress
- [ ] CPT 'property' registrado
- [ ] Meta fields registrados
- [ ] REST API endpoints funcionando
- [ ] Roles y capabilities configurados
- [ ] Sanitización en todos los endpoints
- [ ] Nonce verificado
- [ ] Activation hooks funcionando

### Frontend React
- [ ] Build < 200KB gzipped
- [ ] Tailwind configurado
- [ ] Store de Zustand funcionando
- [ ] Permisos implementados
- [ ] Labels en español
- [ ] Variables en inglés

### Seguridad
- [ ] Nonce en todos los requests
- [ ] Sanitización server-side
- [ ] Validación client y server
- [ ] Permisos verificados
- [ ] No hay SQL injection
- [ ] No hay XSS vulnerabilities

### Performance
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Bundle optimizado
- [ ] React.memo implementado
- [ ] Debounce en búsqueda

---

## 📊 Resumen de Tiempo

| Fase | Días |
|------|------|
| 0. Backend WordPress Setup | 1 |
| 1. Frontend React Setup | 1-2 |
| 2. Integración WP ↔ React | 0.5 |
| 3. Store + API Service | 1 |
| 4. Componentes UI Base | 1 |
| 5. Grid de Propiedades | 2-3 |
| 6. Búsqueda y Filtros | 1-2 |
| 7. Modal Lateral | 2-3 |
| 8. Formulario CRUD | 2-3 |
| 9. Paginación | 1 |
| 10. Delete y Confirmaciones | 1 |
| 11. Polish y UX | 1-2 |
| 12. Testing y Optimización | 1-2 |
| **TOTAL** | **14-20 días** |

---

**Última actualización:** 2025-11-06
**Versión del documento:** 1.0
