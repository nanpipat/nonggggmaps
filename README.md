# PawMap 🐾

แผนที่สถานที่ pet-friendly สำหรับเจ้าของน้องหมา-แมวในกรุงเทพฯ — สะอาด น่ารัก ใช้งานได้บนมือถือเหมือน native app

UX inspired by **Google Maps × Wongnai** — แผนที่เต็มจอ, search bar ลอย, bottom sheet snap, รีวิว/นโยบายสัตว์เลี้ยงเชิงลึก

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) + **TypeScript** | RSC, type-safe, Vercel-ready |
| Styling | **Tailwind CSS** + **shadcn/ui** primitives | utility-first + accessible Radix |
| Map | **Leaflet** + OpenStreetMap (CARTO Voyager tiles) | ฟรี ไม่ต้องใช้ API key |
| Markers | **leaflet.markercluster** + custom paw pins | clean cluster UX |
| State | **Zustand** | tiny, fast, ergonomic |
| Forms | **react-hook-form** + **zod** | best-in-class validation |
| Icons | **lucide-react** + custom paw SVG | clean & cute |
| Toast | **sonner** | beautiful notifications |
| Backend (planned) | **Supabase** (Postgres + Auth + Storage) | ready to wire — see `src/lib/supabase.ts` |
| Storage (now) | **localStorage** | ผ่าน abstraction `src/lib/api.ts` ที่ shape ตรงกับ Supabase 1:1 |

## Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install
#   หรือ pnpm install / yarn / bun install

# 2. (ไม่บังคับ) คัดลอก env ตัวอย่าง — แอปทำงานได้โดยไม่ต้อง config
cp .env.example .env.local

# 3. รัน dev server
npm run dev

# 4. เปิด http://localhost:3000
```

build/check:
```bash
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run start        # serve production build
npm run lint
```

## Features

- **🗺 แผนที่เต็มจอ** — Leaflet + CARTO Voyager tiles, marker cluster, smooth `flyTo`
- **🐾 Pet pins** — แยกสีและไอคอนตามประเภทสัตว์ (หมา/แมว/ทั้งคู่)
- **🔍 Search & Filters** — sticky search, chips บน, modal เต็มรูปแบบ (เงื่อนไข, ขนาด, คะแนน)
- **📋 Bottom sheet** — snap 3 ระดับ (peek/half/full) แบบ Google Maps
- **📍 Place detail** — hero photo, นโยบายสัตว์เลี้ยง, รูปภาพแกลเลอรี, รีวิวจริง, ปุ่มนำทาง
- **➕ Add place** — form + map picker (เลือกตำแหน่งบนแผนที่ได้)
- **✍️ Reviews** — ให้ดาว + ความเห็น + อัปโหลดรูป (resize เป็น 800px JPEG)
- **❤️ Favorites** — บันทึกที่โปรด
- **👤 Auth** — Google (mock), email, guest
- **📱 Mobile-first** — safe-area, viewport-fit, no zoom, glassmorphism
- **🌐 Geolocation** — auto-detect ตำแหน่ง คำนวณระยะ km/m

## Project Structure

```
petmaps/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # root layout + fonts + Toaster
│   │   ├── page.tsx            # main map page (renders AppShell)
│   │   └── globals.css         # tokens + leaflet skin + utilities
│   ├── components/
│   │   ├── AppShell.tsx        # composes the whole app
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── icons/
│   │   │   └── PawIcons.tsx    # custom paw SVGs
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── FabStack.tsx
│   │   │   └── SideDrawer.tsx
│   │   ├── map/
│   │   │   ├── MapView.tsx     # vanilla Leaflet (client)
│   │   │   ├── MapMount.tsx    # SSR-disabled wrapper
│   │   │   ├── marker-icons.ts
│   │   │   └── PickingBanner.tsx
│   │   ├── modals/
│   │   │   ├── FilterModal.tsx
│   │   │   ├── AddPlaceModal.tsx
│   │   │   └── ReviewModal.tsx
│   │   ├── places/
│   │   │   ├── PlaceCard.tsx
│   │   │   ├── PlaceDetail.tsx
│   │   │   ├── PolicyBadges.tsx
│   │   │   └── RatingStars.tsx
│   │   ├── search/
│   │   │   └── CategoryChips.tsx
│   │   ├── sheets/
│   │   │   └── BottomSheetPanel.tsx
│   │   └── ui/                 # shadcn primitives
│   └── lib/
│       ├── api.ts              # data layer — drop-in replace with Supabase
│       ├── supabase.ts         # client (no-op until env configured)
│       ├── store.ts            # Zustand
│       ├── types.ts            # domain types
│       ├── mock-data.ts        # seed Bangkok places
│       ├── categories.ts
│       ├── geo.ts              # distance + maps url helpers
│       ├── photo-upload.ts     # client-side image resize
│       └── utils.ts
├── public/
│   └── favicon.svg
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Data Layer / Supabase Migration

The data layer (`src/lib/api.ts`) is intentionally shaped to mirror the future Supabase schema exactly:

| Frontend API | Supabase Table |
|---|---|
| `placesApi.list/byId/create/update` | `places` |
| `reviewsApi.byPlace/byUser/create` | `reviews` |
| `favoritesApi.list/has/toggle` | `favorites` (composite key user_id + place_id) |
| `editsApi.list/create` | `suggested_edits` |
| `authApi.signInWithGoogle/Email/Guest` | `auth.users` (Supabase Auth) |

**To switch to Supabase:**

1. Create a Supabase project, enable Google OAuth
2. Run the SQL below to create tables:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar text,
  joined_at timestamptz default now()
);

create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('cafe','restaurant','hotel','mall','park','petshop')),
  address text not null,
  district text,
  lat double precision not null,
  lng double precision not null,
  phone text, hours text, website text,
  pet_types text[] not null,
  policy jsonb not null,
  notes text,
  photos text[] not null default '{}',
  cover_photo text,
  rating numeric default 0,
  review_count int default 0,
  added_by uuid references profiles(id),
  added_at timestamptz default now(),
  updated_at timestamptz
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id) on delete cascade,
  user_id uuid references profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text not null,
  photos text[] default '{}',
  created_at timestamptz default now()
);

create table favorites (
  user_id uuid references profiles(id) on delete cascade,
  place_id uuid references places(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, place_id)
);

create table suggested_edits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id) on delete cascade,
  user_id uuid references profiles(id),
  note text not null,
  created_at timestamptz default now()
);

-- RLS (example — tune to your needs)
alter table places enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;
create policy "places are public read" on places for select using (true);
create policy "auth users insert places" on places for insert to authenticated with check (true);
create policy "review owner write" on reviews using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

3. Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Replace function bodies in `src/lib/api.ts` with Supabase queries:

```ts
// before (mock):
list(): Place[] { return read<Place[]>(KEYS.PLACES, SEED_PLACES); }

// after (Supabase):
async list() {
  const { data, error } = await supabase!.from('places').select('*');
  if (error) throw error;
  return data as Place[];
}
```

(The store + components already `await` async calls; signatures are compatible.)

## Design Tokens

All theme tokens live in `src/app/globals.css` as HSL CSS variables. The palette is **soft coral + mint + lavender + peach**, with a warm cream background — clean but warm, modern but cute.

| Token | Default |
|---|---|
| `--primary` | `348 100% 73%` (soft coral pink) |
| `--secondary` | `161 53% 75%` (mint) |
| `--accent` | `32 100% 78%` (peach) |
| `--background` | `36 50% 98%` (cream) |
| `--dog` | `28 95% 60%` (warm orange) |
| `--cat` | `250 70% 70%` (lavender) |

Dark mode tokens are defined too (toggle via `<html class="dark">`).

## Roadmap

- [ ] Real Supabase wiring + Google OAuth
- [ ] Search autocomplete (Algolia / Postgres FTS)
- [ ] Place photo upload to Supabase Storage
- [ ] PWA manifest + offline support
- [ ] Realtime new-review notifications
- [ ] i18n EN/TH toggle
- [ ] Admin dashboard for place verification

## License

MIT — built with ❤️ for Bangkok pet parents.
