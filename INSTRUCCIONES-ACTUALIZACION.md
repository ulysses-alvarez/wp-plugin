# 🔧 Instrucciones de Actualización del Plugin

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
