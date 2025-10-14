# Sistema de Quests Unificado

Sistema completo de gestión de misiones que soporta tanto **misiones de campaña** (cargadas desde JSON) como **misiones procedurales** (generadas con 2d6).

## 📚 Arquitectura

```
QuestManager (Coordinador principal)
    ├── QuestSystem (Lógica de tracking y generación procedural)
    ├── QuestLoader (Carga y parseo de JSON)
    └── SeededRandom (RNG para procedural generation)
```

## 🚀 Uso Básico

### 1. Inicialización

```typescript
import { QuestManager } from './systems/QuestManager';
import { SeededRandom } from './utils/SeededRandom';

const rng = new SeededRandom('my-seed');
const questManager = new QuestManager(rng);
```

### 2. Cargar Misiones de Campaña (JSON)

```typescript
// Cargar una quest individual
const quest = await questManager.loadCampaignQuest(
  '/game_data/quests/prologue_quest.json'
);

// Cargar múltiples quests
const quests = await questManager.loadCampaignQuests([
  '/game_data/quests/prologue_quest.json',
  '/game_data/quests/chapter1_quest.json',
]);

// Activar la quest del prólogo
questManager.activateQuest('prologo_deuda_ecos');
```

### 3. Generar Misiones Procedurales

```typescript
// Generar una quest procedural para el jugador nivel 3
const proceduralQuest = questManager.generateProceduralQuest(3, 'side_quest');

// Generar 3 quests procedurales de una vez
const sideQuests = questManager.generateProceduralQuestsForPlayer(3, 3);

// Activar una quest procedural
questManager.activateQuest(proceduralQuest.id);
```

### 4. Tracking de Progreso

```typescript
// Completar un objetivo
const result = questManager.completeObjective(
  'prologo_deuda_ecos',
  'obj_1_accept_job'
);

if (result.success) {
  console.log(`Ganaste ${result.rewards.xp} XP!`);
  
  if (result.questCompleted) {
    console.log('¡Quest completada!');
  }
}

// Progresar un objetivo con contador
const progress = questManager.progressObjective(
  'quest_id',
  'obj_combat',
  1 // Eliminaste 1 enemigo
);

console.log(`Progreso: ${progress.currentCount}/${objective.count}`);
```

### 5. Consultar Estado

```typescript
// Obtener todas las quests activas
const activeQuests = questManager.getActiveQuests();

// Obtener solo quests de campaña activas
const campaignQuests = questManager.getActiveCampaignQuests();

// Obtener solo quests procedurales activas
const proceduralQuests = questManager.getActiveProceduralQuests();

// Ver progreso de una quest
const progress = questManager.getQuestProgress('prologo_deuda_ecos'); // 0-100%

// Obtener objetivos
const objectives = questManager.getQuestObjectives('prologo_deuda_ecos');
objectives.forEach(obj => {
  console.log(`[${obj.completed ? '✓' : ' '}] ${obj.description}`);
});
```

## 🎯 Características Avanzadas

### Branches Narrativos (Solo Campaña)

```typescript
// Obtener branches disponibles
const branches = questManager.getQuestBranches('prologo_deuda_ecos');

// Ejecutar una decisión narrativa
questManager.executeBranch(
  'prologo_deuda_ecos',
  'branch_betray_hermit',
  (consequences) => {
    consequences.forEach(cons => {
      switch (cons.type) {
        case 'relationship':
          // Aplicar cambio de relación con facción
          updateFactionRelationship(cons.target!, cons.value!);
          break;
        case 'reward':
          // Dar recompensa
          giveReward(cons.gold, cons.items);
          break;
        case 'unlock_quest':
          // Desbloquear nueva quest
          unlockQuest(cons.quest_id!);
          break;
      }
    });
  }
);
```

### Verificar Condiciones de Completado

```typescript
const canComplete = questManager.canCompleteObjective(
  'prologo_deuda_ecos',
  'obj_3_deliver_box',
  playerInventory,
  currentLocation
);

if (!canComplete.canComplete) {
  console.log(canComplete.reason); // "Debes estar en: cueva_aislada"
}
```

### Condiciones de Fallo

```typescript
// Verificar si una acción causa fallo de la quest
const failureResult = questManager.checkFailureCondition(
  'prologo_deuda_ecos',
  'box_destroyed'
);

if (failureResult) {
  console.log(`¡Quest fallida! Resultado: ${failureResult}`); // "alternate_ending"
}
```

## 💾 Guardado y Carga

```typescript
// Serializar estado para guardado
const saveData = questManager.serialize();
localStorage.setItem('quests', JSON.stringify(saveData));

// Restaurar estado
const savedData = JSON.parse(localStorage.getItem('quests')!);
questManager.deserialize(savedData);
```

## 🎲 Generación Procedural (2d6)

El sistema usa tablas basadas en tiradas de 2d6 para generar quests:

### Tablas Disponibles

- **Tipos de Quest**: delivery, combat, explore, talk, collect, escort, investigate
- **NPCs**: 12 personajes distintos (Eremita, Mercader, Guardia, etc.)
- **Locaciones**: 12 lugares temáticos (Catacumbas, Bosque Maldito, etc.)
- **Recompensas**: XP y oro escalados por nivel

### Ejemplo de Quest Generada

```typescript
const quest = questManager.generateProceduralQuest(2, 'side_quest');

// Resultado posible:
// {
//   title: "Exterminio en Bosque Maldito",
//   giver: "Campesino Desesperado",
//   objectives: [
//     { type: 'combat', description: 'Derrota 3 enemigos en Bosque Maldito' }
//   ],
//   rewards: { xp: 2, gold: 30 }
// }
```

## 🔗 Integración con GameContext

```typescript
// En GameContext.tsx
import { QuestManager } from '../systems/QuestManager';

const [questManager] = useState(() => new QuestManager(rng));

useEffect(() => {
  // Cargar quest del prólogo al iniciar
  questManager.loadCampaignQuest('/game_data/quests/prologue_quest.json')
    .then(quest => {
      if (quest) {
        questManager.activateQuest(quest.id);
      }
    });
}, []);

// Exponer en el contexto
const contextValue = {
  questManager,
  // ... otros valores
};
```

## 📊 Formato JSON de Campaña

Ver `prologue_quest.json` como ejemplo completo. Estructura básica:

```json
{
  "quest": {
    "id": "quest_id",
    "title": "Título de la Quest",
    "type": "main_quest",
    "level_range": [1, 3],
    "giver": "npc_id",
    "starting_location": "location_id",
    "description": "Descripción...",
    "objectives": [
      {
        "id": "obj_1",
        "type": "talk",
        "description": "Hablar con NPC",
        "required": true,
        "completed": false,
        "rewards": { "xp": 1 }
      }
    ],
    "branches": [
      {
        "id": "branch_id",
        "trigger": "decision_name",
        "consequences": [
          { "type": "relationship", "target": "faction", "value": 50 },
          { "type": "reward", "gold": 100 }
        ]
      }
    ],
    "rewards": {
      "base": { "xp": 3, "gold": 50 },
      "optional_bonus": { "xp": 2, "items": ["item_id"] }
    }
  }
}
```

## 🐛 Debug

```typescript
// Ver estado completo del sistema
questManager.debugPrint();

// Output:
// === QUEST MANAGER DEBUG ===
// Campaign Quests: 1
// Active Quests: 2
// Completed Quests: 0
//
// Active Quests:
//   - [campaign] La Deuda del Ladrón de Ecos (33%)
//   - [procedural] Exterminio en Bosque Maldito (0%)
```

## ✅ Features Completas

- ✅ Carga de quests desde JSON
- ✅ Generación procedural con 2d6
- ✅ Tracking de progreso por objetivo
- ✅ Branches narrativos con consecuencias
- ✅ Condiciones de fallo
- ✅ Objetivos opcionales vs requeridos
- ✅ Recompensas por objetivo y quest completa
- ✅ Verificación de condiciones de completado
- ✅ Guardado/carga de estado
- ✅ Separación de quests de campaña vs procedurales
- ✅ Scaling de recompensas por nivel

## 🎮 Próximos Pasos

1. **UI de Quest Log** - Panel para mostrar quests activas
2. **Quest Notifications** - Popups al completar objetivos
3. **Quest Markers** - Indicadores visuales en el mapa
4. **Dynamic Quest Generation** - Generar quests basadas en contexto narrativo
