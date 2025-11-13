# 📋 Análisis: Cambios Mobile y Desktop Layout

## 🎯 **CAMBIOS SOLICITADOS**

### **1. Mobile: Siempre 20 propiedades por página**
- **Requisito:** En mobile, siempre mostrar 20 propiedades por página, independientemente de la configuración de "Propiedades por página"
- **Comportamiento actual:** El selector de "Por página" está oculto en mobile, pero el valor del store se mantiene (puede ser 10, 20, 50, 100)
- **Problema:** Si un usuario en desktop cambia a 50 por página, luego en mobile seguiría usando 50 (aunque no se vea el selector)

### **2. Desktop: Layout reorganizado de PropertyFilters**
- **Requisito:** En desktop, poner "Select + Buscador" en una sola fila junto con los botones, usando `space-between`
  - **Izquierda:** Selector "Por página" + Buscador
  - **Derecha:** Botones (Importar, Exportar, Agregar)
- **Comportamiento actual:** 
  - Botones arriba (alineados a la derecha)
  - Buscador abajo (ancho completo)
  - Selector "Por página" está en el footer de paginación (solo desktop)

---

## 🔍 **ANÁLISIS TÉCNICO**

### **1. Mobile: Forzar 20 propiedades**

#### **Opción A: Detectar mobile en el store (RECOMENDADA)**
```typescript
// En usePropertyStore.ts - loadProperties()
const isMobile = window.innerWidth < 640; // sm breakpoint
const effectivePerPage = isMobile ? 20 : perPage;

queryParams.per_page = params?.per_page ?? effectivePerPage;
```

**Ventajas:**
- ✅ Simple y directo
- ✅ No requiere cambios en múltiples componentes
- ✅ El store maneja la lógica centralmente

**Desventajas:**
- ⚠️ No se actualiza si el usuario cambia el tamaño de ventana (pero esto es raro en mobile)

#### **Opción B: Hook personalizado con media query**
```typescript
// Hook useIsMobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};
```

**Ventajas:**
- ✅ Se actualiza dinámicamente
- ✅ Reutilizable

**Desventajas:**
- ⚠️ Más complejo
- ⚠️ Requiere estado adicional

#### **Opción C: CSS + JavaScript (NO RECOMENDADA)**
Usar media queries CSS y JavaScript para detectar, pero es más complejo.

**Recomendación:** **Opción A** - Simple y efectiva para este caso de uso.

---

### **2. Desktop: Reorganizar PropertyFilters**

#### **Estructura Actual:**
```
PropertyFilters
├── Botones (flex justify-end)
│   ├── Importar (hidden md:flex)
│   ├── Exportar
│   └── Agregar
└── Buscador (w-full)
```

#### **Estructura Nueva (Desktop):**
```
PropertyFilters (flex-row justify-between)
├── Izquierda (flex items-center gap-3)
│   ├── Selector "Por página" (nuevo, movido desde Pagination)
│   └── Buscador (flex-1)
└── Derecha (flex items-center gap-2)
    ├── Importar
    ├── Exportar
    └── Agregar
```

#### **Estructura Mobile (sin cambios):**
```
PropertyFilters (flex-col)
├── Botones (flex justify-end)
└── Buscador (w-full)
```

#### **Cambios Necesarios:**

1. **PropertyFilters.tsx:**
   - Agregar selector "Por página" (solo desktop)
   - Cambiar layout a `flex-row justify-between` en desktop
   - Mantener `flex-col` en mobile
   - Recibir `perPage` y `onPerPageChange` como props

2. **Pagination.tsx:**
   - Ocultar selector "Por página" en desktop también (ya está oculto en mobile)
   - O simplemente no pasarlo si viene desde PropertyFilters

3. **PropertyTable.tsx:**
   - Pasar `perPage` y `setPerPage` a PropertyFilters
   - Remover `onPerPageChange` de Pagination (o hacerlo opcional)

---

## 📊 **IMPACTO DE LOS CAMBIOS**

### **Archivos a Modificar:**

1. **`src/stores/usePropertyStore.ts`**
   - Modificar `loadProperties()` para forzar `per_page: 20` en mobile

2. **`src/components/properties/PropertyFilters.tsx`**
   - Agregar selector "Por página" (solo desktop)
   - Cambiar layout a `flex-row justify-between` en desktop
   - Agregar props: `perPage`, `onPerPageChange`

3. **`src/components/properties/PropertyTable.tsx`**
   - Pasar `perPage` y `setPerPage` a PropertyFilters

4. **`src/pages/PropertiesPage.tsx`**
   - Pasar `perPage` y `setPerPage` a PropertyFilters

5. **`src/components/ui/Pagination.tsx`**
   - Hacer que el selector "Por página" sea opcional o siempre oculto (ya que estará en PropertyFilters)

---

## ✅ **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Mobile - Forzar 20 propiedades**

1. Modificar `usePropertyStore.ts`:
   ```typescript
   const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
   const effectivePerPage = isMobile ? 20 : perPage;
   queryParams.per_page = params?.per_page ?? effectivePerPage;
   ```

2. Verificar que funciona correctamente:
   - Desktop: respeta el valor de `perPage` del store
   - Mobile: siempre usa 20, independientemente del store

### **FASE 2: Desktop - Reorganizar PropertyFilters**

1. **PropertyFilters.tsx:**
   - Agregar props: `perPage?: number`, `onPerPageChange?: (perPage: number) => void`
   - Agregar selector "Por página" (solo desktop, `hidden sm:flex`)
   - Cambiar layout:
     ```tsx
     {/* Desktop: Una fila con space-between */}
     <div className="hidden md:flex items-center justify-between gap-4">
       {/* Izquierda: Selector + Buscador */}
       <div className="flex items-center gap-3 flex-1">
         {/* Selector Por página */}
         {/* Buscador */}
       </div>
       {/* Derecha: Botones */}
       <div className="flex items-center gap-2">
         {/* Botones */}
       </div>
     </div>
     
     {/* Mobile: Layout vertical (actual) */}
     <div className="flex md:hidden flex-col gap-3">
       {/* Botones */}
       {/* Buscador */}
     </div>
     ```

2. **PropertiesPage.tsx:**
   - Pasar `perPage` y `setPerPage` a PropertyFilters

3. **Pagination.tsx:**
   - Ocultar selector "Por página" completamente (ya que estará en PropertyFilters)
   - O hacer que `showPerPageSelector` sea `false` por defecto cuando se usa desde PropertyTable

---

## 🎨 **VISUALIZACIÓN DEL LAYOUT**

### **Desktop (≥ 768px):**
```
┌─────────────────────────────────────────────────────────────┐
│ [Por página: 20 ▼] [🔍 Buscador...]    [Imp] [Exp] [Agregar] │
└─────────────────────────────────────────────────────────────┘
```

### **Mobile (< 768px):**
```
┌─────────────────────────────┐
│              [Exp] [Agregar] │
├─────────────────────────────┤
│ [🔍 Buscador...]            │
└─────────────────────────────┘
```

---

## ⚠️ **CONSIDERACIONES**

### **1. Selector "Por página" duplicado:**
- Actualmente está en Pagination (footer)
- Se moverá a PropertyFilters (header)
- Necesitamos asegurarnos de que no aparezca en ambos lugares

### **2. Responsive breakpoints:**
- Tailwind usa `sm: 640px`, `md: 768px`
- Para mobile forzamos 20: `< 640px` (sm)
- Para layout reorganizado: `≥ 768px` (md)

### **3. Estado del store:**
- El valor de `perPage` en el store puede ser diferente a lo que se usa en mobile
- Esto está bien, porque el usuario no puede cambiar el valor en mobile de todas formas

---

## 🧪 **CASOS DE PRUEBA**

### **Mobile (20 propiedades):**
1. ✅ Usuario en desktop cambia a 50 por página
2. ✅ Usuario abre en mobile → debe mostrar 20 por página
3. ✅ Usuario vuelve a desktop → debe mostrar 50 por página (valor guardado)

### **Desktop Layout:**
1. ✅ Selector "Por página" visible en PropertyFilters (header)
2. ✅ Selector "Por página" NO visible en Pagination (footer)
3. ✅ Buscador y selector en la misma fila (izquierda)
4. ✅ Botones en la misma fila (derecha)
5. ✅ Layout responsive: mobile mantiene layout vertical

---

## 📝 **DECISIONES PENDIENTES**

1. **¿El selector "Por página" debe estar siempre visible en desktop?**
   - ✅ Sí, en PropertyFilters (header)

2. **¿Debemos mantener el valor del store aunque en mobile se use 20?**
   - ✅ Sí, para que cuando vuelva a desktop mantenga su preferencia

3. **¿Qué breakpoint usar para el layout reorganizado?**
   - ✅ `md` (768px) - mismo que se usa para mostrar/ocultar botones

---

**Fecha de Análisis:** 13 de Noviembre, 2025  
**Estado:** ⏳ Listo para implementación

