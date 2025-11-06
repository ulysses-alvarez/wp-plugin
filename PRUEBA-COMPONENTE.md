# 🧪 Componente de Prueba - Verificación del Sistema

He creado un **componente de prueba** que te permitirá verificar que toda la integración WordPress ↔ React funciona correctamente antes de implementar el dashboard completo.

---

## 📋 Pasos para Probar

### 1️⃣ Compilar el Proyecto

Desde la raíz del proyecto, ejecuta:

```bash
npm run build
```

Este comando:
- Compilará el código TypeScript
- Generará los archivos optimizados en `dist/`
- Creará `vendor.js` e `index.js`

### 2️⃣ Copiar al Plugin de WordPress

Copia la carpeta `dist/` actualizada al plugin:

```bash
cp -r dist/ wordpress-plugin/
```

### 3️⃣ Subir al Servidor

Sube vía FTP la carpeta completa `wordpress-plugin/dist/` al servidor en:
```
/wp-content/plugins/property-dashboard/dist/
```

### 4️⃣ Ver el Componente de Prueba

1. Ve a la página donde pusiste el shortcode `[property_dashboard]`
2. Deberías ver una interfaz completa mostrando:

---

## ✅ Qué Verás en el Componente de Prueba

El componente muestra varias secciones para verificar que todo funciona:

### 🎯 Tarjetas de Estado
- **✅ React Montado**: Confirma que React se montó correctamente
- **✅ Datos de WordPress**: Verifica que `window.wpPropertyDashboard` existe
- **✅ Nonce Activo**: Muestra que el nonce de seguridad está disponible

### 👤 Información del Usuario
Muestra los datos del usuario actual:
- Nombre
- Email
- Rol (Administrador, Gerente, Asociado)
- ID

### 🔐 Permisos (Capabilities)
Lista visual de todos los permisos que tiene el usuario actual:
- ✅ Verde = Permiso concedido
- ❌ Rojo = Permiso denegado

Algunos permisos que deberías ver:
- `view_properties`
- `create_properties`
- `edit_properties`
- `delete_properties`
- `view_all_properties`
- etc.

### 🌐 Configuración de API
Muestra las URLs configuradas:
- API URL: `/wp-json/property-dashboard/v1`
- Site URL: Tu URL de WordPress
- Locale: `es_ES` o `es_MX`
- Currency: `MXN`

### 🧪 Prueba de REST API
Botón **"🚀 Probar API"** que:
- Hace una petición a `/wp-json/property-dashboard/v1/properties`
- Muestra las propiedades existentes (si hay)
- Verifica que el nonce funciona
- Confirma que la REST API está activa

---

## 🔍 Verificaciones que Hace el Componente

### ✅ 1. React se Monta Correctamente
Si ves la interfaz, significa que:
- Los archivos JS se cargaron bien
- React se montó en el div correcto
- No hay errores en la consola

### ✅ 2. Datos de WordPress Disponibles
Si se muestra la información del usuario:
- `window.wpPropertyDashboard` está definido
- Los datos se pasan correctamente desde PHP a React
- El nonce está activo

### ✅ 3. Permisos Funcionan
Si ves la lista de permisos:
- El sistema de roles está funcionando
- Los capabilities se asignan correctamente
- Puedes ver qué puede hacer cada usuario

### ✅ 4. REST API Funciona
Si al hacer clic en "Probar API" ves una respuesta exitosa:
- La REST API está registrada
- El nonce permite acceso
- Los endpoints funcionan

---

## 🐛 Posibles Problemas y Soluciones

### Problema 1: Mensaje de Advertencia Amarillo

**Mensaje:** "Los datos de WordPress no están disponibles"

**Causa:** `window.wpPropertyDashboard` no está definido

**Solución:**
1. Verifica que el shortcode `[property_dashboard]` esté en la página
2. Verifica que los archivos JS se cargaron (F12 → Network → busca `index.js` y `vendor.js`)
3. Verifica que no haya errores en la consola (F12 → Console)

### Problema 2: Error al Probar API

**Mensaje:** "HTTP error! status: 404" o "HTTP error! status: 401"

**Causas posibles:**
- **404**: La REST API no está registrada
  - **Solución:** Desactiva y reactiva el plugin
  - Ve a **Ajustes → Enlaces permanentes** y haz clic en "Guardar"

- **401**: El nonce no es válido
  - **Solución:** Recarga la página para obtener un nuevo nonce

### Problema 3: No se Ven los Permisos

**Causa:** El usuario no tiene capabilities asignados

**Solución:**
1. Verifica que el usuario sea Administrador
2. Desactiva y reactiva el plugin
3. Verifica el rol en **Usuarios → Todos los usuarios**

---

## 🎉 Si Todo Funciona

Deberías ver:
- ✅ Interfaz completa con fondo blanco y verde
- ✅ Tu información de usuario
- ✅ Lista de permisos (muchos en verde)
- ✅ Botón "Probar API" funcional
- ✅ Al hacer clic en "Probar API", una respuesta JSON con tus propiedades

**Si todo esto funciona, significa que:**
- La integración WordPress ↔ React está perfecta
- El sistema de permisos funciona
- La REST API está activa
- Podemos proceder con la implementación completa del dashboard

---

## 📸 Captura de Pantalla Esperada

La interfaz debería verse así:

```
┌─────────────────────────────────────────────┐
│ ✅ Property Dashboard - Componente de Prueba│
│ Verificación de integración WordPress ↔ React│
└─────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ✅ React     │ │ ✅ Datos de  │ │ ✅ Nonce     │
│    Montado   │ │    WordPress │ │    Activo    │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────┐
│ 👤 Información del Usuario Actual           │
│ Nombre:    Tu Nombre                        │
│ Email:     tu@email.com                     │
│ Rol:       Administrador (administrator)    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🔐 Permisos (Capabilities)                  │
│ ✅ view_properties                          │
│ ✅ create_properties                        │
│ ✅ edit_properties                          │
│ ...                                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🧪 Prueba de REST API                       │
│ [🚀 Probar API]                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Siguiente Paso

Una vez que confirmes que todo funciona:

1. **Si todo está bien:** Podemos proceder con la implementación completa del dashboard
2. **Si hay errores:** Revisa las soluciones arriba o comparte el error que ves

---

## 📝 Checklist de Verificación

Marca cada item cuando lo completes:

- [ ] Ejecuté `npm run build` sin errores
- [ ] Copié la carpeta `dist/` al plugin
- [ ] Subí los archivos al servidor
- [ ] Veo la interfaz del componente de prueba
- [ ] Veo mi información de usuario correctamente
- [ ] Veo la lista de permisos
- [ ] El botón "Probar API" funciona
- [ ] La respuesta de la API muestra datos (o array vacío si no hay propiedades)
- [ ] No hay errores en la consola del navegador (F12)

---

**Última actualización:** 2025-11-06
