
**One Page RPG – Solo Adventure**

---

#### 1. Product Summary

“One Page RPG” is a **mobile-first Progressive Web App (PWA)** built with React that delivers a complete, self-contained solo fantasy role-playing game on a single responsive screen. It combines **procedural narrative generation**, a **lightweight 2d6 resolution system**, **retro pixel-art visuals** (8/16-bit), and optional **LLM-assisted storytelling** to enable immersive, offline-capable adventures playable in under 60 minutes. The entire experience—character creation, exploration, combat, and progression—fits on one page with no installation required beyond adding to the home screen.

---

#### 2. Goals

- Deliver a **fully playable solo RPG session in under 60 minutes**, from cold start to meaningful resolution, on **mobile and desktop**.
- Generate **infinite, coherent, atmospheric adventures** using layered procedural systems, with optional LLM augmentation for richer narration.
- Maintain **mechanical simplicity** (2d6 + attribute) while enabling **strategic depth** through risk/reward outcomes, wounds, fatigue, and equipment choices.
- Ensure **full offline functionality** via deterministic procedural fallbacks when LLM or network is unavailable.
- Provide **persistent, shareable game states** using seed-based saving that works across devices and sessions.
- Achieve **true mobile parity**: touch-friendly UI, fast load times (<3s on 3G), and PWA installability.

---

#### 3. Non-Goals

- **No native iOS/Android apps**—the product is a **PWA only**, wrapped for app stores via Capacitor if needed.
- **No real-time multiplayer or live collaboration**—only asynchronous social features (e.g., “ghost” actions) in future phases.
- **No complex 3D rendering or heavy animations**—visuals are strictly **8/16-bit pixel art** with minimal sprite-based rendering.
- **No user accounts, cloud sync, or backend server**—all data is stored client-side via **localStorage** or **URL seeds**.
- **No modding or user-generated content editors** in the initial release.

---

#### 4. Primary Personas

##### **Persona 1: Alex, the Casual Solo Player**  
- **Role:** Busy professional who plays during short breaks on their phone.  
- **Goals:** Start and finish a satisfying adventure in one sitting; experience surprise and progression without setup.  
- **Frustrations:** Apps that require signups, long downloads, or don’t work offline.  
- **Key Quote:** *“I want to feel like a hero for 10 minutes—no downloads, no signups, just tap and play.”*

##### **Persona 2: Taylor, the Solo RPG Enthusiast**  
- **Role:** Fan of journaling RPGs and procedural systems like Ironsworn.  
- **Goals:** Explore emergent stories, track long-term character arcs, and replay with different seeds or choices.  
- **Frustrations:** Static content, lack of mechanical feedback, or games that don’t support offline or procedural depth.  
- **Key Quote:** *“I want a system that surprises me but still feels consistent—like a GM in a box I can carry in my pocket.”*

---

#### 5. User Scenarios

##### **Scenario 1: Quick Lunchtime Adventure (Mobile)**  
Alex opens the game on their phone during a break. They create a character in 30 seconds (distributing 6 points across 4 attributes, picking 2 starting items). The game generates: *“A magical storm transports you to unknown lands.”* They explore a crystal cave, encounter a wolf, and choose to fight. Rolling 2d6 + Strength yields a partial success—they kill the wolf but take a wound. They earn 1 XP, 3 gold, and a clue toward a hidden shrine. They save the seed and close the tab—all in 12 minutes, **entirely offline**.

##### **Scenario 2: Multi-Session Campaign (Cross-Device)**  
Taylor has played three sessions on mobile and reached Level 3. Their character has +1 Wisdom, a Grimorio, and “Diplomat” reputation with the Mage Circle. Starting a new mission (*“Investigate a supernatural mystery in ancient ruins”*), they use their Grimorio to interpret arcane symbols. The Oracle reveals an NPC is an impostor. Taylor negotiates instead of fighting, gaining an ally. After completing the quest, they level up, unlock the “Truth-Seeker” achievement, and share the adventure seed with a friend via QR code.

---

#### 6. User Stories
Epic: Core Game Engine & State Management
-----------------------------------------

### As a new player, I want to create a character in under a minute so I can start playing immediately.

-   [CORE] Define `Player` TypeScript interface with attributes, wounds, fatigue, XP, inventory
-   [CORE] Implement character creation logic: distribute 6 points across 4 attributes (0--3 max each)
-   [UI] Build retro-styled character sheet component with pixel-art checkboxes (`FUE: ▢▢▢`)
-   [UI] Implement touch-friendly item selection (2 from 6 options) with visual feedback
-   [CORE] Generate unique adventure seed on creation and store in URL/localStorage

### As a returning player, I want to level up my character and choose new equipment so I feel meaningful progression.

-   [CORE] Implement XP tracking and level-up logic (3 XP per level)
-   [CORE] Add level-up rewards: +1 attribute point, heal wounds, choose 1 new item
-   [UI] Create level-up modal with retro animation and equipment selection grid

### As an experienced player, I want to track wounds, fatigue, and XP so I can manage risk strategically.

-   [CORE] Add fatigue system: -1 to all rolls at max fatigue, recover on rest
-   [CORE] Implement wound tracking (max 3, expandable via upgrades)
-   [UI] Display wounds/fatigue as pixelated hearts/energy bars with `image-rendering: pixelated`

* * * * *

Epic: Procedural Adventure Engine
---------------------------------

### As a player, I want the game to generate unique scenes, encounters, and missions so each session feels fresh.

-   [NARRATIVE] Implement base procedural generator using tables from `text_RPG_00.txt` (locations, encounters, challenges)
-   [NARRATIVE] Build scene composer that combines location + encounter + challenge + consequence
-   [CORE] Add seed-based RNG to ensure reproducible adventures from same seed

### As a player, I want to ask the Oracle yes/no or open-ended questions and receive contextual answers so I can drive the narrative.

-   [NARRATIVE] Implement Oracle engine with 2d6-based outcome tables (favorable/unfavorable)
-   [UI] Add Oracle input panel with question type selector (event, find, NPC reaction)
-   [NARRATIVE] Generate contextual follow-up details based on world state

### As a player, I want rich sensory descriptions of locations so I feel immersed in the world.

-   [NARRATIVE] Build atmosphere generator with mood-based templates (mysterious, dangerous, etc.)
-   [NARRATIVE] Add sensory detail system (sight, sound, smell, feeling) per location type

* * * * *

Epic: Local LLM Integration (SmolLM-360M-Instruct)
--------------------------------------------------

### As a player, I want LLM-enhanced narrative that adapts to my character state, inventory, and recent actions.

-   [LLM] Install `@xenova/transformers` and verify SmolLM-360M-Instruct loads in browser
-   [LLM] Create `LLMService` class with `generateNarrative(context: LLMContext)` method
-   [LLM] Design `LLMContext` interface: `{ player, location, recentEvents, inventory, worldState }`
-   [LLM] Build dynamic prompt template that injects full game state into LLM query
-   [LLM] Implement fallback to procedural generation if LLM fails or is disabled

### As a player, I want NPCs with unique, coherent dialogue based on their personality and memory of my actions.

-   [LLM] Extend `LLMContext` to include NPC data: `{ name, personality, goal, memory, relationship }`
-   [LLM] Create NPC dialogue prompt template with personality modifiers
-   [CORE] Implement NPC memory system: log player interactions and adjust relationship score
-   [LLM] Generate dialogue with consistent tone (friendly, hostile, mysterious)

### As a player, I want contextual descriptions that reflect time of day, weather, and exploration history.

-   [LLM] Enhance location prompts with dynamic conditions: `{ timeOfDay, weather, visitedBefore }`
-   [CORE] Add world state tracking for time/weather cycles
-   [LLM] Generate varied sensory descriptions even for revisited locations

### As a player, I want a narrative journal that summarizes my adventure in a unique, stylized way.

-   [LLM] Implement journal generator that condenses recent events into 2--3 sentence log
-   [UI] Display journal entries in retro terminal style with typewriter animation
-   [CORE] Store journal entries in game state for seed-based replay

* * * * *
Epic: LLM Integration (Offline, Local -- SmolLM-360M-Instruct)
-------------------------------------------------------------

### As a player, I want the game to use a local LLM for dynamic, context-aware narration so each moment feels unique and reactive.

-   [LLM] Install `@xenova/transformers` via `npm install @xenova/transformers`
-   [LLM] Create `LocalLLMService` that loads `HuggingFaceTB/SmolLM-360M-Instruct` using `pipeline('text-generation', modelId)`
-   [LLM] Implement model caching via browser IndexedDB (handled automatically by Transformers.js)
-   [LLM] Build dynamic prompt builder that injects:
    -   Player: `name, level, attributes, wounds, fatigue`
    -   Inventory: `["Espada", "Poción"]`
    -   Location: `"cueva con cristales"`
    -   Last 3 events: `["derrotó lobo", "encontró mapa", "descansó"]`
    -   Scene type: `"exploration"`
-   [LLM] Generate narrative with params: `max_new_tokens: 120, temperature: 0.8, top_p: 0.95`
-   [Core] Fallback to procedural generation if model fails to load or user disables LLM

### As a player, I want NPCs to have unique, personality-driven dialogue so interactions feel alive.

-   [LLM] Extend prompt for NPCs:

    1

    2

    3

    "Eres {name}, un/a {occupation} {personality}. Tu objetivo es {goal}.

    El jugador tiene: {inventory}. Última interacción: {lastDialogue}.

    Responde en 1--2 oraciones en tono {mood}."

-   [Core] Implement `NPCMemory` that stores last interaction per NPC
-   [UI] Display NPC name and mood indicator (😊/😐/😠) above dialogue
-   [LLM] Throttle calls: cache dialogue per NPC state to avoid redundant generation

### As a player, I want atmospheric descriptions that adapt to time, weather, and mood so exploration feels fresh.

-   [Core] Track global state: `timeOfDay` (dawn/day/dusk/night), `weather` (clear/rain/storm/fog)
-   [LLM] Build environmental prompt:

    1

    2

    3

    "Describe {location} a {timeOfDay} durante {weather}.

    Incluye detalles sensoriales (vista, sonido, olor).

    El estado de ánimo es {mood}. Máximo 100 palabras."

-   [LLM] Only call LLM for new location + time/weather combo; cache results

### As a player, I want the LLM to suggest world changes based on my moral choices.

-   [Core] Log key decisions: `killedSurrenderedEnemy`, `stoleFromVillage`, `savedNPC`
-   [LLM] After major choice, generate consequence prompt:

    1

    2

    "El jugador {action}. ¿Qué consecuencia narrativa razonable y coherente ocurre en el mundo?

    Menciona un cambio en reputación, clima, o evento futuro. 1 oración."

-   [Core] Apply consequence to `WorldState` (e.g., `reputation.guardia -= 2`)

### As a player, I want a narrative log or "journal" that summarizes my adventure in a stylized way.

-   [LLM] After each scene, generate log entry:

    1

    2

    "En estilo literario en tercera persona, resume en una oración poética:

    '{player} {action} en {location}.'"

-   [UI] Add "Diario de Aventuras" panel showing chronological, stylized entries
-   [Core] Store entries in `GameState.eventHistory` as strings

### As a developer, I need the LLM to work offline on mobile after first load.

-   [PWA] Pre-cache model assets via service worker (or rely on Transformers.js auto-cache)
-   [UI] Show download progress on first LLM use: "Descargando IA narrativa (120 MB)..."
-   [LLM] Provide toggle: "Usar IA narrativa" (on by default if model loaded)
-   [Android] Verify model loads in Capacitor WebView (no CORS issues)
Epic: Core Gameplay Loop
------------------------

### As a player, I want to resolve actions using 2d6 + attribute vs. difficulty so I experience clear risk/reward outcomes.

-   [CORE] Implement 2d6 dice roller with visual animation
-   [CORE] Build resolution engine: map roll + attribute to outcome (Critical Fail → Critical Success)
-   [UI] Show outcome with retro-styled feedback (color-coded, sound effect)

### As a player, I want to engage in tactical combat with defined rules so I can make meaningful tactical choices.

-   [CORE] Implement combat system: initiative, attack/defend/flee actions, damage calculation
-   [CORE] Add enemy definitions from `text_RPG_00.txt` (Goblin, Wolf, Skeleton, etc.)
-   [UI] Create combat scene with pixel-art enemy sprites and health bars

### As a player, I want to complete missions and earn rewards (XP, gold, gear) so I stay motivated to continue.

-   [NARRATIVE] Implement mission generator using 2d6 mission type table
-   [CORE] Add reward system: XP, gold, items, reputation based on mission difficulty
-   [UI] Display mission completion screen with retro victory animation

* * * * *

Epic: Mobile PWA & Offline Experience
-------------------------------------

### As a mobile user, I want the UI to be touch-optimized with large buttons and readable text so I can play comfortably.

-   [UI] Ensure all interactive elements ≥ 48×48px on mobile
-   [UI] Implement responsive layout: narrative panel + character sheet side-by-side on desktop, stacked on mobile
-   [UI] Use `Press Start 2P` font with fallback for readability

### As a commuter, I want the game to work fully offline so I can play on the subway or in areas with poor signal.

-   [PWA] Configure Vite PWA plugin with service worker for full offline caching
-   [CORE] Ensure all procedural systems work without network
-   [LLM] Verify SmolLM model loads from cache after first download

### As a PWA user, I want to install the game on my home screen so it feels like a native app.

-   [PWA] Add `manifest.json` with icons, theme color, and display mode (`standalone`)
-   [PWA] Implement install prompt for Android/iOS
-   [ANDROID] Wrap PWA with Capacitor and build signed AAB for Play Store

Epic: Mobile & Offline Experience
(Enhanced for LLM)

[PWA] Ensure SmolLM model loads in <10s on 4G (test on mid-tier Android)
[UI] Add “Modo Ligero” option that disables LLM to save storage/bandwidth
[Storage] Monitor IndexedDB usage; warn if >200 MB

* * * * *

Epic: Persistence & Sharing
---------------------------

### As a player, I want to save my game state via a unique seed so I can resume later without accounts.

-   [CORE] Implement full game state serialization to deterministic seed (JSON + compression)
-   [CORE] Add seed deserialization to restore exact game state
-   [UI] Display seed in shareable format (text + QR code)

### As a player, I want to share my seed with others via URL or QR code so they can replay my exact adventure.

-   [UI] Generate QR code from seed using `qrcode` library
-   [CORE] Support loading game from URL query param (`?seed=...`)
-   [UI] Add "Copy Seed" and "Share" buttons with native share API

### As a player, I want to unlock achievements based on my playstyle (e.g., pacifist, explorer) so I feel recognized.

-   [CORE] Implement achievement system with progress tracking
-   [CORE] Add hidden achievements (e.g., "Prophecy Fulfilled")
-   [UI] Create retro achievement notification with animation
---

#### 7. Review Checklist

- [ ] Are the product goals aligned with delivering a fast, self-contained, solo RPG experience?  
- [ ] Do the user stories cover both casual and enthusiast player needs?  
- [ ] Are acceptance criteria testable and unambiguous for an AI agent to implement?  
- [ ] Are non-goals clearly defined to prevent scope creep?  
- [ ] Does the procedural system guarantee narrative variety while maintaining coherence and atmospheric tone?
 