# Pending Tasks

**Last updated:** 2025-11-16
**Priority levels:** 🔴 Critical | ⚠️ High | 📝 Medium | 💡 Low

---

## 🔴 Critical Bugs

### Bug #1: Profile Updates Not Persisting to Database
**Impact:** Users cannot change their name or password
**Status:** ❌ Requires backend investigation
**Location:** `property-manager/includes/class-property-profile-api.php:126-176`

**Problem:**
- API returns 200 success but changes don't save to WordPress database
- Name change displays success toast but reverts on reload
- Old password still works, new password doesn't

**Investigation needed:**
1. Add logging before/after `wp_update_user()` call
2. Check if `wp_update_user()` returns `WP_Error`
3. Verify user has permissions to update own profile
4. Check for WordPress hooks intercepting the update

---

### Bug #2: Pagination Scroll Not Working
**Impact:** UX confusion when navigating between pages
**Status:** ⚠️ Requires frontend fix
**Location:** `src/components/properties/PropertyTable.tsx:154-170`

**Problem:**
When user scrolls down and changes page, view stays at bottom instead of scrolling to top.

**Attempted solutions:**
- Option A: `useEffect` with `currentPage` dependency
- Option B: Pass ref from PropertiesPage
- Option C: `scrollIntoView` on first table element
- Option D: Callback after `loadProperties()`

**Files affected:**
- `src/components/properties/PropertyTable.tsx:154-170`
- `src/components/properties/PropertyGrid.tsx:53-66`
- `src/pages/PropertiesPage.tsx:529` (scrollable container)

---

## ⚙️ Backend Refactoring

### T3.1: Split `get_properties()` into Private Methods
**Effort:** 8 hours
**Location:** `property-manager/includes/class-property-rest-api.php:200-526`

**Problem:** 326-line function violates single responsibility principle

**Solution:** Extract to 5 private methods:
- `parse_query_params($request)`
- `build_wp_query($params)`
- `apply_search_filter($query, $search_term)`
- `prepare_response($query)`

**Benefits:** Better testability, reduced cognitive complexity, code reusability

---

### T3.2: Create Constants for Repeated Arrays
**Effort:** 3 hours
**Files:** Multiple classes

**Problem:** Arrays like `$allowed_roles` and `$allowed_statuses` repeated 7+ times

**Solution:** Class constants:
```php
const ALLOWED_ROLES = ['property_admin', 'property_manager', 'property_associate'];
const ALLOWED_STATUSES = ['available', 'sold', 'rented', 'reserved'];
```

---

### T3.4: Extract Inline CSS to Files
**Effort:** 6 hours
**Files:**
- `class-property-meta.php:422-448`
- `class-property-audit.php:107-117`

**Solution:**
1. Create `property-admin.css` in assets
2. Use `wp_enqueue_style()` or `wp_add_inline_style()`
3. Move all inline styles to CSS file

---

### T3.5: Consolidate Code Duplication
**Effort:** 8 hours
**Location:** `class-property-profile-api.php:60-69, 194-204`

**Problem:** Duplicated user response formatting across multiple endpoints

**Solution:** Create private method `format_user_response($user)`

---

**Total backend refactoring:** ~25 hours

---

## ✅ Completed Tasks

### Performance Improvements (Nov 16, 2025)
- ✅ Fixed PHP Fatal Error: `update_post_meta_cache()` → `update_postmeta_cache()`
- ✅ Added defensive validation to `round_price_smart()`
- ✅ Fixed TypeScript compilation errors (8 errors fixed)
- ✅ Unified ImportError types across codebase

### Features Completed (Nov 12, 2025)
- ✅ Empty state vs search-no-results detection
- ✅ Role field now displays correctly on profile page
- ✅ Price rounding configuration (Settings page)
- ✅ Simplified user field hiding

---

## 📊 Quality Improvements (Deferred to Phase 5)

### Security Hardening
- SQL injection fix in search filter
- Sanitize `$_POST['role']` input
- Sanitize `$_SERVER['HTTP_X_DASHBOARD_UPDATE']` header
- Validate property existence in permission checks

### Performance Optimization
- Implement query caching (`update_postmeta_cache`, `cache_users`)
- Change asset versioning from `time()` to `filemtime()`
- Cache `count_users()` with WordPress transients
- Memoize React components (PropertyTableRow)
- Combine Zustand selectors
- Replace polling with storage events

### Code Quality
- Extract CSV parsing to reusable service
- Extract property validation to separate service
- Create formatters utility (`formatPrice`, `getStatusVariant`)
- Split PropertyTable into smaller components
- Eliminate all TypeScript `any` types

---

**Last review:** 2025-11-16
