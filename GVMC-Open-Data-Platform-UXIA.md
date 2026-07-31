# GVMC Open Data Intelligence Platform — UX/IA Deliverable

---

## 1. Sitemap (Hierarchical)

```
GVMC Platform
├── Landing Page (public)
├── Home Dashboard (auth)
├── AI Assistant — Ask GVMC (public + auth)
├── Open Datasets
│   ├── Dataset List
│   ├── Dataset Detail
│   └── Dataset Preview/Download
├── Interactive City Map
│   ├── Map View (layers)
│   └── Layer Detail Panel
├── Analytics Dashboard
│   ├── Overview
│   └── Custom Chart Builder
├── Predictions
│   ├── Model List
│   └── Prediction Detail (e.g., Traffic Forecast)
├── Startup Hub
│   ├── Startup Directory
│   ├── Project Workspace
│   └── Resource Library
├── Research Workspace
│   ├── Notebooks/SQL Editor
│   ├── Shared Projects
│   └── Bookmarked Datasets
├── API Hub
│   ├── API Explorer (Swagger/GraphiQL)
│   └── API Key Management
├── Documentation
│   ├── Getting Started
│   ├── Guides
│   └── Changelog
├── Admin Portal
│   ├── User Management
│   ├── Dataset Management
│   └── System Health/Logs
└── Profile & Settings
    ├── Profile
    ├── Preferences
    └── API Keys / Security
```

---

## 2. Global Navigation & Layout Rules

**Desktop (≥1024px)**
- Persistent top navbar: Logo | primary nav (Home, Datasets, Map, Analytics, Predictions, AI Assistant) | search | notifications | profile menu.
- Secondary nav: left sidebar (collapsible) for section-specific pages (e.g., inside Research Workspace, Admin Portal).
- Max content width 1440px, 12-col grid, 24px gutters.
- Sticky "Ask GVMC" floating action button (bottom-right) on all pages.

**Mobile (<768px)**
- Bottom tab bar: Home, Datasets, Map, Assistant, More (drawer for Analytics/Predictions/Startup/Research/Docs/Admin).
- Top bar collapses to logo + hamburger + search icon.
- Sidebar sections become full-screen drawers.
- AI Assistant FAB collapses into bottom tab.

**Rules**
- Breadcrumbs on all pages nested >1 level deep.
- Active nav state via underline (desktop) / filled icon (mobile).
- Role-based nav items hidden (not disabled) if user lacks permission — reduces clutter.
- All primary nav items keyboard-reachable via Tab; skip-to-content link on every page.

---

## 3. Page-by-Page Breakdown

### 3.1 Landing Page
- **Purpose:** Convert visitors into explorers/sign-ups via a compelling intro to civic open data.
- **Goals:** (1) Understand platform value in <10s, (2) Reach Datasets/Map/Assistant without login.
- **Components:** Hero + CTA, live stat ticker (datasets count, API calls), featured datasets carousel, persona cards (Citizen/Researcher/Startup/Developer), footer with docs/API links.
- **Wireframe:** Desktop — full-width hero, 3-col feature grid, 4-col persona cards. Mobile — stacked single column, carousel becomes swipeable.
- **Data:** `{ datasetCount, apiCallsToday, featuredDatasets[] }` via `GET /api/v1/stats/summary`.
- **Accessibility:** Hero text contrast ≥4.5:1; carousel pausable and keyboard-navigable; all CTAs have visible focus rings.

### 3.2 Home Dashboard
- **Purpose:** Personalized entry point summarizing relevant datasets, alerts, and quick actions.
- **Goals:** (1) See what's new/relevant since last visit, (2) Jump to frequent tasks (search, map, assistant).
- **Components:** Widget grid (recent datasets, saved queries, city alerts, quick-ask input), customizable widget order.
- **Wireframe:** Desktop — 3-col widget grid. Mobile — vertical stack, widgets collapsible.
- **Data:** `GET /api/v1/users/{id}/dashboard` → `{ recentDatasets[], alerts[], savedQueries[] }`.
- **Accessibility:** Widgets are `<section>` landmarks with aria-labels; drag-to-reorder has keyboard alternative (move up/down buttons).

### 3.3 AI Assistant — Ask GVMC
- **Purpose:** Natural-language interface to query civic data without technical skill.
- **Goals:** (1) Get a direct answer with source citation, (2) Escalate to dataset/chart when AI can't answer precisely.
- **Components:** Chat thread, prompt input with suggested-prompt chips, "sources" panel per answer, feedback (thumbs up/down), conversation history sidebar.
- **Wireframe:** Desktop — chat center (60%), sources panel right (40%). Mobile — full-screen chat, sources as expandable card below answer.
- **Data:** `POST /api/v1/assistant/query { question }` → `{ answer, sources: [{datasetId, title, url}], confidence }`.
- **Accessibility:** Chat messages announced via `aria-live="polite"`; sources are real links, not just text.
- **Recommended prompt templates:**
  - "What is the trend of [metric] in [ward/area] over the last [timeframe]?"
  - "Compare [dataset A] and [dataset B] for [region]."
  - "Show me datasets related to [topic]."
  - "Predict [metric] for the next [timeframe]."
- **Provenance handling:** Every factual answer must cite ≥1 dataset ID + last-updated date; render as inline chips linking to Dataset Detail.
- **Fallback pattern:** If confidence < threshold, respond with "I couldn't find a precise answer — here are related datasets" + deep link to filtered Dataset List or Map layer.

### 3.4 Open Datasets
- **Purpose:** Central catalog for discovering, previewing, and downloading civic datasets.
- **Goals:** (1) Find a relevant dataset via search/filter, (2) Preview/download or send to Research Workspace.
- **Components:** Search bar with filters (category, format, update frequency, ward), dataset cards, dataset detail page (schema, sample rows, download, "Open in Research Workspace" button, API snippet).
- **Wireframe:** Desktop — filter sidebar (left, 25%) + card grid (75%). Mobile — filters as bottom-sheet modal, single-column cards.
- **Sample dataset schema:**
```json
{
  "dataset_id": "string",
  "title": "string",
  "category": "string",
  "description": "string",
  "format": "csv | json | geojson",
  "update_frequency": "daily | weekly | monthly | static",
  "last_updated": "ISO8601 datetime",
  "row_count": "integer",
  "fields": [
    { "name": "string", "type": "string|number|date|geo", "description": "string" }
  ],
  "source_agency": "string",
  "license": "string"
}
```
- **Example API:** `GET /api/v1/datasets?category=water&format=csv` → `{ results: [Dataset], total: 128 }`.
- **Accessibility:** Filter controls are labeled form elements; dataset cards keyboard-navigable with visible focus; schema table has proper `<th scope>`.

### 3.5 Interactive City Map
- **Purpose:** Spatial exploration of city datasets layered on a live map.
- **Goals:** (1) Toggle layers to find spatial patterns, (2) Click a feature to jump to related dataset/analytics.
- **Components:** Map canvas (Mapbox GL), layer control panel, legend, search/geocode box, feature popup, permalink/share button.
- **Default layers:** Wards boundary, Water supply infra, Waste collection points, Traffic sensors (if available).
- **Layer toggles:** Checkbox list grouped by category (Infrastructure, Environment, Transport, Civic Services).
- **Cluster strategy:** Client-side clustering (supercluster) for point layers >500 features; server-side vector tiles for >10k features.
- **Performance tips:** Use Mapbox vector tiles (MVT) over raw GeoJSON for large layers; lazy-load layers on toggle; debounce viewport-based re-fetch.
- **Deep linking:** Map state (center, zoom, active layers) encoded in URL query params — `?lat=17.68&lng=83.21&z=12&layers=water,traffic`; clicking a feature opens a side panel with a "View in Analytics" / "View in Datasets" link that pre-filters those pages.
- **Wireframe:** Desktop — map full-bleed, floating layer panel top-left, legend bottom-left. Mobile — map full-screen, layer panel as bottom drawer.
- **Data:** `GET /api/v1/map/layers/{layerId}?bbox=...` → GeoJSON/vector tile.
- **Accessibility:** Provide a non-map data-table alternative view toggle for screen-reader users; layer toggles are real checkboxes with labels; map controls keyboard-operable (zoom +/-, pan via arrow keys when focused).

### 3.6 Analytics Dashboard
- **Purpose:** Visualize trends and KPIs across civic datasets.
- **Goals:** (1) Understand a metric's trend at a glance, (2) Build/save a custom chart.
- **Components:** KPI cards, chart grid (line/bar/pie via ECharts), chart builder (dataset + field + chart-type selectors), export (PNG/CSV) button.
- **Wireframe:** Desktop — KPI row + 2-col chart grid. Mobile — stacked, charts horizontally scrollable if dense.
- **Data:** `GET /api/v1/analytics/{metric}?range=30d&groupBy=ward` → `{ series: [{date, value, ward}] }`.
- **Accessibility:** Charts include a hidden data-table equivalent (`<table class="sr-only">` or toggle); colorblind-safe palette; tooltips reachable via keyboard focus.

### 3.7 Predictions
- **Purpose:** Surface model-driven forecasts for planning and awareness.
- **Goals:** (1) See a forecast with confidence bounds, (2) Understand model inputs/limitations.
- **Components:** Model selector, forecast chart with confidence band, input parameter panel, model card (accuracy, last trained date, data sources).
- **Demo idea — Traffic Congestion Forecast (next 24h):**
  - **Inputs:** historical traffic sensor counts, time-of-day, day-of-week, weather, past-4-weeks pattern.
  - **Output fields:** `{ timestamp, predicted_congestion_index (0-100), lower_bound, upper_bound }`.
  - **Visual:** Line chart, forecast line + shaded confidence band, color-coded congestion zones on map overlay.
  - **Uncertainty display:** Shaded band (10th–90th percentile) + numeric "confidence: 82%" label.
- **Wireframe:** Desktop — chart (70%) + model card sidebar (30%). Mobile — chart full-width, model card below as accordion.
- **Data:** `GET /api/v1/predictions/traffic?horizon=24h` → `{ points: [{ts, value, low, high}], modelVersion, accuracy }`.
- **Accessibility:** Confidence band described in text alt-summary ("Congestion expected to rise 15% between 5–7 PM, ±8% uncertainty").

### 3.8 Startup Hub
- **Purpose:** Help startups discover data, prototype, and connect with civic problem statements.
- **Goals:** (1) Onboard and find relevant datasets fast, (2) Create a project workspace using platform data/APIs.
- **Components:** Startup directory, problem-statement board, project workspace (linked datasets, API keys, notes), resource library (grants, guidelines).
- **Onboarding flow:** Sign up → select interest domains → recommended datasets/problem statements → create first project → generate API key.
- **Collaboration primitives:** Shared project notes (markdown), dataset bookmarking, team invite by email, comment threads on problem statements.
- **Workspace integration:** Embedded Jupyter-lite (Pyodide-based) or hosted notebook link; optional embedded SQL editor against a read-only data warehouse view.
- **Wireframe:** Desktop — directory grid + project workspace as tabbed panel. Mobile — directory as list, workspace simplified to notes + dataset list (notebook opens in new tab).
- **Accessibility:** Kanban-style problem board has list-view alternative for screen readers; drag-drop has keyboard move actions.

### 3.9 Research Workspace
- **Purpose:** Power-user environment for analysis, notebooks, and shared research projects.
- **Goals:** (1) Bookmark/fork datasets into a working project, (2) Run/share analysis via notebook or SQL.
- **Components:** Project list, notebook/SQL editor pane, dataset bookmarks panel, version history, share/export.
- **Onboarding flow:** Create project → import/bookmark datasets → open notebook or SQL editor → save/share project link.
- **Collaboration:** Shared projects with role (owner/editor/viewer), inline notes/comments, forkable projects (clone with attribution).
- **Wireframe:** Desktop — 3-pane (dataset bookmarks | notebook | output/preview). Mobile — single-pane with tab switch; notebook editing recommended desktop-first (progressive enhancement note).
- **Data:** `POST /api/v1/research/projects/{id}/run { code }` → `{ output, executionTime }`.
- **Accessibility:** Code editor (Monaco/CodeMirror) supports keyboard-only operation; output announced via aria-live for status changes (running/complete/error).

### 3.10 API Hub
- **Purpose:** Enable developers to explore and integrate platform APIs.
- **Goals:** (1) Try an endpoint live, (2) Generate/manage an API key.
- **Components:** API explorer (Swagger UI/GraphiQL embed), endpoint list with search, code snippet generator (curl/JS/Python), API key management panel.
- **Wireframe:** Desktop — endpoint list sidebar + explorer main pane. Mobile — endpoint list only, "try it" opens explorer full-screen.
- **Data:** OpenAPI spec served at `/api/v1/openapi.json`.
- **Accessibility:** Explorer's interactive forms fully labeled; code blocks have "copy" button reachable via keyboard with confirmation announced.

### 3.11 Documentation
- **Purpose:** Central knowledge base for using the platform and APIs.
- **Goals:** (1) Find a getting-started guide fast, (2) Search docs by keyword.
- **Components:** Doc search, left-nav table of contents, markdown content pane, version/changelog banner.
- **Wireframe:** Desktop — 2-col (TOC + content). Mobile — TOC as collapsible top accordion.
- **Accessibility:** Proper heading hierarchy (h1→h3), skip-to-TOC link, code blocks with language labels for screen readers.

### 3.12 Admin Portal
- **Purpose:** Manage users, datasets, and platform health.
- **Goals:** (1) Approve/manage user roles, (2) Monitor dataset ingestion/system health.
- **Components:** User table (search/filter/role edit), dataset management (upload/version/retire), system health panel (API uptime, error logs), audit log.
- **Wireframe:** Desktop — sidebar (Users/Datasets/Health/Logs) + data table main pane. Mobile — simplified list views, bulk actions reduced to essential ones.
- **Data:** `GET /api/v1/admin/users?role=researcher`, `POST /api/v1/admin/datasets/{id}/publish`.
- **Accessibility:** Data tables sortable via keyboard; destructive actions (delete/retire) require confirm dialog with focus trap.

### 3.13 Profile & Settings
- **Purpose:** Manage personal account, preferences, and security.
- **Goals:** (1) Update profile/notification preferences, (2) Manage API keys/security.
- **Components:** Profile form, notification toggle list, API key list (create/revoke), theme/language preference, password/2FA management.
- **Wireframe:** Desktop — settings sidebar + form pane. Mobile — accordion sections.
- **Accessibility:** Form fields with visible labels and error messaging tied via `aria-describedby`.

---

## 4. Component Library Summary (Atomic Design)

| Component | Role | Key Props | Variants | Accessibility Notes |
|---|---|---|---|---|
| `Button` | Atom | label, onClick, variant, disabled | primary, secondary, ghost, danger | Visible focus ring, min 44px touch target |
| `Input` | Atom | label, value, onChange, error | text, search, number | Label always visible, error via aria-describedby |
| `Card` | Molecule | title, children, actions | dataset, stat, persona | Heading landmark inside |
| `NavBar` | Organism | items, activeRoute, user | desktop, mobile-drawer | Skip link, aria-current on active item |
| `DataTable` | Organism | columns, rows, sortable | compact, expandable | Sortable via keyboard, scoped th |
| `ChartWrapper` | Organism | data, type, a11yTable | line, bar, pie, area | Includes hidden data table fallback |
| `MapCanvas` | Organism | layers, center, zoom | full, embedded | Keyboard pan/zoom, table-view toggle |
| `ChatThread` | Organism | messages, onSend | assistant, embedded-widget | aria-live region, message roles announced |
| `FilterPanel` | Molecule | filters, onChange | sidebar, bottom-sheet | Real form controls, not divs |
| `Modal` | Organism | isOpen, onClose, children | confirm, form, drawer | Focus trap, Esc to close, returns focus on close |
| `Badge` | Atom | label, tone | info, success, warning, danger | Not color-only (icon/text pairing) |
| `Breadcrumb` | Molecule | path[] | — | nav landmark with aria-label |

---

## 5. Design Tokens & Breakpoints

**Color tokens (WCAG AA checked against listed backgrounds)**

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `color-bg` | #FFFFFF | Page background | — |
| `color-bg-alt` | #F4F6F8 | Section background | — |
| `color-primary` | #0B5FFF | Primary actions/links | 4.6:1 on white |
| `color-primary-dark` | #0A4ACC | Hover/active state | 6.1:1 on white |
| `color-secondary` | #0E9F6E | Success/secondary CTA | 4.8:1 on white |
| `color-accent` | #F59E0B | Highlights/alerts | 3.0:1 on white (use only for large text/icons, pair with dark text) |
| `color-danger` | #DC2626 | Errors/destructive | 4.5:1 on white |
| `color-text` | #1A1D21 | Primary text | 15.8:1 on white |
| `color-text-muted` | #5B6472 | Secondary text | 4.6:1 on white |
| `color-border` | #D9DEE3 | Dividers/borders | — |

**Typography scale:** base 16px, ratio 1.25 — 12 / 14 / 16 / 20 / 25 / 31 / 39px. Font: system-ui stack or Inter.

**Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64.

**Breakpoints:** `sm: 480px`, `md: 768px`, `lg: 1024px`, `xl: 1440px`. Mobile-first; layout shifts at `md` (nav collapse) and `lg` (sidebar appears).

---

## 6. Route Configuration JSON (excerpt)

```json
{
  "routes": [
    { "path": "/", "name": "Landing", "auth": false, "roles": [] },
    { "path": "/home", "name": "Home Dashboard", "auth": true, "roles": ["citizen","researcher","startup","developer","admin"] },
    { "path": "/assistant", "name": "AI Assistant", "auth": false, "roles": [] },
    {
      "path": "/datasets", "name": "Open Datasets", "auth": false, "roles": [],
      "children": [
        { "path": "/datasets/:id", "name": "Dataset Detail", "lazy": true }
      ]
    },
    { "path": "/map", "name": "Interactive City Map", "auth": false, "roles": [], "lazy": true },
    { "path": "/analytics", "name": "Analytics Dashboard", "auth": true, "roles": ["researcher","admin","startup"], "lazy": true },
    { "path": "/predictions", "name": "Predictions", "auth": true, "roles": ["researcher","admin","startup"], "lazy": true },
    {
      "path": "/startup-hub", "name": "Startup Hub", "auth": true, "roles": ["startup","admin"],
      "children": [
        { "path": "/startup-hub/projects/:id", "name": "Project Workspace" }
      ]
    },
    {
      "path": "/research", "name": "Research Workspace", "auth": true, "roles": ["researcher","admin"],
      "children": [
        { "path": "/research/projects/:id", "name": "Project", "lazy": true }
      ]
    },
    { "path": "/api-hub", "name": "API Hub", "auth": false, "roles": [] },
    { "path": "/docs", "name": "Documentation", "auth": false, "roles": [] },
    {
      "path": "/admin", "name": "Admin Portal", "auth": true, "roles": ["admin"],
      "children": [
        { "path": "/admin/users", "name": "User Management" },
        { "path": "/admin/datasets", "name": "Dataset Management" },
        { "path": "/admin/health", "name": "System Health" }
      ]
    },
    { "path": "/settings", "name": "Profile & Settings", "auth": true, "roles": ["citizen","researcher","startup","developer","admin"] }
  ]
}
```

---

## 7. Roles & Permissions Matrix

| Section | Citizen | Researcher | Startup | Developer | Admin |
|---|---|---|---|---|---|
| Landing / Docs / API Hub | View | View | View | View | View |
| AI Assistant | Use | Use | Use | Use | Use |
| Open Datasets | View/Download | View/Download/Bookmark | View/Download/Bookmark | View/Download | Full (manage) |
| Interactive Map | View | View | View | View | View |
| Analytics Dashboard | — | Full | View | — | Full |
| Predictions | — | Full | View | — | Full |
| Startup Hub | — | View | Full | — | Full |
| Research Workspace | — | Full | — | — | Full |
| Admin Portal | — | — | — | — | Full |
| Profile & Settings | Own | Own | Own | Own | Own + others (limited) |

---

## 8. Persona-Driven User Flows

**Flow 1 — Citizen: Ask a question**
Landing → AI Assistant → type question → answer + source chips → click source → Dataset Detail.

**Flow 2 — Researcher: Find dataset → analyze**
Home → Datasets (filter by category) → Dataset Detail → "Open in Research Workspace" → Notebook/SQL editor → save project → share link.

**Flow 3 — Startup founder: Onboard → prototype**
Landing → Sign up → Startup Hub (select interest domains) → recommended datasets/problem statements → create Project Workspace → generate API key → embedded notebook.

**Flow 4 — City official (Admin): Monitor & manage**
Login → Home Dashboard (alerts widget) → Admin Portal → Dataset Management (approve new upload) → System Health (check ingestion status).

**Flow 5 — Developer: Integrate API**
Landing → API Hub → browse endpoints → "Try it" (live call) → copy code snippet → Settings → generate API key → integrate.

---

## 9. Minimal Hackathon MVP Scope (48–72h)

**P0 (must-have for demo)**
1. Nav + Layout shell (desktop + mobile) — 4h — Frontend
2. Landing Page — 3h — Frontend + Designer
3. Open Datasets list + detail (static/sample data) — 6h — Frontend + Data Engineer
4. Interactive Map with 2 sample layers — 8h — Frontend + Data Engineer
5. AI Assistant basic Q&A (retrieval + canned/LLM answer w/ source citation) — 10h — Backend/API + Frontend
6. One polished Analytics chart (real or sample data) — 5h — Frontend + Data Engineer
7. One Predictions demo (traffic or water forecast, mocked model) — 6h — Backend/API + Frontend
8. API Hub — 1 documented endpoint with live "try it" — 4h — Backend/API
9. Auth (basic role simulation, no full RBAC) — 3h — Backend/API
10. Demo script + rehearsal — 2h — All

**Subtotal ≈ 51h** (fits 48–72h with buffer)

**P1 (high, if time remains)**
- Startup Hub directory (static) — 4h
- Documentation page (basic) — 3h
- Profile & Settings basic form — 3h

**P2 (nice-to-have)**
- Research Workspace notebook embed — 6h
- Admin Portal full CRUD — 6h
- Dark mode / theming — 2h

---

## 10. Stretch Features (Post-Hackathon Roadmap)

- Full RBAC with SSO (Google/GovID)
- Real-time data ingestion pipelines + streaming map layers
- Advanced ML predictions (multi-model comparison, retraining UI)
- Full Research Workspace with hosted Jupyter + version control
- Public API rate-limiting/quota dashboard
- Multilingual support (Telugu + English)
- Offline/PWA support for low-connectivity citizen access
- Community feedback loop (dataset requests, upvoting)

---

## 11. Demo Checklist & 5-Minute Script

**Checklist**
- [ ] Seed dataset loaded (e.g., ward-wise water supply + traffic sensor sample)
- [ ] AI Assistant pre-tested with 3 known-good questions
- [ ] Map layers pre-cached for smooth toggle
- [ ] Prediction demo has a compelling, visually clear scenario
- [ ] Fallback screenshots/video ready in case of live-demo failure
- [ ] Devices/network tested (venue wifi is often unreliable)

**Script (5 min)**
1. **0:00–0:30** — Landing page: state the problem (fragmented civic data) and the platform's promise.
2. **0:30–1:30** — AI Assistant: ask "What's the water supply trend in Ward 12 this month?" → show answer + cited dataset.
3. **1:30–2:30** — Interactive Map: toggle water + traffic layers, click a feature → deep-link into Analytics.
4. **2:30–3:30** — Analytics Dashboard: show the pre-built chart tied to that ward.
5. **3:30–4:15** — Predictions: show traffic congestion forecast with confidence band.
6. **4:15–4:45** — API Hub: "try it" live call, show how a developer/startup would integrate.
7. **4:45–5:00** — Close: roadmap slide (stretch features) + call to action.

---

## 12. QA Checklist

- **Accessibility:** axe-core scan zero critical issues; keyboard-only walkthrough of all P0 pages; screen reader spot-check (NVDA/VoiceOver) on Assistant, Map, Datasets.
- **Performance:** Lighthouse ≥90 performance on Landing/Datasets; map initial load <3s on 4G; lazy-load heavy chart/map bundles.
- **Cross-browser:** Chrome, Safari, Firefox latest; iOS Safari + Android Chrome mobile check.
- **Testing:** Unit tests for core components (Button, DataTable, ChartWrapper); one E2E happy-path test per P0 flow (Playwright/Cypress).
- **Content:** No lorem ipsum in final demo; all copy proofread.

---

## 13. Handoff Assets List

- Component library (Storybook or Figma component set) with tokens applied
- Design tokens file (JSON/CSS variables)
- Sample dataset (CSV/GeoJSON) + schema doc
- OpenAPI spec (`openapi.json`)
- Route JSON (as in Section 6)
- Figma frames: Landing, Home, Assistant, Datasets, Map, Analytics, Predictions (desktop + mobile)
- Demo script + seed data script
- README with setup instructions (env vars, API keys, run commands)

---

## 14. Success Metrics & KPIs (Post-Launch)

- **Adoption:** weekly active users by persona; dataset views/downloads per month.
- **Engagement:** AI Assistant queries/day; average session duration; return-visit rate.
- **Developer traction:** API keys issued; API calls/month; docs page views.
- **Data impact:** number of startup/research projects created; datasets forked/bookmarked.
- **Quality:** AI Assistant answer satisfaction (thumbs up rate); average page load time; accessibility audit score.
- **Civic impact:** citizen-reported issues resolved faster (if tied to service requests); prediction accuracy vs. actuals.

---

## Recommended Open-Source Libraries

| Need | Choice |
|---|---|
| Framework | Next.js (React) or Nuxt (Vue) |
| Map | Mapbox GL JS + Turf.js (or MapLibre GL for open-source) |
| Charts | Apache ECharts or Plotly.js |
| AI integration | Anthropic API (Claude) via serverless function, RAG over dataset metadata |
| Auth | Auth0, Clerk, or Supabase Auth |
| Notebook/SQL | Pyodide (in-browser Python) or Hex/Deepnote embed; SQL: CodeMirror + read-only Postgres view |
| API docs | Swagger UI / Redoc for REST, GraphiQL for GraphQL |
| Component dev | Storybook |
| Testing | Playwright (E2E), Vitest/Jest (unit), axe-core (a11y) |
