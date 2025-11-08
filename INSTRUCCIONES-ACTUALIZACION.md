# 🔧 Instrucciones de Actualización del Plugin

---

## 🚀 PRIORIDAD INMEDIATA: Implementación del Sidebar de Navegación

### 📋 Objetivo

Implementar un sidebar lateral permanente con navegación, branding dinámico y panel de configuración del dashboard.

---

### 🎯 Análisis y Diseño

#### 1. Estructura Visual Propuesta

```
┌─────────────────┬──────────────────────────────────────┐
│   SIDEBAR       │       MAIN CONTENT (FULL WIDTH)      │
│   (260px fijo)  │                                       │
├─────────────────┼───────────────────────────────────────┤
│ ┌─────────────┐ │                                       │
│ │   HEADER    │ │                                       │
│ │  Logo + Nom │ │   [Dashboard de Propiedades]         │
│ └─────────────┘ │                                       │
│                 │                                       │
│ ┌─────────────┐ │   [Contenido dinámico según ruta]    │
│ │  NAVIGATION │ │                                       │
│ │             │ │                                       │
│ │ Propiedades │ │                                       │
│ │   └ Lista   │ │                                       │
│ │   └ Nueva   │ │                                       │
│ │             │ │                                       │
│ │ Usuario     │ │                                       │
│ │ Coming soon │ │                                       │
│ └─────────────┘ │                                       │
│                 │                                       │
│ ┌─────────────┐ │                                       │
│ │   FOOTER    │ │                                       │
│ │ Configuración│ │                                       │
│ └─────────────┘ │                                       │
└─────────────────┴───────────────────────────────────────┘
```

---

### 🔧 Componentes a Crear

#### 1. **AppSidebar.tsx** (Nuevo componente principal)

**Ubicación:** `src/components/layout/AppSidebar.tsx`

**Estructura:**
```typescript
interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const AppSidebar = ({ isCollapsed, onToggle }: AppSidebarProps) => {
  return (
    <aside className="app-sidebar">
      <SidebarHeader />
      <SidebarNavigation />
      <SidebarFooter />
    </aside>
  );
};
```

**Características:**
- Width fijo: 260px (expandido), 60px (colapsado)
- Background con color personalizable
- Sticky/fixed a la izquierda
- Z-index alto para estar sobre contenido
- Transiciones suaves con CSS

---

#### 2. **SidebarHeader.tsx** (Header del sidebar)

**Ubicación:** `src/components/layout/SidebarHeader.tsx`

**Contenido:**
- Logo del sitio (imagen cargable)
- Nombre del sitio (texto editable)
- Botón collapse opcional

**Datos Dinámicos:**
```typescript
interface SiteConfig {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
}
```

**Origen de Datos:**
- Nuevo endpoint: `GET /wp-json/property-dashboard/v1/settings`
- Store: `useSettingsStore.ts`

---

#### 3. **SidebarNavigation.tsx** (Menú de navegación)

**Ubicación:** `src/components/layout/SidebarNavigation.tsx`

**Items del Menú:**

```typescript
const navigationItems = [
  {
    id: 'properties',
    label: 'Propiedades',
    icon: <HomeIcon />,
    path: '/properties',
    subitems: [
      { label: 'Lista', path: '/properties' },
      { label: 'Nueva Propiedad', path: '/properties/new' }
    ]
  },
  {
    id: 'users',
    label: 'Usuario',
    icon: <UserIcon />,
    path: '/users',
    content: <ComingSoon />
  }
];
```

**Funcionalidades:**
- Menú colapsable/expandible
- Highlight del item activo (react-router)
- Iconos de Lucide React
- Subitems con indentación

---

#### 4. **SidebarFooter.tsx** (Footer del sidebar)

**Ubicación:** `src/components/layout/SidebarFooter.tsx`

**Contenido:**
- Link a "Configuración"
- Icono de settings
- Abre modal/página de configuración

---

#### 5. **SettingsPage.tsx** (Página de configuración)

**Ubicación:** `src/pages/SettingsPage.tsx`

**Campos del Formulario:**

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `siteName` | text | Nombre del sitio | Requerido, 3-50 chars |
| `logoUrl` | file/url | Logo del sitio | Imagen PNG/JPG/SVG, max 2MB |
| `primaryColor` | color | Color principal del dashboard | Hex válido (#RRGGBB) |

**Guardado:**
- Endpoint: `POST /wp-json/property-dashboard/v1/settings`
- Persistencia: WordPress options table (`wp_options`)
- Cache: 1 hora

---

### 🎨 Sistema de Theming Dinámico

#### 1. **Variables CSS Custom**

**Ubicación:** `src/index.css`

```css
:root {
  /* Colores dinámicos */
  --color-primary: #216121;
  --color-primary-hover: #1a4d1a;
  --color-primary-light: #e8f5e9;

  --color-sidebar-bg: #1e293b;
  --color-sidebar-text: #f1f5f9;
  --color-sidebar-active: var(--color-primary);

  /* Dimensiones */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 60px;

  /* Transiciones */
  --transition-base: 150ms ease-in-out;
}

/* Theme light (default) */
.theme-light {
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
}

/* Theme dark (futuro) */
.theme-dark {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
}
```

#### 2. **Inyección Dinámica de Colores**

**Servicio:** `src/services/themeService.ts`

```typescript
export const applyTheme = (settings: SiteConfig) => {
  document.documentElement.style.setProperty(
    '--color-primary',
    settings.primaryColor
  );
  // ... más colores
};
```

**Carga inicial:** En `App.tsx` al montar

---

### 🗂️ Estructura de Rutas (React Router)

#### Instalación de dependencias

```bash
npm install react-router-dom
npm install -D @types/react-router-dom
```

#### Rutas propuestas

```typescript
// src/router.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,  // Layout con sidebar
    children: [
      {
        index: true,
        element: <Navigate to="/properties" />
      },
      {
        path: 'properties',
        children: [
          { index: true, element: <PropertiesPage /> },
          { path: 'new', element: <PropertyNewPage /> },
          { path: ':id', element: <PropertyDetailPage /> },
          { path: ':id/edit', element: <PropertyEditPage /> }
        ]
      },
      {
        path: 'users',
        element: <ComingSoonPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  }
]);
```

---

### 📦 Nuevo Store de Settings

#### `src/stores/useSettingsStore.ts`

```typescript
interface SettingsState {
  settings: SiteConfig | null;
  isLoading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SiteConfig>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true });
    const response = await fetch(
      `${wpData.wpApiUrl}/property-dashboard/v1/settings`,
      {
        headers: { 'X-WP-Nonce': wpData.nonce }
      }
    );
    const data = await response.json();
    set({ settings: data, isLoading: false });
  },

  updateSettings: async (newSettings) => {
    const response = await fetch(
      `${wpData.wpApiUrl}/property-dashboard/v1/settings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpData.nonce
        },
        body: JSON.stringify(newSettings)
      }
    );
    const data = await response.json();
    set({ settings: data });
    applyTheme(data); // Aplicar nuevo tema
  }
}));
```

---

### 🔌 Backend: Nuevos Endpoints REST

#### Archivo nuevo: `class-property-settings.php`

**Ubicación:** `property-manager-plugin/includes/class-property-settings.php`

```php
<?php
class Property_Settings {

    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    public static function register_routes() {
        // GET /settings
        register_rest_route('property-dashboard/v1', '/settings', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_settings'],
            'permission_callback' => [__CLASS__, 'check_permissions']
        ]);

        // POST /settings
        register_rest_route('property-dashboard/v1', '/settings', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'update_settings'],
            'permission_callback' => [__CLASS__, 'check_permissions']
        ]);
    }

    public static function get_settings() {
        $defaults = [
            'siteName' => get_bloginfo('name'),
            'logoUrl' => '',
            'primaryColor' => '#216121'
        ];

        $settings = get_option('property_dashboard_settings', $defaults);

        return rest_ensure_response($settings);
    }

    public static function update_settings($request) {
        $params = $request->get_json_params();

        // Validar colores hex
        if (isset($params['primaryColor']) &&
            !preg_match('/^#[0-9A-F]{6}$/i', $params['primaryColor'])) {
            return new WP_Error('invalid_color', 'Color primario inválido', ['status' => 400]);
        }

        // Guardar
        $current = get_option('property_dashboard_settings', []);
        $updated = array_merge($current, $params);
        update_option('property_dashboard_settings', $updated);

        return rest_ensure_response($updated);
    }

    public static function check_permissions() {
        return current_user_can('manage_properties') ||
               current_user_can('administrator');
    }
}
```

**Registro en plugin principal:**
```php
// property-manager.php
require_once plugin_dir_path(__FILE__) . 'includes/class-property-settings.php';
Property_Settings::init();
```

---

### 📐 Refactorización de App.tsx

#### Estructura actual (Modal-based)
```
App.tsx
└── PropertyTable
    └── PropertySidebar (Modal overlay)
```

#### Nueva estructura (Router-based con Layout)
```
App.tsx (Router Provider)
└── AppLayout (Sidebar + Outlet)
    ├── AppSidebar (Fixed left)
    └── <Outlet /> (Main content full-width)
        ├── PropertiesPage (tabla actual)
        ├── SettingsPage
        └── ComingSoonPage
```

---

### ✅ Plan de Implementación (Orden Secuencial)

#### **Fase 1: Preparación y Estructura** (1-2 horas)

1. [ ] Crear carpeta `src/components/layout/`
2. [ ] Crear carpeta `src/pages/`
3. [ ] Crear archivo `src/stores/useSettingsStore.ts`
4. [ ] Instalar dependencias: `react-router-dom`, `lucide-react`
5. [ ] Crear tipos TypeScript para `SiteConfig` en `src/types/settings.ts`

#### **Fase 2: Backend y API** (2-3 horas)

6. [ ] Crear `class-property-settings.php`
7. [ ] Registrar endpoints REST (`/settings` GET y POST)
8. [ ] Implementar validación de campos
9. [ ] Crear migración/defaults en `register_activation_hook`
10. [ ] Testear endpoints con Postman/curl

#### **Fase 3: Componentes de Sidebar** (3-4 horas)

11. [ ] Crear `AppSidebar.tsx` con estructura básica
12. [ ] Crear `SidebarHeader.tsx` (logo + nombre)
13. [ ] Crear `SidebarNavigation.tsx` (menú items)
14. [ ] Crear `SidebarFooter.tsx` (link a settings)
15. [ ] Agregar iconos de Lucide React
16. [ ] Implementar estilos con Tailwind

#### **Fase 4: Sistema de Theming** (2-3 horas)

17. [ ] Añadir variables CSS custom a `index.css`
18. [ ] Crear `themeService.ts` para inyección dinámica
19. [ ] Actualizar `tailwind.config.js` para usar CSS vars
20. [ ] Implementar carga de theme al inicio en `App.tsx`

#### **Fase 5: Routing y Layout** (2-3 horas)

21. [ ] Crear `AppLayout.tsx` (Sidebar + Outlet)
22. [ ] Configurar React Router en `src/router.tsx`
23. [ ] Crear páginas:
    - [ ] `PropertiesPage.tsx` (mover lógica actual)
    - [ ] `SettingsPage.tsx`
    - [ ] `ComingSoonPage.tsx`
24. [ ] Actualizar `App.tsx` para usar `RouterProvider`
25. [ ] Actualizar navegación (eliminar modales, usar Links)

#### **Fase 6: Página de Settings** (3-4 horas)

26. [ ] Crear formulario de configuración
27. [ ] Implementar upload de logo (FileUpload component)
28. [ ] Añadir color pickers (input type="color")
29. [ ] Conectar con `useSettingsStore`
30. [ ] Implementar guardado y preview en tiempo real
31. [ ] Añadir validaciones (zod/yup opcional)
32. [ ] Mostrar notificaciones de éxito/error

#### **Fase 7: Responsive y Polish** (2-3 horas)

33. [ ] Hacer sidebar responsive (collapse en mobile)
34. [ ] Añadir burger menu para mobile
35. [ ] Verificar layout en diferentes resoluciones
36. [ ] Añadir transiciones y animaciones
37. [ ] Revisar accesibilidad (ARIA labels)

#### **Fase 8: Testing y Deployment** (2-3 horas)

38. [ ] Probar flujo completo de configuración
39. [ ] Verificar persistencia de colores
40. [ ] Testear en diferentes roles (admin, gestor, agente)
41. [ ] Build de producción: `npm run build`
42. [ ] Subir archivos a WordPress
43. [ ] Documentar cambios en este archivo

---

### 🎨 Mockup de Código (Preview)

#### AppLayout.tsx
```typescript
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';

export const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
```

#### SidebarNavigation.tsx
```typescript
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Settings } from 'lucide-react';

const navItems = [
  { path: '/properties', label: 'Propiedades', icon: Home },
  { path: '/users', label: 'Usuario', icon: User }
];

export const SidebarNavigation = () => {
  const location = useLocation();

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};
```

---

### 🚨 Consideraciones Importantes

#### 1. **Breaking Changes**
- Esta refactorización cambia la navegación de modal-based a router-based
- El sidebar actual (`PropertySidebar`) se mantiene pero para detalles de propiedades
- URLs del dashboard cambiarán (agregar base path en router)

#### 2. **Compatibilidad**
- React Router usa History API (requiere URL rewrite en servidor)
- Configurar `.htaccess` o `rewrites` en WordPress para SPA routing
- Alternativa: usar `HashRouter` (#/properties)

#### 3. **Performance**
- Lazy load de rutas: `React.lazy()` para code splitting
- Memoizar componentes del sidebar con `React.memo()`
- Persistir settings en localStorage + cache

#### 4. **Seguridad**
- Validar permisos en todos los endpoints
- Sanitizar inputs de colores hex
- Limitar tamaño de upload de logo (2MB)
- Validar extensiones permitidas (png, jpg, svg)

---

### 📊 Estimación Total

| Fase | Horas | Dificultad |
|------|-------|------------|
| Preparación | 1-2h | Baja |
| Backend/API | 2-3h | Media |
| Componentes Sidebar | 3-4h | Media |
| Sistema de Theming | 2-3h | Alta |
| Routing y Layout | 2-3h | Alta |
| Página Settings | 3-4h | Media |
| Responsive/Polish | 2-3h | Media |
| Testing | 2-3h | Baja |
| **TOTAL** | **17-25 horas** | **Media-Alta** |

---

### 🎯 Resultado Final Esperado

Al completar esta implementación, el dashboard tendrá:

✅ Sidebar de navegación permanente y profesional
✅ Branding personalizable (logo y nombre)
✅ Sistema de colores totalmente dinámico
✅ Panel de configuración completo
✅ Navegación basada en rutas (mejor UX)
✅ Diseño responsive y moderno
✅ Código escalable y mantenible

---

## ✅ Correcciones Realizadas

Se han realizado las siguientes correcciones al proyecto:

### 1. **Meta Boxes Añadidos al CPT** ✅
- Ahora aparecerán campos editables en el admin de WordPress
- Dos meta boxes: "Detalles de la Propiedad" y "Ubicación"
- Todos los campos están disponibles para edición

### 2. **Carga de Scripts Corregida** ✅
- Se agregó la carga del archivo `vendor.js`
- Orden correcto: vendor.js → index.js

### 3. **Montaje de React Corregido** ✅
- El `main.tsx` ahora busca el div correcto: `property-dashboard-root`
- Añadido mensaje de error si el elemento no se encuentra

---

## 📋 Pasos para Actualizar (IMPORTANTE)

### Paso 1: Recompilar el Proyecto React

Desde la raíz del proyecto, ejecuta:

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Compilar el proyecto React
npm run build
```

Este comando generará los archivos actualizados en la carpeta `dist/`.

### Paso 2: Copiar los Archivos Compilados

Después del build, copia la carpeta `dist/` al plugin de WordPress:

```bash
# Opción A: Copiar localmente (si estás en desarrollo local)
cp -r dist/ wordpress-plugin/

# Opción B: Si estás usando FTP, sube toda la carpeta dist/
# al directorio del plugin en el servidor
```

### Paso 3: Subir los Archivos PHP Modificados al Servidor

Sube los siguientes archivos modificados vía FTP a `/wp-content/plugins/property-dashboard/`:

```
wordpress-plugin/
├── property-dashboard.php                (modificado)
├── includes/
│   ├── class-property-cpt.php           (modificado)
│   ├── class-property-meta.php          (modificado)
│   ├── class-property-roles.php         (modificado)
│   └── class-property-assets.php        (modificado)
└── dist/                                 (carpeta completa actualizada)
    └── assets/
        ├── index.js                      (recompilado)
        ├── vendor.js
        └── index.css
```

### Paso 4: Desactivar y Reactivar el Plugin

En el admin de WordPress:

1. Ve a **Plugins → Plugins instalados**
2. **Desactiva** el plugin "Property Dashboard"
3. **Activa** nuevamente el plugin
4. Recarga la página del navegador (F5)

---

## ✅ Verificación

Después de actualizar, verifica que todo funciona:

### 1. Meta Boxes Visibles en el Admin ✅

1. Ve a **Propiedades → Añadir nueva**
2. Deberías ver dos cajas:
   - **Detalles de la Propiedad**: Estado, Patente, Precio, Google Maps URL
   - **Ubicación**: Estado de la República, Municipio, Colonia, Código Postal, Calle

3. Completa los campos y publica la propiedad
4. Verifica que los datos se guarden correctamente

### 2. Shortcode Funciona ✅

1. Ve a la página donde pusiste `[property_dashboard]`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **Console**
4. NO deberías ver errores
5. Deberías ver la aplicación React montada

### 3. Aplicación React Carga ✅

Si todo está bien, deberías ver:
- El dashboard de propiedades
- Interfaz React funcionando
- Sin errores en consola

### 4. Verificar Carga de Scripts

En las herramientas de desarrollador:

1. Pestaña **Network** (Red)
2. Recarga la página
3. Busca estos archivos (deberían cargar con estado 200):
   - `vendor.js` ✅
   - `index.js` ✅
   - `index.css` ✅

---

## 🐛 Troubleshooting

### El shortcode sigue mostrando un div vacío

**Causas posibles:**

1. **No recompilaste el proyecto React**
   ```bash
   npm run build
   ```

2. **No copiaste la carpeta dist/ actualizada**
   ```bash
   cp -r dist/ wordpress-plugin/
   ```

3. **Los archivos JS tienen errores**
   - Abre la consola del navegador (F12)
   - Busca errores en rojo
   - Si ves "Root element not found", significa que el build no se actualizó

### Los campos no aparecen en el admin

**Causas posibles:**

1. **No desactivaste/reactivaste el plugin**
   - Desactiva el plugin
   - Activa nuevamente
   - Recarga la página

2. **El archivo class-property-meta.php no se subió**
   - Verifica que el archivo esté en el servidor
   - Compara con la versión local

### Errores 404 al cargar JS/CSS

**Causas posibles:**

1. **La carpeta dist/ no está en el servidor**
   - Verifica que `wp-content/plugins/property-dashboard/dist/` exista
   - Verifica que contenga la carpeta `assets/`

2. **Permisos incorrectos**
   ```bash
   # En el servidor, ejecuta:
   chmod -R 755 wp-content/plugins/property-dashboard/
   ```

---

## 📊 Resumen de Archivos Modificados

| Archivo | Qué se modificó |
|---------|-----------------|
| `src/main.tsx` | Cambió de buscar `#root` a `#property-dashboard-root` |
| `index.html` | Actualizado para desarrollo local |
| `wordpress-plugin/property-dashboard.php` | Añadido `Property_Meta::init()` |
| `wordpress-plugin/includes/class-property-meta.php` | Añadidos meta boxes y métodos de renderizado |
| `wordpress-plugin/includes/class-property-assets.php` | Añadida carga de `vendor.js` |
| `wordpress-plugin/includes/class-property-cpt.php` | Ya estaba correcto (de cambios anteriores) |
| `wordpress-plugin/includes/class-property-roles.php` | Ya estaba correcto (de cambios anteriores) |

---

## 🎯 Checklist Final

Marca cada item cuando lo completes:

- [ ] Ejecuté `npm run build`
- [ ] Copié la carpeta `dist/` actualizada a `wordpress-plugin/`
- [ ] Subí todos los archivos PHP modificados al servidor
- [ ] Subí la carpeta `dist/` completa al servidor
- [ ] Desactivé y reactivé el plugin en WordPress
- [ ] Recargué la página del admin (F5)
- [ ] Veo los meta boxes en **Propiedades → Añadir nueva**
- [ ] El shortcode muestra la aplicación React (no solo un div vacío)
- [ ] No hay errores en la consola del navegador (F12)

---

## 📞 Soporte

Si después de seguir todos estos pasos algo sigue sin funcionar:

1. Abre la consola del navegador (F12)
2. Copia todos los errores que veas
3. Verifica los logs de WordPress en `wp-content/debug.log`
4. Revisa que todos los archivos se hayan subido correctamente

---

**Última actualización:** 2025-11-06
