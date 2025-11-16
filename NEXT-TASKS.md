# 📋 TAREAS PENDIENTES - PROPERTY MANAGER

## ⚙️ REFACTORING PENDIENTE (FASE 3 - BACKEND)

### T3.1: Dividir `get_properties()` en métodos privados (8h)

**Ubicación:** `property-manager/includes/class-property-rest-api.php:200-526`

**Problema:**
Función de 326 líneas que viola el principio de responsabilidad única. Mezcla:
- Parsing de parámetros
- Query building
- Filtrado
- Búsqueda
- Preparación de respuesta

**Solución:**
Extraer a 5 métodos privados:
```php
private function parse_query_params($request) { /* ... */ }
private function build_wp_query($params) { /* ... */ }
private function apply_search_filter($query, $search_term) { /* ... */ }
private function prepare_response($query) { /* ... */ }
```

**Beneficios:**
- Mejora testabilidad
- Reduce complejidad cognitiva
- Facilita mantenimiento
- Permite reutilización de lógica

---

### T3.2: Crear constantes para arrays repetidos (3h)

**Archivos:** Múltiples clases

**Problema:**
`$allowed_roles` y `$allowed_statuses` repetidos 7+ veces en diferentes archivos:
- `class-property-user-management.php` (líneas: 52-56, 81, 150, 195, 213, 253, 295)
- `class-property-meta.php`
- Otros archivos

**Solución:**
```php
class Property_User_Management {
    const ALLOWED_ROLES = ['property_admin', 'property_manager', 'property_associate'];
    const ALLOWED_STATUSES = ['available', 'sold', 'rented', 'reserved'];
}
```

**Beneficios:**
- Elimina duplicación de código
- Punto único de verdad
- Fácil actualización de valores permitidos
- Reduce errores

---

### T3.4: Extraer CSS inline a archivos (6h)

**Archivos:**
- `class-property-meta.php:422-448`
- `class-property-audit.php:107-117`

**Problema:**
CSS inline dentro de métodos PHP dificulta mantenimiento y viola separación de responsabilidades.

**Solución:**
1. Crear `property-admin.css` en assets
2. Usar `wp_add_inline_style()` o `wp_enqueue_style()`
3. Mover todos los estilos a archivo CSS

**Beneficios:**
- Mejor organización
- Cacheabilidad
- Minificación
- Reutilización de estilos

---

### T3.5: Consolidar duplicación de código (8h)

**Archivo:** `class-property-profile-api.php:60-69, 194-204`

**Problema:**
Código duplicado para formatear respuestas de usuario en múltiples endpoints.

**Solución:**
Crear método privado `format_user_response($user)`:
```php
private function format_user_response($user) {
    $role = $user->roles[0] ?? '';
    return [
        'id'        => $user->ID,
        'name'      => $user->display_name,
        'email'     => $user->user_email,
        'role'      => $role,
        'roleLabel' => Property_Roles::get_role_label($role)
    ];
}
```

**Beneficios:**
- DRY (Don't Repeat Yourself)
- Consistencia entre endpoints
- Fácil actualización de formato de respuesta
- Reduce código en ~40 líneas

---

**Total estimado Fase 3 backend:** ~25 horas de trabajo

---

## 🔴 ALTA PRIORIDAD

### 🐛 1. BUG CRÍTICO: Cambio de Nombre y Contraseña NO se Persisten en Base de Datos

**Problema:**
Aunque el request al API devuelve status 200 y mensaje de éxito, los cambios de nombre y contraseña NO se guardan en la base de datos de WordPress. El usuario puede cambiar su nombre o contraseña, ve el toast de éxito, pero:
- El nombre sigue siendo el anterior en el frontend y wp-admin
- La contraseña antigua sigue funcionando, la nueva NO funciona

**Evidencia de logs:**
```javascript
// Request exitoso:
Profile update response: {status: 200, data: {success: true, message: 'Perfil actualizado correctamente'}}

// Pero al recargar:
Profile loaded: {name: "Ul Test Admin", ...} // ❌ Nombre NO cambió a "Fernando Díaz"
```

**Causa raíz probable:**
El API responde con éxito pero `wp_update_user()` puede estar fallando silenciosamente o los datos no se están actualizando correctamente en WordPress.

**Ubicaciones a investigar:**
- **Backend:** `property-manager/includes/class-property-profile-api.php` líneas 126-176
- Específicamente la llamada a `wp_update_user($user_data)` línea 176
- Verificar si hay hooks de WordPress bloqueando la actualización
- Verificar permisos del usuario actual

**Solución propuesta:**
1. Agregar logs en el backend PHP antes y después de `wp_update_user()`
2. Verificar el resultado de `wp_update_user()` y registrar si devuelve `WP_Error`
3. Verificar que `$user_data` contenga los campos correctos
4. Revisar si hay algún hook de WordPress interceptando la actualización
5. Confirmar que el usuario tiene permisos para actualizar su propio perfil

**Impacto:** 🔴 CRÍTICO - Los usuarios NO pueden cambiar su información de perfil

**Estado:** ❌ Requiere investigación backend

---

### ✅ 2. BUG RESUELTO: Rol Aparece Correctamente en Página de Perfil

**Problema original:**
El campo "Rol" NO se mostraba en la página de perfil.

**Solución implementada:**
- Agregado mapeo de datos en el frontend para soportar tanto `role_label` como `roleLabel`
- Modificado API para devolver ambos formatos
- Archivos modificados:
  - `src/pages/ProfilePage.tsx` líneas 60-67
  - `property-manager/includes/class-property-profile-api.php` líneas 67-68

**Estado:** ✅ Completado y funcional

---

### ❌ 4. Scroll Automático en Paginación (NO FUNCIONA)

**Problema:**
Cuando el usuario está navegando por la tabla de propiedades y hace scroll hasta abajo, al cambiar de página la vista NO sube automáticamente al inicio de la tabla. El usuario se queda viendo el final de la página vacía.

**Impacto en UX:** Alto - Confunde al usuario haciéndole pensar que no hay más propiedades.

---

#### 📊 Análisis Técnico Completo

**Estructura del DOM:**
```
PropertiesPage
  └── <div className="h-full flex flex-col">
      ├── <PropertyFilters />
      └── <div className="flex-1 overflow-auto">  ← CONTENEDOR SCROLLABLE REAL (PropertiesPage línea 529)
          └── <div className="px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
              └── <div className="flex-1 overflow-hidden">
                  └── <PropertyTable>
                      └── <div ref={tableContainerRef} className="h-full flex flex-col">
                          └── <div className="flex-1 overflow-hidden flex flex-col">
                              └── <div className="flex-1 overflow-auto">  ← Scroll interno de tabla
```

---

#### 🔄 Historial de Intentos de Solución

##### **Intento #1 - Código Original (ANTES)**
**Ubicación:** `PropertyTable.tsx` líneas 154-172 (versión previa)

```typescript
const handlePageChange = (page: number) => {
  setPage(page);

  // Execute scroll after a small delay to ensure content is updated
  requestAnimationFrame(() => {
    // Find all scrollable elements and scroll them to top
    const scrollableElements = [
      document.querySelector('.overflow-auto'),
      document.documentElement,
      document.body
    ];

    scrollableElements.forEach((element) => {
      if (element) {
        element.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
};
```

**Por qué no funcionó:**
- `document.querySelector('.overflow-auto')` encuentra el PRIMER elemento con esa clase
- Puede encontrar el scroll interno de la tabla en lugar del contenedor padre
- No garantiza que sea el contenedor correcto
- Intenta múltiples elementos pero sin especificidad

---

##### **Intento #2 - Uso de `.closest()` (ACTUAL - NO FUNCIONA)**
**Ubicación:** `PropertyTable.tsx` líneas 154-170 (versión actual)

```typescript
const handlePageChange = (page: number) => {
  setPage(page);

  // Scroll to top after page change
  // Use requestAnimationFrame to ensure the page change is processed first
  requestAnimationFrame(() => {
    // Find the scrollable parent container (the one in PropertiesPage)
    if (tableContainerRef.current) {
      // Find the closest parent element with overflow-auto class
      const scrollableParent = tableContainerRef.current.closest('.overflow-auto');
      
      if (scrollableParent) {
        scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });
};
```

**Por qué probablemente no funciona:**
1. **Timing incorrecto:** `requestAnimationFrame` puede ejecutarse antes de que React actualice el DOM
2. **Ref incorrecto:** `tableContainerRef` está dentro de muchos niveles de divs anidados
3. **`.closest()` busca hacia arriba:** Podría encontrar el contenedor interno de la tabla primero
4. **Estado asíncrono:** `setPage()` es asíncrono y el scroll se ejecuta antes de que las propiedades se carguen

---

#### 🔧 Posibles Soluciones a Explorar

##### **Opción A: useEffect con dependencia en currentPage**
```typescript
useEffect(() => {
  // Ejecutar después de que currentPage cambie y las propiedades se carguen
  if (!initialLoad && !loading) {
    const scrollContainer = document.querySelector('.flex-1.overflow-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}, [currentPage, loading, initialLoad]);
```

**Ventajas:**
- Se ejecuta después de que React actualice el DOM
- Depende de `currentPage` que cambia cuando se navega
- Verifica que no esté cargando

**Desventajas:**
- Puede ejecutarse en otras situaciones
- Necesita selectores más específicos

---

##### **Opción B: Pasar ref desde PropertiesPage**
```typescript
// En PropertiesPage.tsx
const mainScrollContainerRef = useRef<HTMLDivElement>(null);

// Luego en el JSX:
<div ref={mainScrollContainerRef} className="flex-1 overflow-auto">
  ...
  <PropertyTable scrollContainerRef={mainScrollContainerRef} />
</div>

// En PropertyTable.tsx
interface PropertyTableProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  // ... otros props
}

const handlePageChange = (page: number) => {
  setPage(page);
  
  requestAnimationFrame(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
};
```

**Ventajas:**
- Acceso directo al contenedor correcto
- No depende de selectores CSS
- Más predecible

**Desventajas:**
- Requiere modificar la interfaz del componente
- Acopla más los componentes

---

##### **Opción C: Usar scrollIntoView en el primer elemento de la tabla**
```typescript
const handlePageChange = (page: number) => {
  setPage(page);
  
  // Esperar a que React actualice
  setTimeout(() => {
    // Buscar la primera fila de la tabla o el header
    const firstElement = tableContainerRef.current?.querySelector('thead') 
                      || tableContainerRef.current?.querySelector('tbody tr:first-child');
    
    if (firstElement) {
      firstElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};
```

**Ventajas:**
- Usa el navegador para encontrar el contenedor scrollable automáticamente
- `scrollIntoView` es más confiable
- Scroll al elemento específico (header de tabla)

**Desventajas:**
- Usa `setTimeout` con tiempo arbitrario
- Puede no funcionar si el DOM no está listo

---

##### **Opción D: Callback después de loadProperties**
```typescript
const handlePageChange = (page: number) => {
  setPage(page);
  
  // Esperar a que loadProperties termine
  loadProperties().then(() => {
    requestAnimationFrame(() => {
      const scrollContainer = document.querySelector('.flex-1.overflow-auto');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
};
```

**Ventajas:**
- Scroll después de que los datos se carguen
- Usa Promises para timing correcto

**Desventajas:**
- `loadProperties` ya se ejecuta por el `useEffect`
- Podría causar doble carga

---

#### 📝 Archivos Afectados

- **`src/components/properties/PropertyTable.tsx`** (líneas 154-170)
- **`src/components/properties/PropertyGrid.tsx`** (líneas 53-66)
- **`src/pages/PropertiesPage.tsx`** (línea 529 - contenedor scrollable)

---

#### ✅ Criterios de Éxito

1. Usuario hace scroll hasta el final de la tabla
2. Usuario hace clic en "Página 2" (o cualquier otra página)
3. La vista debe subir suavemente al inicio de la tabla
4. El usuario debe ver la primera propiedad de la nueva página inmediatamente

---

#### 🎯 Prioridad: **ALTA**
#### ⏱️ Estimación: 1-2 horas de investigación + pruebas

---

## 🟢 COMPLETADAS

### ✅ 1. Estado Vacío vs Búsqueda Sin Resultados

**Problema:** El botón "+ Agregar Primera Propiedad" aparecía incluso cuando se buscaba algo y no había resultados.

**Solución implementada:**
- Se detecta si hay búsqueda activa mediante `filters.searchValue`
- Si hay búsqueda sin resultados: muestra mensaje de búsqueda (sin botón)
- Si sistema vacío sin búsqueda: muestra botón "+ Agregar Primera Propiedad"

**Archivos modificados:**
- `src/components/properties/PropertyTable.tsx` (líneas 250-294)
- `src/components/properties/PropertyGrid.tsx` (líneas 84-128)

**Estado:** ✅ Completado y funcional

---

## 📅 Última actualización: 2025-11-12

