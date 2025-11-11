# 📋 PLAN COMPLETO: BULK ACTIONS PARA PROPERTY MANAGER

## 🎯 OBJETIVO
Permitir a los usuarios seleccionar múltiples propiedades y ejecutar acciones en lote para mejorar la eficiencia en la gestión.

---

## 1️⃣ ANÁLISIS DE LA UI ACTUAL

### **Estado Actual:**
- ✅ Tabla con 5 columnas (Propiedad, Ubicación, Estado, Precio, Acciones)
- ✅ Acciones individuales por fila (Ver, Editar, Eliminar, Descargar)
- ✅ Sistema de paginación (5-100 items/página)
- ✅ Ordenamiento por 5 columnas
- ✅ Filtros avanzados (búsqueda por campo)
- ❌ **NO hay selección múltiple**
- ❌ **NO hay barra de acciones masivas**

---

## 2️⃣ PROPUESTA DE UI/UX

### **A. Columna de Selección (Nueva)**
```
┌─────────────────────────────────────────────────────────────┐
│ [☑] | Propiedad | Ubicación | Estado | Precio | Acciones   │
├─────────────────────────────────────────────────────────────┤
│ [☑] | Casa en... | CDMX     | ●Disp  | $2.5M  | [👁][✏][🗑] │
│ [☐] | Terreno... | Jalisco  | ●Vend  | $1.2M  | [👁][✏][🗑] │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- **Checkbox en header** → Selecciona/deselecciona todos los items de la página actual
- **Checkbox por fila** → Selección individual
- **Persistencia de selección** → Las selecciones se mantienen al cambiar de página
- **Indicador visual** → Filas seleccionadas con fondo azul claro

### **B. Barra Flotante de Acciones (Sticky)**
Aparece solo cuando hay 1+ propiedades seleccionadas:

```
┌──────────────────────────────────────────────────────────────┐
│  ✓ 23 propiedades seleccionadas                              │
│                                                               │
│  [Cambiar estado ▼] [Modificar patente] [Exportar] [Eliminar]│
│                                                               │
│  [Deseleccionar todo] [Seleccionar todas (147)]              │
└──────────────────────────────────────────────────────────────┘
```

**Posición:**
- Fixed/sticky en la parte inferior de la pantalla
- Animación suave al aparecer/desaparecer
- z-index alto para estar siempre visible

---

## 3️⃣ ACCIONES POR LOTES APROBADAS

### **🔴 NIVEL 1: ACCIONES CRÍTICAS (REQUIEREN CONFIRMACIÓN ROBUSTA)**

#### **1. Eliminar en Lote**
- **¿Quién puede?** Solo usuarios con permiso `delete_properties` + validación individual
- **Confirmación:**
  ```
  ⚠️ ATENCIÓN: Vas a eliminar 23 propiedades

  Esta acción NO se puede deshacer.

  Propiedades afectadas:
  - Casa en Polanco (Patente: MX-12345)
  - Terreno en Guadalajara (Patente: MX-67890)
  ... (mostrar primeras 5, luego "+18 más")

  [ Cancelar ]  [ Sí, eliminar 23 propiedades ]
  ```
- **Validación backend:**
  - Verificar permisos para CADA propiedad individualmente
  - Si el usuario NO puede eliminar una, omitirla y notificar
  - Respuesta: `{ deleted: 20, failed: 3, errors: [...] }`
- **Progreso:** Barra de progreso con cancelación
- **Resultado:** Toast con resumen: "✓ 20 eliminadas, ✗ 3 fallaron"

#### **2. Cambiar Estado en Lote**
- **Estados:** Disponible, Vendida, Alquilada, Reservada
- **¿Quién puede?** Usuarios con `edit_properties` + validación individual
- **UI:**
  ```
  Cambiar estado de 15 propiedades a:
  ○ Disponible
  ● Vendida      ← seleccionado
  ○ Alquilada
  ○ Reservada

  [ Cancelar ]  [ Aplicar cambio ]
  ```
- **Backend:** Endpoint `POST /properties/bulk-update-status`
  ```json
  {
    "property_ids": [1, 2, 3, ...],
    "status": "sold"
  }
  ```

---

### **🟡 NIVEL 2: ACCIONES MODERADAS**

#### **3. Modificar Patente en Lote**
- **¿Quién puede?** Usuarios con `edit_properties` + validación individual
- **Casos de uso:**
  - Agregar prefijo/sufijo a patentes existentes (ej: agregar "2025-" a todas)
  - Reemplazar parte de la patente (ej: cambiar "MX-" por "MEX-")
  - Establecer un patrón secuencial (ej: PROP-001, PROP-002, etc.)
- **UI:**
  ```
  Modificar patente de 8 propiedades:

  ● Agregar prefijo
    Prefijo: [2025-_____]
    Ejemplo: MX-123 → 2025-MX-123

  ○ Agregar sufijo
    Sufijo: [_____-A]
    Ejemplo: MX-123 → MX-123-A

  ○ Reemplazar texto
    Buscar: [MX-_____]  Reemplazar: [MEX-_____]
    Ejemplo: MX-123 → MEX-123

  ○ Secuencial automático
    Patrón: [PROP-___] Inicio: [001]
    Ejemplo: PROP-001, PROP-002, PROP-003...

  ⚠️ Validación: Las patentes deben ser únicas

  [ Cancelar ]  [ Vista previa ]  [ Aplicar ]
  ```
- **Validación crítica:**
  - Verificar que ninguna patente nueva ya exista
  - Mostrar conflictos antes de aplicar
  - Si hay conflictos, no proceder

---

### **🟢 NIVEL 3: ACCIONES SEGURAS**

#### **4. Exportar Selección (CSV)**
- **¿Quién puede?** Usuarios con `export_properties` capability
- **Formato:** CSV con todos los campos
- **UI:**
  ```
  Exportar 47 propiedades seleccionadas

  Formato: CSV (archivo plano)

  Campos incluidos:
  ✓ Título, Patente, Estado
  ✓ Ubicación completa (Estado, Municipio, Colonia, C.P., Calle)
  ✓ Precio, Descripción
  ✓ Google Maps URL
  ✓ Autor, Fechas de creación/modificación

  [ Cancelar ]  [ Descargar CSV ]
  ```

#### **5. Descargar Fichas en Lote (ZIP)**
- **Requisito:** Propiedades con `attachment_url`
- **Resultado:** Archivo ZIP con todos los PDFs
- **UI:**
  ```
  Descargar fichas de 5 propiedades

  ⚠️ 2 propiedades no tienen ficha adjunta y serán omitidas.

  Fichas disponibles:
  ✓ Casa Polanco (ficha-polanco.pdf)
  ✓ Terreno GDL (ficha-gdl.pdf)
  ✓ Rancho Tequila (ficha-tequila.pdf)
  ✗ Depto Condesa (sin ficha)
  ✗ Local Roma (sin ficha)

  [ Cancelar ]  [ Descargar ZIP (3 fichas) ]
  ```

---

## 4️⃣ FASES DE IMPLEMENTACIÓN

### **FASE 1: FUNDAMENTOS Y ACCIONES CRÍTICAS** ⚡
**Objetivo:** Implementar la base de selección múltiple y las acciones más importantes

#### **Frontend:**
1. ✅ Crear hook `usePropertySelection` para gestionar selecciones
2. ✅ Agregar columna de checkboxes a `PropertyTable.tsx`
3. ✅ Implementar checkbox en header (seleccionar todos de página)
4. ✅ Crear componente `BulkActionsBar` (barra flotante)
5. ✅ Implementar modal `BulkDeleteModal` con confirmación
6. ✅ Implementar modal `BulkStatusModal` con radio buttons

#### **Backend:**
7. ✅ Crear endpoint `POST /properties/bulk-delete`
8. ✅ Crear endpoint `POST /properties/bulk-update-status`
9. ✅ Implementar validación de permisos individual por propiedad
10. ✅ Implementar respuesta estructurada con éxitos/fallos

#### **Store:**
11. ✅ Agregar acción `bulkDelete` a `usePropertyStore`
12. ✅ Agregar acción `bulkUpdateStatus` a `usePropertyStore`

**Entregables:**
- ✓ Usuarios pueden seleccionar múltiples propiedades
- ✓ Pueden eliminar en lote con confirmación
- ✓ Pueden cambiar estado en lote
- ✓ Ver progreso y resultados detallados

**Tiempo estimado:** 2-3 días

---

### **FASE 2: MODIFICACIÓN DE PATENTES** 🏷️
**Objetivo:** Implementar funcionalidad avanzada de modificación masiva de patentes

#### **Frontend:**
1. ✅ Crear componente `BulkPatentModal` con 4 modos:
   - Agregar prefijo
   - Agregar sufijo
   - Reemplazar texto
   - Secuencial automático
2. ✅ Implementar vista previa en tiempo real de cambios
3. ✅ Validar unicidad de patentes antes de enviar

#### **Backend:**
4. ✅ Crear endpoint `POST /properties/bulk-update-patent`
5. ✅ Implementar validación de unicidad de patentes
6. ✅ Implementar lógica para cada modo de modificación
7. ✅ Retornar conflictos si existen patentes duplicadas

#### **Store:**
8. ✅ Agregar acción `bulkUpdatePatent` a `usePropertyStore`

**Entregables:**
- ✓ Modal con 4 opciones de modificación
- ✓ Vista previa de cambios
- ✓ Validación de conflictos
- ✓ Aplicación masiva con feedback

**Tiempo estimado:** 2 días

---

### **FASE 3: EXPORTACIÓN Y DESCARGA** 📦
**Objetivo:** Permitir exportar datos y descargar fichas en lote

#### **Frontend:**
1. ✅ Implementar botón "Exportar" en `BulkActionsBar`
2. ✅ Crear modal de exportación con progreso
3. ✅ Implementar botón "Descargar fichas" en `BulkActionsBar`
4. ✅ Filtrar propiedades sin attachment automáticamente
5. ✅ Mostrar preview de qué se descargará

#### **Backend:**
6. ✅ Crear endpoint `GET /properties/bulk-export` (CSV)
7. ✅ Generar CSV en memoria con todos los campos
8. ✅ Crear endpoint `GET /properties/bulk-download-attachments` (ZIP)
9. ✅ Generar ZIP con archivos adjuntos
10. ✅ Implementar streaming para archivos grandes

#### **Store:**
11. ✅ Agregar acción `bulkExport` a `usePropertyStore`
12. ✅ Agregar acción `bulkDownloadAttachments` a `usePropertyStore`

**Entregables:**
- ✓ Exportar propiedades seleccionadas a CSV
- ✓ Descargar fichas en ZIP
- ✓ Manejo de errores y archivos faltantes

**Tiempo estimado:** 2 días

---

### **FASE 4: SELECCIÓN MULTI-PÁGINA (OPCIONAL)** 🔄
**Objetivo:** Permitir seleccionar todas las propiedades más allá de la página actual

#### **Frontend:**
1. ✅ Agregar banner: "20 seleccionadas en esta página. ¿Seleccionar las 147 totales?"
2. ✅ Implementar `selectAllPages()` que fetch todos los IDs
3. ✅ Mostrar contador correcto en barra flotante

#### **Backend:**
4. ✅ Crear endpoint `GET /properties/all-ids` (devuelve solo IDs)
5. ✅ Aplicar mismos filtros que búsqueda actual

**Entregables:**
- ✓ Seleccionar todas las propiedades con filtros aplicados
- ✓ Banner informativo
- ✓ Funcionamiento correcto de acciones con +100 items

**Tiempo estimado:** 1 día

---

## 5️⃣ ESTRUCTURA DE ARCHIVOS

### **Archivos Nuevos:**
```
src/
├── components/
│   └── properties/
│       ├── BulkActionsBar.tsx          ✨ NUEVO (Fase 1)
│       ├── BulkDeleteModal.tsx         ✨ NUEVO (Fase 1)
│       ├── BulkStatusModal.tsx         ✨ NUEVO (Fase 1)
│       ├── BulkPatentModal.tsx         ✨ NUEVO (Fase 2)
│       ├── BulkExportModal.tsx         ✨ NUEVO (Fase 3)
│       └── BulkDownloadModal.tsx       ✨ NUEVO (Fase 3)
│
├── hooks/
│   └── usePropertySelection.ts         ✨ NUEVO (Fase 1)
│
└── types/
    └── bulk.ts                         ✨ NUEVO (Fase 1)
```

### **Archivos Modificados:**
```
property-manager-plugin/
└── includes/
    └── class-property-rest-api.php     📝 MODIFICAR (Todas las fases)

src/
├── components/
│   └── properties/
│       └── PropertyTable.tsx           📝 MODIFICAR (Fase 1)
│
├── stores/
│   └── usePropertyStore.ts             📝 MODIFICAR (Todas las fases)
│
└── services/
    └── api.ts                          📝 MODIFICAR (Todas las fases)
```

---

## 6️⃣ ENDPOINTS DE API (RESUMEN)

### **Fase 1:**
- `POST /property-dashboard/v1/properties/bulk-delete`
- `POST /property-dashboard/v1/properties/bulk-update-status`

### **Fase 2:**
- `POST /property-dashboard/v1/properties/bulk-update-patent`
- `GET /property-dashboard/v1/properties/validate-patents` (validación previa)

### **Fase 3:**
- `GET /property-dashboard/v1/properties/bulk-export` (CSV)
- `POST /property-dashboard/v1/properties/bulk-download-attachments` (ZIP)

### **Fase 4:**
- `GET /property-dashboard/v1/properties/all-ids` (solo IDs con filtros)

---

## 7️⃣ TIPOS Y INTERFACES

```typescript
// types/bulk.ts

export interface BulkResult {
  success: number[];      // IDs exitosos
  failed: BulkError[];    // IDs fallidos con razón
  total: number;          // Total procesados
}

export interface BulkError {
  id: number;
  reason: string;
  property_title?: string;
}

export interface PatentModification {
  mode: 'prefix' | 'suffix' | 'replace' | 'sequential';
  prefix?: string;
  suffix?: string;
  search?: string;
  replace?: string;
  pattern?: string;
  start?: number;
}

export interface PatentValidation {
  valid: boolean;
  conflicts: Array<{
    property_id: number;
    old_patent: string;
    new_patent: string;
    conflict_with_id?: number;
  }>;
}
```

---

## 8️⃣ CONSIDERACIONES TÉCNICAS

### **Seguridad:**
- ✅ Validación de permisos individual por propiedad
- ✅ Rate limiting (máx. 3 operaciones bulk por minuto)
- ✅ Confirmación robusta para acciones destructivas
- ✅ Nonce verification en cada request

### **Rendimiento:**
- ✅ Límite de selección: Máximo 500 propiedades
- ✅ Procesamiento por chunks de 20-50 items
- ✅ Timeout handling (continuar en background si >30s)
- ✅ Cancelación a mitad de proceso

### **UX:**
- ✅ Feedback visual constante
- ✅ Barras de progreso
- ✅ Resumen detallado de éxitos/fallos
- ✅ Persistencia de selección (sessionStorage)

---

## 9️⃣ MOCKUP FINAL

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Property Dashboard                    [+ Nueva Propiedad] [Importar CSV]│
├─────────────────────────────────────────────────────────────────────────┤
│  Buscar: [Patente        ▼] [_____________________] [🔍 Buscar]          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ [☑] | Propiedad         | Ubicación      | Estado  | Precio       │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ [☑] | Casa Polanco      | CDMX, Polanco  | ●Vend   | $2,500,000   │ │
│  │ [☑] | Terreno GDL       | JAL, Centro    | ●Vend   | $1,200,000   │ │
│  │ [☐] | Depto Condesa     | CDMX, Condesa  | ●Disp   | $3,800,000   │ │
│  │ [☑] | Rancho Tequila    | JAL, Tequila   | ●Vend   | $5,000,000   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Mostrando 1-20 de 147 propiedades                    [< 1 2 3 ... 8 >] │
└─────────────────────────────────────────────────────────────────────────┘

                ┌──────────────────────────────────────────────┐
                │  ✓ 3 propiedades seleccionadas               │
                │                                              │
                │  [Cambiar estado ▼] [Patente] [📥] [🗑]     │
                │                                              │
                │  [Deseleccionar] [Seleccionar 147]           │
                └──────────────────────────────────────────────┘
```

---

## 🎯 RESUMEN EJECUTIVO

### **Acciones por Lotes Implementadas:**
1. ✅ **Eliminar en lote** (con confirmación robusta)
2. ✅ **Cambiar estado en lote** (Disponible/Vendida/Alquilada/Reservada)
3. ✅ **Modificar patente en lote** (4 modos: prefijo, sufijo, reemplazar, secuencial)
4. ✅ **Exportar a CSV** (selección personalizada)
5. ✅ **Descargar fichas en ZIP** (solo con attachments)

### **Timeline Total:**
- **Fase 1:** 2-3 días (Fundamentos + Eliminar + Estado)
- **Fase 2:** 2 días (Modificar patentes)
- **Fase 3:** 2 días (Exportar + Descargar)
- **Fase 4:** 1 día (Multi-página - OPCIONAL)
- **Total:** 7-8 días (6-7 días sin Fase 4)

### **Archivos afectados:**
- **6 archivos nuevos**
- **4 archivos modificados**
- **6 nuevos endpoints de API**

---

## ✅ APROBACIÓN

Este plan ha sido revisado y aprobado con los siguientes ajustes:
- ❌ Removido: Cambiar precio en lote
- ❌ Removido: Reasignación de autor
- ❌ Removido: Modificar ubicación/municipio en lote
- ✅ Agregado: Modificar patente en lote (4 modos)
- ✅ Mantenido: Eliminar, Cambiar estado, Exportar, Descargar fichas

**Fecha de aprobación:** 2025-11-10
**Comienza implementación:** FASE 1
