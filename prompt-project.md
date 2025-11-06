# 🚀 PROMPT DE PROYECTO - Property Dashboard React

## Descripción General

Crear una aplicación React con Vite para gestión de propiedades inmobiliarias que se **embebe en WordPress como shortcode**. La UI debe ser estilo **panel de administración** moderno con modales laterales estilo **Asana/Linear**.

---

## 🎯 OBJETIVO PRINCIPAL (MVP)

**Grid de Listado de Propiedades** - Esta es la funcionalidad CORE que debe implementarse primero y funcionar perfectamente.

### Funcionalidades del Grid:
1. **Listar propiedades** en formato de grid/tarjetas responsive
2. **Búsqueda en tiempo real** (debounced a 300ms)
3. **Filtros combinables** por estado, patente y status
4. **Paginación** configurable (5, 10, 20, 50, 100 items)
5. **Acciones rápidas** por propiedad: ver, editar, eliminar, descargar ficha
6. **Loading states** y manejo de errores elegante
7. **Estados visuales** claros (disponible, vendida, alquilada, reservada)

---

## 🛠 STACK TECNOLÓGICO

### Frontend (Ultra-Ligero)
- **React 18.2** - Librería UI
- **React DOM 18.2** - Renderizado
- **Zustand 4.4** - State management (solo 3KB)
- **Vite 5.0** - Build tool
- **Tailwind CSS 3.4** - Estilos utility-first

**Total: 3 dependencias de producción + Tailwind**

### Por qué Tailwind CSS:
- Desarrollo ultrarrápido con utility classes
- Bundle pequeño con tree-shaking automático (~10-15KB final)
- Responsive design nativo
- No conflictos con estilos de WordPress
- Componentes consistentes sin escribir CSS custom
- Dark mode fácil de implementar (futuro)

### Backend
- **WordPress REST API** existente
- Endpoints base: `/wp-json/property-dashboard/v1/properties`
- Autenticación: WordPress nonce + cookies de sesión
- Permisos: Basado en capacidades de WordPress

### Deployment
- **Embebido en WordPress** vía shortcode `[property_dashboard]`
- Build de Vite genera carpeta `/dist` dentro del plugin
- WordPress encola y sirve los archivos estáticos compilados
- Sin necesidad de servidor Node.js en producción

---

## 📁 ESTRUCTURA DEL PROYECTO

```
wordpress-plugin/
│
├── property-dashboard-react/          # Proyecto React/Vite
│   ├── src/
│   │   ├── main.jsx                   # Entry point - montaje en DOM
│   │   ├── App.jsx                    # Componente raíz
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx         # Cabecera con búsqueda global
│   │   │   │   └── Sidebar.jsx        # Navegación lateral (tabs)
│   │   │   │
│   │   │   ├── properties/
│   │   │   │   ├── PropertyGrid.jsx   # 🎯 CORE - Grid principal
│   │   │   │   ├── PropertyCard.jsx   # Card individual
│   │   │   │   ├── PropertyFilters.jsx # Barra de filtros
│   │   │   │   ├── PropertySidebar.jsx # 🎯 Modal lateral Asana
│   │   │   │   └── PropertyForm.jsx    # Formulario CRUD
│   │   │   │
│   │   │   └── ui/                     # Componentes base reutilizables
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Select.jsx
│   │   │       ├── Textarea.jsx
│   │   │       ├── SearchBar.jsx
│   │   │       ├── Pagination.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   │
│   │   ├── stores/
│   │   │   └── usePropertyStore.js    # Zustand store global
│   │   │
│   │   ├── services/
│   │   │   └── api.js                 # Cliente WordPress REST API
│   │   │
│   │   ├── hooks/
│   │   │   ├── useProperties.js       # Hook datos propiedades
│   │   │   ├── useDebounce.js         # Debounce búsqueda
│   │   │   └── useFilters.js          # Lógica de filtros
│   │   │
│   │   └── utils/
│   │       ├── formatters.js          # Formato moneda, fechas
│   │       ├── validators.js          # Validación formularios
│   │       └── constants.js           # Estados México, etc.
│   │
│   ├── tailwind.config.js             # Configuración Tailwind
│   ├── postcss.config.js
│   ├── vite.config.js                 # Build a /dist
│   └── package.json
│
├── dist/                               # Build compilado (auto-generado)
│   ├── assets/
│   │   ├── index.js                   # Bundle JS
│   │   └── index.css                  # Bundle CSS
│   └── index.html
│
├── property-dashboard.php              # Plugin principal PHP
├── includes/
│   └── class-property-rest-api.php     # Endpoints REST
└── README.md
```

---

## 🎨 DISEÑO UI - ESPECIFICACIONES DETALLADAS

### Paleta de Colores

**Colores Principales:**
- Primary: `#216121` (verde actual del sistema)
- Primary Hover: `#1a4d1a`
- Primary Light: `#e8f5e9`

**Colores Administrativos:**
- Background: `#f8fafc` (gris muy claro)
- Cards: `#ffffff` (blanco puro)
- Borders: `#e2e8f0` (gris claro)
- Text Primary: `#1e293b` (gris oscuro)
- Text Secondary: `#64748b` (gris medio)

**Status Colors:**
- Disponible: Verde (`bg-green-100 text-green-800`)
- Vendida: Gris (`bg-gray-100 text-gray-800`)
- Alquilada: Azul (`bg-blue-100 text-blue-800`)
- Reservada: Amarillo (`bg-yellow-100 text-yellow-800`)

### Tipografía
- Font Family: `Inter, system-ui, sans-serif`
- Tamaños: 12px (xs), 14px (sm), 16px (base), 18px (lg), 24px (xl)
- Pesos: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Layout Principal

**Estructura de dos columnas:**
- Sidebar izquierdo fijo: 270px de ancho
- Contenido principal: Flex grow con max-width 1400px
- Header superior: 64px de altura
- Padding general: 24-32px

**Responsive Breakpoints:**
- Desktop: > 1024px (3 columnas grid)
- Tablet: 768px - 1024px (2 columnas grid)
- Mobile: < 768px (1 columna grid, sidebar oculto)

### Grid de Propiedades

**Diseño de Cards:**
- Layout: CSS Grid responsive (3/2/1 columnas)
- Cards: Fondo blanco, bordes redondeados (8px)
- Sombra sutil con efecto hover elevado
- Padding interno: 16px
- Gap entre cards: 24px

**Información Visible en Card:**
- Título de la propiedad (truncado a 2 líneas)
- Icono + Estado y Municipio
- Icono + Patente
- Icono + Precio formateado (si existe)
- Badge de status (disponible/vendida/etc)
- Fecha de creación
- Menú de acciones (⋮)

**Menú de Acciones (Dropdown):**
- Icono de tres puntos verticales
- Abre dropdown al hacer click
- Opciones:
  - Ver detalles
  - Editar
  - Eliminar (texto rojo)
  - Descargar ficha (si existe)

### Modal Lateral Estilo Asana 🎯

**Características Principales:**
- Animación slide-in desde la derecha (300ms ease-out)
- Ancho: 600px en desktop, 100% en mobile
- Altura: 100vh (pantalla completa vertical)
- Overlay semi-transparente: `bg-black/50`
- Sombra lateral prominente
- z-index: 50 (modal), 40 (overlay)

**Estructura del Modal:**
1. **Header (sticky top):**
   - Título dinámico según modo (Vista/Editar/Crear)
   - Botón cerrar (X) en esquina superior derecha
   - Border bottom para separación
   - Padding: 16px 24px

2. **Content (scrolleable):**
   - Scroll vertical automático
   - Padding: 24px
   - Formulario o vista de solo lectura
   - Campos organizados verticalmente con spacing

3. **Footer (sticky bottom - opcional):**
   - Botones de acción (Cancelar, Guardar)
   - Border top para separación
   - Padding: 16px 24px
   - Background blanco con sombra sutil

**Comportamiento:**
- Cerrar con:
  - Click en overlay
  - Botón X
  - Tecla ESC
  - Callback después de guardar exitoso
- Prevenir scroll del body cuando está abierto
- Focus trap dentro del modal
- Animación suave al abrir/cerrar

**Tres Modos de Operación:**
1. **Vista Previa (mode='view'):**
   - Solo lectura de todos los campos
   - Labels y valores organizados
   - Botón "Editar" al final
   - Link a Google Maps si existe

2. **Crear Nueva (mode='create'):**
   - Formulario completo vacío
   - Validación en tiempo real
   - Botones: Cancelar y Crear

3. **Editar (mode='edit'):**
   - Formulario pre-llenado con datos actuales
   - Validación en tiempo real
   - Botones: Cancelar y Actualizar

### Filtros y Búsqueda

**Barra de Filtros:**
- Fondo blanco con sombra sutil
- Grid responsive (4 columnas desktop, 1 mobile)
- Padding: 16px
- Margin bottom: 24px

**Componentes:**
1. **Búsqueda Global:**
   - Input de texto ancho (2 columnas en desktop)
   - Placeholder: "Buscar propiedades..."
   - Icono de búsqueda (lupa)
   - Debounce de 300ms

2. **Filtro por Estado:**
   - Dropdown con todos los estados de México
   - Opción por defecto: "Todos los estados"
   - Alfabéticamente ordenados

3. **Filtro por Status:**
   - Dropdown con 4 opciones
   - Opción por defecto: "Todos los status"
   - Badge con color correspondiente

4. **Botón Limpiar (opcional):**
   - Resetea todos los filtros
   - Solo visible cuando hay filtros activos

### Paginación

**Diseño:**
- Centrada horizontalmente
- Botones con bordes redondeados
- Página activa destacada en color primario
- Disabled state para primera/última página

**Componentes:**
- Botón "Anterior" con icono
- Números de página (con elipsis si > 7 páginas)
- Botón "Siguiente" con icono
- Selector de items por página (5, 10, 20, 50, 100)
- Texto informativo: "Mostrando X-Y de Z propiedades"

---

## 📊 CAMPOS DE PROPIEDADES

### Campos del Modelo (10 campos principales)

**Campos Requeridos:**
1. **Título** (title) - String, max 255 caracteres
2. **Estado Status** (estado_status) - Enum: disponible, vendida, alquilada, reservada
3. **Estado** (estado) - Select de 32 estados de México
4. **Municipio** (municipio) - String
5. **Colonia** (colonia) - String
6. **Código Postal** (codigo_postal) - String, 5 dígitos
7. **Calle** (calle) - String, dirección completa
8. **Patente** (patente) - String, número único

**Campos Opcionales:**
9. **Precio** (precio) - Number, formato moneda MXN
10. **Google Maps URL** (google_maps) - URL válida
11. **Descripción** (description) - Textarea, sin límite
12. **Ficha Técnica** (ficha_attachment_id) - File upload (PDF, PNG, JPG)

### 32 Estados de México (para Select)

Aguascalientes, Baja California, Baja California Sur, Campeche, Chiapas, Chihuahua, Ciudad de México, Coahuila, Colima, Durango, Guanajuato, Guerrero, Hidalgo, Jalisco, México, Michoacán, Morelos, Nayarit, Nuevo León, Oaxaca, Puebla, Querétaro, Quintana Roo, San Luis Potosí, Sinaloa, Sonora, Tabasco, Tamaulipas, Tlaxcala, Veracruz, Yucatán, Zacatecas

### Validaciones del Formulario

**Client-Side (JavaScript):**
- Campos requeridos no vacíos
- Código postal: exactamente 5 dígitos numéricos
- Precio: número positivo o vacío
- Google Maps: URL válida o vacío
- Estado: debe estar en lista de estados válidos
- Status: debe estar en opciones válidas

**Server-Side (WordPress REST API):**
- Sanitización de todos los campos
- Verificación de permisos de usuario
- Validación de patente única por estado/municipio
- Límite de tamaño de archivo (2MB para fichas)
- Tipos de archivo permitidos para fichas

---

## 🔄 FLUJO DE DATOS Y ESTADO

### Store Global (Zustand)

**Estado Principal:**
- `properties` - Array de propiedades cargadas
- `loading` - Boolean de carga en progreso
- `error` - String de mensaje de error (null si no hay)
- `filters` - Objeto con filtros activos (search, estado, patente, status, page, perPage)
- `pagination` - Objeto con total, totalPages, currentPage

**Acciones Principales:**
- `fetchProperties()` - Carga propiedades con filtros actuales
- `setFilters(newFilters)` - Actualiza filtros y resetea a página 1
- `setPage(page)` - Cambia página sin resetear filtros
- `createProperty(data)` - Crea nueva propiedad vía API
- `updateProperty(id, data)` - Actualiza propiedad existente
- `deleteProperty(id)` - Elimina propiedad con confirmación
- `clearFilters()` - Resetea todos los filtros a valores por defecto

### Integración con WordPress

**Datos Pasados de PHP a JavaScript:**
```
window.wpData = {
  apiUrl: '/wp-json/property-dashboard/v1',
  nonce: 'abc123...',
  currentUser: {
    id: 1,
    name: 'Admin User',
    canEdit: true
  }
}
```

**Uso del Nonce:**
- Header `X-WP-Nonce` en cada request
- Validación server-side en cada endpoint
- Renovación automática si expira (opcional)

**Manejo de Sesión:**
- Cookies de WordPress manejadas automáticamente
- Credential mode: 'same-origin'
- Redirect a login si no autenticado (opcional)

---

## 🎯 PRIORIDADES DE DESARROLLO

### FASE 1: Setup y Base (1-2 días)
**Prioridad: CRÍTICA**

- Crear proyecto Vite con React
- Instalar dependencias (Zustand, Tailwind)
- Configurar Tailwind con paleta custom
- Configurar Vite para build a /dist
- Crear estructura de carpetas
- Setup de integración WordPress (shortcode básico)
- Montar React en div de WordPress
- Verificar que wpData se pasa correctamente

### FASE 2: Grid de Propiedades (2-3 días) 🎯
**Prioridad: MÁXIMA - CORE DEL PROYECTO**

- Crear Zustand store con estado básico
- Implementar fetchProperties() con API real
- Crear componente PropertyCard con toda la info
- Crear PropertyGrid con layout responsive
- Implementar loading states (spinner)
- Implementar error states (mensajes)
- Implementar empty state ("No hay propiedades")
- Menú de acciones (⋮) con dropdown
- Formateo de precio (moneda MXN)
- Formateo de fecha (español México)
- Badges de status con colores

### FASE 3: Búsqueda y Filtros (1-2 días)
**Prioridad: ALTA**

- Crear componente PropertyFilters
- Input de búsqueda global
- Select de estados (32 opciones)
- Select de status (4 opciones)
- Hook useDebounce para búsqueda
- Integrar filtros con store
- Auto-fetch al cambiar filtros
- Botón limpiar filtros
- Persistencia de filtros en URL (opcional)

### FASE 4: Modal Lateral Asana (2-3 días) 🎯
**Prioridad: ALTA - CARACTERÍSTICA CLAVE**

- Crear componente PropertySidebar base
- Implementar animación slide-in/out
- Overlay con backdrop blur
- Cerrar con ESC, click overlay, botón X
- Prevenir scroll del body
- Tres modos: view, create, edit
- Vista de solo lectura (PropertyView)
- Responsivo (100% en mobile)
- Focus trap y accesibilidad

### FASE 5: Formulario CRUD (2-3 días)
**Prioridad: ALTA**

- Crear componente PropertyForm
- Todos los campos con validación
- Validación en tiempo real
- Mensajes de error por campo
- Formateo automático (código postal, precio)
- Upload de ficha técnica
- Preview de ficha cargada
- Integrar createProperty() en store
- Integrar updateProperty() en store
- Feedback visual al guardar (toast/notification)

### FASE 6: Paginación (1 día)
**Prioridad: MEDIA**

- Crear componente Pagination
- Navegación entre páginas
- Selector de items por página
- Texto informativo de rango
- Integrar con store y API
- Mantener filtros al paginar

### FASE 7: Delete y Confirmaciones (1 día)
**Prioridad: MEDIA**

- Modal de confirmación para delete
- Implementar deleteProperty() en store
- Refresh automático después de delete
- Mensajes de éxito/error
- Undo delete (opcional, avanzado)

### FASE 8: Polish y UX (1-2 días)
**Prioridad: MEDIA**

- Optimizar animaciones
- Loading skeletons en lugar de spinner
- Toasts/notifications elegantes
- Mensajes de error amigables
- Validación de permisos de usuario
- Estados disabled para usuarios sin permisos
- Accesibilidad (ARIA labels, keyboard nav)

### FASE 9: Build y Testing (1 día)
**Prioridad: ALTA**

- Build de producción optimizado
- Verificar bundle size (< 200KB)
- Testing en WordPress real
- Testing responsive (mobile, tablet, desktop)
- Testing en diferentes navegadores
- Performance audit con Lighthouse

### FASES FUTURAS (Backlog)
**Prioridad: BAJA - Después del MVP**

- Importación CSV masiva
- Exportación de datos (CSV, Excel)
- Dashboard con estadísticas y gráficas
- Gestión de usuarios
- Configuración del sistema (colores, logo)
- Historial de cambios (audit log)
- Búsqueda avanzada con más campos
- Filtros guardados (favoritos)
- Ordenamiento personalizado
- Vista de mapa (Google Maps integration)
- Duplicar propiedad
- Modo oscuro (dark mode)

---

## 🔌 INTEGRACIÓN CON WORDPRESS

### Shortcode Principal

**Uso en WordPress:**
```
[property_dashboard]
```

**Funcionalidad:**
- Encola archivo JavaScript compilado (`dist/assets/index.js`)
- Encola archivo CSS compilado (`dist/assets/index.css`)
- Pasa datos vía `wp_localize_script` a `window.wpData`
- Renderiza `<div id="property-dashboard-root"></div>`
- React se monta automáticamente en ese div

### WordPress REST API

**Endpoint Base:**
```
/wp-json/property-dashboard/v1/properties
```

**Operaciones Soportadas:**

**GET /properties** - Listar propiedades
- Query params: search, estado, patente, status, page, per_page
- Response: { data: [...], total: 50, page: 1, per_page: 20 }

**GET /properties/:id** - Una propiedad
- Response: { id, title, estado, municipio, ... }

**POST /properties** - Crear propiedad
- Body: JSON con todos los campos
- Validación server-side
- Response: Nueva propiedad creada

**PUT /properties/:id** - Actualizar propiedad
- Body: JSON con campos a actualizar
- Response: Propiedad actualizada

**DELETE /properties/:id** - Eliminar propiedad
- Response: { success: true, message: "Eliminada" }

**Autenticación:**
- Nonce de WordPress en header `X-WP-Nonce`
- Cookies de sesión de WordPress
- Verificación de permisos por capacidad

---

## ✅ CHECKLIST DE MVP

### Setup Inicial
- [ ] Proyecto Vite creado
- [ ] Dependencias instaladas (React, Zustand, Tailwind)
- [ ] Tailwind configurado con paleta custom
- [ ] Vite configurado para build a /dist
- [ ] Estructura de carpetas creada
- [ ] Shortcode WordPress funcionando
- [ ] React se monta correctamente
- [ ] wpData se pasa a React

### Grid de Propiedades (CORE)
- [ ] PropertyCard diseñado y responsive
- [ ] PropertyGrid con layout 3/2/1 columnas
- [ ] Fetch de propiedades desde API
- [ ] Loading spinner funcionando
- [ ] Error state con mensaje amigable
- [ ] Empty state con CTA
- [ ] Menú de acciones (⋮) funcionando
- [ ] Formato de precio correcto
- [ ] Formato de fecha correcto
- [ ] Badges de status con colores

### Búsqueda y Filtros
- [ ] Input de búsqueda con debounce
- [ ] Select de estados funcionando
- [ ] Select de status funcionando
- [ ] Filtros se aplican correctamente
- [ ] Auto-fetch al cambiar filtros
- [ ] Botón limpiar filtros

### Modal Lateral
- [ ] PropertySidebar slide-in animado
- [ ] Overlay semi-transparente
- [ ] Cierra con ESC, overlay, botón X
- [ ] Previene scroll del body
- [ ] Modo view (solo lectura)
- [ ] Modo create (formulario vacío)
- [ ] Modo edit (formulario pre-llenado)
- [ ] Responsive (100% en mobile)

### Formulario y CRUD
- [ ] PropertyForm con todos los campos
- [ ] Validación en tiempo real
- [ ] Mensajes de error por campo
- [ ] createProperty() funcionando
- [ ] updateProperty() funcionando
- [ ] deleteProperty() con confirmación
- [ ] Upload de ficha técnica
- [ ] Feedback visual al guardar

### Paginación
- [ ] Componente Pagination funcionando
- [ ] Navegación entre páginas
- [ ] Selector de items por página
- [ ] Mantiene filtros al paginar
- [ ] Texto informativo de rango

### Build y Performance
- [ ] Build optimizado < 200KB
- [ ] Tree-shaking funcionando
- [ ] CSS purgado correctamente
- [ ] Testing en WordPress real
- [ ] Responsive en todos los dispositivos
- [ ] Performance Lighthouse > 90

---

## 🎯 DEFINICIÓN DE ÉXITO

### Criterios Técnicos
- Bundle size total < 200KB gzipped
- Lighthouse Performance > 90
- Lighthouse Accessibility > 90
- Cero errores de consola
- Compatible con WordPress 5.0+
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)

### Criterios Funcionales
- Grid muestra todas las propiedades correctamente
- Búsqueda encuentra propiedades en < 500ms
- Filtros se aplican sin bugs
- Modal lateral se abre/cierra suavemente
- Formulario valida todos los campos
- CRUD completo funciona sin errores
- Paginación navega correctamente
- Responsive en mobile, tablet, desktop

### Criterios de UX
- Interfaz intuitiva y moderna
- Transiciones suaves (no abruptas)
- Feedback visual en todas las acciones
- Mensajes de error claros y útiles
- Loading states no bloquean UI innecesariamente
- Accesible con teclado
- Sin conflictos con estilos de WordPress

---

## 📝 NOTAS IMPORTANTES

### Sobre el Desarrollo

1. **Priorizar el Grid:** Es la funcionalidad core. Todo lo demás puede esperar si el grid no funciona perfectamente.

2. **Mobile-first:** Diseñar primero para mobile, luego escalar a desktop. Tailwind hace esto fácil.

3. **Performance desde el inicio:** No esperar a optimizar al final. Usar React.memo, useMemo, useCallback donde sea necesario.

4. **Componentes pequeños:** Cada componente debe hacer una sola cosa bien. Facilita testing y mantenimiento.

5. **Accesibilidad:** Usar elementos semánticos, ARIA labels, y asegurar navegación por teclado.

### Sobre WordPress

1. **No depender de plugins:** La app debe funcionar con WordPress vanilla + el plugin custom.

2. **Namespace CSS:** Aunque Tailwind hace scoping automático, prefixear clases custom para evitar conflictos.

3. **Versionado de assets:** Usar version number en wp_enqueue para invalidar caché en updates.

4. **Testing con temas diferentes:** Verificar que funciona con Twenty Twenty-Three, Twenty Twenty-Four, etc.

### Sobre el Stack

1. **Sin React Router:** No es necesario para una app embebida. Estado interno maneja las "vistas".

2. **Zustand sobre Redux:** Más simple, menos boilerplate, mismo poder.

3. **Tailwind sobre CSS-in-JS:** Más rápido, menor bundle, mejor DX.

4. **Fetch sobre Axios:** Nativo, suficiente para este caso, 13KB ahorrados.

---

## 🚀 COMENZAR EL DESARROLLO

### Comandos Iniciales

```bash
# 1. Crear proyecto
npm create vite@latest property-dashboard-react -- --template react

# 2. Entrar al directorio
cd property-dashboard-react

# 3. Instalar dependencias de producción
npm install zustand

# 4. Instalar dependencias de desarrollo
npm install -D tailwindcss autoprefixer postcss

# 5. Inicializar Tailwind
npx tailwindcss init -p

# 6. Desarrollo
npm run dev

# 7. Build para producción
npm run build
```

### Configuraciones Esenciales

**tailwind.config.js:** Agregar paths de archivos React y configurar colores custom del proyecto.

**vite.config.js:** Configurar outDir a '../dist' para que el build vaya directamente a la carpeta del plugin WordPress.

**main.jsx:** Montar React en el div con id 'property-dashboard-root' que WordPress crea.

**App.jsx:** Recibir wpData como prop y comenzar a construir el layout.

### Primer Hito

**Objetivo:** Ver "Hello World" de React renderizado dentro de WordPress vía shortcode.

**Pasos:**
1. Build del proyecto React
2. Crear shortcode en PHP que encola el JS/CSS compilado
3. Agregar shortcode en una página de WordPress
4. Ver React funcionando en el frontend

**Tiempo estimado:** 1-2 horas

---

## 🎯 OBJETIVO FINAL

Una aplicación React **ultra-ligera** (~100KB total), **moderna** (Tailwind + Zustand), y **performante** (Lighthouse > 90) que se integre perfectamente en WordPress como un panel de administración profesional con modales laterales estilo Asana/Linear para gestión de propiedades inmobiliarias.

**Stack Final:** React + Zustand + Tailwind + WordPress REST API

**Resultado:** Panel de administración de propiedades moderno, rápido, intuitivo y visualmente atractivo.

---

**¡Listo para construir un producto excelente!** 🚀
