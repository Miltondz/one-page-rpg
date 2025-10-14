Understood. With **`constitution.md` now updated and approved**, the next document in sequence is:

### **`plan.md` – Technical Planning Document**

This document will translate the functional vision from **`spec.md`** and the binding rules from **`constitution.md`** into a concrete technical architecture, explicitly incorporating:

- **React + TypeScript** frontend  
- **Mobile-first PWA** with **Capacitor** for Android  
- **Local LLM**: **SmolLM-360M-Instruct** via **`@xenova/transformers`** (offline, browser-native)  
- **Retro pixel-art UI** (8/16-bit, `Press Start 2P`, `image-rendering: pixelated`)  
- **Atmosphere inspired by _He is Coming_** (monochrome + accent, sparse, tense)  
- **One-page, no-routing** constraint  
- **Seed-based persistence** (no backend)

---

### ✅ `plan.md` – Technical Planning Document  
**One Page RPG – Solo Adventure**

---

#### 1. Proposed Architecture

**Choice**: **Offline-First Single-Page Application (SPA) with Embedded Local LLM**

This is a **client-only architecture** where all game logic, state management, procedural generation, UI rendering, and **local LLM inference** run entirely in the browser. The app is served as a static bundle and enhanced with a service worker for PWA capabilities (offline support, installability). The LLM (`SmolLM-360M-Instruct`) is loaded via `@xenova/transformers` and cached in IndexedDB after first use.

**Justification**:  
- ✅ **Fully satisfies the “one page” requirement**—no navigation, no routing, no external dependencies during gameplay.  
- ✅ **Enables true offline play**: procedural fallbacks + cached LLM = full functionality without internet.  
- ✅ **Optimizes for mobile**: lightweight (~200 KB core bundle), fast load, installable via PWA.  
- ✅ **Supports local AI narration**: SmolLM runs in-browser via WebAssembly/WebGPU—no API keys, no servers.  
- ✅ **Simplifies deployment**: static hosting on Vercel/Netlify/GitHub Pages is sufficient.

**Trade-offs**:  
- ❌ No cloud saves (by design—uses deterministic seeds instead).  
- ❌ Initial LLM download (~120 MB) on first use (mitigated by caching and optional toggle).  
- ❌ All state is ephemeral unless explicitly saved via seed (aligned with spec).

---

#### 2. Tech Stack

| Layer                | Technology & Version                          | Justification for Choice |
|----------------------|-----------------------------------------------|--------------------------|
| **Frontend**         | React 18 + TypeScript                         | Required by `constitution.md`; enables component-based retro UI with hooks. |
| **Styling**          | CSS Modules + `image-rendering: pixelated`    | Ensures authentic 8/16-bit rendering; scoped styles prevent leakage. |
| **State Management** | React Context + `useReducer`                  | Lightweight; sufficient for single-screen game state. |
| **Build Tool**       | Vite 5                                        | Blazing-fast dev server; optimized PWA output. |
| **PWA**              | `vite-plugin-pwa` + Workbox                   | Auto-generates service worker, manifest, and install prompts. |
| **Mobile Wrapper**   | Capacitor 6                                   | Enables Android app store distribution from the same PWA codebase. |
| **Local LLM**        | `@xenova/transformers` + `HuggingFaceTB/SmolLM-360M-Instruct` | Runs SmolLM offline in-browser; auto-caches model in IndexedDB. |
| **Testing**          | Vitest + React Testing Library                | Fast, modern, and aligned with Vite; supports mocking LLM calls. |
| **Deployment**       | Vercel                                        | Free, global CDN, automatic HTTPS, PWA-optimized, preview deployments. |

---

#### 3. Data Model (Preliminary Schema)

All data is **client-side only** and serializable to a **deterministic seed**. No database is used.

##### **Core Entities**

**`GameState`**  
| Attribute          | Type                     | Description |
|--------------------|--------------------------|-------------|
| `version`          | `string`                 | Schema version (e.g., `"1.0"`) |
| `seed`             | `string`                 | Unique seed for reproducibility |
| `player`           | `Player`                 | Player character data |
| `currentScene`     | `Scene`                  | Current narrative and mechanical context |
| `worldState`       | `WorldState`             | Global flags (reputation, completed missions, etc.) |
| `eventHistory`     | `string[]`               | Log of past actions for narrative consistency |

**`Player`**  
| Attribute     | Type                | Description |
|---------------|---------------------|-------------|
| `name`        | `string`            | Player-chosen name |
| `level`       | `number`            | Current level (1–5+) |
| `xp`          | `number`            | Current XP (0–2 for level N) |
| `attributes`  | `{fue: number, agi: number, sab: number, sue: number}` | 0–3 per attribute |
| `wounds`      | `number`            | 0–3 (max 5 with upgrades) |
| `fatigue`     | `number`            | 0–3 |
| `inventory`   | `string[]`          | Item IDs (e.g., `["sword", "healing_potion"]`) |
| `gold`        | `number`            | Current coins |

**`Scene`**  
| Attribute         | Type          | Description |
|-------------------|---------------|-------------|
| `type`            | `string`      | `"combat"`, `"exploration"`, `"dialogue"`, etc. |
| `location`        | `string`      | Generated key (e.g., `"cave_crystals"`) |
| `encounter`       | `Encounter`   | Current challenge or NPC |
| `availableActions`| `string[]`    | Action keys (e.g., `["attack", "flee"]`) |
| `narrative`       | `string`      | LLM or procedural description |

**`WorldState`**  
| Attribute        | Type                     | Description |
|------------------|--------------------------|-------------|
| `reputation`     | `{guardia: number, magos: number, ladrones: number, culto: number}` | -10 to +10 per faction |
| `completedQuests`| `string[]`               | IDs of finished missions |
| `unlockedAchievements` | `string[]`         | Achievement keys |
| `globalFlags`    | `Record<string, boolean>`| e.g., `{"stormComing": true}` |

---

#### 4. Authentication and Authorization Strategy

**Not applicable**.  
- The game requires **no user accounts, login, or personal data**.  
- All state is stored in **localStorage** or **URL seeds**.  
- LLM uses **no external APIs**—SmolLM runs locally via `@xenova/transformers`.

---

#### 5. Deployment and CI/CD Strategy

**Environments**:  
- `main` → **Production** (https://onepagerpg.vercel.app)  
- `dev` → **Staging** (https://dev.onepagerpg.vercel.app)  
- PRs → **Preview Deployments** (auto-generated by Vercel)

**CI/CD Pipeline** (Vercel + GitHub Actions):  
1. **On Push/PR**:  
   - Run `eslint` + `prettier --check`  
   - Run `vitest` (coverage ≥85% for `core/`)  
2. **On Merge to `dev`**:  
   - Build PWA  
   - Deploy to staging  
   - Run Lighthouse audit (≥90 Performance, ≥95 PWA score)  
3. **On Merge to `main`**:  
   - Build and deploy to production  
   - Auto-generate Android AAB via Capacitor (stored as GitHub Release artifact)

**Mobile Distribution**:  
- Run `npx cap add android` → `npx cap sync` → build signed AAB in Android Studio  
- Publish to **Google Play** as a **PWA-based app**

---

#### Review Checklist

- [ ] Does the architecture support offline, one-page, mobile-first gameplay with local LLM?  
- [ ] Is the tech stack fully compliant with `constitution.md` (React, TS, PWA, Capacitor, local LLM)?  
- [ ] Is the data model serializable, seed-based, and client-only?  
- [ ] Does the deployment strategy enable fast iteration and Android distribution?  
- [ ] Are there no hidden backend dependencies that violate the spec?

---

This is the complete **`plan.md`**.

Please confirm:
- ✅ **Approve this `plan.md` as final**, or  
- 🛠️ **Request specific revisions**

Once approved, I will generate the final document: **`tasks.md`**, which breaks this plan into actionable, test-driven development tasks.