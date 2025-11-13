# 🔍 Análisis: ¿Es sobre-ingeniería el hook de media query?

## 📊 **INVESTIGACIÓN**

### **Resultados de la investigación:**

✅ **Los hooks de media query SON una práctica recomendada:**
- No se considera sobre-ingeniería
- Es una solución estándar en React
- Mejora la mantenibilidad y escalabilidad
- Se usa en bibliotecas populares (Material-UI, usehooks-ts)

### **Pero... ¿es necesario para este caso específico?**

---

## 🎯 **ANÁLISIS DEL CASO ESPECÍFICO**

### **Requisito:**
Forzar 20 propiedades por página en mobile, independientemente de la configuración.

### **Preguntas clave:**

1. **¿Necesitamos que se actualice dinámicamente?**
   - ❓ ¿El usuario va a cambiar el tamaño de ventana mientras navega?
   - ❓ ¿Es común redimensionar de desktop a mobile en la misma sesión?
   - **Respuesta:** Probablemente NO. En mobile, el usuario está en mobile. En desktop, está en desktop.

2. **¿Se usará en múltiples lugares?**
   - ❓ ¿Necesitamos detectar mobile en otros componentes?
   - **Respuesta:** Posiblemente SÍ en el futuro (layout responsive, etc.)

3. **¿Es una funcionalidad crítica?**
   - ❓ ¿Qué pasa si no se actualiza inmediatamente?
   - **Respuesta:** No es crítico. El usuario puede recargar la página.

---

## 💡 **OPCIONES COMPARADAS**

### **Opción 1: Hook de Media Query (Completa)**

```typescript
// hooks/useMediaQuery.ts (30+ líneas)
// hooks/useIsMobile.ts (5 líneas)
// Uso en componente

const isMobile = useIsMobile();
const effectivePerPage = isMobile ? 20 : perPage;
```

**Pros:**
- ✅ Se actualiza automáticamente
- ✅ Reutilizable
- ✅ Mejores prácticas
- ✅ SSR-safe

**Contras:**
- ⚠️ Más código (2 archivos nuevos)
- ⚠️ Complejidad adicional
- ⚠️ Posible sobre-ingeniería si solo se usa una vez

**Costo:** ~40 líneas de código + mantenimiento

---

### **Opción 2: Detección simple en el store (Simple)**

```typescript
// En usePropertyStore.ts - loadProperties()
const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
const effectivePerPage = isMobile ? 20 : perPage;
queryParams.per_page = params?.per_page ?? effectivePerPage;
```

**Pros:**
- ✅ Muy simple (2 líneas)
- ✅ Centralizado en el store
- ✅ No requiere hooks adicionales
- ✅ Funciona para el 99% de los casos

**Contras:**
- ⚠️ No se actualiza si cambia el tamaño de ventana
- ⚠️ No es "perfecto" técnicamente

**Costo:** 2 líneas de código

---

### **Opción 3: Detección simple en el componente (Intermedia)**

```typescript
// En PropertyTable.tsx
useEffect(() => {
  const isMobile = window.innerWidth < 640;
  const effectivePerPage = isMobile ? 20 : perPage;
  loadProperties({ per_page: effectivePerPage });
}, [perPage, ...]);
```

**Pros:**
- ✅ Simple
- ✅ Se recalcula cuando cambia perPage

**Contras:**
- ⚠️ No se actualiza si cambia el tamaño de ventana
- ⚠️ Lógica en el componente (menos centralizada)

**Costo:** ~5 líneas de código

---

## 🎯 **RECOMENDACIÓN FINAL**

### **Para este caso específico: Opción 2 (Simple) ⭐**

**Razones:**

1. **No necesitamos reactividad:**
   - El usuario no va a cambiar el tamaño de ventana mientras navega
   - Si cambia de desktop a mobile, puede recargar la página
   - La funcionalidad funciona correctamente sin actualización dinámica

2. **Simplicidad > Complejidad:**
   - 2 líneas vs 40+ líneas
   - Menos código = menos bugs
   - Más fácil de mantener

3. **YAGNI (You Aren't Gonna Need It):**
   - No necesitamos la funcionalidad "perfecta" ahora
   - Si en el futuro necesitamos reactividad, podemos agregar el hook

4. **El store es el lugar correcto:**
   - La lógica de paginación ya está ahí
   - Centralizado y fácil de encontrar

### **Cuándo SÍ usar el hook:**

- ✅ Si necesitamos detectar mobile en múltiples componentes
- ✅ Si necesitamos que se actualice dinámicamente (ej: layout que cambia en tiempo real)
- ✅ Si es parte de una funcionalidad más compleja de responsive design

---

## 📝 **IMPLEMENTACIÓN RECOMENDADA (Simple)**

```typescript
// src/stores/usePropertyStore.ts
loadProperties: async (params?: PropertyQueryParams) => {
  set({ loading: true, error: null });

  try {
    const { filters, currentPage, perPage, sortBy, sortOrder } = get();

    // Forzar 20 en mobile (simple y efectivo)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const effectivePerPage = isMobile ? 20 : perPage;

    const queryParams: PropertyQueryParams = {
      page: params?.page ?? currentPage,
      per_page: params?.per_page ?? effectivePerPage, // ← Usar effectivePerPage
      orderby: params?.orderby ?? sortBy,
      order: params?.order ?? sortOrder
    };
    // ... resto del código
  }
}
```

**Ventajas de esta solución:**
- ✅ Simple (2 líneas)
- ✅ Funciona correctamente
- ✅ Centralizado
- ✅ Fácil de entender
- ✅ No es sobre-ingeniería

**Desventajas:**
- ⚠️ No se actualiza si cambia el tamaño de ventana (pero no es necesario)

---

## 🎓 **CONCLUSIÓN**

### **¿Es sobre-ingeniería el hook de media query?**

**Respuesta:** Depende del contexto:

- **Para este caso específico:** SÍ, es sobre-ingeniería
  - No necesitamos reactividad
  - Solo se usa en un lugar
  - La solución simple funciona perfectamente

- **En general:** NO, es una buena práctica
  - Si necesitáramos detectar mobile en múltiples lugares
  - Si necesitáramos reactividad
  - Si fuera parte de un sistema de responsive design más complejo

### **Recomendación:**

**Usar la solución simple (Opción 2)** por ahora. Si en el futuro necesitamos:
- Detectar mobile en otros componentes
- Reactividad dinámica
- Un sistema de responsive más complejo

**Entonces sí crear el hook de media query.**

---

## 📚 **REFERENCIAS**

- Los hooks de media query son una práctica recomendada (confirmado por búsqueda)
- Pero no siempre son necesarios para casos simples
- Principio YAGNI: No agregar complejidad hasta que sea necesaria
- KISS: Keep It Simple, Stupid

---

**Fecha de Análisis:** 13 de Noviembre, 2025  
**Recomendación:** ✅ Usar solución simple (Opción 2)

