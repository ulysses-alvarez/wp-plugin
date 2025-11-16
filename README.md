# Property Manager

Modern WordPress plugin for real estate property management.

**Version:** 1.0.0 RC
**Tech Stack:** React 19 + TypeScript + WordPress REST API

---

## Quick Start

### Build Plugin

```bash
pnpm install
pnpm run build
```

Built files go to `property-manager/dist/`

### Install in WordPress

1. Copy `property-manager/` to `wp-content/plugins/`
2. Activate plugin in WordPress Admin
3. Add shortcode to any page: `[property_dashboard]`

---

## Documentation

- **[Features](docs/features.md)** - Complete feature list
- **[Current Status](docs/current-status.md)** - System status and architecture
- **[Pending Tasks](docs/pending-tasks.md)** - Bugs and improvements

---

## Development

```bash
pnpm run dev          # Development server
pnpm run build        # Production build
pnpm tsc              # Type checking
```

---

## System Requirements

- WordPress 6.0+
- PHP 7.4+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

---

**License:** GPL v2 or later
