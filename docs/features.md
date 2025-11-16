# System Features

Complete feature documentation for Property Manager WordPress Plugin.

---

## Core Features

### Property Management

**CRUD Operations:**
- Create new properties with full metadata
- View property details in elegant sidebar
- Edit existing properties with pre-filled form
- Delete properties (with permission check)
- Bulk operations (select multiple, delete)

**Property Data:**
- **Basic:** Title, description, status
- **Location:** State, municipality, neighborhood, postal code, street
- **Details:** Patent number, price (MXN)
- **Media:** Google Maps URL, technical file attachment
- **Metadata:** Created date, last updated, author

**Status Types:**
- Available (green)
- Sold (blue)
- Rented (purple)
- Reserved (orange)

---

### Search & Filtering

**Search:**
- Full-text search across title, patent, municipality
- Debounced input (500ms)
- Real-time results

**Filters:**
- Status (available/sold/rented/reserved)
- State (32 Mexican states)
- Municipality (dynamic based on state)
- Active filter indicators
- Clear all filters button

**Sorting:**
- By date (newest/oldest)
- By title (A-Z / Z-A)
- By price (lowest/highest)
- Toggle ascending/descending

---

### Pagination

**Controls:**
- First/Previous/Next/Last page buttons
- Page numbers with ellipsis (1...5 6 7...20)
- Current page indicator
- Maximum 5 visible pages

**Items Per Page:**
- Options: 5, 10, 20, 50, 100
- Dropdown selector
- Range display: "Showing 1 to 20 of 157 properties"

**Navigation:**
- Keyboard accessible
- Responsive on mobile
- Maintains filters and sorting

---

### User Interface

**Views:**
- **Grid View:** Responsive cards (1-3 columns)
- **Table View:** Dashlane-style table with sortable columns
- Toggle between views

**Sidebar Panel:**
- **View Mode:** Read-only property details
- **Create Mode:** Empty form for new property
- **Edit Mode:** Pre-filled form with current data
- Slide-in animation from right (600px wide)
- Close with ESC, backdrop click, or X button

**Components:**
- Property cards with status badges
- Filters bar with search and dropdowns
- Pagination controls
- Loading spinners
- Error messages with retry
- Toast notifications (success/error/info)
- Empty state messages

---

### File Management

**Upload:**
- Drag & drop or click to select
- Supported formats: PDF, PNG, JPG, JPEG, GIF, WEBP
- Maximum size: 2MB
- Preview before upload
- Integration with WordPress Media Library

**Download:**
- Direct download button
- File name display
- File size display

---

### Data Import/Export

**CSV Import:**
- Upload CSV file
- Automatic header detection
- Row-by-row validation
- Error reporting (row, field, reason)
- Duplicate detection
- Batch creation

**CSV Format:**
Required headers: `title`, `status`, `state`, `municipality`, `postal_code`, `street`, `patent`, `price`
Optional: `neighborhood`, `description`, `google_maps_url`

**Export:**
- Export filtered results to CSV
- Export all properties
- Includes all metadata fields

---

### Role-Based Access Control

**Capabilities:**

**Admin:**
- Full system access
- Manage users and roles
- View/edit/delete all properties
- Configure site settings
- Upload logo, change colors

**Manager:**
- View all properties
- Create new properties
- Edit all properties
- Delete own properties only
- View team statistics

**Associate:**
- View own properties only
- Create new properties
- Edit own properties
- Cannot delete
- Limited dashboard access

**Viewer:**
- View all properties (read-only)
- No create/edit/delete
- Export data

---

### Site Configuration

**Settings (Admin only):**

**Branding:**
- Upload custom logo (2MB max)
- Site name (read-only from WordPress)
- Primary color (hex picker)
- Automatic text contrast adjustment

**Price Rounding:**
Configurable price range rounding for filters:
- Threshold (price range)
- Multiplier (round to nearest)
- Add/remove levels
- Reset to defaults

Example: Prices under $100k round to nearest $10k

---

### User Profile Management

**Editable Fields:**
- Display name
- Email address
- Password (with confirmation)

**Read-only:**
- Username
- Role
- Registration date

**Security:**
- Password strength indicator
- Email validation
- Confirmation required for password change

---

### Responsive Design

**Breakpoints:**
- Mobile: < 640px (1 column)
- Tablet: 640-1024px (2 columns)
- Desktop: > 1024px (3 columns)

**Mobile Features:**
- Hamburger menu
- Bottom navigation
- Touch-friendly buttons (min 44px)
- Swipe gestures for sidebar
- Optimized forms

**Desktop Features:**
- Side navigation
- Multi-column grid
- Keyboard shortcuts
- Hover states
- Context menus

---

## User Experience

### Loading States
- Skeleton screens for initial load
- Spinner for data fetching
- Progress indicators for file upload
- Disabled buttons during operations

### Error Handling
- Inline validation errors
- Toast notifications for failures
- Retry buttons on error screens
- Graceful degradation

### Accessibility
- Semantic HTML5
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader compatible

### Notifications
- Success toasts (green)
- Error toasts (red)
- Info toasts (blue)
- Warning toasts (yellow)
- Auto-dismiss (4 seconds)
- Manual dismiss option

---

## Integration Features

### WordPress Integration
- Custom post type: `property`
- REST API endpoints
- Media library integration
- User capabilities system
- Nonce verification
- Shortcode: `[property_dashboard]`

### Third-Party Integration
- Google Maps (embed)
- File downloads
- CSV export/import

---

## Performance Features

### Optimization
- Code splitting
- Lazy loading
- Debounced search
- Pagination (reduces load)
- Gzipped assets (83.5 KB total)

### Caching
- Browser cache for assets
- SessionStorage for selections
- LocalStorage for preferences

---

## Security Features

### Backend
- Nonce verification
- Capability checks
- Input sanitization
- SQL prepared statements
- Output escaping

### Frontend
- XSS prevention
- CSRF protection
- Type validation (TypeScript)
- File upload validation
- Secure API calls

---

## Customization

### Theme Support
- Respects WordPress theme
- Custom color palette
- Configurable primary color
- Auto-adjusting text contrast

### Extensibility
- WordPress hooks & filters
- REST API extensible
- Custom capabilities
- Pluggable templates

---

## Browser Support

**Modern browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features:**
- ES6+ JavaScript
- CSS Grid & Flexbox
- Fetch API
- LocalStorage
- SessionStorage

---

## Limitations

**Current constraints:**
- Single site only (no multisite support)
- English/Spanish languages only
- Maximum 10,000 properties (performance)
- 2MB file upload limit
- No offline mode

---

**For technical implementation details, see [current-status.md](./current-status.md)**
**For pending improvements, see [pending-tasks.md](./pending-tasks.md)**
