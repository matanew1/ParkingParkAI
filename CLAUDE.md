# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run deploy     # Build + deploy to GitHub Pages
```

No test suite is configured. TypeScript type-checking is enforced at build time via `tsc`.

## Architecture

**ParkingParkAI** is a React 18 + TypeScript + Vite SPA for real-time parking management in Tel Aviv. It is entirely frontend — no backend server. All data comes from the Tel Aviv GIS API.

### Data Flow

```
UI Components
  → Zustand Stores (parkingStore, themeStore, favoritesStore, notificationStore)
  → Services (parkingService, routeService, notificationService, favoritesService)
  → External APIs (Tel Aviv GIS, Valhalla Routing)
  → Caching (CacheManager, SpatialCacheManager, localStorage)
```

### Key Layers

**`src/stores/`** — Zustand stores. `parkingStore.ts` is the central hub: parking data, map center, user location, active routes, loading states. `favoritesStore` and `notificationStore` use Zustand `persist` middleware to sync with localStorage.

**`src/Services/`** — All external API communication. `parkingService.ts` fetches two GIS layers (970 = public lots, 555 = private lots), converts coordinates from Israel TM Grid (EPSG:2039) to WGS84 via Proj4, and applies multi-level caching. `routeService.ts` calls Valhalla routing. `notificationService.ts` wraps the Browser Notifications API + service worker (`public/sw.js`).

**`src/features/`** — Feature-sliced UI. Each subdirectory owns its components for one domain: `app/` (root layout), `map/` (Leaflet map + markers), `sidebar/` (search + virtual list), `favorites/`, `notifications/`, `options/`.

**`src/hooks/`** — `useViewportFilter` loads only parking spots visible in the current map bounds (key performance feature). `useAutoPopup` manages auto-opening marker popups.

**`src/utils/`** — `CacheManager` (5-min TTL memory cache), `SpatialCacheManager` (bounds-based geo cache), `coordinateValidation` (Israel bounds checking), `colorUtils` (status → marker color), `debounceThrottle`.

### External APIs

| API | URL | Purpose |
|-----|-----|---------|
| Tel Aviv GIS Layer 970 | `https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/970/` | Public parking (live availability) |
| Tel Aviv GIS Layer 555 | `https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/555/` | Private parking |
| Valhalla Routing | `https://valhalla1.openstreetmap.de/route` | Navigation/routes |

The Vite dev server proxies `/gis-api` → GIS base URL to avoid CORS issues in development (see `vite.config.ts`).

### Coordinate System

Parking data from Layer 555 uses **EPSG:2039** (Israel Transverse Mercator). `parkingService.ts` converts these to WGS84 (lat/lng) using Proj4 before storing in state.

### Mapping Stack

Leaflet + React-Leaflet + React-Leaflet-Cluster. Marker colors are computed by `colorUtils` based on parking status. Route polylines use `leaflet-arrowheads`. Marker clustering reduces DOM load for 1000+ spots.

### State Persistence

- Theme preference → localStorage via Zustand persist
- Favorites + nicknames → localStorage via Zustand persist
- Notification settings + history → localStorage via Zustand persist
- Parking data → in-memory only (refreshed on load, 5-min cache TTL)

### Mobile Layout

`AppContent.tsx` uses an MUI Drawer for sidebar on mobile. A toggle button switches between map and list views on small screens. The map component is lazy-loaded.

## Tech Stack Summary

- **React 18** + **TypeScript 5.5** + **Vite 5**
- **Zustand 5** — state management
- **MUI 6** + **Tailwind CSS 3** + **Framer Motion 11** — UI/styling
- **Leaflet 1.9** + **React-Leaflet 4** — maps
- **Proj4** — coordinate conversion
- **Axios** — HTTP
- **Tanstack Virtual** — virtualized list rendering

## TypeScript Config

Strict mode is on. `noUnusedLocals` and `noUnusedParameters` are enforced. Target is ES2020. Path aliases are not configured — use relative imports.
