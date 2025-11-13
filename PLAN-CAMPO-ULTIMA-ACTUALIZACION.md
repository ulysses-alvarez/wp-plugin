# 📋 Plan: Campo de Última Actualización de Propiedades

## 🔍 **ANÁLISIS INICIAL**

### ✅ **Lo que WordPress YA tiene por defecto:**

WordPress incluye automáticamente estos campos en todos los posts:

1. **`post_date`** → Fecha de creación del post
2. **`post_modified`** → Fecha de última modificación del post
3. **`post_modified_gmt`** → Fecha de última modificación en GMT

### ✅ **Lo que YA está implementado:**

1. **Backend (PHP):**
   - La API REST ya devuelve `created_at` y `updated_at` (líneas 984-985 de `class-property-rest-api.php`)
   - Estos campos se actualizan automáticamente cuando se guarda un post

2. **Frontend (TypeScript):**
   - El tipo `Property` ya incluye `created_at?: string` y `updated_at?: string` (líneas 26-27 de `permissions.ts`)
   - Los datos ya están disponibles en el frontend

### ❌ **Lo que NO se puede hacer actualmente:**

**No se puede distinguir** si la actualización fue desde:
- WordPress Admin (editor clásico/Gutenberg)
- Dashboard de Propiedades (nuestra aplicación)

WordPress actualiza `post_modified` automáticamente en ambos casos sin distinguir el origen.

---

## 🎯 **OBJETIVO**

Registrar y mostrar cuándo fue la última vez que se actualizó una propiedad, con la capacidad de distinguir si fue desde:
1. **WordPress Admin** (editor nativo)
2. **Dashboard de Propiedades** (nuestra aplicación)

---

## 💡 **OPCIONES DE IMPLEMENTACIÓN**

### **OPCIÓN 1: Meta Field Personalizado (RECOMENDADA) ⭐**

**Descripción:**
Crear un meta field `_property_last_dashboard_update` que solo se actualice cuando se modifique desde el dashboard.

**Ventajas:**
- ✅ Simple de implementar
- ✅ No interfiere con WordPress core
- ✅ Permite distinguir claramente el origen
- ✅ Mantiene `updated_at` para todas las actualizaciones
- ✅ Fácil de consultar y mostrar

**Desventajas:**
- ⚠️ Requiere actualizar el código PHP de la API
- ⚠️ Solo rastrea actualizaciones desde el dashboard (no desde WordPress admin)

**Implementación:**
```php
// Al actualizar desde dashboard:
update_post_meta($property_id, '_property_last_dashboard_update', current_time('mysql'));

// Al actualizar desde WordPress admin (hook):
add_action('save_post_property', function($post_id) {
    // Solo si NO viene del dashboard (detectar por falta de header o nonce)
    if (!isset($_SERVER['HTTP_X_DASHBOARD_UPDATE'])) {
        // WordPress admin update - no hacer nada especial
    }
});
```

---

### **OPCIÓN 2: Header Personalizado en Requests**

**Descripción:**
Enviar un header personalizado desde el frontend cuando se actualiza desde el dashboard, y detectarlo en el backend.

**Ventajas:**
- ✅ No requiere meta fields adicionales
- ✅ Distingue claramente el origen
- ✅ Puede actualizar un campo existente

**Desventajas:**
- ⚠️ Requiere modificar tanto frontend como backend
- ⚠️ Puede ser omitido si alguien hace request directo

**Implementación:**
```typescript
// Frontend (api.ts)
headers: {
  'Content-Type': 'application/json',
  'X-WP-Nonce': config.nonce,
  'X-Dashboard-Update': 'true' // Nuevo header
}
```

```php
// Backend
$is_dashboard_update = isset($_SERVER['HTTP_X_DASHBOARD_UPDATE']);
if ($is_dashboard_update) {
    update_post_meta($property_id, '_property_last_dashboard_update', current_time('mysql'));
}
```

---

### **OPCIÓN 3: Usar Solo `updated_at` (MÁS SIMPLE)**

**Descripción:**
Simplemente mostrar el campo `updated_at` que ya existe, sin distinguir el origen.

**Ventajas:**
- ✅ Ya está implementado
- ✅ No requiere cambios en backend
- ✅ Muestra TODAS las actualizaciones (admin + dashboard)

**Desventajas:**
- ❌ No distingue el origen de la actualización
- ❌ No cumple con el requisito de distinguir origen

---

### **OPCIÓN 4: Hook de WordPress + Meta Field**

**Descripción:**
Usar hooks de WordPress para detectar actualizaciones desde admin y guardar en meta field separado.

**Ventajas:**
- ✅ Rastrea ambos orígenes
- ✅ Usa sistema nativo de WordPress

**Desventajas:**
- ⚠️ Más complejo de implementar
- ⚠️ Requiere detectar correctamente el origen (puede ser difícil)
- ⚠️ Puede tener falsos positivos

---

## 🏆 **RECOMENDACIÓN: OPCIÓN 1 + OPCIÓN 2 (Híbrida)**

### **Estrategia Recomendada:**

1. **Meta Field Personalizado:**
   - `_property_last_dashboard_update` → Solo se actualiza desde dashboard
   - `_property_last_admin_update` → Solo se actualiza desde WordPress admin (opcional)

2. **Header Personalizado:**
   - Frontend envía `X-Dashboard-Update: true` cuando actualiza desde dashboard
   - Backend detecta el header y actualiza el meta field correspondiente

3. **Mostrar en UI:**
   - Mostrar `updated_at` (última actualización general)
   - Mostrar `last_dashboard_update` (si existe, última desde dashboard)
   - Mostrar `last_admin_update` (si existe, última desde admin)

---

## 📊 **ESTRUCTURA DE DATOS PROPUESTA**

### **Backend (PHP):**
```php
// En prepare_property_response():
'created_at'              => $post->post_date,
'updated_at'              => $post->post_modified, // Todas las actualizaciones
'last_dashboard_update'   => get_post_meta($post->ID, '_property_last_dashboard_update', true),
'last_admin_update'      => get_post_meta($post->ID, '_property_last_admin_update', true),
```

### **Frontend (TypeScript):**
```typescript
export interface Property {
  // ... campos existentes ...
  created_at?: string;
  updated_at?: string;
  last_dashboard_update?: string;  // Nuevo
  last_admin_update?: string;      // Nuevo (opcional)
}
```

---

## 🛠️ **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Backend (PHP)**

1. **Modificar `update_property()` en `class-property-rest-api.php`:**
   - Detectar header `X-Dashboard-Update`
   - Si viene del dashboard → actualizar `_property_last_dashboard_update`
   - Si viene de WordPress admin → actualizar `_property_last_admin_update` (via hook)

2. **Agregar hook para WordPress Admin:**
   - `save_post_property` hook
   - Detectar si NO viene del dashboard
   - Actualizar `_property_last_admin_update`

3. **Modificar `prepare_property_response()`:**
   - Agregar `last_dashboard_update` y `last_admin_update` a la respuesta

### **FASE 2: Frontend (TypeScript)**

1. **Modificar `api.ts`:**
   - Agregar header `X-Dashboard-Update: true` en `updateProperty()`
   - Agregar header en `bulkUpdateStatus()` y `bulkUpdatePatent()`

2. **Actualizar tipo `Property`:**
   - Agregar campos `last_dashboard_update` y `last_admin_update`

3. **Mostrar en UI (Opcional):**
   - Agregar columna en tabla (opcional)
   - Mostrar en sidebar de detalles
   - Tooltip con información de última actualización

---

## 📝 **CAMPOS A AGREGAR**

### **Meta Fields (WordPress):**
- `_property_last_dashboard_update` (string, formato MySQL datetime)
- `_property_last_admin_update` (string, formato MySQL datetime) - Opcional

### **API Response:**
- `last_dashboard_update` (string, ISO 8601)
- `last_admin_update` (string, ISO 8601) - Opcional

### **TypeScript Interface:**
- `last_dashboard_update?: string`
- `last_admin_update?: string`

---

## 🎨 **DÓNDE MOSTRAR LA INFORMACIÓN**

### **Opciones de Visualización:**

1. **En la Tabla de Propiedades:**
   - Nueva columna "Última Actualización" (opcional, solo desktop)
   - Tooltip con detalles: "Actualizado desde Dashboard: [fecha]"

2. **En el Sidebar de Detalles:**
   - Sección "Información de Actualización"
   - Mostrar:
     - Fecha de creación
     - Última actualización general
     - Última actualización desde dashboard (si existe)
     - Última actualización desde admin (si existe)

3. **En el Formulario de Edición:**
   - Badge o indicador: "Última actualización: [fecha] desde [origen]"

---

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **1. Migración de Datos Existentes:**
- Las propiedades existentes no tendrán estos campos
- Considerar si se necesita migración o simplemente empezar desde ahora

### **2. Bulk Updates:**
- Las actualizaciones masivas también deben actualizar el campo
- Considerar si cada propiedad individual o una fecha general

### **3. Importación CSV:**
- Las importaciones masivas pueden o no actualizar estos campos
- Decidir si se considera "dashboard update" o no

### **4. Performance:**
- Agregar meta fields no afecta significativamente el performance
- Las consultas con meta_query son eficientes en WordPress

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Backend:**
- [ ] Agregar detección de header `X-Dashboard-Update` en `update_property()`
- [ ] Actualizar meta field `_property_last_dashboard_update` cuando viene del dashboard
- [ ] Agregar hook `save_post_property` para detectar actualizaciones desde admin
- [ ] Actualizar meta field `_property_last_admin_update` cuando viene de admin
- [ ] Modificar `prepare_property_response()` para incluir nuevos campos
- [ ] Actualizar `bulkUpdateStatus()` y `bulkUpdatePatent()` para actualizar meta fields
- [ ] Probar actualizaciones desde dashboard
- [ ] Probar actualizaciones desde WordPress admin

### **Frontend:**
- [ ] Agregar header `X-Dashboard-Update` en `updateProperty()`
- [ ] Agregar header en `bulkUpdateStatus()` y `bulkUpdatePatent()`
- [ ] Actualizar tipo `Property` con nuevos campos
- [ ] Actualizar store para manejar nuevos campos
- [ ] (Opcional) Agregar columna en tabla
- [ ] (Opcional) Mostrar en sidebar de detalles
- [ ] (Opcional) Agregar tooltips informativos

---

## 🧪 **CASOS DE PRUEBA**

1. **Actualizar propiedad desde dashboard:**
   - Verificar que `last_dashboard_update` se actualiza
   - Verificar que `updated_at` se actualiza
   - Verificar que `last_admin_update` NO se actualiza

2. **Actualizar propiedad desde WordPress admin:**
   - Verificar que `last_admin_update` se actualiza
   - Verificar que `updated_at` se actualiza
   - Verificar que `last_dashboard_update` NO se actualiza

3. **Bulk update desde dashboard:**
   - Verificar que todas las propiedades actualizadas tienen `last_dashboard_update`

4. **Propiedad nueva:**
   - Verificar que solo tiene `created_at` y `updated_at`
   - No debe tener `last_dashboard_update` ni `last_admin_update` hasta primera actualización

---

## 📚 **REFERENCIAS**

- [WordPress: post_modified](https://developer.wordpress.org/reference/classes/wp_post/post_modified/)
- [WordPress: save_post hook](https://developer.wordpress.org/reference/hooks/save_post/)
- [WordPress: update_post_meta](https://developer.wordpress.org/reference/functions/update_post_meta/)

---

## 🎯 **DECISIÓN REQUERIDA**

Antes de implementar, necesito que decidas:

1. **¿Quieres distinguir entre admin y dashboard?**
   - ✅ Sí → Implementar Opción 1 + 2 (híbrida)
   - ❌ No → Solo mostrar `updated_at` existente

2. **¿Dónde quieres mostrar esta información?**
   - Tabla de propiedades
   - Sidebar de detalles
   - Ambos
   - Solo en sidebar

3. **¿Las actualizaciones masivas (bulk) deben actualizar el campo?**
   - ✅ Sí
   - ❌ No

4. **¿Qué hacer con propiedades existentes?**
   - Dejarlas sin el campo (empezar desde ahora)
   - Migrar y establecer fecha de creación como última actualización

---

**Fecha de Plan:** 13 de Noviembre, 2025  
**Estado:** ⏳ Esperando decisión del usuario

