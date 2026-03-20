## Web App Mobile-First de Notation Guinness

**Version :** 2.0  
**Date :** Mars 2026  
**Statut :** Ready for Development  
**Auteur :** —  
**Référence :** Cahier des fonctionnalités v1.0

---

## Table des matières

1. [Vue d'ensemble du produit](#1-vue-densemble-du-produit)
2. [Objectifs et métriques de succès](#2-objectifs-et-m%C3%A9triques-de-succ%C3%A8s)
3. [Utilisateurs cibles](#3-utilisateurs-cibles)
4. [Architecture technique](#4-architecture-technique)
5. [Structure du projet](#5-structure-du-projet)
6. [Schéma de base de données](#6-sch%C3%A9ma-de-base-de-donn%C3%A9es)
7. [API & Intégrations externes](#7-api--int%C3%A9grations-externes)
8. [Stories et critères d'acceptation](#8-stories-et-crit%C3%A8res-dacceptation)
9. [Maquettes de navigation](#9-maquettes-de-navigation)
10. [Plan de développement](#10-plan-de-d%C3%A9veloppement)
11. [Risques et mitigations](#11-risques-et-mitigations)
12. [Définition of Done](#12-d%C3%A9finition-of-done)

---

## 1. Vue d'ensemble du produit

### 1.1 Résumé

Web application **mobile-first** et **Progressive Web App (PWA)** permettant aux amateurs de Guinness de noter leurs expériences de dégustation selon plusieurs critères, de les géolocaliser automatiquement dans des bars et pubs, et de consulter une carte communautaire des meilleures adresses. L'application est accessible depuis n'importe quel navigateur mobile sans installation via un store, avec une expérience quasi-native grâce au PWA.

### 1.2 Choix du web vs natif

|Critère|React Native (v1)|Next.js PWA (v2)|
|---|---|---|
|Distribution|App Store + Play Store (review)|URL directe, instantané|
|Mise à jour|Review store requis|Déploiement Vercel en secondes|
|Coût infra|EAS Build payant|Vercel free tier suffisant en MVP|
|Géolocalisation|expo-location (natif)|Browser Geolocation API (standard)|
|Caméra / Photo|expo-image-picker|`<input capture>` HTML5|
|Offline|AsyncStorage|Service Worker + Cache API|
|SEO|Non applicable|Pages indexables (carte publique)|
|Installation|Obligatoire|Optionnelle (Add to Home Screen)|

### 1.3 Proposition de valeur

> _"Trouve la meilleure Guinness près de toi. Note la tienne. Partage-la."_

- **Pour l'utilisateur solo** : journal personnel de dégustations avec localisation automatique, accessible depuis son téléphone sans installation
- **Pour la communauté** : découvrir les bars servant les meilleures Guinness dans une ville donnée
- **Différenciation** : notation multi-critères + carte 100% open source sans Google + PWA installable

### 1.4 Hors périmètre v1

- Système de commentaires entre utilisateurs
- Notifications push (Web Push API — v2)
- Extension à d'autres bières
- Dashboard analytics admin
- Application native iOS / Android

---

## 2. Objectifs et métriques de succès

### 2.1 Objectifs produit

|Objectif|Métrique|Cible à 3 mois|
|---|---|---|
|Adoption|Nombre d'inscrits|500 utilisateurs|
|Engagement|Notations créées|2 000 notations|
|Rétention|Utilisateurs actifs à J+30|40%|
|PWA|Taux d'installation (Add to Home Screen)|≥ 20%|
|Qualité|Notations avec lieu associé|≥ 80%|
|Qualité|Notations avec photo|≥ 30%|

### 2.2 Objectifs techniques

- **Core Web Vitals** : LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lighthouse mobile** : score ≥ 90 (Performance, Accessibilité, PWA)
- Chargement de la carte < 2s sur connexion 4G
- Taux de crash / erreur JS < 0.5% des sessions
- Couverture de tests ≥ 70% sur les fonctions critiques
- **Time to First Byte (TTFB)** < 200ms grâce au Edge Runtime Vercel

---

## 3. Utilisateurs cibles

### Persona principal — _"Le Connaisseur casual"_

- **Profil** : 25–45 ans, amateur de bière, fréquente régulièrement bars et pubs
- **Device** : iPhone ou Android, utilise Safari / Chrome mobile
- **Comportement** : scan un QR code partagé par un ami, préfère ne pas installer une appli pour tester
- **Besoin** : noter sa pinte rapidement depuis son téléphone, partage d'une URL directe
- **Frustration** : les avis Google sont trop généraux, les apps de bière nécessitent une installation

### Persona secondaire — _"Le Touriste curieux"_

- **Profil** : en voyage, cherche un pub local authentique
- **Comportement** : recherche sur Google "meilleure Guinness [ville]" ou scanne un QR sur une table
- **Besoin** : accès immédiat à la carte communautaire sans compte requis pour la consultation
- **Frustration** : obligation de créer un compte avant de pouvoir consulter des avis

---

## 4. Architecture technique

### 4.1 Stack complète

|Couche|Technologie|Version|Rôle|
|---|---|---|---|
|Framework|Next.js (App Router)|15.x|SSR, SSG, API Routes, Edge Runtime|
|Langage|TypeScript|5.x|Typage statique|
|UI|Tailwind CSS|4.x|Styling mobile-first|
|Composants|shadcn/ui|Latest|Composants accessibles|
|PWA|next-pwa / Serwist|Latest|Service Worker, manifest, offline|
|Backend / BaaS|Supabase|Latest|Auth, DB, Storage, Realtime|
|Base de données|PostgreSQL + PostGIS|15|Données relationnelles + géospatiales|
|Auth|Supabase Auth + SSR|—|Cookies httpOnly, session server-side|
|Stockage média|Supabase Storage|—|Photos de pintes|
|Cartographie|MapLibre GL JS|4.x|Rendu carte open source (browser)|
|Tuiles carto|Maptiler (OSM)|—|Fonds de carte sans Google|
|Lieux (POI)|Overpass API (OSM)|—|Recherche bars/pubs à proximité|
|Géocodage|Nominatim (OSM)|—|Recherche manuelle d'adresse|
|State management|Zustand|4.x|État global client léger|
|Formulaires|React Hook Form + Zod|—|Validation formulaires|
|Data fetching|TanStack Query|5.x|Cache, revalidation, optimistic updates|
|HTTP (OSM)|Native fetch|—|Requêtes Overpass / Nominatim|
|Hébergement|Vercel|—|Edge Network, CI/CD, Analytics|
|Tests|Vitest + Testing Library|—|Tests unitaires et composants|
|E2E|Playwright|—|Tests end-to-end mobile viewport|

### 4.2 Décisions d'architecture Next.js

#### Server vs Client Components

|Composant|Rendu|Raison|
|---|---|---|
|Pages carte publique|Server Component + ISR|SEO + performance initiale|
|Formulaire de notation|Client Component|Interactivité, géolocalisation browser|
|Liste de ses notations|Server Component|Données fraîches depuis Supabase server-side|
|Carte MapLibre|Client Component|WebGL nécessite le browser|
|Auth (login/register)|Client Component|Interactions formulaire|
|Profil|Server Component + Client partiel|Données serveur + form modifications|

#### Stratégies de rendu

```
/                    → SSG  (landing page statique)
/map                 → SSR  (carte communautaire, données fraîches)
/rate                → CSR  (formulaire interactif + GPS)
/my-ratings          → SSR  (données privées, auth requise)
/my-ratings/[id]     → SSR  (détail notation)
/profile             → SSR  (données utilisateur)
/auth/login          → CSR  (formulaire)
/auth/register       → CSR  (formulaire)
```

#### Middleware Vercel (protection des routes)

```typescript
// middleware.ts
export const config = {
  matcher: ['/rate', '/my-ratings/:path*', '/profile/:path*'],
};
// Vérifie le cookie de session Supabase, redirige vers /auth/login si absent
```

### 4.3 Configuration PWA

```json
// public/manifest.json
{
  "name": "Guinness Rater",
  "short_name": "G-Rater",
  "description": "Note et géolocalise tes Guinness",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#1a1a1a",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Stratégie Service Worker (Serwist) :**

|Ressource|Stratégie cache|
|---|---|
|Pages Next.js|Network First|
|Tuiles Maptiler|Cache First (24h)|
|Assets statiques (JS, CSS)|Cache First (immutable)|
|API Supabase|Network Only|
|Requêtes Overpass|Stale While Revalidate (1h)|

### 4.4 Schéma d'architecture

```
┌─────────────────────────────────────────────────────────┐
│              BROWSER MOBILE (PWA)                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  /map    │  │  /rate   │  │/my-rating│  │/profile│  │
│  │MapLibre  │  │  Form    │  │    s     │  │        │  │
│  │(WebGL)   │  │+ GPS API │  │          │  │        │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └─────────────┴─────────────┴─────────────┘       │
│              Zustand + TanStack Query                    │
│                   Service Worker (PWA)                   │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────┐
│                    VERCEL EDGE                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │            Next.js App Router                   │    │
│  │                                                 │    │
│  │  Server Components │ API Routes │ Middleware    │    │
│  │  (SSR / SSG / ISR) │ /api/*     │ Auth guard   │    │
│  └────────────────────┬────────────────────────────┘    │
└───────────────────────┼─────────────────────────────────┘
                        │ Supabase JS SDK (server)
          ┌─────────────▼──────────────────────┐
          │             SUPABASE                │
          │  ┌──────────┐    ┌──────────────┐  │
          │  │   Auth   │    │  PostgreSQL  │  │
          │  │ (cookies)│    │  + PostGIS   │  │
          │  └──────────┘    └──────────────┘  │
          │  ┌──────────┐    ┌──────────────┐  │
          │  │ Storage  │    │   Realtime   │  │
          │  │(photos)  │    │  (websocket) │  │
          │  └──────────┘    └──────────────┘  │
          └────────────────────────────────────┘
                        │
          ┌─────────────▼──────────────────────┐
          │         APIs EXTERNES (OSM)         │
          │  Overpass API  │  Nominatim         │
          │  Maptiler tiles│                    │
          └────────────────────────────────────┘
```

### 4.5 Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SECRET_ROLE_KEY=your_service_role_key   # server-side uniquement
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
NEXT_PUBLIC_OVERPASS_API_URL=https://overpass-api.de/api/interpreter
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais être exposé côté client. Utilisé uniquement dans les Server Components et API Routes.

### 4.6 Déploiement Vercel

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["cdg1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**Pipeline CI/CD :**

```
Push sur main
    │
    ▼
Vercel Build
    ├── next build
    ├── Type check (tsc --noEmit)
    └── Tests (vitest run)
         │
         ▼
    Preview URL (Pull Requests)
         │
         ▼
    Production (merge main)
```

---

## 5. Structure du projet

```
guinness-app/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Groupe de routes auth (layout minimal)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (app)/                        # Routes protégées (layout avec nav mobile)
│   │   ├── map/
│   │   │   └── page.tsx              # F-03 — Carte (Client Component)
│   │   ├── rate/
│   │   │   ├── page.tsx              # F-01 — Formulaire notation
│   │   │   └── place/
│   │   │       └── page.tsx          # F-02 — Sélection du lieu
│   │   ├── my-ratings/
│   │   │   ├── page.tsx              # F-05 — Liste des notations
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Détail notation
│   │   │       └── edit/
│   │   │           └── page.tsx      # Édition notation
│   │   ├── profile/
│   │   │   └── page.tsx              # F-04 — Profil
│   │   └── layout.tsx                # Bottom nav mobile
│   │
│   ├── api/                          # API Routes (server-side)
│   │   ├── ratings/
│   │   │   ├── route.ts              # GET (liste) / POST (création)
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET / PATCH / DELETE
│   │   ├── places/
│   │   │   └── nearby/
│   │   │       └── route.ts          # GET — proxy Overpass (évite CORS)
│   │   └── upload/
│   │       └── route.ts              # POST — upload photo vers Supabase Storage
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # OAuth callback Supabase
│   │
│   ├── layout.tsx                    # Root layout (providers, metadata)
│   ├── page.tsx                      # Landing page (SSG)
│   └── globals.css
│
├── components/
│   ├── ui/                           # shadcn/ui + composants custom
│   │   ├── StarRating.tsx
│   │   ├── RatingCard.tsx
│   │   ├── BottomSheet.tsx           # Drawer mobile (Vaul)
│   │   ├── Avatar.tsx
│   │   └── MobileNav.tsx             # Barre de navigation bottom
│   ├── map/
│   │   ├── GuinnessMap.tsx           # MapLibre GL JS (dynamic import)
│   │   ├── RatingMarker.tsx
│   │   └── PlaceBottomSheet.tsx
│   ├── rating/
│   │   ├── RatingForm.tsx
│   │   ├── CriteriaRow.tsx           # Ligne critère + étoiles
│   │   └── PhotoCapture.tsx          # <input capture="environment">
│   └── place/
│       ├── PlaceSelector.tsx
│       └── PlaceSearchBar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient (côté client)
│   │   ├── server.ts                 # createServerClient (Server Components)
│   │   └── middleware.ts             # createMiddlewareClient
│   ├── overpass.ts                   # Helpers Overpass API
│   ├── nominatim.ts                  # Helpers Nominatim
│   └── geo.ts                        # Utilitaires géospatiaux
│
├── store/
│   ├── authStore.ts                  # Session utilisateur (Zustand)
│   ├── ratingsStore.ts               # Notations (Zustand)
│   └── mapStore.ts                   # État carte (Zustand)
│
├── hooks/
│   ├── useGeolocation.ts             # Browser Geolocation API
│   ├── useNearbyPlaces.ts            # Overpass via /api/places/nearby
│   ├── useRatings.ts                 # TanStack Query — CRUD notations
│   └── useProfile.ts                 # TanStack Query — profil utilisateur
│
├── types/
│   ├── database.types.ts             # Générés par Supabase CLI
│   └── index.ts
│
├── constants/
│   ├── colors.ts
│   └── config.ts
│
├── middleware.ts                     # Auth guard Vercel Edge
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker (généré par Serwist)
│   └── icons/
│
├── __tests__/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
└── tsconfig.json
```

---

## 6. Schéma de base de données

### 6.1 Migration SQL initiale

```sql
-- Activation de PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Table profiles (extension de auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 3 AND 30),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger : création automatique du profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Table places
CREATE TABLE places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  city        TEXT,
  osm_id      TEXT,
  location    GEOGRAPHY(Point, 4326) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index géospatial
CREATE INDEX places_location_idx ON places USING GIST (location);

-- Table ratings
CREATE TABLE ratings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  place_id     UUID REFERENCES places(id) ON DELETE SET NULL,
  color        NUMERIC(2,1) CHECK (color BETWEEN 1 AND 5),
  foam         NUMERIC(2,1) CHECK (foam BETWEEN 1 AND 5),
  texture      NUMERIC(2,1) CHECK (texture BETWEEN 1 AND 5),
  temperature  NUMERIC(2,1) CHECK (temperature BETWEEN 1 AND 5),
  environment  NUMERIC(2,1) CHECK (environment BETWEEN 1 AND 5),
  overall      NUMERIC(2,1) NOT NULL CHECK (overall BETWEEN 1 AND 5),
  comment      TEXT CHECK (char_length(comment) <= 500),
  photo_url    TEXT,
  price        NUMERIC(4,2),
  rated_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX ratings_user_id_idx ON ratings (user_id);
CREATE INDEX ratings_place_id_idx ON ratings (place_id);
CREATE INDEX ratings_rated_at_idx ON ratings (rated_at DESC);
```

### 6.2 Row Level Security (RLS)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings  ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_read_all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write_own"  ON profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- places
CREATE POLICY "places_read_all"     ON places FOR SELECT USING (true);
CREATE POLICY "places_insert_auth"  ON places FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ratings
CREATE POLICY "ratings_read_all"    ON ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert_own"  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update_own"  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "ratings_delete_own"  ON ratings FOR DELETE
  USING (auth.uid() = user_id);
```

### 6.3 Vue pour la carte

```sql
CREATE OR REPLACE VIEW places_with_stats AS
SELECT
  p.id,
  p.name,
  p.address,
  p.city,
  ST_AsGeoJSON(p.location)::json AS geojson,
  ROUND(AVG(r.overall)::numeric, 1)      AS avg_overall,
  ROUND(AVG(r.color)::numeric, 1)        AS avg_color,
  ROUND(AVG(r.foam)::numeric, 1)         AS avg_foam,
  ROUND(AVG(r.texture)::numeric, 1)      AS avg_texture,
  ROUND(AVG(r.temperature)::numeric, 1)  AS avg_temperature,
  ROUND(AVG(r.environment)::numeric, 1)  AS avg_environment,
  COUNT(r.id)                            AS rating_count,
  MAX(r.photo_url)                       AS latest_photo
FROM places p
LEFT JOIN ratings r ON r.place_id = p.id
GROUP BY p.id;
```

### 6.4 Fonction PostGIS — bars à proximité

```sql
CREATE OR REPLACE FUNCTION get_places_nearby(
  lat FLOAT, lng FLOAT, radius_meters INT DEFAULT 500
)
RETURNS TABLE (
  id UUID, name TEXT, address TEXT, distance_meters FLOAT
)
LANGUAGE SQL AS $$
  SELECT
    p.id, p.name, p.address,
    ST_Distance(p.location, ST_Point(lng, lat)::geography) AS distance_meters
  FROM places p
  WHERE ST_DWithin(p.location, ST_Point(lng, lat)::geography, radius_meters)
  ORDER BY distance_meters ASC
  LIMIT 10;
$$;
```

---

## 7. API & Intégrations externes

### 7.1 Supabase Auth — SSR avec cookies

La gestion de session utilise `@supabase/ssr` pour stocker les tokens dans des **cookies httpOnly** (et non dans localStorage), compatible avec le rendu server-side de Next.js.

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* getAll / setAll sur request/response */ } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  return response
}

export const config = {
  matcher: ['/rate/:path*', '/my-ratings/:path*', '/profile/:path*'],
}
```

### 7.2 Géolocalisation — Browser Geolocation API

Remplacement de `expo-location` par l'API navigateur standard.

```typescript
// hooks/useGeolocation.ts
export function useGeolocation() {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n'est pas supportée par ce navigateur.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords(pos.coords); setLoading(false) },
      (err) => { setError(err.message); setLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { coords, error, loading, getPosition }
}
```

> **Prérequis navigateur :** La Geolocation API requiert HTTPS. Vercel fournit HTTPS automatiquement sur tous les déploiements.

### 7.3 Prise de photo — HTML5 input capture

Remplacement de `expo-image-picker` par l'élément HTML natif.

```tsx
// components/rating/PhotoCapture.tsx
export function PhotoCapture({ onCapture }: { onCapture: (file: File) => void }) {
  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        capture="environment"       // Ouvre la caméra arrière sur mobile
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onCapture(file)
        }}
      />
      <div className="flex items-center gap-2 rounded-xl border-2 border-dashed p-4">
        📷 Prendre une photo
      </div>
    </label>
  )
}
```

### 7.4 MapLibre GL JS — intégration Next.js

MapLibre est importé dynamiquement (pas de SSR car WebGL nécessite le browser).

```typescript
// components/map/GuinnessMap.tsx
'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./MapLibreMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-neutral-900" />,
})

// MapLibreMap.tsx (chargé uniquement côté client)
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
```

### 7.5 API Route — proxy Overpass (évite les problèmes CORS)

```typescript
// app/api/places/nearby/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') ?? '500'

  const query = `
    [out:json][timeout:10];
    (
      node["amenity"~"bar|pub|biergarten"](around:${radius},${lat},${lng});
      way["amenity"~"bar|pub|biergarten"](around:${radius},${lat},${lng});
    );
    out center body;
  `

  const response = await fetch(process.env.NEXT_PUBLIC_OVERPASS_API_URL!, {
    method: 'POST',
    body: query,
    next: { revalidate: 3600 }, // Cache Vercel 1h
  })

  const data = await response.json()
  return NextResponse.json(data)
}
```

### 7.6 Supabase Storage — upload photo

```typescript
// app/api/upload/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const buffer = await file.arrayBuffer()
  const fileName = `${user.id}/${Date.now()}.jpg`

  const { error } = await supabase.storage
    .from('rating-photos')
    .upload(fileName, buffer, { contentType: 'image/jpeg' })

  if (error) return NextResponse.json({ error }, { status: 500 })

  const { data } = supabase.storage.from('rating-photos').getPublicUrl(fileName)
  return NextResponse.json({ url: data.publicUrl })
}
```

---

## 8. Stories et critères d'acceptation

### Epic 1 — Authentification

---

**US-01 · Inscription**

> En tant que nouvel utilisateur, je veux créer un compte avec un pseudo, un e-mail et un mot de passe.

**Critères d'acceptation :**

- [ ] Le formulaire valide le format de l'e-mail (Zod)
- [ ] Le mot de passe fait minimum 8 caractères, 1 majuscule, 1 chiffre
- [ ] Le pseudo est unique (vérification en base avant soumission)
- [ ] Un e-mail de confirmation est envoyé via Supabase Auth
- [ ] Un profil est créé automatiquement dans `profiles` via le trigger SQL
- [ ] En cas d'erreur (email déjà utilisé), un message explicite est affiché inline
- [ ] La page est responsive et optimisée mobile

---

**US-02 · Connexion**

> En tant qu'utilisateur, je veux me connecter avec mon e-mail et mot de passe.

**Critères d'acceptation :**

- [ ] La session est persistée via cookies httpOnly (Supabase SSR)
- [ ] Les Server Components accèdent à la session sans appel client supplémentaire
- [ ] L'accès OAuth (Google / Apple) fonctionne via Supabase Auth
- [ ] La redirection post-connexion pointe vers `/map`
- [ ] Le middleware protège les routes `/rate`, `/my-ratings`, `/profile`

---

**US-03 · Mot de passe oublié**

> En tant qu'utilisateur, je veux réinitialiser mon mot de passe si je l'ai oublié.

**Critères d'acceptation :**

- [ ] `supabase.auth.resetPasswordForEmail` envoie un lien
- [ ] Un message de confirmation s'affiche même si l'e-mail n'existe pas (sécurité)
- [ ] Le lien de reset redirige vers une page `/auth/reset-password` avec le nouveau formulaire

---

### Epic 2 — Notation

---

**US-04 · Créer une notation**

> En tant qu'utilisateur connecté, je veux noter ma Guinness selon plusieurs critères.

**Critères d'acceptation :**

- [ ] 6 critères avec sélecteur étoiles tactile (demi-étoiles, 1 à 5)
- [ ] La note générale est obligatoire, les 5 autres sont optionnelles
- [ ] Commentaire libre (max 500 caractères) avec compteur en temps réel
- [ ] Photo via `<input capture="environment">` (caméra arrière sur mobile)
- [ ] La photo est compressée côté client (max 800px, qualité 0.8) avant upload, format carré
- [ ] Prix de la pinte optionnel (champ numérique)
- [ ] Date/heure pré-remplie automatiquement, modifiable via `<input type="datetime-local">`
- [ ] Après validation, redirection vers `/rate/place` (F-02)

---

**US-05 · Associer un lieu**

> En tant qu'utilisateur, je veux lier ma notation à un bar à proximité.

**Critères d'acceptation :**

- [ ] La Browser Geolocation API est sollicitée avec `enableHighAccuracy: true`
- [ ] Si permission refusée, basculement immédiat en mode recherche manuelle
- [ ] Les bars à proximité sont chargés via `/api/places/nearby` (proxy Vercel)
- [ ] 5 bars maximum sont listés dans un rayon de 500m
- [ ] Extension automatique du rayon à 1km puis 2km si aucun résultat
- [ ] Recherche manuelle par nom via Nominatim
- [ ] L'étape peut être ignorée
- [ ] Si le lieu sélectionné n'existe pas en base, il est créé dans `places`

---

**US-06 · Modifier une notation**

> En tant qu'utilisateur, je veux modifier une notation existante.

**Critères d'acceptation :**

- [ ] La page `/my-ratings/[id]/edit` est un Server Component avec données pré-chargées
- [ ] Le formulaire client est pré-rempli avec les valeurs existantes
- [ ] La photo existante est affichée, remplaçable ou supprimable
- [ ] L'ancienne photo est supprimée de Supabase Storage lors du remplacement
- [ ] TanStack Query invalide le cache après modification
- [ ] Seul le propriétaire peut accéder à cette page (RLS + vérification middleware)

---

**US-07 · Supprimer une notation**

> En tant qu'utilisateur, je veux supprimer une notation.

**Critères d'acceptation :**

- [ ] Un Dialog de confirmation (shadcn/ui AlertDialog) s'affiche avant suppression
- [ ] La photo associée est supprimée de Supabase Storage
- [ ] La notation est supprimée via l'API Route `DELETE /api/ratings/[id]`
- [ ] TanStack Query invalide et recharge la liste immédiatement
- [ ] Seul le propriétaire peut supprimer (RLS vérifié côté serveur)

---

### Epic 3 — Carte

---

**US-08 · Voir la carte communautaire**

> En tant qu'utilisateur (connecté ou non), je veux voir sur une carte les bars notés.

**Critères d'acceptation :**

- [ ] MapLibre GL JS est chargé via `dynamic(() => import(...), { ssr: false })`
- [ ] Les tuiles Maptiler (OSM) s'affichent sans dépendance Google
- [ ] Les marqueurs sont colorés selon la note moyenne du lieu
- [ ] Le clustering natif MapLibre regroupe les marqueurs proches
- [ ] Un tap/click sur un marqueur ouvre une bottom sheet (Vaul drawer)
- [ ] Un bouton "me recentrer" utilise la Browser Geolocation API
- [ ] Le toggle "Mes notes / Toutes les notes" est visible uniquement si connecté
- [ ] La carte est consultable sans compte (mode "Toutes les notes" par défaut)

---

**US-09 · Filtrer la carte**

> En tant qu'utilisateur, je veux filtrer les marqueurs par note minimale.

**Critères d'acceptation :**

- [ ] Un slider accessible depuis un panneau de filtres (bottom sheet)
- [ ] Le filtre est appliqué côté client sur les données GeoJSON déjà chargées
- [ ] Les marqueurs se mettent à jour sans rechargement de la carte
- [ ] Le filtre est réinitialisé à la fermeture de l'écran

---

### Epic 4 — Profil

---

**US-10 · Modifier son profil**

> En tant qu'utilisateur, je veux modifier mon pseudo, e-mail et mot de passe.

**Critères d'acceptation :**

- [ ] La page est un Server Component (données chargées côté serveur)
- [ ] Les formulaires de modification sont des Client Components imbriqués
- [ ] Modification e-mail : `supabase.auth.updateUser({ email })` + mail de confirmation
- [ ] Modification mot de passe : saisie de l'ancien requis
- [ ] Statistiques calculées en temps réel via requête Supabase agrégée
- [ ] Avatar modifiable via `<input type="file">` → upload vers Supabase Storage

---

**US-11 · Supprimer son compte**

> En tant qu'utilisateur, je veux pouvoir supprimer mon compte définitivement.

**Critères d'acceptation :**

- [ ] Double confirmation requise (saisie du mot "SUPPRIMER")
- [ ] Appel à l'API Route `DELETE /api/profile` (utilise `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Photos supprimées de Supabase Storage
- [ ] Cookie de session supprimé, redirection vers `/`

---

## 9. Maquettes de navigation

### 9.1 Flux d'authentification

```
[/ — Landing Page]
        │
        ├── Session active ────────────────────→ [/map]
        │
        └── Pas de session
                │
          [/auth/login]
                │
                ├── [/auth/forgot-password]
                │
                └── [/auth/register]
                          │
                          └── [/map]
```

### 9.2 Flux de notation

```
[/rate]
RatingFormScreen
- 6 critères (étoiles tactiles)
- Commentaire + photo + prix
        │
        ▼
[/rate/place]
PlaceSelectorScreen
- Liste Overpass (5 bars)
- Recherche Nominatim
- "Passer cette étape"
        │
        ▼
[/my-ratings/[id]]
Confirmation + détail notation
```

### 9.3 Navigation mobile (Bottom Nav)

```
┌──────────────────────────────────────────┐
│                                          │
│         [Contenu de la page active]      │
│                                          │
│                                          │
├──────────┬──────────┬──────────┬─────────┤
│  🗺️ /map │ ➕ /rate │📋/my-rat │👤/profil│
│          │          │  ings    │         │
└──────────┴──────────┴──────────┴─────────┘
```

Implémenté en tant que composant `<MobileNav>` dans le layout `(app)/layout.tsx`, fixé en bas via `fixed bottom-0` Tailwind, avec `safe-area-inset-bottom` pour les iPhones avec encoche.

---

## 10. Plan de développement

### Sprint 0 — Setup (3 jours)

|Tâche|Détail|
|---|---|
|Init Next.js|`npx create-next-app@latest guinness-app --typescript --tailwind --app`|
|Setup shadcn/ui|`npx shadcn@latest init`|
|Config Supabase|Projet Supabase, variables `.env.local`|
|Migration DB|SQL initial (tables, RLS, triggers, vues, PostGIS)|
|Storage bucket|`rating-photos` (public)|
|Supabase CLI|`supabase gen types typescript --local > types/database.types.ts`|
|Config PWA|`next-pwa` / Serwist, manifest.json, icônes|
|MapLibre|`npm install maplibre-gl`, import dynamique configuré|
|Setup Vercel|Connexion repo GitHub, variables d'env production|
|Middleware auth|Protection des routes `/rate`, `/my-ratings`, `/profile`|

---

### Sprint 1 — Authentification (4 jours)

|Tâche|Story|Priorité|
|---|---|---|
|Page `/auth/login`|US-02|Haute|
|Page `/auth/register`|US-01|Haute|
|Page `/auth/forgot-password`|US-03|Moyenne|
|Route `/auth/callback` (OAuth)|US-02|Haute|
|`lib/supabase/client.ts` + `server.ts`|—|Haute|
|Middleware auth (cookies SSR)|US-02|Haute|
|Auth store Zustand (état client)|—|Haute|
|Trigger SQL création profil|US-01|Haute|
|Layout `(auth)` minimal|—|Haute|

---

### Sprint 2 — Notation (5 jours)

|Tâche|Story|Priorité|
|---|---|---|
|Composant `StarRating` (demi-étoiles, tactile)|US-04|Haute|
|Page `/rate` — formulaire complet|US-04|Haute|
|Composant `PhotoCapture` (`<input capture>`)|US-04|Haute|
|Compression image côté client (canvas API)|US-04|Haute|
|API Route `POST /api/upload`|US-04|Haute|
|Hook `useGeolocation` (Browser API)|US-05|Haute|
|API Route `GET /api/places/nearby` (proxy Overpass)|US-05|Haute|
|Page `/rate/place` — PlaceSelector|US-05|Haute|
|Recherche Nominatim|US-05|Moyenne|
|API Route `POST /api/ratings`|US-04|Haute|

---

### Sprint 3 — Carte (4 jours)

|Tâche|Story|Priorité|
|---|---|---|
|Import dynamique MapLibre GL JS|US-08|Haute|
|Page `/map` avec tuiles Maptiler|US-08|Haute|
|Chargement marqueurs depuis `places_with_stats`|US-08|Haute|
|Clustering MapLibre natif|US-08|Haute|
|Couleur marqueurs selon note|US-08|Haute|
|Bottom sheet (Vaul) résumé lieu|US-08|Haute|
|Toggle Mes notes / Toutes|US-08|Haute|
|Filtre note minimale|US-09|Moyenne|
|Bouton recentrage (Browser Geolocation)|US-08|Moyenne|
|Accès public sans compte|US-08|Haute|

---

### Sprint 4 — Gestion des notes & Profil (4 jours)

|Tâche|Story|Priorité|
|---|---|---|
|Page `/my-ratings` (SSR + liste)|F-05|Haute|
|Page `/my-ratings/[id]` (détail, SSR)|F-05|Haute|
|Page `/my-ratings/[id]/edit` (SSR + form client)|US-06|Haute|
|API Route `PATCH /api/ratings/[id]`|US-06|Haute|
|API Route `DELETE /api/ratings/[id]`|US-07|Haute|
|TanStack Query invalidation cache|—|Haute|
|Page `/profile` (SSR + stats)|US-10|Moyenne|
|Formulaires modification pseudo / email / mdp|US-10|Moyenne|
|Upload avatar|US-10|Basse|
|Suppression de compte (`DELETE /api/profile`)|US-11|Basse|

---

### Sprint 5 — PWA, polish & tests (3 jours)

|Tâche|Détail|
|---|---|
|Service Worker offline|Cache tuiles + pages visitées|
|Gestion erreurs globale|Toast (shadcn/ui Sonner) sur erreurs réseau / Supabase|
|`safe-area-inset` mobile|Padding bottom nav iPhone avec encoche|
|Tests unitaires|`useGeolocation`, `lib/overpass`, `lib/nominatim`, `lib/geo`|
|Tests composants|`StarRating`, `RatingCard`, `PhotoCapture`, `PlaceSelector`|
|Tests E2E Playwright|Flux complet inscription → notation → carte (viewport mobile)|
|Lighthouse audit|Score PWA, Performance, Accessibilité ≥ 90|
|Core Web Vitals|LCP, FID, CLS sur mobile 4G simulé|
|Revue sécurité|RLS, headers Vercel, `SUPABASE_SERVICE_ROLE_KEY` server-only|
|Revue RGPD|Consentement géolocalisation, politique confidentialité|

---

### Récapitulatif planning

|Sprint|Durée|Livrable|
|---|---|---|
|Sprint 0|3 jours|Projet Next.js init, DB Supabase, Vercel connecté|
|Sprint 1|4 jours|Auth complète (email + OAuth) avec SSR cookies|
|Sprint 2|5 jours|Création notation avec photo et lieu géolocalisé|
|Sprint 3|4 jours|Carte MapLibre interactive (publique + communautaire)|
|Sprint 4|4 jours|Gestion des notes + profil complet|
|Sprint 5|3 jours|PWA, tests, Lighthouse ≥ 90, mise en production|
|**Total**|**~23 jours**|**MVP production-ready sur Vercel**|

---

## 11. Risques et mitigations

|Risque|Probabilité|Impact|Mitigation|
|---|---|---|---|
|Browser Geolocation refusée par l'utilisateur|Haute|Moyen|Dégradation gracieuse : saisie manuelle toujours disponible|
|`<input capture>` non supporté sur certains browsers|Faible|Faible|Fallback sur sélecteur de fichier classique|
|Overpass API lente ou indisponible|Moyenne|Élevé|Proxy Vercel avec cache `revalidate: 3600` + fallback saisie manuelle|
|Données OSM incomplètes (bars manquants)|Haute|Moyen|Saisie manuelle toujours disponible|
|Limite Nominatim (1 req/s, User-Agent requis)|Haute|Moyen|Debounce 1s côté client + header User-Agent sur le proxy|
|MapLibre WebGL non supporté (vieux Android)|Faible|Moyen|Message dégradé + lien vers la liste textuelle des notes|
|HTTPS requis pour Geolocation API|—|—|Garanti par Vercel sur tous les déploiements|
|Supabase Storage coût photos|Faible|Moyen|Compression canvas avant upload (max 800px, qualité 0.8)|
|Hydration mismatch SSR/CSR (MapLibre)|Moyenne|Moyen|`dynamic(() => ..., { ssr: false })` sur tous les composants MapLibre|
|Cookie session expiré silencieusement|Faible|Moyen|Middleware Supabase rafraîchit le token à chaque requête|

---

## 12. Définition of Done

Une story est considérée comme **Done** lorsque :

- [ ] Le code est écrit et typé en TypeScript (pas de `any` non justifié)
- [ ] La fonctionnalité passe tous ses critères d'acceptation
- [ ] Server vs Client Components correctement séparés (`'use client'` uniquement si nécessaire)
- [ ] Les tests unitaires / composants sont écrits et passent (`vitest run`)
- [ ] Aucune régression sur les stories précédentes
- [ ] La RLS Supabase est vérifiée pour toute écriture/lecture
- [ ] `SUPABASE_SERVICE_ROLE_KEY` n'est jamais exposé dans un Client Component
- [ ] La fonctionnalité est testée sur Chrome mobile ET Safari iOS (viewport 390px)
- [ ] Les cas d'erreur (réseau, GPS refusé, données invalides) sont gérés et affichés
- [ ] Aucun secret ou clé API n'est commité en dur (`NEXT_PUBLIC_` uniquement pour les clés publiques)
- [ ] Le déploiement Vercel preview passe sans erreur de build
- [ ] Lighthouse mobile ≥ 85 sur la page concernée

---

_PRD version 2.0 — Mars 2026. Stack migrée React Native → Next.js 15 / Vercel / Supabase._  
_Document vivant, à mettre à jour à chaque fin de sprint._