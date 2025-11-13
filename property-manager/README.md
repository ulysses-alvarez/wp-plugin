# Property Dashboard - WordPress Plugin

Plugin de WordPress para gestión de propiedades inmobiliarias con interfaz React.

## 🚀 Características

- ✅ Custom Post Type 'property' con todos los meta fields
- ✅ Sistema de roles y permisos (Admin, Gerente, Asociado)
- ✅ REST API completa para CRUD de propiedades
- ✅ Interfaz React moderna y responsive
- ✅ Shortcode `[property_dashboard]` para insertar en cualquier página
- ✅ Seguridad con nonce y validación de permisos
- ✅ Totalmente en español (interfaz) e inglés (código)

## 📋 Requisitos

- WordPress 6.0 o superior
- PHP 7.4 o superior
- Node.js 16+ (solo para desarrollo)

## 🔧 Instalación

### 1. Compilar el Frontend React

Primero, compila el proyecto React:

```bash
# Desde la raíz del proyecto
npm install
npm run build
```

Esto generará la carpeta `dist/` con los archivos compilados.

### 2. Copiar archivos compilados

Copia el contenido de `dist/` a la carpeta del plugin:

```bash
cp -r dist/ wordpress-plugin/
```

### 3. Subir el plugin a WordPress

Opción A - Vía FTP/SFTP:
```bash
# Sube la carpeta wordpress-plugin/ a:
/wp-content/plugins/property-dashboard/
```

Opción B - Vía ZIP:
```bash
cd wordpress-plugin
zip -r property-dashboard.zip .
# Sube el ZIP desde WordPress Admin → Plugins → Subir
```

### 4. Activar el plugin

1. Ve a **WordPress Admin → Plugins**
2. Busca "Property Dashboard"
3. Haz clic en **Activar**

**IMPORTANTE:** Al activar el plugin se ejecutarán automáticamente las siguientes acciones:
- ✅ Se registrará el Custom Post Type "Propiedades"
- ✅ Se crearán los roles personalizados (Gerente, Asociado)
- ✅ Se asignarán permisos al rol Administrador
- ✅ Se creará una página de ejemplo con el shortcode
- ✅ Se configurarán las reglas de reescritura (permalinks)

**Verificación:** Después de activar, deberías ver el menú "Propiedades" en el panel lateral del admin de WordPress. Si no aparece inmediatamente, recarga la página del navegador.

### 5. Crear página con shortcode

1. Ve a **Páginas → Agregar nueva**
2. Dale un nombre (ej: "Dashboard de Propiedades")
3. Agrega el shortcode: `[property_dashboard]`
4. Publica la página

¡Listo! Ya puedes acceder al dashboard de propiedades.

## 👥 Roles y Permisos

El plugin crea 3 roles automáticamente:

### Administrador
- ✅ Ver todas las propiedades
- ✅ Crear, editar y eliminar cualquier propiedad
- ✅ Gestionar usuarios y roles
- ✅ Acceso completo

### Gerente
- ✅ Ver todas las propiedades
- ✅ Crear y editar cualquier propiedad
- ✅ Eliminar solo sus propiedades
- ✅ Asignar propiedades a asociados
- ❌ No puede gestionar usuarios

### Asociado
- ✅ Ver solo sus propiedades
- ✅ Crear nuevas propiedades
- ✅ Editar sus propiedades
- ❌ No puede eliminar
- ❌ No puede ver propiedades de otros

## 📡 REST API Endpoints

El plugin expone los siguientes endpoints:

### Propiedades

```bash
# Listar propiedades
GET /wp-json/property-dashboard/v1/properties
Query params: ?page=1&per_page=20&search=casa&status=available&state=jalisco

# Obtener una propiedad
GET /wp-json/property-dashboard/v1/properties/123

# Crear propiedad
POST /wp-json/property-dashboard/v1/properties
Body: { title, description, status, state, municipality, ... }

# Actualizar propiedad
PUT /wp-json/property-dashboard/v1/properties/123
Body: { title, price, ... }

# Eliminar propiedad
DELETE /wp-json/property-dashboard/v1/properties/123
```

### Usuario actual

```bash
# Obtener info del usuario actual
GET /wp-json/property-dashboard/v1/user/me
```

## 🔐 Seguridad

- ✅ Nonce verificado en todas las peticiones
- ✅ Capabilities verificadas server-side
- ✅ Sanitización de todos los inputs
- ✅ Protección contra SQL Injection
- ✅ Protección contra XSS
- ✅ Validación de permisos por propiedad

## 🏗️ Estructura del Plugin

```
wordpress-plugin/
├── property-dashboard.php              # Archivo principal
├── includes/
│   ├── class-property-cpt.php         # Custom Post Type
│   ├── class-property-meta.php        # Meta fields
│   ├── class-property-roles.php       # Roles y permisos
│   ├── class-property-rest-api.php    # REST API
│   ├── class-property-installer.php   # Activation hooks
│   ├── class-property-shortcode.php   # Shortcode handler
│   └── class-property-assets.php      # Assets manager
├── dist/                               # React compilado
│   └── assets/
│       ├── index.js
│       └── index.css
└── README.md
```

## 🎨 Uso del Shortcode

### Básico
```
[property_dashboard]
```

### Con opciones
```
[property_dashboard view="grid" per_page="20"]
```

Parámetros disponibles:
- `view`: "grid" o "list" (por defecto: "grid")
- `per_page`: Propiedades por página (por defecto: 20)

## 🔄 Desarrollo

### Compilar cambios del frontend

```bash
# Development con hot reload
npm run dev

# Build para producción
npm run build
```

Después de cada build, copia los archivos a `wordpress-plugin/dist/`.

### Estructura de datos

Cada propiedad contiene:
- `title` - Título
- `description` - Descripción
- `status` - Estado (available, sold, rented, reserved)
- `state` - Estado de la República
- `municipality` - Municipio
- `neighborhood` - Colonia
- `postal_code` - Código Postal
- `street` - Calle
- `patent` - Patente (número único)
- `price` - Precio en MXN
- `google_maps_url` - URL de Google Maps
- `attachment_id` - ID de ficha técnica PDF

## 🐛 Troubleshooting

### El CPT "Propiedades" no aparece en el menú del admin

**Solución:**
1. Desactiva el plugin desde **Plugins → Plugin instalados**
2. Reactiva el plugin
3. Recarga la página del navegador (F5 o Cmd+R)

Si el problema persiste:
1. Ve a **Ajustes → Enlaces permanentes**
2. Haz clic en "Guardar cambios" (sin modificar nada)
3. Esto forzará la regeneración de las reglas de reescritura

### No tengo permisos para ver/editar propiedades

Verifica que tu usuario tiene uno de los siguientes roles:
- Administrador
- Gerente (property_manager)
- Asociado (property_associate)

Para cambiar roles:
1. Ve a **Usuarios → Todos los usuarios**
2. Edita el usuario
3. Cambia el "Rol" en el menú desplegable

### El shortcode no muestra nada

Verifica que:
1. La carpeta `dist/` existe en el plugin
2. Contiene los archivos `assets/index.js` y `assets/index.css`
3. Los archivos se compilaron correctamente con `npm run build`

### Errores en la consola del navegador

Abre las herramientas de desarrollo (F12) y verifica:
- Que no haya errores 404 al cargar JS/CSS
- Que `window.wpPropertyDashboard` esté definido
- Que `wpPropertyDashboard.nonce` esté presente

## 🐛 Debugging

Habilita debug en WordPress:

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Los logs se guardan en: `wp-content/debug.log`

## 📝 Licencia

GPL v2 o posterior

## 👨‍💻 Autor

Tu Nombre - 2025

## 🆘 Soporte

Para reportar bugs o solicitar features, contacta al desarrollador.
