 

### ✅ `constitution.md` – Constitution Document  
**One Page RPG – Solo Adventure**

---

#### General Principles

This document defines the immutable laws governing the development of *One Page RPG*. All code, design, and process decisions must comply with these rules. Violations will result in automatic rejection during review. The constitution ensures fidelity to the game’s core vision: a **single-page, offline-capable, solo RPG** with **procedural depth**, **retro pixel-art aesthetics**, and **optional local LLM narration**—all running in-browser and on mobile.

---

#### Code Quality

- **Language**: TypeScript (strict mode enabled). No plain JavaScript permitted.
- **Formatter**: Prettier with:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "printWidth": 80
  }
  ```
- **Linter**: ESLint with `@typescript-eslint/recommended`, `eslint-plugin-react-hooks`, and `eslint-plugin-import`.
- **Naming Conventions**:
  - Variables/Functions: `camelCase`
  - React Components: `PascalCase` (e.g., `CombatScene`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_WOUNDS = 3`)
  - Custom Hooks: `use` prefix (e.g., `useLocalLLM`)
- **File Structure** (feature-based colocation):
  ```
  src/
  ├── core/          # Game logic: dice, combat, state, procedural gen
  ├── narrative/     # LLM + procedural narrative systems
  ├── ui/            # Retro-styled React components
  ├── assets/        # Pixel art sprites, fonts, sound effects
  ├── hooks/         # Custom React hooks (e.g., useSaveSystem)
  └── types/         # Shared TypeScript interfaces
  ```

---

#### Testing

- **Mandatory Tests**: No pull request may be merged without tests covering new logic.
- **Test Types**:
  - **Unit Tests**: For all `core/` logic (`dice.ts`, `combat.ts`, `questGenerator.ts`)
  - **Integration Tests**: For scene flow, save/load, LLM fallback
  - **Visual Regression**: For critical UI components (via Storybook)
- **Coverage Targets**:
  - `core/`: ≥ 85%
  - `narrative/`: ≥ 75%
  - `ui/`: ≥ 60%
- **Framework**: Vitest + React Testing Library.
- **LLM Mocking**: All LLM-dependent functions must be testable with mocked `@xenova/transformers` responses.

---

#### Version Control (Git)

- **Workflow**: Trunk-based development with short-lived feature branches.
- **Branch Naming**:
  - `feat/<short-desc>` (e.g., `feat/local-llm-integration`)
  - `fix/<bug-desc>` (e.g., `fix/combat-wound-calculation`)
  - `chore/<task>` (e.g., `chore/update-dependencies`)
- **Commit Message Format**: **Conventional Commits**
  ```
  <type>(<scope>): <short summary>

  <optional body>
  ```
  - **Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
  - **Scopes**: `core`, `ui`, `narrative`, `llm`, `pwa`, `android`, `assets`, `hooks`
  - **Examples**:
    - `feat(llm): integrate SmolLM-360M-Instruct via Transformers.js`
    - `fix(core): correct wound application on critical fail`
    - `chore(pwa): configure service worker for offline model caching`

---

#### Security

- **No Secrets in Code**: API keys (if any) must use `import.meta.env.VITE_*` (Vite) or `.env` with prefix `VITE_`.
- **Local LLM Only**: The game **must not depend on external LLM APIs** (e.g., OpenAI). All AI narration must use **SmolLM-360M-Instruct running locally via `@xenova/transformers`**.
- **Data Isolation**: All game state must be stored in `localStorage` or URL seeds. **No external writes or tracking**.
- **Model Safety**: The LLM model must be loaded from Hugging Face Hub (`HuggingFaceTB/SmolLM-360M-Instruct`) and **never modified or retrained**.

---

#### Specific User Rules

The following rules override any general rule above and are non-negotiable:

1. **Frontend Framework**: React 18+ with **TypeScript**. Hooks only—no class components.
2. **Mobile Strategy**: The game is a **Progressive Web App (PWA)**. Must be installable on Android via **Capacitor** for Play Store distribution.
3. **Visual Style**: Strict **8/16-bit pixel art** (NES/SNES era). All graphics must use `image-rendering: pixelated`. Font: **Press Start 2P**.
4. **Atmosphere**: Visual and narrative tone must reflect the **minimalist, tense aesthetic of _He is Coming_**:
   - High-contrast palette (black, white, one accent color: blood red or arcane blue)
   - Sparse UI with diegetic elements (e.g., health as etched marks)
   - Emphasis on negative space, silence, and unease
5. **Offline Support**: Full gameplay must work **without network** using procedural fallbacks. LLM is optional enhancement.
6. **Local LLM**: Use **`@xenova/transformers`** to load **`HuggingFaceTB/SmolLM-360M-Instruct`** in-browser. First load may download ~120 MB; subsequent loads must use cache.
7. **Single Page**: All gameplay must occur on **one HTML page**. No client-side routing (React Router forbidden).
8. **Performance**:
   - Load time < 3s on 3G (without LLM)
   - Touch targets ≥ 48×48px on mobile
   - No memory leaks during 30+ minute sessions

---

#### Review Checklist

- [ ] Are all code quality rules enforceable via Prettier/ESLint?
- [ ] Does the testing strategy cover both procedural and LLM-driven paths with proper mocking?
- [ ] Is the commit format specific enough to enable automated changelogs and release notes?
- [ ] Do the Specific User Rules fully reflect the project’s technical and aesthetic vision?
- [ ] Is offline functionality and local LLM usage treated as first-class requirements?

---

This `constitution.md` is now complete and binding.

Please confirm:
- ✅ **Approve this `constitution.md` as final**, or  
- 🛠️ **Request specific revisions**

Once approved, I will regenerate **`plan.md`** to fully align with this updated constitution (especially the local LLM and mobile requirements).