# Plan de Funcionalidad: Exportación de Propiedades (CSV)

## 📋 Resumen Ejecutivo

Implementar una funcionalidad de exportación CSV que permita a los usuarios descargar datos de propiedades con tres opciones:
1. **Exportar TODAS las propiedades** (sin filtros)
2. **Exportar propiedades filtradas** (respetando filtros activos del AdvancedSearchBar)
3. **Exportar propiedades seleccionadas** (desde Bulk Actions)

---

## 🎯 Objetivos

1. **Exportar propiedades en formato CSV**
2. **Tres modos de exportación**:
   - Todas las propiedades (sin filtros)
   - Propiedades filtradas (respetando filtros activos)
   - Propiedades seleccionadas (desde Bulk Actions)
3. **Interfaz intuitiva** con modal de configuración
4. **Usar colores globales** (bg-primary, text-primary-text, etc.)
5. **Progreso visual** durante la exportación
6. **Manejo robusto de errores**

---

## 🔍 Análisis del Sistema Actual

### Sistema de Filtros Existente

El sistema cuenta con un **AdvancedSearchBar** que permite filtrar por:

| Campo | Tipo | Opciones |
|-------|------|----------|
| **Búsqueda General** | text | Busca en título, patente, municipio |
| **Título** | text | Búsqueda específica en título |
| **Descripción** | text | Búsqueda en descripción |
| **Patente** | text | Búsqueda por patente |
| **Estado Propiedad** | select | Disponible, Vendida, Alquilada, Reservada |
| **Estado República** | select | 32 estados de México |
| **Municipio** | text | Búsqueda por municipio |
| **Calle** | text | Búsqueda por calle |
| **Código Postal** | text | Búsqueda por CP |
| **Precio** | select | Rangos dinámicos de precio |

### Estado del Store

```typescript
filters: {
  searchField: string;      // Campo activo del AdvancedSearchBar
  searchValue: string;      // Valor del filtro activo
}
```

**Nota**: El sistema actualmente solo soporta **UN filtro activo a la vez** mediante `searchField` y `searchValue`.

---

## 🏗️ Arquitectura de la Solución

### Componentes Nuevos

```
src/components/properties/
└── ExportModal.tsx           # Modal de configuración de exportación

src/services/
└── exportService.ts          # Lógica de exportación y generación de CSV

src/utils/
└── csvFormatter.ts           # Formateador de datos para CSV
```

### Tipos Nuevos

```typescript
// src/types/export.ts
export interface ExportOptions {
  filters: {
    searchField: string;
    searchValue: string;
    sortBy: string;
    sortOrder: string;
  };
  columns: string[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  count: number;
  data: string; // CSV content
}
```

---

## 📐 Diseño de la Interfaz

### ExportModal Component

**Ubicación**: Se abre al hacer clic en el botón "Exportar"

**Características**:
- ✅ Muestra filtros activos en formato legible
- ✅ Indica cuántas propiedades se exportarán
- ✅ Checkbox para incluir/excluir columnas específicas
- ✅ Botones: "Cancelar" y "Exportar CSV"

**Mockup Visual**:

```
┌─────────────────────────────────────────────┐
│  📤 Exportar Propiedades                   │
│                                             │
│  Filtros activos:                          │
│  🔍 Estado Propiedad: Disponible           │
│                                             │
│  📊 Se exportarán: 45 propiedades          │
│                                             │
│  Columnas a incluir:                       │
│  ☑ ID             ☑ Título                │
│  ☑ Patente        ☑ Estado                │
│  ☑ Estado República ☑ Municipio           │
│  ☑ Colonia        ☑ Calle                 │
│  ☑ Código Postal  ☑ Precio                │
│  ☑ Descripción    ☑ URL Google Maps       │
│  ☑ Fecha Creación                         │
│                                             │
│  [ Cancelar ]      [ Exportar CSV ] 📥    │
└─────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Exportación

### Flujo Usuario

```
1. Usuario aplica filtro (ej: "Estado Propiedad: Disponible")
2. Usuario hace clic en botón "Exportar"
3. Se abre ExportModal
4. Modal muestra:
   - Filtros activos
   - Cantidad de propiedades a exportar
   - Selección de columnas
5. Usuario selecciona columnas a incluir
6. Usuario hace clic en "Exportar CSV"
7. Se muestra indicador de progreso
8. Se descarga el archivo CSV
9. Toast de éxito: "✓ 45 propiedades exportadas correctamente"
```

### Flujo Técnico

```typescript
// 1. Obtener estado actual
const filters = usePropertyStore(state => state.filters);
const sortBy = usePropertyStore(state => state.sortBy);
const sortOrder = usePropertyStore(state => state.sortOrder);
const properties = usePropertyStore(state => state.properties);
const total = usePropertyStore(state => state.total);

// 2. Construir opciones de exportación
const exportOptions: ExportOptions = {
  filters: {
    searchField: filters.searchField,
    searchValue: filters.searchValue,
    sortBy,
    sortOrder
  },
  columns: selectedColumns
};

// 3. Llamar al servicio de exportación
const result = await exportToCSV(exportOptions);

// 4. Descargar archivo
downloadCSV(result.data, result.filename);
```

---

## 🔧 Implementación Técnica

### 1. Backend API (WordPress PHP)

**Nuevo endpoint**: `POST /wp-json/property-manager/v1/properties/export`

**Request Body**:
```json
{
  "format": "csv",
  "filters": {
    "searchField": "status",
    "searchValue": "available",
    "sortBy": "price",
    "sortOrder": "desc"
  },
  "columns": [
    "id",
    "title",
    "patent",
    "status",
    "state",
    "municipality",
    "neighborhood",
    "street",
    "postal_code",
    "price",
    "description",
    "google_maps_url",
    "created_at"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "filename": "propiedades_disponibles_2025-01-12.csv",
  "count": 45,
  "data": "ID,Título,Patente,Estado..."
}
```

### 2. Frontend Service (exportService.ts)

```typescript
import type { Property } from '@/utils/permissions';
import { API_BASE_URL } from './api';

export interface ExportOptions {
  filters: {
    searchField: string;
    searchValue: string;
    sortBy: string;
    sortOrder: string;
  };
  columns: string[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  count: number;
  data: string;
}

export const exportToCSV = async (
  options: ExportOptions
): Promise<ExportResult> => {
  const response = await fetch(
    `${API_BASE_URL}/properties/export`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.wpApiSettings?.nonce || ''
      },
      body: JSON.stringify({
        format: 'csv',
        ...options
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al exportar propiedades');
  }

  return await response.json();
};

export const downloadCSV = (data: string, filename: string) => {
  // Crear blob con UTF-8 BOM para compatibilidad con Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + data], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
```

### 3. CSV Formatter Utility (csvFormatter.ts)

```typescript
import type { Property } from '@/utils/permissions';

export interface CSVColumn {
  key: keyof Property | 'created_at';
  label: string;
}

export const DEFAULT_COLUMNS: CSVColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Título' },
  { key: 'patent', label: 'Patente' },
  { key: 'status', label: 'Estado' },
  { key: 'state', label: 'Estado República' },
  { key: 'municipality', label: 'Municipio' },
  { key: 'neighborhood', label: 'Colonia' },
  { key: 'street', label: 'Calle' },
  { key: 'postal_code', label: 'Código Postal' },
  { key: 'price', label: 'Precio' },
  { key: 'description', label: 'Descripción' },
  { key: 'google_maps_url', label: 'URL Google Maps' },
  { key: 'created_at', label: 'Fecha Creación' }
];

export const escapeCSVValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Si contiene comas, comillas o saltos de línea, escapar
  if (stringValue.includes(',') || 
      stringValue.includes('"') || 
      stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

export const propertiesToCSV = (
  properties: Property[],
  columns: CSVColumn[]
): string => {
  // Header
  const headers = columns.map(col => escapeCSVValue(col.label));
  const csvRows = [headers.join(',')];
  
  // Data rows
  properties.forEach(property => {
    const row = columns.map(col => {
      const value = property[col.key as keyof Property];
      return escapeCSVValue(value);
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};
```

---

## 📊 Formato CSV

### Características

- ✅ **Ligero y rápido** de generar
- ✅ **Compatible** con Excel, Google Sheets, Numbers
- ✅ **Ideal para grandes volúmenes** de datos
- ✅ **Encoding UTF-8 con BOM** para acentos en Excel
- ✅ **Escape correcto** de comas y comillas

### Ejemplo de Salida

```csv
ID,Título,Patente,Estado,Estado República,Municipio,Precio
1,"Casa en Centro","ABC-123","Disponible","Jalisco","Guadalajara","2500000"
2,"Departamento Moderno","DEF-456","Vendida","Jalisco","Zapopan","1800000"
3,"Local Comercial, Zona Centro","GHI-789","Alquilada","Jalisco","Tlaquepaque","1200000"
```

---

## 🎨 Estados del UI

### Botón "Exportar"

```tsx
// Sin filtros activos (exporta todas las propiedades visibles)
<button className="border border-gray-300 text-gray-700">
  <Download size={16} />
  Exportar
</button>

// Con filtros activos
<button className="border-2 border-primary text-primary">
  <Download size={16} />
  Exportar (45)
</button>
```

### Indicador de Filtro Activo en Modal

```tsx
{filters.searchField && filters.searchField !== 'all' && filters.searchValue ? (
  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
    <p className="text-sm text-blue-800">
      <strong>🔍 Filtro activo:</strong>{' '}
      {getFilterLabel(filters.searchField)}:{' '}
      <span className="font-semibold">
        {getFilterValueLabel(filters.searchField, filters.searchValue)}
      </span>
    </p>
  </div>
) : (
  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4">
    <p className="text-sm text-gray-700">
      Se exportarán todas las propiedades visibles
    </p>
  </div>
)}
```

---

## 🛡️ Manejo de Errores

### Casos de Error

1. **Sin propiedades para exportar**
   ```tsx
   toast.error('No hay propiedades para exportar');
   ```

2. **Error de red**
   ```tsx
   toast.error('Error de conexión. Por favor, intenta nuevamente');
   ```

3. **Error del servidor**
   ```tsx
   toast.error('Error al generar archivo CSV');
   ```

4. **Error de permisos**
   ```tsx
   toast.error('No tienes permisos para exportar propiedades');
   ```

---

## 🔐 Seguridad y Permisos

### Validaciones Backend

```php
// Verificar permisos de usuario
if (!current_user_can('read_properties')) {
    return new WP_Error(
        'forbidden',
        'No tienes permisos para exportar propiedades',
        ['status' => 403]
    );
}

// Validar formato
if ($format !== 'csv') {
    return new WP_Error('invalid_format', 'Solo se soporta formato CSV');
}

// Validar columnas solicitadas
$allowed_columns = [
    'id', 'title', 'patent', 'status', 'state', 
    'municipality', 'neighborhood', 'street', 
    'postal_code', 'price', 'description', 
    'google_maps_url', 'created_at'
];

foreach ($requested_columns as $column) {
    if (!in_array($column, $allowed_columns)) {
        return new WP_Error('invalid_column', "Columna no válida: $column");
    }
}
```

---

## 🧪 Casos de Prueba

### Test 1: Exportación Sin Filtros
- [ ] Exportar todas las propiedades visibles en CSV
- [ ] Verificar que el conteo es correcto
- [ ] Verificar que todas las columnas están presentes

### Test 2: Exportación Con Filtro de Estado
- [ ] Aplicar filtro "Estado Propiedad: Disponible"
- [ ] Click en botón Exportar
- [ ] Verificar que modal muestra el filtro activo
- [ ] Exportar en CSV
- [ ] Verificar que solo incluye propiedades disponibles

### Test 3: Exportación Con Filtro de Precio
- [ ] Aplicar filtro de rango de precio
- [ ] Exportar en CSV
- [ ] Verificar que solo incluye propiedades en ese rango

### Test 4: Selección de Columnas
- [ ] Deseleccionar columna "Descripción"
- [ ] Exportar en CSV
- [ ] Verificar que la columna no está presente en el CSV

### Test 5: Caracteres Especiales
- [ ] Exportar propiedades con acentos, ñ y comas
- [ ] Verificar encoding correcto (UTF-8 con BOM)
- [ ] Abrir en Excel y verificar que muestra correctamente
- [ ] Verificar que comas en valores están escapadas

### Test 6: Sin Propiedades
- [ ] Aplicar un filtro que no devuelva resultados
- [ ] Intentar exportar
- [ ] Verificar mensaje de error apropiado

---

## 📦 Entregables

### Implementación Completa
1. ✅ ExportModal component
2. ✅ exportService.ts con soporte CSV
3. ✅ csvFormatter.ts con utilidades
4. ✅ Backend API endpoint
5. ✅ Integración con filtros existentes
6. ✅ Manejo de errores y feedback
7. ✅ Tipos TypeScript

---

## 💡 Consideraciones Técnicas

### Performance

- **Frontend**: Generación de CSV puede hacerse en frontend o backend
- **Backend**: Usar streaming para datasets grandes (opcional)
- **Memoria**: Para < 1000 registros, generación en frontend es viable

### Encoding

```typescript
// UTF-8 BOM para que Excel reconozca acentos
const BOM = '\uFEFF';
const blob = new Blob([BOM + csvContent], { 
  type: 'text/csv;charset=utf-8;' 
});
```

### Nombres de Archivo

```typescript
const generateFilename = (
  filters: { searchField: string; searchValue: string }
): string => {
  const date = new Date().toISOString().split('T')[0];
  const filterPart = filters.searchValue 
    ? `_${filters.searchField}_${filters.searchValue}` 
    : '';
  
  return `propiedades${filterPart}_${date}.csv`
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_');
};
```

---

## ✅ Checklist de Desarrollo

### Frontend
- [ ] Crear ExportModal component
- [ ] Crear exportService.ts
- [ ] Crear csvFormatter.ts
- [ ] Crear types/export.ts
- [ ] Integrar con PropertyFilters (mostrar count en botón)
- [ ] Agregar toast notifications
- [ ] Testing de UI

### Backend
- [ ] Crear endpoint de exportación
- [ ] Implementar generador CSV
- [ ] Validaciones y permisos
- [ ] Manejo de errores
- [ ] Testing de API

### Integración
- [ ] Pruebas end-to-end
- [ ] Verificar con datos reales
- [ ] Verificar encoding con acentos
- [ ] Optimización de performance
- [ ] Documentación

---

## 📖 Documentación Usuario

### Guía Rápida

**¿Cómo exportar propiedades?**

1. Aplica los filtros deseados usando el buscador (opcional)
2. Haz clic en el botón "Exportar"
3. Selecciona las columnas a incluir
4. Haz clic en "Exportar CSV"
5. El archivo se descargará automáticamente

**Formato CSV**:
- Compatible con Excel, Google Sheets y cualquier hoja de cálculo
- Los acentos y caracteres especiales se muestran correctamente
- Se puede abrir directamente en Excel haciendo doble clic

---

## 🎯 Métricas de Éxito

- ✅ Tiempo de exportación < 3 segundos para 100 propiedades
- ✅ Tasa de error < 1%
- ✅ Encoding correcto en el 100% de casos
- ✅ Uso de exportación > 20% de usuarios activos

---

**Versión**: 3.0 (Implementada - Solo CSV)  
**Fecha**: Enero 2025  
**Estado**: ✅ Implementación Completa

## 📝 Cambios Implementados (v3.0)

### ✅ UI Mejorada
- Usa correctamente los colores globales (`bg-primary`, `text-primary-text`, `border-primary`)
- Diseño más limpio y moderno
- Banners informativos con colores consistentes

### ✅ Tres Modos de Exportación
1. **Botón "Exportar" principal**: Exporta TODAS las propiedades o las filtradas
2. **Bulk Actions → "Exportar CSV"**: Exporta solo las propiedades seleccionadas
3. **Detección automática**: El modal detecta si hay filtros activos o propiedades seleccionadas

### ✅ Lógica Mejorada
- Exporta TODAS las propiedades de la lista (no solo la página actual)
- Si hay filtros, exporta todas las que coinciden con el filtro
- Si hay selección, exporta solo las seleccionadas
- Carga automática de todas las propiedades si es necesario

### ✅ Cambios en BulkActions
- Nueva opción "Exportar CSV" con icono `FileDown`
- "Descargar Fichas" sigue usando icono `Download`
- Mantiene consistencia visual con otros modales
