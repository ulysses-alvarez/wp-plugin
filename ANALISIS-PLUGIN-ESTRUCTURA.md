# ANÁLISIS COMPLETO: ESTRUCTURA DEL PLUGIN DE GESTIÓN DE PROPIEDADES

## 1. ESTRUCTURA DE ARCHIVOS DEL PLUGIN

### Arquitectura General
El plugin está organizado en dos capas principales:

**Backend (WordPress PHP):**
```
property-manager-plugin/
├── property-manager.php          # Archivo principal del plugin
├── includes/
│   ├── class-property-cpt.php    # Custom Post Type y filtros de rol
│   ├── class-property-meta.php   # Campos meta y validación
│   ├── class-property-roles.php  # Sistema de permisos y roles
│   ├── class-property-rest-api.php # Endpoints REST API
│   ├── class-property-settings.php # Configuración del plugin
│   ├── class-property-installer.php # Activación/desactivación
│   ├── class-property-assets.php # Enqueue de scripts/styles
│   ├── class-property-template.php # Templates
│   └── class-property-shortcode.php # Shortcodes
└── templates/
    └── page-template-dashboard.php # Template de página
```

**Frontend (React + TypeScript):**
```
src/
├── components/
│   ├── layout/          # Componentes de estructura
│   ├── properties/      # Componentes específicos de propiedades
│   │   ├── PropertyTable.tsx      # Tabla listado
│   │   ├── PropertyFilters.tsx    # Filtros y búsqueda
│   │   ├── PropertyForm.tsx       # Formulario crear/editar
│   │   ├── PropertySidebar.tsx    # Panel lateral detalles
│   │   ├── PropertyGrid.tsx       # Vista en grid
│   │   ├── PropertyCard.tsx       # Card individual
│   │   └── ImportCSVModal.tsx     # Modal importación CSV
│   └── ui/             # Componentes reutilizables
├── pages/
│   ├── PropertiesPage.tsx        # Página principal
│   ├── SettingsPage.tsx
│   └── ComingSoonPage.tsx
├── stores/
│   └── usePropertyStore.ts       # Store Zustand
├── services/
│   └── api.ts                    # Cliente API REST
└── utils/
    ├── constants.ts              # Constantes
    └── permissions.ts            # Permisos
```

---

## 2. ESTRUCTURA DE LA TABLA/LISTADO DE PROPIEDADES

### PropertyTable Component (src/components/properties/PropertyTable.tsx)

**Características actuales:**
- Tabla HTML5 con estructura de 5 columnas
- Ordenamiento por: título, ubicación, estado, precio, fecha
- Paginación con selector de items por página (5, 10, 20, 50, 100)
- Filas interactivas con hover effects

**Columnas mostradas:**
1. **Propiedad** - Título + Patente
2. **Ubicación** - Estado, Municipio, Colonia, C.P. con ícono
3. **Estado** - Badge con color
4. **Precio** - Formateado en MXN
5. **Acciones** - Botones individuales

**Acciones Individuales Actuales:**
- Ver detalles (siempre disponible)
- Editar (si canEditProperty)
- Descargar ficha técnica (si attachment_url existe)
- Eliminar (si canDeleteProperty)

---

## 3. CAMPOS Y DATOS DE UNA PROPIEDAD

### Property Interface

```typescript
interface Property {
  id: number                    // Post ID
  title: string                 // Post title
  description?: string          // Post content
  status: PropertyStatus        // Meta: _property_status
  author_id: number             // Post author ID
  state?: string                // Meta: _property_state
  municipality?: string         // Meta: _property_municipality
  neighborhood?: string         // Meta: _property_neighborhood
  postal_code?: string          // Meta: _property_postal_code
  street?: string               // Meta: _property_street
  patent?: string               // Meta: _property_patent (unique ID)
  price?: number                // Meta: _property_price (MXN)
  google_maps_url?: string      // Meta: _property_google_maps_url
  attachment_id?: number        // Meta: _property_attachment_id
  attachment_url?: string       // Computed from attachment_id
  created_at?: string           // Post date
  updated_at?: string           // Post modified
}
```

### Meta Fields (10 requeridos)

| Meta Key | Type | Validation |
|----------|------|-----------|
| _property_status | string | ['available','sold','rented','reserved'] |
| _property_state | string | 32 Mexican states |
| _property_municipality | string | Text field |
| _property_neighborhood | string | Text field |
| _property_postal_code | string | 5 digits regex |
| _property_street | string | Text field |
| _property_patent | string | Uppercase only |
| _property_price | number | Float value (MXN) |
| _property_google_maps_url | string | URL (optional) |
| _property_attachment_id | integer | PDF/PNG/JPG ID (optional) |

---

## 4. ACCIONES INDIVIDUALES DISPONIBLES

### En PropertyTable.tsx

1. **Ver Detalles** (Always)
   - Abre sidebar en modo 'view'
   - Handler: `onPropertySelect(property)`

2. **Editar** (Conditional)
   - Abre sidebar en modo 'edit'
   - Mostrado si: `canEditProperty(property) === true`
   - Handler: `onPropertyEdit(property)`

3. **Descargar Ficha** (Conditional)
   - Descarga archivo adjunto
   - Mostrado si: `property.attachment_url` existe
   - Handler: `<a href download>`

4. **Eliminar** (Conditional)
   - Elimina con confirmación
   - Mostrado si: `canDeleteProperty(property) === true`
   - Handler: `onPropertyDelete(property)`

### Acciones de Importación (PropertiesPage.tsx)

- **Importar CSV** - Carga masiva con validación por fila
  - Silent mode para bulk operations
  - Validación individual de campos requeridos
  - Reporte de errores y éxitos

---

## 5. SISTEMA DE PERMISOS Y ROLES

### 3 Roles Definidos

#### Administrator (WP Built-in)
- view_properties, view_all_properties, create_properties
- edit_properties, edit_others_properties
- delete_properties, delete_others_properties
- manage_property_roles, export_properties, view_statistics, assign_properties

#### property_manager (Gerente)
- view_properties, view_all_properties, assign_properties
- view_team_statistics, export_properties
- delete_properties (solo propias)
- NO: delete_others_properties, manage_property_roles

#### property_associate (Asociado)
- view_properties (solo propias), view_own_statistics
- publish_posts, edit_posts
- NO: view_all_properties, delete_properties (completamente), assign_properties, export_properties

### Funciones Clave (Frontend)

```typescript
can(capability)                          // Genérico
canViewProperty(property)                // Ver individual
canEditProperty(property)                // Editar individual
canDeleteProperty(property)              // Eliminar individual
canCreateProperty()                      // Crear nuevas
canViewAllProperties()                   // Ver todas/propias
isAdmin() / isManager() / isAssociate()  // Checks por rol
```

### Funciones Clave (Backend)

```php
Property_Roles::can_view_property($user_id, $property_id)
Property_Roles::can_edit_property($user_id, $property_id)
Property_Roles::can_delete_property($user_id, $property_id)
Property_Roles::filter_property_deletion($caps, $cap, $user_id, $args)
```

---

## 6. ESTRUCTURA DE LA API REST EXISTENTE

### Namespace: `property-dashboard/v1`

### Endpoints

#### GET `/properties`
**Parámetros:**
- page, per_page, orderby (date|title|price|status|state|municipality)
- order (ASC|DESC)
- search, status, state, municipality (legacy)
- search_field, search_value (advanced search)

**Respuesta:** Array de Property objects con headers:
- X-WP-Total
- X-WP-TotalPages

#### GET `/properties/{id}`
**Respuesta:** Single Property object

#### POST `/properties`
**Body:** Partial PropertyData (todos los campos opcionales en update)

#### PATCH/PUT `/properties/{id}`
**Body:** Partial PropertyData

#### DELETE `/properties/{id}`
**Respuesta:** `{ deleted: true, id: number }`

#### GET `/user/me`
**Respuesta:**
```json
{
  "id": number,
  "name": string,
  "email": string,
  "role": string,
  "roleLabel": string,
  "capabilities": { [cap]: boolean }
}
```

#### GET `/price-ranges`
**Respuesta:** Array de rangos dinámicos

### Advanced Search Fields

- `all` - Búsqueda general
- `title`, `description`, `patent`, `municipality`, `street`
- `status` (exact), `state` (exact)
- `postal_code` (starts with)
- `price` (rango min-max)

### Autenticación

- **Nonce:** Header `X-WP-Nonce`
- **Permisos:** Verificados en permission callbacks
  - read: `view_properties`
  - create: `create_properties`
  - edit: `can_edit_property($user_id, $property_id)`
  - delete: `can_delete_property($user_id, $property_id)`

---

## 7. FRAMEWORKS Y LIBRERÍAS FRONTEND

### Stack Tecnológico

**Framework:**
- React 19.1.1
- TypeScript 5.9.3
- React Router DOM 7.9.5

**State Management:**
- Zustand 5.0.8
  - usePropertyStore (properties, filters, pagination, sorting)
  - useSettingsStore

**UI/Styling:**
- Tailwind CSS 3.4.18 (utility-first CSS)
- Lucide React 0.468.0 (icons)
- Custom components in src/components/ui/

**Formularios:**
- React Hook Form 7.66.0

**Notificaciones:**
- React Hot Toast 2.6.0

**Build:**
- Vite 7.1.7
- SWC para TypeScript compilation
- ESLint 9.36.0

### Estructura de Componentes

**Patrón:**
```
Component (FC)
├── Hooks (useState, useEffect, useCallback, usePropertyStore)
├── Event Handlers
└── JSX (Tailwind classes, condicionales, loops)
```

**usePropertyStore:**
```typescript
// Estado
properties: Property[]
loading: boolean
currentPage: number
totalPages: number
filters: { searchField, searchValue, search, status, state, municipality }
sortBy: 'date' | 'title' | 'price' | 'status' | 'state'
sortOrder: 'asc' | 'desc'

// Actions
loadProperties(params?)
createProperty(data, silent?)
updateProperty(id, data)
deleteProperty(id)
setFieldSearch(field, value)
setPage(page)
setSortBy(sortBy)
// + más...
```

### API Service (src/services/api.ts)

```typescript
fetchProperties(params: PropertyQueryParams)
fetchProperty(id: number)
createProperty(data: PropertyData)
updateProperty(id: number, data: Partial<PropertyData>)
deleteProperty(id: number)
uploadFile(file: File)
```

### Características Especiales

1. **Advanced Search** - Búsqueda contextual por campo
2. **CSV Import** - Bulk create con validación por fila
3. **Dynamic Price Ranges** - Calculados del servidor
4. **Permission-based UI** - Botones mostrados según permisos
5. **Sidebar Details** - Panel lateral para ver/editar
6. **Responsive Design** - Mobile-first con Tailwind

---

## RESUMEN EJECUTIVO PARA BULK ACTIONS

### Datos Clave para Implementación

**UI:**
- Tabla con 5 columnas
- Acciones individuales: ver, editar, descargar, eliminar
- PropertyTable.tsx (renderizado), PropertySidebar.tsx (detalles)

**Data:**
- 10 campos requeridos
- Store Zustand con acciones CRUD
- API REST endpoints disponibles
- Permisos: view_all_properties, edit_others_properties, delete_others_properties

**Permisos:**
- 3 roles: Admin (todos), Manager (vista todo, edit/delete propias), Associate (vista/edit propias)
- Funciones: canCreateProperty(), canEditProperty(property), canDeleteProperty(property)

**Tech Stack:**
- React + TypeScript
- Zustand store
- React Hot Toast
- Tailwind CSS
- REST API con nonce

**Relacionado:**
- CSV Import ya implementado (bulk create)
- Validación de campos requeridos
- Error handling con toasts
- Pagination y sorting
