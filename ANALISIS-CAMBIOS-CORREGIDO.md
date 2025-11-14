# 📋 Análisis Corregido: Cambios Mobile y Desktop Layout

## 🎯 **CAMBIOS SOLICITADOS (CORREGIDO)**

### **1. Mobile: Siempre 20 propiedades por página**
- **Requisito:** En mobile, siempre mostrar 20 propiedades por página, independientemente de la configuración de "Propiedades por página"
- **Mejores prácticas:** Usar un hook de media query en lugar de `window.innerWidth` para detectar mobile de manera más robusta

### **2. Desktop: Layout reorganizado de PropertyFilters**
- **Requisito:** En desktop, poner el **AdvancedSearchBar** (selector de contexto + buscador) en la misma fila que los botones, usando `space-between`
  - **Izquierda:** AdvancedSearchBar (selector de contexto + campo de búsqueda)
  - **Derecha:** Botones (Importar, Exportar, Agregar)
- **Mobile:** Mantener layout vertical actual (botones arriba, buscador abajo)

---

## 🔍 **ANÁLISIS TÉCNICO**

### **1. Mobile: Forzar 20 propiedades (MEJORES PRÁCTICAS)**

#### **Problema con `window.innerWidth`:**
- ❌ No se actualiza cuando el usuario cambia el tamaño de ventana
- ❌ No detecta correctamente dispositivos móviles en modo landscape
- ❌ No es SSR-safe (puede causar problemas en server-side rendering)
- ❌ No respeta las preferencias del usuario (zoom, tamaño de fuente)

#### **Solución Recomendada: Media Query Hook**

**Opción A: Hook personalizado con `matchMedia` (RECOMENDADA) ⭐**

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
};

// Uso:
const isMobile = useMediaQuery('(max-width: 639px)'); // sm breakpoint
```

**Ventajas:**
- ✅ Se actualiza automáticamente cuando cambia el tamaño de ventana
- ✅ SSR-safe (verifica `typeof window`)
- ✅ Usa la API estándar `matchMedia` (más confiable)
- ✅ Respeta las preferencias del usuario
- ✅ Reutilizable en toda la aplicación

**Opción B: Hook específico para mobile**

```typescript
// hooks/useIsMobile.ts
import { useMediaQuery } from './useMediaQuery';

export const useIsMobile = (): boolean => {
  // Tailwind sm breakpoint: 640px
  return useMediaQuery('(max-width: 639px)');
};
```

**Opción C: Usar en el store con efecto**

```typescript
// En usePropertyStore.ts
import { useIsMobile } from '@/hooks/useIsMobile';

// Pero esto NO funciona porque el store no es un hook de React
// Necesitamos pasar el valor desde un componente
```

**Solución Final:**
1. Crear hook `useMediaQuery` y `useIsMobile`
2. Usar el hook en `PropertyTable` o `PropertiesPage`
3. Pasar `effectivePerPage` al store cuando se carga

---

### **2. Desktop: Reorganizar PropertyFilters**

#### **Estructura Actual:**
```
PropertyFilters
├── Botones (flex justify-end)
│   ├── Importar (hidden md:flex)
│   ├── Exportar
│   └── Agregar
└── AdvancedSearchBar (w-full)
    ├── Selector de contexto (Título, Patente, etc.)
    └── Campo de búsqueda
```

#### **Estructura Nueva (Desktop):**
```
PropertyFilters (flex-row justify-between)
├── Izquierda (flex items-center gap-3 flex-1)
│   └── AdvancedSearchBar
│       ├── Selector de contexto
│       └── Campo de búsqueda
└── Derecha (flex items-center gap-2)
    ├── Importar
    ├── Exportar
    └── Agregar
```

#### **Estructura Mobile (sin cambios):**
```
PropertyFilters (flex-col)
├── Botones (flex justify-end)
└── AdvancedSearchBar (w-full)
```

#### **Cambios Necesarios en PropertyFilters.tsx:**

```tsx
return (
  <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
    {/* Desktop: Una fila con space-between */}
    <div className="hidden md:flex items-center justify-between gap-4">
      {/* Izquierda: AdvancedSearchBar */}
      <div className="flex-1 max-w-2xl">
        <AdvancedSearchBar
          onSearch={handleSearch}
          debounceMs={300}
        />
      </div>
      
      {/* Derecha: Botones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Importar */}
        {/* Exportar */}
        {/* Agregar */}
      </div>
    </div>

    {/* Mobile: Layout vertical */}
    <div className="flex md:hidden flex-col gap-3">
      {/* Botones */}
      <div className="flex items-center justify-end gap-2">
        {/* Exportar */}
        {/* Agregar */}
      </div>
      
      {/* Buscador */}
      <div className="w-full">
        <AdvancedSearchBar
          onSearch={handleSearch}
          debounceMs={300}
        />
      </div>
    </div>
  </div>
);
```

---

## 📊 **IMPACTO DE LOS CAMBIOS**

### **Archivos a Crear:**

1. **`src/hooks/useMediaQuery.ts`** (NUEVO)
   - Hook genérico para media queries
   - Reutilizable en toda la aplicación

2. **`src/hooks/useIsMobile.ts`** (NUEVO)
   - Hook específico para detectar mobile
   - Usa `useMediaQuery` internamente

### **Archivos a Modificar:**

1. **`src/stores/usePropertyStore.ts`**
   - Modificar `loadProperties()` para aceptar `effectivePerPage` como parámetro
   - O crear una función helper que calcule el perPage efectivo

2. **`src/components/properties/PropertyTable.tsx`**
   - Usar `useIsMobile()` hook
   - Calcular `effectivePerPage` (20 si mobile, `perPage` si desktop)
   - Pasar `effectivePerPage` a `loadProperties()`

3. **`src/components/properties/PropertyFilters.tsx`**
   - Reorganizar layout para desktop (flex-row justify-between)
   - Mantener layout vertical en mobile
   - Mover AdvancedSearchBar a la izquierda en desktop

---

## ✅ **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Crear hooks de media query**

1. **Crear `src/hooks/useMediaQuery.ts`:**
   ```typescript
   // Hook genérico para media queries
   // Usa matchMedia API
   // SSR-safe
   ```

2. **Crear `src/hooks/useIsMobile.ts`:**
   ```typescript
   // Hook específico para mobile
   // Usa useMediaQuery('(max-width: 639px)')
   ```

### **FASE 2: Mobile - Forzar 20 propiedades**

1. **PropertyTable.tsx:**
   ```typescript
   const isMobile = useIsMobile();
   const effectivePerPage = isMobile ? 20 : perPage;
   
   useEffect(() => {
     loadProperties({ per_page: effectivePerPage });
   }, [effectivePerPage, ...]);
   ```

2. **Verificar:**
   - Desktop: respeta el valor de `perPage` del store
   - Mobile: siempre usa 20
   - Cambio de tamaño de ventana: se actualiza automáticamente

### **FASE 3: Desktop - Reorganizar PropertyFilters**

1. **PropertyFilters.tsx:**
   - Agregar layout desktop con `flex-row justify-between`
   - Mover AdvancedSearchBar a la izquierda
   - Mantener botones a la derecha
   - Mobile: mantener layout vertical

2. **Verificar:**
   - Desktop: AdvancedSearchBar y botones en la misma fila
   - Mobile: layout vertical (sin cambios)

---

## 🎨 **VISUALIZACIÓN DEL LAYOUT**

### **Desktop (≥ 768px):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Título ▼] [🔍 Buscador...]              [Imp] [Exp] [Agregar]      │
└─────────────────────────────────────────────────────────────────────┘
```

### **Mobile (< 768px):**
```
┌─────────────────────────────┐
│              [Exp] [Agregar] │
├─────────────────────────────┤
│ [Título ▼] [🔍 Buscador...] │
└─────────────────────────────┘
```

---

## ⚠️ **CONSIDERACIONES**

### **1. Breakpoints:**
- Tailwind `sm`: 640px
- Tailwind `md`: 768px
- Para mobile: `max-width: 639px` (menor que sm)
- Para layout reorganizado: `min-width: 768px` (md)

### **2. AdvancedSearchBar:**
- Ya tiene su propio layout interno (selector + input)
- Solo necesitamos ajustar el contenedor en PropertyFilters
- No necesita cambios internos

### **3. Responsive:**
- El hook `useMediaQuery` se actualiza automáticamente
- Si el usuario cambia el tamaño de ventana, se recalcula automáticamente
- Mejor UX que usar `window.innerWidth`

---

## 🧪 **CASOS DE PRUEBA**

### **Mobile (20 propiedades):**
1. ✅ Usuario en desktop cambia a 50 por página
2. ✅ Usuario redimensiona ventana a mobile (< 640px) → debe mostrar 20 por página
3. ✅ Usuario vuelve a desktop → debe mostrar 50 por página (valor guardado)
4. ✅ Usuario cambia tamaño de ventana dinámicamente → se actualiza automáticamente

### **Desktop Layout:**
1. ✅ AdvancedSearchBar y botones en la misma fila (desktop)
2. ✅ Layout vertical en mobile (sin cambios)
3. ✅ AdvancedSearchBar a la izquierda, botones a la derecha
4. ✅ `space-between` funciona correctamente

---

## 📝 **MEJORES PRÁCTICAS APLICADAS**

1. ✅ **Media Query Hook:** Usa `matchMedia` API en lugar de `window.innerWidth`
2. ✅ **SSR-safe:** Verifica `typeof window` antes de usar APIs del navegador
3. ✅ **Reactivo:** Se actualiza automáticamente cuando cambia el tamaño de ventana
4. ✅ **Reutilizable:** Hooks genéricos que se pueden usar en otros componentes
5. ✅ **Mantenible:** Código limpio y bien estructurado

---

**Fecha de Análisis:** 13 de Noviembre, 2025  
**Estado:** ✅ Listo para implementación con mejores prácticas



