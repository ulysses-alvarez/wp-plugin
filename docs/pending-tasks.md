# Pending Tasks

**Last updated:** 2025-11-16
**Priority levels:** 🔴 Critical | ⚠️ High | 📝 Medium | 💡 Low

---

## 🔴 Critical Priority

## ⚙️ Backend Refactoring (Completed ✅)

All backend refactoring tasks have been completed successfully!

---

## ✅ Completed Tasks

### Backend Refactoring (Nov 16, 2025)
- ✅ **T3.1:** Split `get_properties()` into 5 private methods (8 hours)
  - Created `parse_query_params()`, `build_search_filters()`, `create_search_hooks()`, `execute_query_with_hooks()`, `build_paginated_response()`
  - Reduced main function from 315 lines to 6 lines
  - Improved testability and code reusability
- ✅ **T3.2:** Created class constants for repeated arrays (3 hours)
  - `Property_REST_API::ALLOWED_STATUSES`
  - `Property_User_Management::ALLOWED_ROLES`
  - `Property_Meta::ALLOWED_STATUSES`
  - Replaced 15+ hardcoded array instances
- ✅ **T3.5:** Consolidated user response formatting (8 hours)
  - Created `format_user_response()` private method in `Property_Profile_API`
  - Eliminated duplicate code across 2 endpoints
- ✅ **T3.4:** Extracted inline CSS to external file (6 hours)
  - Created `property-manager/assets/property-admin.css`
  - Moved CSS from `class-property-meta.php` and `class-property-audit.php`
  - Implemented proper `wp_enqueue_style()` with cache-busting

**Total refactoring time:** ~25 hours

### Performance Improvements (Nov 16, 2025)
- ✅ Fixed PHP Fatal Error: `update_post_meta_cache()` → `update_postmeta_cache()`
- ✅ Added defensive validation to `round_price_smart()`
- ✅ Fixed TypeScript compilation errors (8 errors fixed)
- ✅ Unified ImportError types across codebase
- ✅ Implemented file upload progress bar with XMLHttpRequest (2.5 hours)
  - Real-time progress tracking (0-100%)
  - Dynamic button text during upload
  - Visual progress bar with percentage
  - Error handling for failed uploads

### Features Completed (Nov 12, 2025)
- ✅ Empty state vs search-no-results detection
- ✅ Role field now displays correctly on profile page
- ✅ Price rounding configuration (Settings page)
- ✅ Simplified user field hiding

---

## 💡 Low Priority Issues

### File Upload UX Enhancements (Optional/Future)
**Priority:** 💡 Low - Nice to have
**Status:** 🔮 Possible future implementation
**Estimated effort:** 6-8 hours total

**Current state:** Basic progress bar already implemented ✅

**Possible enhancements:**

1. **Image Compression (Client-Side)** - 2 hours
   - Reduce image file sizes by 50-80% before upload
   - Faster uploads and less bandwidth
   - Library: `browser-image-compression` (~18KB)
   - Only works for images (not PDFs)
   - **Trade-off:** May reduce quality for technical drawings

2. **Cancel Upload Button** - 1 hour
   - Allow users to abort ongoing uploads
   - Already prepared with `XMLHttpRequest.abort()`
   - Add "Cancelar" button next to progress bar
   - **Benefit:** Better user control

3. **Upload Time Estimation** - 1 hour
   - Display estimated remaining time ("~15 segundos restantes")
   - Calculate based on upload speed
   - **Benefit:** Sets user expectations

4. **File Preview Before Upload** - 2 hours
   - Show image/PDF preview before submitting
   - Thumbnail for images
   - PDF first page preview
   - **Benefit:** User can verify correct file

5. **Enhanced Drag & Drop** - 1 hour
   - Visual feedback during drag
   - Multiple file zones highlighting
   - Drop overlay animation
   - **Benefit:** More intuitive interface

**Decision criteria:**
- Implement if users frequently upload large files (>2MB)
- Image compression valuable if users upload photos vs PDFs
- Cancel button useful for slow connections
- Low priority unless user complaints

---

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
