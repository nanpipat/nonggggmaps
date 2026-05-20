# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 3000
npm run build      # Production build
npm run lint       # ESLint (next lint)
npm run typecheck  # TypeScript check (tsc --noEmit)
```

No test suite is configured yet.

## Architecture

**PawMap** is a pet-friendly places discovery app for Bangkok. Built on Next.js 15 App Router with TypeScript, Tailwind CSS, Radix UI (via shadcn/ui), Zustand for state, and vanilla Leaflet for maps.

### Key architectural decisions

- **Client-first SPA.** The root page renders `<AppShell>`, which hydrates all data from `localStorage` on mount. There is no server-side data fetching today.
- **Abstracted data layer.** `src/lib/api.ts` exposes typed functions (`placesApi`, `reviewsApi`, `favoritesApi`, `authApi`, `editsApi`) backed by localStorage. The shape mirrors a Supabase schema 1:1 so each function can be swapped without touching callers. `src/lib/supabase.ts` holds the client stub (no-op until env vars are set).
- **Zustand store (`src/lib/store.ts`).** Single store for all app state: places, user, favorites, userLocation, all modal open/close flags, active filters, and sort order. `getFiltered()` in the store computes the filtered+sorted place list reactively.
- **Leaflet is client-only.** `MapView.tsx` is a plain Leaflet component; `MapMount.tsx` wraps it with `next/dynamic` and `ssr: false` to avoid SSR issues.
- **No API key required.** Map tiles use CARTO Voyager (free, attribution required). The app seeds mock Bangkok data and runs fully offline.

### Directory structure

```
src/
├── app/           # Next.js App Router (layout, page, globals.css)
├── components/
│   ├── AppShell.tsx          # Root orchestrator (auth, hydration, location)
│   ├── auth/                 # Login screen
│   ├── layout/               # TopBar, BottomNav, FabStack, SideDrawer
│   ├── map/                  # MapView, MapMount, marker-icons, PickingBanner
│   ├── modals/               # FilterModal, AddPlaceModal, ReviewModal
│   ├── places/               # PlaceCard, PlaceDetail, PolicyBadges, RatingStars
│   ├── search/               # CategoryChips
│   ├── sheets/               # BottomSheetPanel (3-level snap, Google Maps style)
│   └── ui/                   # shadcn/ui primitives (do not modify structure)
└── lib/
    ├── api.ts                # Data layer (localStorage → Supabase swap target)
    ├── store.ts              # Zustand store + actions
    ├── types.ts              # All domain types (Place, Review, Filters, etc.)
    ├── mock-data.ts          # SEED_PLACES / SEED_REVIEWS for local dev
    ├── geo.ts                # Distance calculations, maps URL builders
    ├── photo-upload.ts       # Client-side image resize to 800px JPEG
    ├── map-helpers.ts        # Leaflet utilities
    ├── categories.ts         # PlaceCategory enum
    └── utils.ts              # cn() and general helpers
```

### Domain types (`src/lib/types.ts`)

Core types to know: `Place`, `PetPolicy`, `Review`, `AppUser`, `Filters`, `PetType` (`dog | cat`), `PlaceCategory` (`cafe | restaurant | hotel | mall | park | petshop`), `SizeLimit`, `SortBy`.

### Styling

Design tokens are CSS HSL variables defined in `globals.css`. Tailwind config extends them with pet-themed colors (dog: orange, cat: lavender), custom animations (`wiggle`, `pulse-ring`, `fade-in`, `slide-up`), and soft shadow utilities. Dark mode is class-based.

### Path alias

`@/*` maps to `./src/*` throughout the codebase.

### Environment variables

See `.env.example`. The app runs without any env vars set (mock data is used). Supabase vars are optional until the backend is wired.

### Supabase migration

The README contains the full SQL schema and step-by-step instructions for replacing localStorage with Supabase. When implementing, swap function bodies in `src/lib/api.ts` and update `src/lib/supabase.ts` with real credentials.
