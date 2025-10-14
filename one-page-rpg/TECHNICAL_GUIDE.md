# 🔧 GUÍA TÉCNICA - One Page RPG

**Versión:** 0.6.0  
**Para desarrolladores que quieren:** Extender, modificar o contribuir al motor

---

## 📖 ÍNDICE

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Estructura de Directorios](#estructura-de-directorios)
3. [Interfaces TypeScript Core](#interfaces-typescript-core)
4. [Sistemas Principales](#sistemas-principales)
5. [DiceSystem (2d6)](#dicesystem-2d6)
6. [ReputationSystem](#reputationsystem)
7. [NPCGenerator](#npcgenerator)
8. [NPCMemorySystem](#npcmemorysystem)
9. [CombatEngine](#combatengine)
10. [EconomySystem](#economysystem)
11. [Testing y Calidad](#testing-y-calidad)
12. [Setup y Build](#setup-y-build)
13. [Contribución](#contribución)

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Filosofía de Diseño

**Separation of Concerns:**
- **Core Systems:** Lógica de juego independiente
- **Game State:** Estado mutable del juego
- **Content:** Configuración JSON/YAML
- **UI:** Presentación (CLI, Web, etc.)

**Flujo de Datos:**
```
Content (JSON) → Game State → Core Systems → Actions → State Mutations → UI Updates
```

### Diagramas de Arquitectura

#### Sistema General
```
┌─────────────────────────────────────┐
│         Content Layer               │
│  (JSON configs, narratives, etc.)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Game State Manager            │
│  (Immutable state + reducers)       │
└──────────────┬──────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────┐      ┌──────────┐
│  Core    │      │  Content │
│ Systems  │◄────►│  Loaders │
└──────────┘      └──────────┘
      │
      ▼
┌──────────────────────────┐
│    UI Layer              │
│  (CLI, Web, Discord, etc)│
└──────────────────────────┘
```

#### Core Systems Interaction
```
┌─────────────┐      ┌───────────────┐
│ DiceSystem  │◄────►│ CombatEngine  │
└─────────────┘      └───────────────┘
       ▲                     ▲
       │                     │
       │              ┌──────┴──────┐
       │              │             │
┌──────┴──────┐  ┌───┴────┐  ┌────▼────┐
│ Reputation  │  │  NPC   │  │  Quest  │
│   System    │  │ Memory │  │ Manager │
└─────────────┘  └────────┘  └─────────┘
       ▲              ▲
       │              │
       └──────┬───────┘
              │
       ┌──────▼──────┐
       │  Economy    │
       │  System     │
       └─────────────┘
```

---

## 📂 ESTRUCTURA DE DIRECTORIOS

```
one-page-rpg/
├── src/
│   ├── core/                    # Core game logic
│   │   ├── systems/
│   │   │   ├── DiceSystem.ts    # Sistema 2d6
│   │   │   ├── ReputationSystem.ts
│   │   │   ├── NPCGenerator.ts
│   │   │   ├── NPCMemorySystem.ts
│   │   │   ├── CombatEngine.ts
│   │   │   ├── EconomySystem.ts
│   │   │   └── QuestManager.ts
│   │   └── utils/
│   │       ├── seedrandom.ts    # Seeded RNG
│   │       └── validators.ts
│   │
│   ├── types/                   # TypeScript interfaces
│   │   ├── gameState.ts
│   │   ├── npc.ts
│   │   ├── combat.ts
│   │   ├── quest.ts
│   │   └── reputation.ts
│   │
│   ├── content/                 # Content loaders
│   │   ├── GameLoader.ts
│   │   ├── NPCLoader.ts
│   │   └── QuestLoader.ts
│   │
│   ├── state/                   # State management
│   │   ├── GameState.ts
│   │   ├── actions.ts
│   │   └── reducers.ts
│   │
│   └── ui/                      # UI layer (CLI, web, etc.)
│       ├── cli/
│       │   ├── CLIRenderer.ts
│       │   └── commands.ts
│       └── web/
│           └── (future)
│
├── games/                       # Game content
│   ├── griswald-prologue/       # Default game
│   │   ├── config.json
│   │   ├── locations.json
│   │   ├── factions.json
│   │   ├── npcs/
│   │   ├── quests/
│   │   ├── items/
│   │   └── bestiary.json
│   └── examples/
│
├── tests/                       # Test suites
│   ├── unit/
│   │   ├── DiceSystem.test.ts
│   │   ├── ReputationSystem.test.ts
│   │   ├── NPCGenerator.test.ts
│   │   └── ...
│   ├── integration/
│   │   ├── combat.integration.test.ts
│   │   └── economy.integration.test.ts
│   └── e2e/
│       └── full-playthrough.test.ts
│
├── docs/                        # Documentation
│   ├── PLAYER_GUIDE.md
│   ├── DESIGNER_GUIDE.md
│   ├── TECHNICAL_GUIDE.md       # This file
│   └── API.md
│
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 🎯 INTERFACES TYPESCRIPT CORE

### GameState (`src/types/gameState.ts`)

```typescript
export interface GameState {
  // Meta
  gameId: string;
  version: string;
  seed: string;
  
  // Player
  player: Player;
  
  // World
  world: WorldState;
  
  // NPCs
  npcs: Map<string, NPC>;
  npcMemories: Map<string, NPCMemory>;
  
  // Factions
  factions: Map<string, Faction>;
  playerReputations: Map<string, number>;
  
  // Quests
  activeQuests: Quest[];
  completedQuests: Quest[];
  failedQuests: Quest[];
  
  // Combat
  combatState: CombatState | null;
  
  // Time
  time: {
    day: number;
    hour: number;
    season: Season;
  };
  
  // Flags
  flags: Map<string, boolean>;
  tags: Set<string>;
}

export interface Player {
  name: string;
  class: PlayerClass;
  level: number;
  xp: number;
  
  // Attributes
  attributes: {
    str: number;  // 0-5
    agi: number;
    wis: number;
    luk: number;
  };
  
  // Resources
  health: {
    current: number;
    max: number;
  };
  fatigue: {
    current: number;
    max: number;
  };
  gold: number;
  
  // Inventory
  inventory: Item[];
  equipment: Equipment;
  
  // Location
  currentLocation: string;
  
  // Status
  statusEffects: StatusEffect[];
}

export interface WorldState {
  entropy: number;  // 0-100
  factionPower: Map<string, number>;
  locations: Map<string, LocationState>;
  weather: WeatherType;
}
```

### NPC Types (`src/types/npc.ts`)

```typescript
export interface NPC {
  id: string;
  name: string;
  archetype: NPCArchetype;
  
  // Appearance
  appearance: {
    age: number;
    gender: 'male' | 'female' | 'non-binary';
    race: string;
    physique: string;
    facialFeatures?: string;
    clothing?: string;
  };
  
  // Personality
  personality: {
    traits: string[];
    motivation: Motivation;
    fear?: string;
    quirk?: string;
  };
  
  // Stats
  stats: {
    str: number;
    agi: number;
    wis: number;
    luk: number;
    health: number;
    combat: boolean;
  };
  
  // Relationships
  faction?: string;
  factionRep: number;
  
  // Secret
  secret: {
    text: string;
    severity: 'minor' | 'moderate' | 'major';
    baseShareChance: number;
    discovered: boolean;
  };
  
  // Inventory
  inventory: {
    items: Item[];
    gold: number;
    shop?: Shop;
  };
  
  // Location
  currentLocation: string;
  schedule?: Schedule;
  
  // Flags
  alive: boolean;
  hostile: boolean;
  
  // Procedural metadata
  seed: string;
  generated: boolean;
}

export type NPCArchetype =
  | 'merchant'
  | 'guard'
  | 'noble'
  | 'commoner'
  | 'scholar'
  | 'thief'
  | 'cultist'
  | 'mage'
  | 'hermit';

export type Motivation =
  | 'gold'
  | 'power'
  | 'knowledge'
  | 'revenge'
  | 'love'
  | 'survival'
  | 'redemption'
  | 'duty'
  | 'freedom'
  | 'faith';
```

### NPCMemory (`src/types/npc.ts`)

```typescript
export interface NPCMemory {
  npcId: string;
  
  // Relationship metrics
  relationship: number;  // -100 to +100
  trust: number;         // 0 to 100
  
  // Interaction history
  interactions: Interaction[];
  lastInteraction: number;  // timestamp
  
  // Knowledge
  knownFacts: Set<string>;
  promises: Promise[];
  favorsOwed: number;
  
  // Tags
  tags: Set<string>;  // e.g., 'saved-life', 'betrayed', 'romantic-interest'
}

export interface Interaction {
  type: InteractionType;
  timestamp: number;
  description: string;
  relationshipDelta: number;
  trustDelta: number;
}

export type InteractionType =
  | 'dialogue'
  | 'gift'
  | 'trade'
  | 'combat-aid'
  | 'betrayal'
  | 'favor-asked'
  | 'favor-done'
  | 'secret-shared'
  | 'promise-made'
  | 'promise-kept'
  | 'promise-broken';
```

### Combat Types (`src/types/combat.ts`)

```typescript
export interface CombatState {
  id: string;
  type: 'player-vs-enemies' | 'npc-vs-enemies';
  
  // Participants
  player: CombatEntity;
  allies: CombatEntity[];
  enemies: CombatEntity[];
  
  // State
  turn: number;
  currentPhase: 'player-turn' | 'enemy-turn' | 'ended';
  
  // History
  log: CombatLogEntry[];
  
  // Conditions
  escapeAllowed: boolean;
  escapeDifficulty: number;
}

export interface CombatEntity {
  id: string;
  name: string;
  
  // Stats
  health: {
    current: number;
    max: number;
  };
  defense: number;
  
  attributes: {
    str: number;
    agi: number;
    wis: number;
    luk: number;
  };
  
  // Combat state
  statusEffects: StatusEffect[];
  advantage: boolean;
  disadvantage: boolean;
  
  // AI (for NPCs/enemies)
  aiType?: 'aggressive' | 'defensive' | 'strategic';
}

export interface CombatAction {
  type: 'attack-str' | 'attack-agi' | 'defend' | 'use-item' | 'flee';
  actorId: string;
  targetId?: string;
  itemId?: string;
}

export interface CombatResult {
  success: boolean;
  roll: DiceRollResult;
  damage: number;
  effects: string[];
  narrative: string;
}
```

### Dice Types (`src/types/dice.ts`)

```typescript
export interface DiceRollResult {
  rolls: number[];
  total: number;
  modifier: number;
  finalTotal: number;
  outcome: RollOutcome;
  narrative?: string;
}

export type RollOutcome =
  | 'critical-failure'   // 2-6
  | 'partial-success'    // 7-9
  | 'success'            // 10-11
  | 'critical-success';  // 12+

export interface DiceRollOptions {
  advantage?: boolean;
  disadvantage?: boolean;
  seed?: string;
}
```

### Reputation Types (`src/types/reputation.ts`)

```typescript
export interface Faction {
  id: string;
  name: string;
  type: FactionType;
  
  description: {
    short: string;
    long: string;
    publicReputation: string;
    secretReputation: string;
  };
  
  ideology: {
    primary: string;
    values: string[];
    vices: string[];
  };
  
  // Relations with other factions
  relationships: Map<string, number>;  // -1.0 to 1.0
  
  territory: string[];
  resources: {
    wealth: number;
    military: number;
    influence: number;
    magic: number;
  };
}

export type FactionType =
  | 'political'
  | 'religious'
  | 'criminal'
  | 'military'
  | 'academic'
  | 'commercial';

export type Attitude =
  | 'devoted'      // 80-100
  | 'friendly'     // 40-79
  | 'neutral'      // -39 to 39
  | 'unfriendly'   // -40 to -79
  | 'hostile';     // -80 to -100
```

---

## 🎲 DICESYSTEM (2D6)

### Ubicación
`src/core/systems/DiceSystem.ts`

### Responsabilidad
- Manejo de tiradas 2d6
- Ventaja/Desventaja (3d6, mantener mejores/peores 2)
- Determinación de outcomes (critical failure, partial, success, critical success)
- Generación reproducible con seeds

### Interface

```typescript
export class DiceSystem {
  constructor(seed?: string);
  
  // Basic roll
  roll2d6(modifier: number, options?: DiceRollOptions): DiceRollResult;
  
  // Advantage/Disadvantage
  rollWithAdvantage(modifier: number, seed?: string): DiceRollResult;
  rollWithDisadvantage(modifier: number, seed?: string): DiceRollResult;
  
  // Outcome determination
  determineOutcome(total: number): RollOutcome;
  
  // Damage calculation (for combat)
  calculateDamage(outcome: RollOutcome, baseDamage: number): number;
  
  // Narrative helpers
  getPartialSuccessConsequence(seed?: string): string;
  getCriticalSuccessBonus(seed?: string): string;
}
```

### Outcomes y Daños

```typescript
// Mapping outcome → damage multiplier
const DAMAGE_MULTIPLIERS = {
  'critical-failure': 0,    // No damage, player takes damage instead
  'partial-success': 1,     // 1 damage
  'success': 1,             // 1 damage
  'critical-success': 2,    // 2 damage
};

// Consequences for partial success (7-9)
const PARTIAL_CONSEQUENCES = [
  "pero te cuesta 1 punto de fatiga extra",
  "pero alertas a enemigos cercanos",
  "pero pierdes o dañas un item",
  "pero te expones a un peligro adicional",
  "pero toma el doble de tiempo",
  "pero haces ruido y pierdes el sigilo",
  "pero el éxito es solo temporal",
  "pero alguien nota tu acción",
];

// Bonuses for critical success (12+)
const CRITICAL_BONUSES = [
  "y encuentras algo útil adicional",
  "y impresionas a los presentes positivamente",
  "y lo haces más rápido de lo esperado",
  "y no gastas recursos en el proceso",
  "y ganas ventaja táctica para tu próxima acción",
  "y aprendes algo importante del proceso",
  "y tus enemigos se desmoralizan",
  "y causas un efecto secundario favorable",
];
```

### Ejemplo de Uso

```typescript
const dice = new DiceSystem('my-seed-123');

// Roll básico: 2d6 + 3
const result = dice.roll2d6(3);
console.log(result);
// {
//   rolls: [4, 5],
//   total: 9,
//   modifier: 3,
//   finalTotal: 12,
//   outcome: 'critical-success',
//   narrative: 'y encuentras algo útil adicional'
// }

// Con ventaja (3d6, mantener 2 mejores)
const advantageRoll = dice.rollWithAdvantage(2);
console.log(advantageRoll);
// {
//   rolls: [6, 3, 2],  // Se mantienen [6, 3]
//   total: 9,
//   modifier: 2,
//   finalTotal: 11,
//   outcome: 'success'
// }

// Calcular daño en combate
const damage = dice.calculateDamage('critical-success', 1);
console.log(damage);  // 2 (base 1 × multiplier 2)
```

### Tests
- `tests/unit/DiceSystem.test.ts` (21 tests, 100% coverage)
- Ver "Testing y Calidad" más abajo

---

## 🏆 REPUTATIONSYSTEM

### Ubicación
`src/core/systems/ReputationSystem.ts`

### Responsabilidad
- Calcular actitud de facciones hacia el jugador
- Aplicar modificadores de precio basados en reputación
- Determinar si NPCs aceptarán comerciar
- Propagar cambios de reputación entre facciones enemigas/aliadas
- Calcular beneficios y penalizaciones según nivel de reputación

### Interface

```typescript
export class ReputationSystem {
  constructor(factions: Map<string, Faction>);
  
  // Core calculations
  calculateAttitude(reputation: number): Attitude;
  getPriceModifier(reputation: number, memory?: NPCMemory): number;
  
  // Trading
  willTrade(reputation: number, memory?: NPCMemory): boolean;
  canShareInformation(reputation: number, memory?: NPCMemory): boolean;
  canAskFavor(reputation: number, memory?: NPCMemory): boolean;
  
  // Reputation changes
  changeReputation(
    factionId: string,
    delta: number,
    playerReps: Map<string, number>
  ): Map<string, number>;
  
  // Benefits and penalties
  getBenefits(factionId: string, reputation: number): string[];
  getPenalties(factionId: string, reputation: number): string[];
  
  // Descriptions
  getAttitudeDescription(attitude: Attitude): string;
}
```

### Actitudes y Thresholds

```typescript
const ATTITUDE_THRESHOLDS = {
  devoted: 80,
  friendly: 40,
  neutral: -39,
  unfriendly: -40,
  hostile: -80,
};

function calculateAttitude(reputation: number): Attitude {
  if (reputation >= 80) return 'devoted';
  if (reputation >= 40) return 'friendly';
  if (reputation >= -39) return 'neutral';
  if (reputation >= -80) return 'unfriendly';
  return 'hostile';
}
```

### Modificadores de Precio

```typescript
const PRICE_MODIFIERS = {
  // Buying (what player pays)
  buying: {
    80: 0.7,   // 30% discount
    60: 0.8,   // 20% discount
    40: 0.9,   // 10% discount
    0: 1.0,    // normal
    [-40]: 1.2,   // 20% markup
    [-60]: 1.4,   // 40% markup
    [-80]: 1.6,   // 60% markup
  },
  
  // Selling (what player receives)
  selling: {
    80: 1.3,   // 30% bonus
    60: 1.2,
    40: 1.1,
    0: 1.0,
    [-40]: 0.8,
    [-60]: 0.6,
    [-80]: 0.5,   // 50% penalty
  },
};
```

### Propagación de Reputación

```typescript
// Cuando la reputación con una facción cambia,
// afecta también a facciones enemigas/aliadas

function changeReputation(
  factionId: string,
  delta: number,
  playerReps: Map<string, number>
): Map<string, number> {
  const newReps = new Map(playerReps);
  
  // Cambio directo
  const current = playerReps.get(factionId) || 0;
  newReps.set(factionId, clamp(current + delta, -100, 100));
  
  // Propagación a facciones relacionadas
  const faction = this.factions.get(factionId);
  if (faction) {
    for (const [otherId, relationship] of faction.relationships) {
      const otherCurrent = playerReps.get(otherId) || 0;
      const propagatedDelta = delta * relationship * PROPAGATION_FACTOR;
      newReps.set(otherId, clamp(otherCurrent + propagatedDelta, -100, 100));
    }
  }
  
  return newReps;
}

// Ejemplo:
// +10 reputación con Círculo del Eco
// Casa Von Hess (relación -0.3): -3 reputación
// Culto del Silencio (relación -0.5): -5 reputación
```

### Memoria de NPCs y Bonos

```typescript
// La memoria personal del NPC puede añadir bonos adicionales
function getPriceModifier(
  reputation: number,
  memory?: NPCMemory
): number {
  let modifier = getBaseModifier(reputation);
  
  if (memory) {
    // Bonus por alta relación personal
    if (memory.relationship >= 80) {
      modifier *= 0.9;  // 10% extra discount
    }
    
    // Bonus por tags especiales
    if (memory.tags.has('saved-life')) {
      modifier *= 0.95;  // 5% extra
    }
    
    // Penalty por traición
    if (memory.tags.has('betrayed')) {
      modifier *= 1.2;  // 20% penalty
    }
  }
  
  return modifier;
}
```

### Ejemplo de Uso

```typescript
const factions = new Map([
  ['circle-of-echo', circleOfEcoFaction],
  ['von-hess', vonHessFaction],
]);

const repSystem = new ReputationSystem(factions);

// Calcular actitud
const reputation = 65;
const attitude = repSystem.calculateAttitude(reputation);
console.log(attitude);  // 'friendly'

// Modificador de precio
const priceModifier = repSystem.getPriceModifier(reputation);
console.log(priceModifier);  // 0.8 (20% discount)

// Con memoria personal del NPC
const memory: NPCMemory = {
  npcId: 'merchant-1',
  relationship: 85,
  trust: 80,
  tags: new Set(['saved-life']),
  // ...
};

const modifierWithMemory = repSystem.getPriceModifier(reputation, memory);
console.log(modifierWithMemory);  // ~0.68 (combined bonuses)

// Cambiar reputación y propagar
const currentReps = new Map([
  ['circle-of-echo', 50],
  ['von-hess', 0],
  ['cult-of-silence', -20],
]);

const newReps = repSystem.changeReputation('circle-of-echo', 20, currentReps);
console.log(newReps);
// Map {
//   'circle-of-echo': 70,
//   'von-hess': -6,         // propagated -0.3
//   'cult-of-silence': -30  // propagated -0.5
// }
```

### Tests
- `tests/unit/ReputationSystem.test.ts` (47 tests, 100% coverage)

---

## 👤 NPCGENERATOR

### Ubicación
`src/core/systems/NPCGenerator.ts`

### Responsabilidad
- Generar NPCs procedurales a partir de templates y seeds
- Crear nombres, apariencias, personalidades, secretos
- Asignar stats y equipamiento según archetype
- Generar diálogos base
- Convertir entre diferentes formatos de NPC

### Interface

```typescript
export class NPCGenerator {
  constructor(seed?: string);
  
  // Generation
  generate(archetype: NPCArchetype, template: NPCTemplate): NPC;
  generateName(gender: 'male' | 'female', archetype: NPCArchetype): string;
  
  // Profile generation
  generateProfile(archetype: NPCArchetype, template: NPCTemplate): NPCProfile;
  generateSecret(archetype: NPCArchetype, severity: 'minor' | 'moderate' | 'major'): NPCSecret;
  
  // Conversion utilities
  npcToProfile(npc: NPC): NPCProfile;
  profileToNPC(profile: NPCProfile, id: string): NPC;
  
  // Seed management
  setSeed(seed: string): void;
  getSeed(): string;
}
```

### Templates

```typescript
export interface NPCTemplate {
  archetype: NPCArchetype;
  
  namePatterns: {
    male: string[];
    female: string[];
    surnames: string[];
  };
  
  appearanceOptions: {
    age: { min: number; max: number };
    physique: string[];
    clothing: string[];
    features: string[];
  };
  
  personalityWeights: Record<string, number>;
  motivations: Array<{ motivation: Motivation; weight: number }>;
  
  stats: {
    str: { min: number; max: number };
    agi: { min: number; max: number };
    wis: { min: number; max: number };
    luk: { min: number; max: number };
    health: number;
    combat: boolean;
  };
  
  secretTemplates: Array<{
    template: string;
    severity: 'minor' | 'moderate' | 'major';
    weight: number;
  }>;
  
  dialogueTemplates: {
    greeting: string[];
    farewell: string[];
  };
  
  inventoryProfile: {
    alwaysHas: string[];
    sometimes: Array<{ item: string; chance: number }>;
    gold: { min: number; max: number };
  };
}
```

### Generación de Nombres

```typescript
// Seeded name generation
function generateName(
  gender: 'male' | 'female',
  archetype: NPCArchetype
): string {
  const template = this.templates.get(archetype);
  if (!template) return 'Unknown';
  
  const { male, female, surnames } = template.namePatterns;
  
  const firstNamePool = gender === 'male' ? male : female;
  const firstName = this.pickSeeded(firstNamePool);
  const surname = this.pickSeeded(surnames);
  
  return `${firstName} ${surname}`;
}

// pickSeeded usa el RNG con seed para reproducibilidad
private pickSeeded<T>(array: T[]): T {
  const index = Math.floor(this.rng() * array.length);
  return array[index];
}
```

### Generación de Secretos

```typescript
function generateSecret(
  archetype: NPCArchetype,
  severity: 'minor' | 'moderate' | 'major'
): NPCSecret {
  const template = this.templates.get(archetype);
  if (!template) throw new Error(`No template for ${archetype}`);
  
  // Filter by severity
  const candidates = template.secretTemplates.filter(
    st => st.severity === severity
  );
  
  // Weighted pick
  const chosen = this.weightedPick(candidates);
  
  // Calculate share chance based on severity
  const baseChance = {
    minor: 0.55,      // 55% avg
    moderate: 0.30,   // 30% avg
    major: 0.125,     // 12.5% avg
  }[severity];
  
  // Add variance
  const variance = (this.rng() - 0.5) * 0.3;  // ±15%
  const shareChance = clamp(baseChance + variance, 0.05, 0.95);
  
  return {
    text: this.expandTemplate(chosen.template),
    severity,
    baseShareChance: shareChance,
    discovered: false,
  };
}

// expandTemplate reemplaza placeholders como {crimen}, {NPC aleatorio}
private expandTemplate(template: string): string {
  return template
    .replace(/{crimen}/g, () => this.pickSeeded(CRIMES))
    .replace(/{NPC aleatorio}/g, () => this.generateName('male', 'commoner'));
}
```

### Ejemplo de Uso

```typescript
const generator = new NPCGenerator('my-seed-123');

// Generar NPC desde template
const guardTemplate = loadTemplate('guard');
const guard = generator.generate('guard', guardTemplate);

console.log(guard);
// {
//   id: 'generated-npc-1',
//   name: 'Darius Stone',
//   archetype: 'guard',
//   appearance: {
//     age: 34,
//     gender: 'male',
//     race: 'human',
//     physique: 'muscular',
//     clothing: 'chainmail'
//   },
//   personality: {
//     traits: ['loyal', 'suspicious', 'duty-bound'],
//     motivation: 'duty',
//     quirk: 'Always checks his weapon'
//   },
//   stats: {
//     str: 4,
//     agi: 3,
//     wis: 2,
//     luk: 2,
//     health: 4,
//     combat: true
//   },
//   secret: {
//     text: 'Desertó de otra ciudad por asesinato accidental',
//     severity: 'major',
//     baseShareChance: 0.08,
//     discovered: false
//   },
//   inventory: {
//     items: ['guard-sword', 'guard-shield', 'healing-potion'],
//     gold: 27
//   },
//   seed: 'my-seed-123',
//   generated: true
// }

// Reproducibilidad: mismo seed = mismo NPC
const generator2 = new NPCGenerator('my-seed-123');
const guard2 = generator2.generate('guard', guardTemplate);
console.log(guard.name === guard2.name);  // true
console.log(guard.secret.text === guard2.secret.text);  // true
```

### Tests
- `tests/unit/NPCGenerator.test.ts` (30 tests, 100% coverage)

---

## 🧠 NPCMEMORYSYSTEM

### Ubicación
`src/core/systems/NPCMemorySystem.ts`

### Responsabilidad
- Trackear interacciones entre jugador y NPCs
- Actualizar relación y confianza según acciones
- Gestionar promesas, favores, tags
- Determinar si un NPC compartirá su secreto
- Calcular actitud del NPC hacia el jugador

### Interface

```typescript
export class NPCMemorySystem {
  private memories: Map<string, NPCMemory>;
  
  constructor();
  
  // Memory management
  getMemory(npcId: string): NPCMemory;
  initializeMemory(npcId: string): NPCMemory;
  
  // Interaction recording
  recordInteraction(
    npcId: string,
    interaction: Interaction
  ): NPCMemory;
  
  // Relationship updates
  adjustRelationship(npcId: string, delta: number): void;
  adjustTrust(npcId: string, delta: number): void;
  
  // Promise management
  makePromise(npcId: string, promise: Promise): void;
  fulfillPromise(npcId: string, promiseId: string): void;
  breakPromise(npcId: string, promiseId: string): void;
  
  // Favor management
  askFavor(npcId: string): boolean;
  doFavor(npcId: string): void;
  
  // Secret sharing
  shouldShareSecret(
    npcId: string,
    npc: NPC,
    context: SecretContext
  ): boolean;
  
  // Tags
  addTag(npcId: string, tag: string): void;
  hasTag(npcId: string, tag: string): boolean;
  
  // Attitude
  getAttitude(npcId: string): Attitude;
}
```

### Registro de Interacciones

```typescript
const INTERACTION_EFFECTS: Record<InteractionType, {
  relationshipDelta: number;
  trustDelta: number;
}> = {
  'dialogue': { relationshipDelta: 1, trustDelta: 0 },
  'gift': { relationshipDelta: 10, trustDelta: 5 },
  'trade': { relationshipDelta: 2, trustDelta: 1 },
  'combat-aid': { relationshipDelta: 15, trustDelta: 10 },
  'betrayal': { relationshipDelta: -50, trustDelta: -80 },
  'favor-asked': { relationshipDelta: -5, trustDelta: 0 },
  'favor-done': { relationshipDelta: 10, trustDelta: 5 },
  'secret-shared': { relationshipDelta: 15, trustDelta: 20 },
  'promise-made': { relationshipDelta: 5, trustDelta: 0 },
  'promise-kept': { relationshipDelta: 20, trustDelta: 30 },
  'promise-broken': { relationshipDelta: -30, trustDelta: -50 },
};

function recordInteraction(
  npcId: string,
  interaction: Interaction
): NPCMemory {
  const memory = this.getMemory(npcId);
  
  // Add interaction to history
  memory.interactions.push(interaction);
  memory.lastInteraction = Date.now();
  
  // Apply deltas
  const effects = INTERACTION_EFFECTS[interaction.type];
  memory.relationship = clamp(
    memory.relationship + effects.relationshipDelta,
    -100,
    100
  );
  memory.trust = clamp(
    memory.trust + effects.trustDelta,
    0,
    100
  );
  
  return memory;
}
```

### Compartir Secretos

```typescript
interface SecretContext {
  location: string;
  private: boolean;
  tense: boolean;
}

function shouldShareSecret(
  npcId: string,
  npc: NPC,
  context: SecretContext
): boolean {
  const memory = this.getMemory(npcId);
  
  // Ya descubierto
  if (npc.secret.discovered) return false;
  
  // Base chance from secret
  let chance = npc.secret.baseShareChance;
  
  // Relationship modifiers
  if (memory.relationship >= 80) {
    chance += 0.3;  // Devoted bonus
  } else if (memory.relationship >= 60) {
    chance += 0.2;  // Friendly bonus
  } else if (memory.relationship < 40) {
    chance -= 0.5;  // Not close enough
  }
  
  // Trust modifiers
  if (memory.trust >= 80) {
    chance += 0.2;
  } else if (memory.trust < 50) {
    chance -= 0.3;
  }
  
  // Context modifiers
  if (context.private) {
    chance += 0.1;  // More likely in private
  }
  if (context.tense) {
    chance += 0.15;  // Crisis = vulnerability
  }
  
  // Special tags
  if (memory.tags.has('saved-life')) {
    chance += 0.2;
  }
  if (memory.tags.has('betrayed')) {
    chance = 0;  // Never shares if betrayed
  }
  
  // Clamp and roll
  chance = clamp(chance, 0, 1);
  return Math.random() < chance;
}
```

### Ejemplo de Uso

```typescript
const memorySystem = new NPCMemorySystem();

// Inicializar memoria para nuevo NPC
const memory = memorySystem.initializeMemory('merchant-1');
console.log(memory);
// {
//   npcId: 'merchant-1',
//   relationship: 0,
//   trust: 50,
//   interactions: [],
//   lastInteraction: 0,
//   knownFacts: new Set(),
//   promises: [],
//   favorsOwed: 0,
//   tags: new Set()
// }

// Registrar interacción de regalo
memorySystem.recordInteraction('merchant-1', {
  type: 'gift',
  timestamp: Date.now(),
  description: 'Player gave expensive sword',
  relationshipDelta: 10,
  trustDelta: 5,
});

// Ver memoria actualizada
const updated = memorySystem.getMemory('merchant-1');
console.log(updated.relationship);  // 10
console.log(updated.trust);  // 55

// Hacer promesa
memorySystem.makePromise('merchant-1', {
  id: 'promise-1',
  description: 'Will deliver letter to brother',
  madeAt: Date.now(),
  fulfilled: false,
});

// Cumplir promesa
memorySystem.fulfillPromise('merchant-1', 'promise-1');
// relationship +20, trust +30

// Ver si el NPC compartirá su secreto
const npc: NPC = /* ... */;
const context: SecretContext = {
  location: 'tavern-private-room',
  private: true,
  tense: false,
};

const willShare = memorySystem.shouldShareSecret('merchant-1', npc, context);
if (willShare) {
  console.log('NPC reveals secret:', npc.secret.text);
  npc.secret.discovered = true;
}
```

### Tests
- `tests/unit/NPCMemorySystem.test.ts` (en desarrollo)

---

## ⚔️ COMBATENGINE

### Ubicación
`src/core/systems/CombatEngine.ts`

### Responsabilidad
- Inicializar combate entre jugador y enemigos
- Gestionar turnos y fases
- Ejecutar acciones de combate usando DiceSystem
- Aplicar daño y efectos
- Determinar victoria, derrota o escape
- Generar log narrativo del combate

### Interface

```typescript
export class CombatEngine {
  constructor(diceSystem: DiceSystem);
  
  // Combat lifecycle
  initiateCombat(
    player: CombatEntity,
    enemies: CombatEntity[],
    options?: CombatOptions
  ): CombatState;
  
  // Turn execution
  executePlayerAction(
    combat: CombatState,
    action: CombatAction
  ): CombatResult;
  
  executeEnemyTurn(
    combat: CombatState
  ): CombatResult[];
  
  // Combat resolution
  checkVictory(combat: CombatState): boolean;
  checkDefeat(combat: CombatState): boolean;
  
  // Escape
  attemptEscape(
    combat: CombatState,
    escaperAgi: number
  ): { success: boolean; result: DiceRollResult };
  
  // Helpers
  applyDamage(entity: CombatEntity, damage: number): void;
  applyStatusEffect(entity: CombatEntity, effect: StatusEffect): void;
  hasAdvantage(entity: CombatEntity): boolean;
  hasDisadvantage(entity: CombatEntity): boolean;
}
```

### Flujo de Combate

```typescript
// 1. Iniciar combate
const combat = combatEngine.initiateCombat(playerEntity, [enemy1, enemy2]);

// 2. Turno del jugador
const playerAction: CombatAction = {
  type: 'attack-str',
  actorId: 'player',
  targetId: 'enemy-1',
};

const playerResult = combatEngine.executePlayerAction(combat, playerAction);
console.log(playerResult);
// {
//   success: true,
//   roll: { rolls: [5, 4], total: 9, finalTotal: 12, outcome: 'critical-success' },
//   damage: 2,
//   effects: [],
//   narrative: 'Tu golpe conecta perfectamente, y el enemigo tambalea!'
// }

// 3. Turno de enemigos
const enemyResults = combatEngine.executeEnemyTurn(combat);
for (const result of enemyResults) {
  console.log(result.narrative);
}

// 4. Verificar fin de combate
if (combatEngine.checkVictory(combat)) {
  console.log('¡Victoria!');
  // Award XP, loot, etc.
} else if (combatEngine.checkDefeat(combat)) {
  console.log('Derrota...');
  // Handle defeat
}

// 5. Repetir hasta fin
```

### Ataques con DiceSystem

```typescript
function executePlayerAction(
  combat: CombatState,
  action: CombatAction
): CombatResult {
  if (action.type === 'attack-str' || action.type === 'attack-agi') {
    const attacker = combat.player;
    const target = this.findEntity(combat, action.targetId);
    
    // Determine attribute
    const attr = action.type === 'attack-str' ? attacker.attributes.str : attacker.attributes.agi;
    
    // Check advantage/disadvantage
    const options: DiceRollOptions = {
      advantage: this.hasAdvantage(attacker),
      disadvantage: this.hasDisadvantage(attacker),
    };
    
    // Roll using DiceSystem
    const roll = this.diceSystem.roll2d6(attr, options);
    
    // Check vs defense
    const success = roll.finalTotal >= target.defense;
    
    // Calculate damage
    let damage = 0;
    if (success) {
      damage = this.diceSystem.calculateDamage(roll.outcome, 1);
      this.applyDamage(target, damage);
    } else if (roll.outcome === 'critical-failure') {
      // Critical failure: player takes damage
      damage = Math.floor(Math.random() * 2) + 1;
      this.applyDamage(attacker, damage);
    }
    
    // Generate narrative
    const narrative = this.generateCombatNarrative(roll, success, damage, attacker, target);
    
    // Log
    combat.log.push({
      turn: combat.turn,
      actor: attacker.name,
      action: action.type,
      roll,
      damage,
      narrative,
    });
    
    return { success, roll, damage, effects: [], narrative };
  }
  
  // Handle other action types...
}
```

### IA de Enemigos

```typescript
function determineEnemyAction(enemy: CombatEntity, combat: CombatState): CombatAction {
  switch (enemy.aiType) {
    case 'aggressive':
      // Always attack player
      return {
        type: enemy.attributes.str > enemy.attributes.agi ? 'attack-str' : 'attack-agi',
        actorId: enemy.id,
        targetId: 'player',
      };
      
    case 'defensive':
      // Defend if low health
      if (enemy.health.current <= 1) {
        return { type: 'defend', actorId: enemy.id };
      }
      // Otherwise attack
      return {
        type: 'attack-str',
        actorId: enemy.id,
        targetId: 'player',
      };
      
    case 'strategic':
      // Use items if available
      if (enemy.health.current <= 2 && this.hasHealingItem(enemy)) {
        return { type: 'use-item', actorId: enemy.id, itemId: 'healing-potion' };
      }
      // Otherwise attack weakest target
      const target = this.findWeakestTarget(combat);
      return {
        type: 'attack-wis',
        actorId: enemy.id,
        targetId: target.id,
      };
  }
}
```

### Ejemplo Completo

```typescript
const dice = new DiceSystem('combat-seed-123');
const combatEngine = new CombatEngine(dice);

// Setup entities
const player: CombatEntity = {
  id: 'player',
  name: 'Kael',
  health: { current: 3, max: 3 },
  defense: 7,
  attributes: { str: 4, agi: 2, wis: 2, luk: 2 },
  statusEffects: [],
  advantage: false,
  disadvantage: false,
};

const bandit: CombatEntity = {
  id: 'bandit-1',
  name: 'Bandido',
  health: { current: 3, max: 3 },
  defense: 7,
  attributes: { str: 3, agi: 2, wis: 1, luk: 2 },
  statusEffects: [],
  advantage: false,
  disadvantage: false,
  aiType: 'aggressive',
};

// Initiate
const combat = combatEngine.initiateCombat(player, [bandit]);

// Turn 1: Player attacks
const action: CombatAction = {
  type: 'attack-str',
  actorId: 'player',
  targetId: 'bandit-1',
};

const result = combatEngine.executePlayerAction(combat, action);
console.log(result.narrative);
// "¡Golpe crítico! Causas 2 heridas al Bandido."

// Check bandit health
console.log(bandit.health.current);  // 1

// Turn 1: Enemy attacks
const enemyResults = combatEngine.executeEnemyTurn(combat);
console.log(enemyResults[0].narrative);
// "El Bandido ataca pero fallas en defenderte. Recibes 1 herida."

// Check player health
console.log(player.health.current);  // 2

// Continue until victory or defeat...
```

### Tests
- `tests/unit/CombatEngine.test.ts` (en desarrollo)
- `tests/integration/combat.integration.test.ts`

---

## 💰 ECONOMYSYSTEM

### Ubicación
`src/core/systems/EconomySystem.ts`

### Responsabilidad
- Calcular precios de compra/venta con modificadores de reputación
- Determinar si un comerciante aceptará comerciar
- Gestionar transacciones
- Aplicar bonos/penalizaciones por memoria personal del NPC

### Interface

```typescript
export class EconomySystem {
  constructor(reputationSystem: ReputationSystem);
  
  // Price calculation
  calculateBuyPrice(
    item: Item,
    merchantFaction: string,
    playerRep: number,
    merchantMemory?: NPCMemory
  ): number;
  
  calculateSellPrice(
    item: Item,
    merchantFaction: string,
    playerRep: number,
    merchantMemory?: NPCMemory
  ): number;
  
  // Trading
  canTrade(
    merchantFaction: string,
    playerRep: number,
    merchantMemory?: NPCMemory
  ): boolean;
  
  // Transactions
  buyItem(
    player: Player,
    merchant: NPC,
    item: Item,
    price: number
  ): TransactionResult;
  
  sellItem(
    player: Player,
    merchant: NPC,
    item: Item,
    price: number
  ): TransactionResult;
}
```

### Cálculo de Precios

```typescript
function calculateBuyPrice(
  item: Item,
  merchantFaction: string,
  playerRep: number,
  merchantMemory?: NPCMemory
): number {
  // Base price
  let price = item.basePrice;
  
  // Merchant type multiplier
  const merchantMultiplier = this.getMerchantMultiplier(merchantFaction);
  price *= merchantMultiplier;
  
  // Reputation modifier (via ReputationSystem)
  const repModifier = this.reputationSystem.getPriceModifier(
    playerRep,
    merchantMemory
  );
  price *= repModifier;
  
  // Round to nearest integer
  return Math.round(price);
}

// Example merchant multipliers:
const MERCHANT_MULTIPLIERS = {
  'general-store': 1.0,
  'blacksmith': 1.2,      // Weapons/armor cost more
  'alchemist': 1.3,       // Potions cost more
  'fence': 0.8,           // Stolen goods cheaper
};
```

### Determinar Si Aceptará Comerciar

```typescript
function canTrade(
  merchantFaction: string,
  playerRep: number,
  merchantMemory?: NPCMemory
): boolean {
  // Use ReputationSystem to check
  return this.reputationSystem.willTrade(playerRep, merchantMemory);
}

// From ReputationSystem:
function willTrade(reputation: number, memory?: NPCMemory): boolean {
  const attitude = this.calculateAttitude(reputation);
  
  // Won't trade if hostile
  if (attitude === 'hostile') return false;
  
  // Won't trade if betrayed
  if (memory && memory.tags.has('betrayed')) return false;
  
  // Otherwise yes
  return true;
}
```

### Transacciones

```typescript
interface TransactionResult {
  success: boolean;
  message: string;
  goldSpent?: number;
  goldReceived?: number;
  item?: Item;
}

function buyItem(
  player: Player,
  merchant: NPC,
  item: Item,
  price: number
): TransactionResult {
  // Check if player has enough gold
  if (player.gold < price) {
    return {
      success: false,
      message: 'No tienes suficiente oro.',
    };
  }
  
  // Check if merchant has item
  if (!merchant.inventory.items.includes(item)) {
    return {
      success: false,
      message: 'El mercader no tiene ese item.',
    };
  }
  
  // Execute transaction
  player.gold -= price;
  merchant.inventory.gold += price;
  
  player.inventory.push(item);
  merchant.inventory.items = merchant.inventory.items.filter(i => i !== item);
  
  return {
    success: true,
    message: `Compraste ${item.name} por ${price} oro.`,
    goldSpent: price,
    item,
  };
}

function sellItem(
  player: Player,
  merchant: NPC,
  item: Item,
  price: number
): TransactionResult {
  // Check if player has item
  if (!player.inventory.includes(item)) {
    return {
      success: false,
      message: 'No tienes ese item.',
    };
  }
  
  // Check if merchant has enough gold
  if (merchant.inventory.gold < price) {
    return {
      success: false,
      message: 'El mercader no tiene suficiente oro.',
    };
  }
  
  // Execute transaction
  player.inventory = player.inventory.filter(i => i !== item);
  merchant.inventory.items.push(item);
  
  player.gold += price;
  merchant.inventory.gold -= price;
  
  return {
    success: true,
    message: `Vendiste ${item.name} por ${price} oro.`,
    goldReceived: price,
    item,
  };
}
```

### Ejemplo de Uso

```typescript
const repSystem = new ReputationSystem(factions);
const economySystem = new EconomySystem(repSystem);

const item: Item = {
  id: 'iron-sword',
  name: 'Espada de Hierro',
  basePrice: 100,
  // ...
};

// Calcular precio de compra
const playerRep = 65;  // Friendly con la facción del mercader
const memory: NPCMemory = {
  npcId: 'merchant-1',
  relationship: 80,
  trust: 75,
  tags: new Set(['saved-life']),
  // ...
};

const buyPrice = economySystem.calculateBuyPrice(
  item,
  'merchants-guild',
  playerRep,
  memory
);
console.log(buyPrice);
// 100 × 1.0 (general store) × 0.68 (rep + memory bonuses) = 68 oro

// Verificar si aceptará comerciar
const canTrade = economySystem.canTrade('merchants-guild', playerRep, memory);
console.log(canTrade);  // true

// Ejecutar compra
const result = economySystem.buyItem(player, merchant, item, buyPrice);
console.log(result);
// {
//   success: true,
//   message: 'Compraste Espada de Hierro por 68 oro.',
//   goldSpent: 68,
//   item: { id: 'iron-sword', ... }
// }
```

### Tests
- `tests/unit/EconomySystem.test.ts` (en desarrollo)
- `tests/integration/economy.integration.test.ts`

---

## 🧪 TESTING Y CALIDAD

### Framework
- **Jest** para unit, integration y e2e tests
- **TypeScript** con tipos estrictos
- **Coverage:** objetivo 80%+

### Estructura de Tests

```
tests/
├── unit/                         # Tests unitarios (sistemas aislados)
│   ├── DiceSystem.test.ts        # ✅ 21 tests, 100% coverage
│   ├── ReputationSystem.test.ts  # ✅ 47 tests, 100% coverage
│   ├── NPCGenerator.test.ts      # ✅ 30 tests, 100% coverage
│   ├── NPCMemorySystem.test.ts   # 🔄 En desarrollo
│   ├── CombatEngine.test.ts      # 🔄 En desarrollo
│   └── EconomySystem.test.ts     # 🔄 En desarrollo
│
├── integration/                  # Tests de integración (múltiples sistemas)
│   ├── combat.integration.test.ts
│   ├── economy.integration.test.ts
│   └── quest.integration.test.ts
│
└── e2e/                          # Tests end-to-end (playthrough completo)
    └── full-playthrough.test.ts
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test DiceSystem
npm test ReputationSystem

# Con coverage
npm test -- --coverage

# Watch mode (auto-rerun)
npm test -- --watch

# Solo unit tests
npm test -- tests/unit/

# Solo integration tests
npm test -- tests/integration/
```

### Ejemplo de Test Unitario: DiceSystem

```typescript
// tests/unit/DiceSystem.test.ts
import { DiceSystem } from '../../src/core/systems/DiceSystem';

describe('DiceSystem', () => {
  describe('roll2d6', () => {
    it('should roll 2d6 and add modifier', () => {
      const dice = new DiceSystem('test-seed');
      const result = dice.roll2d6(3);
      
      expect(result.rolls).toHaveLength(2);
      expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(result.rolls[0]).toBeLessThanOrEqual(6);
      expect(result.modifier).toBe(3);
      expect(result.finalTotal).toBe(result.total + result.modifier);
    });
    
    it('should be reproducible with same seed', () => {
      const dice1 = new DiceSystem('same-seed');
      const dice2 = new DiceSystem('same-seed');
      
      const result1 = dice1.roll2d6(2);
      const result2 = dice2.roll2d6(2);
      
      expect(result1.rolls).toEqual(result2.rolls);
      expect(result1.finalTotal).toBe(result2.finalTotal);
    });
    
    it('should determine critical-failure for totals 2-6', () => {
      const dice = new DiceSystem();
      const result = dice.roll2d6(-10);  // Force low total
      
      if (result.finalTotal <= 6) {
        expect(result.outcome).toBe('critical-failure');
      }
    });
    
    it('should determine critical-success for totals 12+', () => {
      const dice = new DiceSystem();
      const result = dice.roll2d6(10);  // Force high total
      
      if (result.finalTotal >= 12) {
        expect(result.outcome).toBe('critical-success');
        expect(result.narrative).toBeDefined();
      }
    });
  });
  
  describe('rollWithAdvantage', () => {
    it('should roll 3d6 and keep best 2', () => {
      const dice = new DiceSystem('test-seed-adv');
      const result = dice.rollWithAdvantage(2);
      
      expect(result.rolls).toHaveLength(3);
      
      // Total should be sum of best 2
      const sorted = [...result.rolls].sort((a, b) => b - a);
      const expectedTotal = sorted[0] + sorted[1];
      expect(result.total).toBe(expectedTotal);
    });
  });
  
  describe('calculateDamage', () => {
    it('should return 0 for critical-failure', () => {
      const dice = new DiceSystem();
      const damage = dice.calculateDamage('critical-failure', 1);
      expect(damage).toBe(0);
    });
    
    it('should return base damage for success', () => {
      const dice = new DiceSystem();
      const damage = dice.calculateDamage('success', 1);
      expect(damage).toBe(1);
    });
    
    it('should return 2x damage for critical-success', () => {
      const dice = new DiceSystem();
      const damage = dice.calculateDamage('critical-success', 1);
      expect(damage).toBe(2);
    });
  });
});
```

### Coverage Report

```bash
npm test -- --coverage

----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   87.3  |   82.1   |   91.2  |   88.5  |
 core/systems/        |         |          |         |         |
  DiceSystem.ts       |  100.0  |  100.0   |  100.0  |  100.0  |
  ReputationSystem.ts |  100.0  |  100.0   |  100.0  |  100.0  |
  NPCGenerator.ts     |  100.0  |  100.0   |  100.0  |  100.0  |
  CombatEngine.ts     |   75.2  |   68.3   |   82.1  |   76.8  |
  EconomySystem.ts    |   68.9  |   61.4   |   75.0  |   70.2  |
  NPCMemorySystem.ts  |   62.3  |   54.7   |   68.9  |   63.5  |
----------------------|---------|----------|---------|---------|
```

### Métricas de Calidad

**Objetivo:**
- Unit tests: 80%+ coverage
- Integration tests: Key flows cubiertos
- E2E tests: Al menos 1 playthrough completo

**Actual (Estado del Proyecto):**
- ✅ DiceSystem: 100% coverage (21 tests)
- ✅ ReputationSystem: 100% coverage (47 tests)
- ✅ NPCGenerator: 100% coverage (30 tests)
- 🔄 CombatEngine: ~75% coverage (en progreso)
- 🔄 EconomySystem: ~69% coverage (en progreso)
- 🔄 NPCMemorySystem: ~62% coverage (en progreso)

---

## 🛠️ SETUP Y BUILD

### Prerequisitos

```bash
# Node.js 18+ y npm
node --version  # v18.0.0+
npm --version   # 8.0.0+
```

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/one-page-rpg.git
cd one-page-rpg

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar tests
npm test
```

### Scripts de npm

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  }
}
```

### Configuración TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Configuración Jest (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 🤝 CONTRIBUCIÓN

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crear branch** para tu feature: `git checkout -b feature/mi-feature`
3. **Implementar** cambios con tests
4. **Ejecutar** tests y linter: `npm test && npm run lint`
5. **Commit** con mensaje descriptivo: `git commit -m "feat: add new combat ability system"`
6. **Push** a tu fork: `git push origin feature/mi-feature`
7. **Pull Request** al repo principal

### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
test: tests
refactor: refactorización sin cambio de funcionalidad
chore: tareas de mantenimiento
```

**Ejemplos:**
```
feat(combat): add critical hit multipliers
fix(reputation): correct propagation calculation
docs(api): update ReputationSystem documentation
test(dice): add tests for disadvantage rolls
```

### Guías de Estilo

**TypeScript:**
- Usa tipos estrictos, evita `any`
- Preferir `interface` sobre `type` para objetos
- Documentar funciones públicas con JSDoc
- Nombres descriptivos (no abreviaturas)

**Tests:**
- Nombrar tests claramente: `it('should X when Y')`
- Arrange-Act-Assert pattern
- Un concepto por test
- Tests reproducibles (usa seeds)

**Arquitectura:**
- Core systems deben ser independientes de UI
- State management inmutable
- No lógica de juego en UI layer
- Content en JSON, no hardcoded

### Áreas que Necesitan Contribución

**Alta Prioridad:**
- [ ] Completar tests de CombatEngine
- [ ] Completar tests de EconomySystem
- [ ] Completar tests de NPCMemorySystem
- [ ] Integration tests para quest system
- [ ] E2E test de playthrough completo

**Media Prioridad:**
- [ ] Quest Manager implementation
- [ ] Save/Load system
- [ ] Web UI (React/Next.js)
- [ ] Content validator CLI tool

**Baja Prioridad:**
- [ ] Discord bot interface
- [ ] Multiplayer support
- [ ] Editor visual de contenido
- [ ] Steam Workshop integration

---

## 📚 RECURSOS ADICIONALES

### Documentación Relacionada
- `PLAYER_GUIDE.md`: Guía para jugadores
- `DESIGNER_GUIDE.md`: Guía para diseñadores de contenido
- `API.md`: Referencia completa de API (en desarrollo)

### Comunicación
- **GitHub Issues:** Reportar bugs, proponer features
- **GitHub Discussions:** Preguntas, ideas, showcase
- **Discord:** (servidor en desarrollo)

### Licencia
- MIT License (ver `LICENSE`)

---

**¡Gracias por contribuir a One Page RPG!**

*"El mejor código es el que se puede entender, mantener y extender."*

🔧⚙️💻
