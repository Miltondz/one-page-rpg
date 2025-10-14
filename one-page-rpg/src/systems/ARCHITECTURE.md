# Arquitectura del Sistema de Quests

## 📐 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        GAME CONTEXT                         │
│  (GameContext.tsx - Estado global del juego)               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Integra
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      QUEST MANAGER                          │
│  • Coordinador principal del sistema de misiones           │
│  • Maneja quests de campaña Y procedurales                 │
│  • API unificada para ambos tipos                          │
└──────────────┬───────────────────────────┬──────────────────┘
               │                           │
               │                           │
       ┌───────▼────────┐         ┌────────▼────────┐
       │  QUEST LOADER  │         │  QUEST SYSTEM   │
       │                │         │                 │
       │ • Carga JSON   │         │ • Generación    │
       │ • Parsea datos │         │   procedural    │
       │ • Convierte    │         │ • Tracking      │
       │   formato      │         │ • Progreso      │
       └────────┬───────┘         └────────┬────────┘
                │                          │
                │                          │
       ┌────────▼──────────────────────────▼────────┐
       │         SEEDED RANDOM (RNG)                │
       │  • Generación determinista                 │
       │  • Tablas 2d6                              │
       └────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Carga de Quest de Campaña (JSON)

```
┌──────────────┐
│ JSON File    │
│ (campaign)   │
└──────┬───────┘
       │
       │ fetch()
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ QuestLoader  │────▶│ QuestManager │────▶│ QuestSystem  │
│ .loadFrom    │     │ .loadCampaign│     │ .activate    │
│ Path()       │     │ Quest()      │     │ Quest()      │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       │ Parsea y convierte
       ▼
┌──────────────┐
│ Quest Object │
│ (formato     │
│  interno)    │
└──────────────┘
```

### 2. Generación de Quest Procedural (2d6)

```
┌──────────────┐
│ Player Level │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ QuestManager │────▶│ QuestSystem  │────▶│ SeededRandom │
│ .generate    │     │ .generate    │     │ .roll2d6()   │
│ Procedural   │     │ Quest()      │     └──────────────┘
│ Quest()      │     └──────────────┘
└──────┬───────┘            │
       │                    │ Usa tablas 2d6
       │                    ▼
       │            ┌──────────────┐
       │            │ • Quest Type │
       │            │ • NPC Giver  │
       │            │ • Location   │
       │            │ • Rewards    │
       │            └──────────────┘
       │
       ▼
┌──────────────┐
│ Quest Object │
│ (procedural) │
└──────────────┘
```

### 3. Tracking de Progreso

```
┌──────────────┐
│ Player Action│
│ (kill enemy, │
│  talk to NPC)│
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ QuestManager                     │
│ .completeObjective() /           │
│ .progressObjective()             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ QuestSystem                      │
│ • Actualiza contador             │
│ • Marca objetivo como completado │
│ • Calcula progreso total         │
│ • Retorna recompensas            │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Retorno                          │
│ • success: boolean               │
│ • rewards: { xp, gold, items }   │
│ • questCompleted: boolean        │
└──────────────────────────────────┘
```

## 🎯 Tipos de Datos

### Quest (Formato Unificado)

```typescript
Quest {
  id: string                    // Identificador único
  title: string                 // Título visible
  type: 'main' | 'side' | 'event'
  levelRange: [min, max]        // Nivel recomendado
  giver: string                 // NPC que da la quest
  startingLocation: string      // Dónde empieza
  description: string           // Descripción
  objectives: QuestObjective[]  // Lista de objetivos
  rewards: {                    // Recompensas finales
    xp: number
    gold: number
    items?: string[]
  }
  active: boolean              // ¿Está activa?
  completed: boolean           // ¿Completada?
  failed: boolean              // ¿Fallida?
}
```

### QuestObjective

```typescript
QuestObjective {
  id: string
  type: QuestType              // talk, combat, explore, etc.
  description: string
  required: boolean            // ¿Obligatorio?
  completed: boolean
  location?: string            // Locación requerida
  targetNpc?: string           // NPC objetivo
  enemies?: string[]           // Enemigos a derrotar
  items?: string[]             // Items a recolectar
  count?: number               // Cantidad necesaria
  currentCount?: number        // Progreso actual
  rewards: {                   // Recompensas por objetivo
    xp?: number
    gold?: number
    items?: string[]
  }
}
```

## 🔀 Metadata de Campaña (Solo JSON)

```typescript
CampaignQuestData {
  branches: Branch[]           // Decisiones narrativas
  failureConditions: {         // Condiciones de fallo
    condition: string
    result: string
  }[]
}

Branch {
  id: string
  trigger: string              // Evento que dispara
  description: string
  consequences: Consequence[]
}

Consequence {
  type: 'relationship' | 'reward' | 'unlock_quest' | 'unlock_location'
  target?: string
  value?: number
  gold?: number
  items?: string[]
  quest_id?: string
  location_id?: string
}
```

## 📊 Tablas Procedurales (2d6)

### Distribución de Probabilidad

```
Roll │ Probability │ Quest Type
─────┼─────────────┼───────────────
  2  │    2.78%    │ investigate
  3  │    5.56%    │ delivery
  4  │    8.33%    │ talk
  5  │   11.11%    │ collect
  6  │   13.89%    │ explore
  7  │   16.67%    │ combat (más común)
  8  │   13.89%    │ combat
  9  │   11.11%    │ escort
 10  │    8.33%    │ explore
 11  │    5.56%    │ delivery
 12  │    2.78%    │ investigate
```

### Tablas Incluidas

1. **Quest Types**: 7 tipos distintos
2. **NPCs**: 12 personajes (Eremita, Mercader, Guardia, etc.)
3. **Locations**: 12 locaciones (Catacumbas, Bosque, Minas, etc.)
4. **Rewards**: Escalados por nivel del jugador

## 🎮 Integración con GameContext

### Inicialización

```typescript
// En GameContext.tsx
const [rng] = useState(() => new SeededRandom(seed));
const [questManager] = useState(() => new QuestManager(rng));

useEffect(() => {
  // Cargar quest del prólogo
  questManager.loadCampaignQuest('/game_data/quests/prologue_quest.json')
    .then(quest => {
      if (quest) questManager.activateQuest(quest.id);
    });
}, []);
```

### Exponer en Contexto

```typescript
interface GameContextType {
  // ... otros valores
  questManager: QuestManager;
  
  // Helper functions
  completeQuestObjective: (questId: string, objectiveId: string) => void;
  generateNewQuest: (playerLevel: number) => Quest;
  getActiveQuests: () => Quest[];
}
```

## 🔧 Ejemplo de Uso en Componentes

### Quest Log Component

```tsx
function QuestLog() {
  const { questManager } = useGameContext();
  const activeQuests = questManager.getActiveQuests();
  
  return (
    <div>
      {activeQuests.map(quest => {
        const progress = questManager.getQuestProgress(quest.id);
        const objectives = questManager.getQuestObjectives(quest.id);
        
        return (
          <QuestCard
            key={quest.id}
            quest={quest}
            progress={progress}
            objectives={objectives}
          />
        );
      })}
    </div>
  );
}
```

### Narrative Scene Component

```tsx
function NarrativeScene() {
  const { questManager, currentScene } = useGameContext();
  
  const handleDecision = (branchId: string) => {
    questManager.executeBranch(
      currentScene.questId,
      branchId,
      (consequences) => {
        // Aplicar consecuencias al estado del juego
        applyConsequencesToWorld(consequences);
      }
    );
  };
  
  return <SceneRenderer scene={currentScene} onDecision={handleDecision} />;
}
```

## ✅ Ventajas del Sistema

1. **Unificado**: Misma API para quests de campaña y procedurales
2. **Flexible**: Fácil añadir nuevos tipos de quests
3. **Testeable**: Lógica separada en módulos
4. **Determinista**: RNG con seed para reproducibilidad
5. **Escalable**: Recompensas ajustadas al nivel
6. **Serializable**: Guardado/carga completo
7. **Extensible**: Branches narrativos para campaña

## 🚀 Próximas Mejoras

- [ ] Sistema de prerequisitos (quest chains)
- [ ] Timeouts para quests temporales
- [ ] Quest dynamics (cambios basados en contexto)
- [ ] Multiple quest givers en una locación
- [ ] Reputation-based quest generation
- [ ] Failed quest consequences
