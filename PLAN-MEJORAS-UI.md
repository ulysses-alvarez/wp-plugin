# 🎯 Plan de Mejoras UI - Ordenamiento y Búsqueda Avanzada

**Fecha:** 7 de Noviembre, 2025
**Prioridad:** INMEDIATA
**Estado:** En Planificación

---

## 📋 Resumen de Requisitos

### 1. Ordenamiento por Columna
Reemplazar el selector dropdown actual por ordenamiento clickeable en headers de tabla.

### 2. Buscador-Select Combinado
Crear un campo de búsqueda avanzada con contexto seleccionable.

---

## 🔍 Análisis Detallado

### 1. ORDENAMIENTO POR COLUMNA

#### Situación Actual
- ✅ Existe `PropertyTable.tsx` con tabla HTML verdadera
- ✅ Tiene columnas: Propiedad, Ubicación, Estado, Precio, Acciones
- ✅ El store ya soporta `sortBy` y `sortOrder`
- ❌ No tiene interacción de ordenamiento en headers

#### Propuesta de Implementación

**Columnas Ordenables:**
1. **Propiedad** → Ordena por `title` (alfabético)
2. **Ubicación** → Ordena por `state` o `municipality` (alfabético)
3. **Estado** → Ordena por `status` (alfabético)
4. **Precio** → Ordena por `price` (numérico)
5. **Acciones** → No ordenable

**Componente: SortableTableHeader**

```typescript
interface SortableTableHeaderProps {
  label: string;
  sortKey: 'title' | 'state' | 'municipality' | 'status' | 'price' | 'date';
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (sortKey: string) => void;
}
```

**Comportamiento:**
1. Click en header → Ordena por esa columna en dirección ASC
2. Click nuevamente → Cambia a DESC
3. Click nuevamente → Cambia a ASC (ciclo continuo)
4. Indicadores visuales:
   - **Sin orden**: Flecha doble gris (↕)
   - **ASC activo**: Flecha arriba verde (↑)
   - **DESC activo**: Flecha abajo verde (↓)

**Estados Visuales:**
```
[ Propiedad ↕ ]  → No ordenado (gris)
[ Propiedad ↑ ]  → Ordenado ASC (verde)
[ Propiedad ↓ ]  → Ordenado DESC (verde)
```

#### Ventajas de este Enfoque
✅ **UX estándar**: Los usuarios están familiarizados con este patrón
✅ **Intuitivo**: No requiere explicación, el icono indica el estado
✅ **Eficiente**: 1 click para ordenar, sin abrir dropdowns
✅ **Visual**: Se ve qué columna está ordenando actualmente
✅ **Responsive**: Funciona en móvil y desktop

#### Desventajas
❌ **Requiere tabla**: No funciona bien con vista de cards (Grid)
❌ **Espacio limitado**: Headers pueden verse saturados en móvil

#### Solución Híbrida Propuesta
1. **Desktop (> 1024px)**: Usar `PropertyTable` con ordenamiento por columna
2. **Mobile (< 1024px)**: Usar `PropertyGrid` con selector dropdown
3. **Toggle de vista**: Botón para cambiar entre Grid y Table en desktop

---

### 2. BUSCADOR-SELECT COMBINADO

#### Situación Actual
- ✅ Existe `SearchBar` con debounce
- ✅ Búsqueda general funciona (título, patente, municipio)
- ❌ No permite búsqueda específica por campo

#### Propuesta de Implementación

**Componente: AdvancedSearchBar**

```typescript
interface SearchContext {
  value: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number';
}

const SEARCH_CONTEXTS: SearchContext[] = [
  { value: 'general', label: 'General', placeholder: 'Buscar en todo...', type: 'text' },
  { value: 'title', label: 'Título', placeholder: 'Buscar por título...', type: 'text' },
  { value: 'patent', label: 'Patente', placeholder: 'Buscar por patente...', type: 'text' },
  { value: 'state', label: 'Estado', placeholder: 'Buscar por estado...', type: 'text' },
  { value: 'municipality', label: 'Municipio', placeholder: 'Buscar por municipio...', type: 'text' },
  { value: 'neighborhood', label: 'Colonia', placeholder: 'Buscar por colonia...', type: 'text' },
  { value: 'postal_code', label: 'Código Postal', placeholder: 'Ej: 12345', type: 'number' },
  { value: 'street', label: 'Dirección', placeholder: 'Buscar por dirección...', type: 'text' },
  { value: 'price', label: 'Precio', placeholder: 'Ej: 5000000', type: 'number' }
];
```

**Diseño UI:**

```
┌───────────────────────────────────────────────────────┐
│ [General ▼] │ 🔍 Buscar...                          [X]│
└───────────────────────────────────────────────────────┘
```

**Características:**
1. **Select integrado** (izquierda):
   - Ancho fijo: 140px
   - Borde derecho que conecta con input
   - Iconos para cada tipo de búsqueda

2. **Input de búsqueda** (derecha):
   - Flex-grow para ocupar espacio restante
   - Placeholder dinámico según contexto
   - Debounce de 500ms
   - Botón X para limpiar (solo visible con texto)

3. **Validación**:
   - Código Postal: solo 5 dígitos
   - Precio: solo números positivos
   - Texto: sin validación especial

#### Backend - Actualización API

**Nuevos parámetros REST API:**
```php
// Parámetros actuales
'search'       // Búsqueda general (título, patente, municipio)
'status'       // Filtro por status
'state'        // Filtro por estado

// Nuevos parámetros
'search_field' // Campo específico: title, patent, municipality, etc.
'search_value' // Valor a buscar
```

**Lógica Backend:**
```php
if (!empty($search_field) && !empty($search_value)) {
    // Búsqueda específica por campo
    switch ($search_field) {
        case 'title':
            $args['s'] = $search_value;
            break;
        case 'patent':
        case 'municipality':
        case 'neighborhood':
        case 'postal_code':
        case 'street':
        case 'price':
            $args['meta_query'][] = [
                'key'     => "_property_{$search_field}",
                'value'   => $search_value,
                'compare' => 'LIKE'
            ];
            break;
    }
} elseif (!empty($search)) {
    // Búsqueda general (comportamiento actual)
    $args['s'] = $search;
}
```

#### Ventajas de este Enfoque
✅ **Búsqueda precisa**: Los usuarios pueden buscar exactamente lo que necesitan
✅ **Intuitivo**: Similar a búsquedas avanzadas de Gmail, GitHub, etc.
✅ **Flexible**: Mantiene búsqueda general y agrega contextos específicos
✅ **Eficiente**: Reduce resultados irrelevantes
✅ **Extensible**: Fácil agregar más campos en el futuro

#### Desventajas
❌ **Complejidad**: Más parámetros para manejar
❌ **UX**: Usuarios novatos pueden no descubrir la funcionalidad
❌ **Backend**: Requiere modificar la API

#### Solución a Desventajas
1. **Tooltip de ayuda**: Explicar cómo usar el contexto de búsqueda
2. **Estados recientes**: Guardar últimos 3 contextos usados
3. **Retrocompatibilidad**: Mantener búsqueda general por defecto

---

## 🔄 Manejo de Campos SELECT en Buscador Avanzado

### Problema Identificado

Algunos campos de búsqueda tienen valores predefinidos (enumerados), como:
- **Estado de Propiedad**: Disponible, Vendida, Alquilada, Reservada
- **Estado de la República**: Los 32 estados de México

Para estos campos, un **input de texto libre no tiene sentido**. La solución óptima es mostrar un **select con las opciones válidas**.

---

### Solución Propuesta: Tipado Dinámico

**Definir el tipo de cada campo de búsqueda:**

```typescript
interface SearchOption {
  value: string;
  label: string;
}

interface SearchContext {
  value: string;           // ID del campo (ej: 'status', 'state')
  label: string;           // Label visible (ej: 'Estado Propiedad')
  type: 'text' | 'number' | 'select';  // Tipo de input
  placeholder?: string;    // Para text/number
  options?: SearchOption[]; // Para select
}

const SEARCH_CONTEXTS: SearchContext[] = [
  {
    value: 'general',
    label: 'General',
    type: 'text',
    placeholder: 'Buscar en todo...'
  },
  {
    value: 'title',
    label: 'Título',
    type: 'text',
    placeholder: 'Buscar por título...'
  },
  {
    value: 'patent',
    label: 'Patente',
    type: 'text',
    placeholder: 'Buscar por patente...'
  },
  {
    value: 'status',
    label: 'Estado Propiedad',
    type: 'select',
    options: PROPERTY_STATUS_OPTIONS  // Importado de constants.ts
  },
  {
    value: 'state',
    label: 'Estado República',
    type: 'select',
    options: MEXICAN_STATES  // Importado de constants.ts
  },
  {
    value: 'municipality',
    label: 'Municipio',
    type: 'text',
    placeholder: 'Buscar por municipio...'
  },
  {
    value: 'neighborhood',
    label: 'Colonia',
    type: 'text',
    placeholder: 'Buscar por colonia...'
  },
  {
    value: 'postal_code',
    label: 'Código Postal',
    type: 'number',
    placeholder: 'Ej: 12345'
  },
  {
    value: 'street',
    label: 'Dirección',
    type: 'text',
    placeholder: 'Buscar por dirección...'
  },
  {
    value: 'price',
    label: 'Precio',
    type: 'number',
    placeholder: 'Ej: 5000000'
  }
];
```

---

### Renderizado Condicional en AdvancedSearchBar

**Lógica del componente:**

```tsx
const AdvancedSearchBar = () => {
  const [searchContext, setSearchContext] = useState('general');
  const [searchValue, setSearchValue] = useState('');

  const currentContext = SEARCH_CONTEXTS.find(ctx => ctx.value === searchContext);

  return (
    <div className="flex gap-0 border border-gray-300 rounded-lg overflow-hidden">
      {/* Context Selector */}
      <select
        value={searchContext}
        onChange={(e) => {
          setSearchContext(e.target.value);
          setSearchValue(''); // Reset value on context change
        }}
        className="w-[180px] px-3 py-2 border-r border-gray-300 bg-gray-50"
      >
        {SEARCH_CONTEXTS.map(ctx => (
          <option key={ctx.value} value={ctx.value}>
            {ctx.label}
          </option>
        ))}
      </select>

      {/* Dynamic Input Area */}
      <div className="flex-1 flex items-center px-3">
        {currentContext?.type === 'select' ? (
          // Render SELECT for enum fields
          <select
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-transparent focus:outline-none"
          >
            <option value="">Todos</option>
            {currentContext.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : currentContext?.type === 'number' ? (
          // Render NUMBER input
          <input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={currentContext.placeholder}
            className="w-full bg-transparent focus:outline-none"
          />
        ) : (
          // Render TEXT input (default)
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={currentContext?.placeholder || 'Buscar...'}
            className="w-full bg-transparent focus:outline-none"
          />
        )}

        {/* Clear Button */}
        {searchValue && (
          <button onClick={() => setSearchValue('')}>✕</button>
        )}
      </div>
    </div>
  );
};
```

---

### Ventajas de esta Solución

✅ **Tipo de dato correcto**: SELECT para enums, input para texto libre
✅ **Validación implícita**: Solo valores válidos para enums
✅ **UX consistente**: Usa componentes nativos conocidos
✅ **Extensible**: Fácil agregar nuevos tipos (date, range, etc.)
✅ **Mantenible**: Toda la configuración en un solo lugar
✅ **Reutilizable**: PROPERTY_STATUS_OPTIONS ya existe en constants.ts

---

### Estados Visuales Ejemplos

**1. Búsqueda General (default):**
```
┌──────────────────────────────────────────────┐
│ [General ▼] │ 🔍 Buscar en todo...       [X]│
└──────────────────────────────────────────────┘
```

**2. Búsqueda por Título (text):**
```
┌──────────────────────────────────────────────┐
│ [Título ▼] │ 🔍 Buscar por título...    [X]│
└──────────────────────────────────────────────┘
```

**3. Búsqueda por Estado Propiedad (select):**
```
┌──────────────────────────────────────────────────┐
│ [Estado Propiedad ▼] │ [Disponible ▼]        [X]│
└──────────────────────────────────────────────────┘
```
Opciones del segundo select: Todos, Disponible, Vendida, Alquilada, Reservada

**4. Búsqueda por Estado República (select):**
```
┌──────────────────────────────────────────────────┐
│ [Estado República ▼] │ [Jalisco ▼]           [X]│
└──────────────────────────────────────────────────┘
```
Opciones del segundo select: Todos, + 32 estados de México

**5. Búsqueda por Precio (number):**
```
┌──────────────────────────────────────────────┐
│ [Precio ▼] │ 🔢 Ej: 5000000             [X]│
└──────────────────────────────────────────────┘
```

---

### Integración con Backend

**API recibe:**
```json
{
  "search_field": "status",
  "search_value": "available"
}
```

**Backend procesa:**
```php
if (!empty($search_field) && !empty($search_value)) {
    switch ($search_field) {
        case 'title':
            $args['s'] = $search_value;
            break;

        case 'status':
        case 'state':
            // Para enums, búsqueda exacta
            $args['meta_query'][] = [
                'key'     => "_property_{$search_field}",
                'value'   => $search_value,
                'compare' => '='  // Exacta, no LIKE
            ];
            break;

        case 'municipality':
        case 'neighborhood':
        case 'street':
            // Para texto libre, búsqueda LIKE
            $args['meta_query'][] = [
                'key'     => "_property_{$search_field}",
                'value'   => $search_value,
                'compare' => 'LIKE'
            ];
            break;

        case 'price':
        case 'postal_code':
            // Para números, búsqueda exacta o rango
            $args['meta_query'][] = [
                'key'     => "_property_{$search_field}",
                'value'   => $search_value,
                'compare' => '=',
                'type'    => 'NUMERIC'
            ];
            break;
    }
}
```

---

### Mejoras Futuras (Post-MVP)

**Rangos de búsqueda:**
```
┌──────────────────────────────────────────────────────┐
│ [Precio ▼] │ Min: 1000000 │ Max: 5000000       [X]│
└──────────────────────────────────────────────────────┘
```

**Fecha de creación:**
```
┌──────────────────────────────────────────────────────┐
│ [Fecha ▼] │ 📅 Desde: 01/01/2025 │ Hasta: ...   [X]│
└──────────────────────────────────────────────────────┘
```

**Búsqueda con operadores:**
```
┌──────────────────────────────────────────────────────┐
│ [Precio ▼] │ [Mayor que ▼] │ 5000000           [X]│
└──────────────────────────────────────────────────────┘
```
Operadores: Igual a, Mayor que, Menor que, Entre

---

## 🎨 Diseño Visual

### PropertyTable con Ordenamiento

```
┌──────────────────────────────────────────────────────────┐
│ Propiedades                           [+ Nueva Propiedad]│
│ 45 propiedades encontradas                               │
├──────────────────────────────────────────────────────────┤
│ Propiedad ↑ │ Ubicación ↕ │ Estado ↕ │ Precio ↕ │ Acc.  │
├─────────────┼─────────────┼──────────┼──────────┼───────┤
│ Casa A      │ CDMX        │ Vendida  │ $500,000 │ ⋮     │
│ Casa B      │ Jalisco     │ Disponib │ $750,000 │ ⋮     │
│ Casa C      │ Monterrey   │ Reservad │ $300,000 │ ⋮     │
└──────────────────────────────────────────────────────────┘
```

### AdvancedSearchBar

```
┌─────────────────────────────────────────────────────────┐
│ Filtros de Búsqueda                                     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐     │
│ │ [General ▼] │ 🔍 Buscar en todo...           [X]│     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Estado de la Propiedad: [Todos ▼]                       │
│ Estado de la República: [Todos ▼]                       │
│                                                         │
│ 📊 Filtros activos: Búsqueda                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación por Fases

### FASE 1: Ordenamiento por Columna (Prioridad: ALTA)
**Tiempo estimado:** 2-3 horas

**Tareas:**
1. ✅ Crear componente `SortableTableHeader`
   - Props: label, sortKey, currentSort, onSort
   - Lógica de toggle ASC/DESC
   - Iconos de estado (↕ ↑ ↓)

2. ✅ Integrar en `PropertyTable.tsx`
   - Reemplazar `<th>` estáticos por `<SortableTableHeader>`
   - Conectar con `setSortBy` y `setSortOrder` del store
   - Agregar columnas ordenables

3. ✅ Actualizar `PropertyGrid.tsx`
   - Mantener selector dropdown para mobile
   - Agregar toggle de vista (Grid/Table) para desktop

4. ✅ Actualizar backend (opcional)
   - Ya soporta ordenamiento por todos los campos necesarios
   - Agregar ordenamiento por `municipality` si se requiere

**Testing:**
- Click en headers cambia ordenamiento
- Indicadores visuales correctos
- Funciona con filtros activos
- Responsive en todos los tamaños

---

### FASE 2: Buscador-Select Combinado (Prioridad: ALTA)
**Tiempo estimado:** 3-4 horas

**Tareas:**
1. ✅ Crear componente `AdvancedSearchBar`
   - Select de contextos
   - Input con debounce
   - Placeholder dinámico
   - Botón limpiar

2. ✅ Actualizar `usePropertyStore`
   - Agregar `searchField` al estado
   - Agregar `setSearchField` action
   - Modificar `loadProperties` para enviar contexto

3. ✅ Actualizar Backend REST API
   - Agregar parámetro `search_field`
   - Lógica de búsqueda específica por campo
   - Meta queries para campos custom

4. ✅ Integrar en `PropertyFilters.tsx`
   - Reemplazar `SearchBar` por `AdvancedSearchBar`
   - Mantener filtros de Estado y Status
   - Actualizar indicador de "Filtros activos"

**Testing:**
- Búsqueda general funciona
- Búsqueda por campo específico funciona
- Validación de campos numéricos
- Debounce correcto
- Integración con otros filtros

---

## 📊 Comparación: Antes vs Después

### Antes (Actual)
```
Filtros y Ordenamiento
├─ Búsqueda: [🔍 Buscar...]
├─ Estado: [Dropdown]
├─ Ubicación: [Dropdown]
└─ Ordenar por: [Fecha ▼] [↑↓]
```

### Después (Propuesta)
```
Filtros de Búsqueda
├─ Búsqueda Avanzada: [[General ▼] │ 🔍 Buscar...]
├─ Estado: [Dropdown]
└─ Ubicación: [Dropdown]

Tabla con Ordenamiento
├─ Headers clickeables
└─ Indicadores visuales de orden
```

---

## 🎯 Criterios de Éxito

### Funcionales
- ✅ Ordenamiento por columna funciona en todos los campos
- ✅ Búsqueda específica por campo retorna resultados correctos
- ✅ Búsqueda general mantiene comportamiento actual
- ✅ Integración con paginación funciona correctamente
- ✅ Filtros se mantienen al cambiar ordenamiento

### UX
- ✅ Indicadores visuales claros de estado de ordenamiento
- ✅ Placeholder dinámico según contexto de búsqueda
- ✅ Respuesta inmediata (< 500ms) al ordenar
- ✅ Debounce en búsqueda evita requests excesivos

### Performance
- ✅ Bundle size incrementa menos de 5KB
- ✅ Renderizado de tabla < 100ms con 100 items
- ✅ Búsqueda backend < 300ms

### Accesibilidad
- ✅ Teclas de navegación funcionan en select
- ✅ Screen readers anuncian estado de ordenamiento
- ✅ Contraste de colores cumple WCAG 2.1 AA
- ✅ Foco visible en todos los elementos interactivos

---

## 🚀 Próximos Pasos

1. **Revisar y aprobar** este plan
2. **Implementar Fase 1**: Ordenamiento por columna (2-3 horas)
3. **Testing Fase 1**: Verificar funcionalidad (30 min)
4. **Implementar Fase 2**: Buscador avanzado (3-4 horas)
5. **Testing Fase 2**: Verificar integración completa (30 min)
6. **Compilar y desplegar**: Build de producción (10 min)
7. **Documentar**: Actualizar ESTADO-ACTUAL.md

**Tiempo total estimado:** 6-8 horas de desarrollo

---

## 📝 Notas Técnicas

### Manejo de Estado
- El store de Zustand ya maneja `sortBy` y `sortOrder`
- Agregar `searchField` al estado global
- Mantener retrocompatibilidad con búsqueda actual

### Componentes a Crear
1. `SortableTableHeader.tsx` - Header de tabla con ordenamiento
2. `AdvancedSearchBar.tsx` - Buscador con contexto

### Componentes a Modificar
1. `PropertyTable.tsx` - Integrar headers ordenables
2. `PropertyGrid.tsx` - Agregar toggle de vista (opcional)
3. `PropertyFilters.tsx` - Integrar buscador avanzado
4. `usePropertyStore.ts` - Agregar searchField
5. `class-property-rest-api.php` - Soportar búsqueda por campo

### Backend Changes
- Agregar parámetro `search_field` al endpoint
- Implementar lógica de búsqueda específica
- Mantener búsqueda general como fallback

---

## 💡 Mejoras Futuras (Post-MVP)

### Ordenamiento
- Ordenamiento múltiple (Ctrl+Click)
- Guardar preferencia de ordenamiento
- Ordenamiento personalizado (drag & drop)

### Búsqueda
- Búsqueda con operadores (>, <, =, !=)
- Rangos de precio (desde-hasta)
- Búsqueda con autocompletado
- Historial de búsquedas
- Búsquedas guardadas (favoritas)
- Búsqueda por fecha de creación/modificación

### UX
- Atajos de teclado (Ctrl+F para búsqueda)
- Modo de búsqueda avanzada (más filtros)
- Export de resultados filtrados
- Compartir link con filtros aplicados

---

**Estado del Plan:** ✅ Listo para aprobación e implementación
**Aprobado por:** [Pendiente]
**Fecha de inicio:** [Pendiente]
