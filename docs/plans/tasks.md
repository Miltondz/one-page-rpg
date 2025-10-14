Understood. Based on the **full project definition in `text_RPG_00.txt`**, the approved **`spec.md`**, the binding **`constitution.md`** (React, TypeScript, PWA, local LLM via `@xenova/transformers`, retro pixel art, _He is Coming_ atmosphere), and the technical **`plan.md`**, here is the **final, complete, and implementation-ready `tasks.md`**.

All tasks are:
- ✅ Scoped to **1–2 days of work**
- ✅ Tagged by component (`[UI]`, `[Core]`, `[LLM]`, etc.)
- ✅ Ordered by dependency
- ✅ Aligned with **offline-first**, **mobile**, and **local LLM** requirements
- ✅ Include **procedural fallbacks** for all LLM features

---

### ✅ `tasks.md` – Task Breakdown  
**One Page RPG – Solo Adventure**

---

## Epic: Character Creation & Progression

### As a new player, I want to create a character in under a minute so I can start playing immediately.
- [ ] [UI] Implement character creation screen with 4 attribute sliders (FUE, AGI, SAB, SUE), total = 6 points
- [ ] [UI] Add equipment selection grid (6 items, choose 2) with visual icons
- [ ] [Core] Enforce point distribution rules (no negative, total = 6)
- [ ] [Core] Serialize initial character state to `GameState` object
- [ ] [UI] Add “Start Adventure” button that triggers scene generation

### As a returning player, I want to level up my character and choose new equipment so I feel meaningful progression.
- [ ] [Core] Implement XP tracking and level-up logic (3 XP per level)
- [ ] [UI] Show level-up modal with: +1 attribute point, +1 equipment slot
- [ ] [Core] Validate attribute upgrades (max 3 per stat)
- [ ] [UI] Update character sheet in real-time after level-up

### As an experienced player, I want to track wounds, fatigue, and XP so I can manage risk strategically.
- [ ] [UI] Render wounds and fatigue as pixelated heart/moon icons (3 max each)
- [ ] [Core] Apply fatigue penalty (-1 to all rolls at max fatigue)
- [ ] [UI] Show XP progress bar (e.g., “0/3 XP”)

---

## Epic: Procedural Adventure Engine

### As a player, I want the game to generate unique scenes, encounters, and missions so each session feels fresh.
- [ ] [Core] Implement base procedural tables (locations, encounters, challenges) from `text_RPG_00.txt`
- [ ] [Core] Build scene generator that combines Table A + B + C into structured `Scene` object
- [ ] [Core] Add seed-based RNG for reproducible adventures
- [ ] [UI] Display generated scene description in narrative panel

### As a player, I want to ask the Oracle yes/no or open-ended questions and receive contextual answers so I can drive the narrative.
- [ ] [UI] Add “Ask Oracle” button that opens input modal
- [ ] [Core] Implement OracleEngine with 2d6-based logic (from spec)
- [ ] [UI] Display Oracle result with atmospheric phrasing (“Yes, but…”)

### As a player, I want rich sensory descriptions of locations so I feel immersed in the world.
- [ ] [Core] Integrate `atmosphereGenerator` and `sensoryGenerator` from `text_RPG_00.txt`
- [ ] [UI] Append sensory details to procedural scene descriptions

---

## Epic: LLM Integration (Offline, Local – SmolLM-360M-Instruct)

### As a player, I want the game to use a local LLM for dynamic, context-aware narration so each moment feels unique and reactive.
- [ ] [LLM] Install `@xenova/transformers` via `npm install @xenova/transformers`
- [ ] [LLM] Create `LocalLLMService` that loads `HuggingFaceTB/SmolLM-360M-Instruct` using `pipeline('text-generation', modelId)`
- [ ] [LLM] Implement model caching via browser IndexedDB (handled by Transformers.js)
- [ ] [LLM] Build **dynamic prompt builder** that injects:
  - Player: `name, level, attributes, wounds, fatigue`
  - Inventory: `["Espada", "Poción"]`
  - Location: `"cueva con cristales"`
  - Last 3 events: `["derrotó lobo", "encontró mapa", "descansó"]`
  - Scene type: `"exploration"`
- [ ] [LLM] Generate narrative with params: `max_new_tokens: 120, temperature: 0.8, top_p: 0.95`
- [ ] [Core] Fallback to procedural generation if model fails to load or user disables LLM

### As a player, I want NPCs to have unique, personality-driven dialogue so interactions feel alive.
- [ ] [LLM] Extend prompt for NPCs:
  ```
  "Eres {name}, un/a {occupation} {personality}. Tu objetivo es {goal}. 
  El jugador tiene: {inventory}. Última interacción: {lastDialogue}.
  Responde en 1–2 oraciones en tono {mood}."
  ```
- [ ] [Core] Implement `NPCMemory` that stores last interaction per NPC
- [ ] [UI] Display NPC name and mood indicator (😊/😐/😠) above dialogue
- [ ] [LLM] Throttle calls: cache dialogue per NPC state to avoid redundant generation

### As a player, I want atmospheric descriptions that adapt to time, weather, and mood so exploration feels fresh.
- [ ] [Core] Track global state: `timeOfDay` (dawn/day/dusk/night), `weather` (clear/rain/storm/fog)
- [ ] [LLM] Build environmental prompt:
  ```
  "Describe {location} a {timeOfDay} durante {weather}. 
  Incluye detalles sensoriales (vista, sonido, olor). 
  El estado de ánimo es {mood}. Máximo 100 palabras."
  ```
- [ ] [LLM] Only call LLM for **new location + time/weather combo**; cache results

### As a player, I want the LLM to suggest world changes based on my moral choices.
- [ ] [Core] Log key decisions: `killedSurrenderedEnemy`, `stoleFromVillage`, `savedNPC`
- [ ] [LLM] After major choice, generate consequence prompt:
  ```
  "El jugador {action}. ¿Qué consecuencia narrativa razonable y coherente ocurre en el mundo? 
  Menciona un cambio en reputación, clima, o evento futuro. 1 oración."
  ```
- [ ] [Core] Apply consequence to `WorldState` (e.g., `reputation.guardia -= 2`)

### As a player, I want a narrative log or “journal” that summarizes my adventure in a stylized way.
- [ ] [LLM] After each scene, generate log entry:
  ```
  "En estilo literario en tercera persona, resume en una oración poética: 
  '{player} {action} en {location}.'"
  ```
- [ ] [UI] Add “Diario de Aventuras” panel showing chronological, stylized entries
- [ ] [Core] Store entries in `GameState.eventHistory` as strings

### As a developer, I need the LLM to work offline on mobile after first load.
- [ ] [PWA] Ensure model loads in Capacitor WebView (test on Android)
- [ ] [UI] Show download progress on first LLM use: “Descargando IA narrativa (120 MB)…”
- [ ] [LLM] Provide toggle: “Usar IA narrativa” (on by default if model loaded)
- [ ] [UI] Add “Modo Ligero” option that disables LLM to save storage

---

## Epic: Core Gameplay Loop

### As a player, I want to resolve actions using 2d6 + attribute vs. difficulty so I experience clear risk/reward outcomes.
- [ ] [Core] Implement `roll2d6()` function with modifiers (advantage/disadvantage)
- [ ] [Core] Build resolution engine that maps roll → outcome (Critical Fail to Critical Success)
- [ ] [UI] Show dice animation and result banner on action

### As a player, I want to engage in tactical combat with defined rules so I can make meaningful tactical choices.
- [ ] [Core] Implement combat loop: initiative → player action → enemy action
- [ ] [Core] Add enemy stats (FUE, AGI, DEF, wounds) from `text_RPG_00.txt`
- [ ] [UI] Render combat scene with player/enemy sprites and health bars
- [ ] [UI] Show action buttons: Attack, Defend, Flee, Use Item

### As a player, I want to complete missions and earn rewards (XP, gold, gear) so I stay motivated to continue.
- [ ] [Core] Implement quest generator with 2d6 mission types
- [ ] [Core] Track quest objectives and completion
- [ ] [Core] Grant rewards on completion (XP, gold, equipment)

---

## Epic: Persistence & Sharing

### As a player, I want to save my game state via a unique seed so I can resume later without accounts.
- [ ] [Core] Serialize full `GameState` to deterministic seed (e.g., base64 + timestamp)
- [ ] [UI] Add “Save Adventure” button that copies seed to clipboard
- [ ] [Core] Implement `loadFromSeed(seed)` that reconstructs full state

### As a player, I want to share my seed with others via URL or QR code so they can replay my exact adventure.
- [ ] [UI] Generate shareable URL: `?seed=abc123`
- [ ] [UI] Add QR code generator (using `qrcode` npm package)
- [ ] [Core] Auto-load seed from URL on app start

### As a player, I want to unlock achievements based on my playstyle so I feel recognized.
- [ ] [Core] Implement `AchievementSystem` with triggers (e.g., `enemiesDefeated >= 1`)
- [ ] [UI] Show retro-style achievement notification on unlock
- [ ] [Core] Store earned achievements in `GameState`

---

## Epic: Mobile & Offline Experience

### As a mobile user, I want the UI to be touch-optimized with large buttons and readable text so I can play comfortably.
- [ ] [UI] Apply responsive design: min 48×48px touch targets on mobile
- [ ] [UI] Use `Press Start 2P` font with fallback
- [ ] [UI] Enable `image-rendering: pixelated` on all graphics

### As a commuter, I want the game to work fully offline so I can play on the subway or in areas with poor signal.
- [ ] [PWA] Configure `vite-plugin-pwa` with service worker caching
- [ ] [LLM] Ensure SmolLM model loads from cache after first download
- [ ] [Core] All procedural systems must work without network

### As a PWA user, I want to install the game on my home screen so it feels like a native app.
- [ ] [PWA] Add `manifest.json` with icons, name, and display: standalone
- [ ] [PWA] Register service worker and prompt install on mobile
- [ ] [Android] Wrap with Capacitor and build signed AAB for Play Store

---

This is the **final `tasks.md`**.

All four planning documents are now complete and aligned:
- ✅ `spec.md` — Functional vision  
- ✅ `constitution.md` — Binding rules  
- ✅ `plan.md` — Technical architecture  
- ✅ `tasks.md` — Actionable, testable tasks  

Ready for implementation.