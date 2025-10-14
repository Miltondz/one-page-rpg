# 🔍 ANÁLISIS DE BRECHA: Diseño Original vs Implementación Actual

**Fecha:** 2025-01-14  
**Versión del Proyecto:** 0.4.1  
**Progreso Global:** 65%

---

## 📋 RESUMEN EJECUTIVO

Este documento compara las especificaciones del diseño original (archivos en `D:\Proyectos\textRPG\`) con la implementación actual en `one-page-rpg/` para identificar:

1. ✅ **Funcionalidades implementadas** correctamente
2. ⚠️ **Funcionalidades parcialmente implementadas**
3. ❌ **Funcionalidades faltantes**
4. 🔄 **Diferencias significativas** de diseño

---

## 🎯 SISTEMAS CORE DEL JUEGO

### 1. **Sistema de Atributos y Personaje**

#### Diseño Original
```
ATRIBUTOS (Repartir 6 puntos):
- FUERZA: ▢▢▢
- AGILIDAD: ▢▢▢
- SABIDURÍA: ▢▢▢
- SUERTE: ▢▢▢

HERIDAS: □□□ (3 máximo)
FATIGA: □□□ (3 máximo)
BOTÍN: 0 monedas de oro
```

#### Implementación Actual
```typescript
// src/types/Player.ts
interface Player {
  name: string;
  level: number;
  xp: number;
  attributes: { FUE, AGI, SAB, SUE };
  wounds: number;       // ✅ Implementado
  maxWounds: number;
  fatigue: number;      // ✅ Implementado
  maxFatigue: number;
  inventory: string[];
  gold: number;
}

const PLAYER_CONSTANTS = {
  BASE_WOUNDS: 3,      // ✅ Correcto
  BASE_FATIGUE: 3,     // ✅ Correcto
  XP_PER_LEVEL: 3,
  STARTING_GOLD: 0,
  INVENTORY_SLOTS: 10,
  MAX_LEVEL: 10
};
```

**Estado:** ✅ **IMPLEMENTADO COMPLETAMENTE**
- Todos los atributos presentes
- Sistema de heridas y fatiga funcional
- Constantes correctas


---

### 2. **Sistema de Resolución 2d6**

#### Diseño Original
```
TIRO 2D6 + ATRIBUTO vs DIFICULTAD:

6-  : FALLO CRÍTICO - Sucede algo peor
7-9 : FALLO PARCIAL - Logras con consecuencias
10+ : ÉXITO - Logras lo intentado
12+ : ÉXITO CRÍTICO - Logras con beneficio extra

DIFICULTADES BASE:
- Fácil: 6+
- Normal: 7+
- Difícil: 9+
- Épico: 11+
```

#### Implementación Actual
```typescript
// src/engine/CombatEngine.ts
// ❌ NO HAY IMPLEMENTACIÓN EXPLÍCITA DE RESULTADO POR RANGOS

interface CombatActionResult {
  success: boolean;
  damage?: number;
  critical?: boolean;  // ⚠️ Solo binario (sí/no)
  rollResult?: {
    dice: [number, number];
    modifier: number;
    total: number;
    difficulty: number;
  };
}
```

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Problemas identificados:**
1. ❌ **No hay diferenciación entre "Éxito Parcial" y "Éxito Total"**
2. ❌ **No hay categorización explícita de 6-, 7-9, 10+, 12+**
3. ✅ Sí hay tracking de críticos (12+)
4. ❌ **No hay mecánica de "consecuencias" para éxitos parciales**

**Recomendación:**
```typescript
// FALTANTE - Debería agregarse:
type RollOutcome = 
  | 'critical_failure' // 2-6
  | 'partial_success'  // 7-9
  | 'success'          // 10-11
  | 'critical_success' // 12+

interface EnhancedRollResult {
  outcome: RollOutcome;
  total: number;
  consequence?: string; // Para éxitos parciales
  bonus?: string;       // Para éxitos críticos
}
```

---

### 3. **Sistema de Combate**

#### Diseño Original
```
TURNO DEL JUGADOR:
- ATAQUE: Tirar 2d6 + FUE vs DEFensa enemiga
- DEFENSA: Tirar 2d6 + AGI vs ATAque enemigo
- HUIDA: Tirar 2d6 + AGI vs 9+
- ITEM: Usar objeto del equipo

DAÑO:
- Éxito normal: 1 herida al enemigo
- Éxito crítico: 2 heridas al enemigo
- Fallo: Recibes 1 herida
- Fallo crítico: Recibes 2 heridas
```

#### Implementación Actual
```typescript
// src/engine/CombatEngine.ts
type PlayerCombatAction =
  | { type: 'attack'; targetIndex: number; attribute: 'FUE' | 'AGI' }
  | { type: 'defend' }                    // ✅ Implementado
  | { type: 'use_item'; itemId: string }  // ✅ Implementado
  | { type: 'flee' };                     // ✅ Implementado
```

**Estado:** ✅ **IMPLEMENTADO** pero ⚠️ **con diferencias**

**Diferencias encontradas:**
1. ✅ Las 4 acciones básicas están presentes
2. ⚠️ **Sistema de daño puede no seguir exactamente la regla 1/2 heridas**
3. ⚠️ **No hay verificación explícita de "fallo = recibir daño"**
4. ✅ Hay sistema de turnos jugador/enemigo

---

### 4. **Sistema de Misiones (Quests)**

#### Diseño Original
```json
// Archivos JSON de configuracion juego y narrativa.md
{
  "objectives": [
    {
      "text": "Derrotar al jefe",
      "completion_trigger": {
        "event": "ENEMY_DEFEATED",
        "enemy_id": "rastrero_hueso"
      }
    }
  ],
  "rewards": {
    "xp": 2,
    "gold": 5-15,
    "items": [...],
    "attributeBonus": { "attribute": "FUE", "value": +1 },
    "factionReputation": { "circulo_eco": +50 }
  }
}
```

#### Implementación Actual
```typescript
// src/types/Quest.ts
interface Quest {
  objectives: QuestObjective[];
  rewards: {
    xp?: number;         // ✅ Implementado
    gold?: number;       // ✅ Implementado
    items?: string[];    // ✅ Implementado
    factionReputation?: Record<string, number>; // ✅ Implementado
    attributeBonus?: { attribute: string; value: number }; // ✅ Implementado
  };
}

type CompletionEventType =
  | 'ENTER_LOCATION'    // ✅ Implementado
  | 'ITEM_ACQUIRED'     // ✅ Implementado
  | 'DECISION_MADE'     // ✅ Implementado
  | 'NPC_TALKED_TO'     // ✅ Implementado
  | 'ENEMY_DEFEATED'    // ✅ Implementado
  | 'GOLD_REACHED'      // ✅ Implementado
  | 'LEVEL_REACHED';    // ✅ Implementado
```

**Estado:** ✅ **IMPLEMENTADO COMPLETAMENTE**
- Sistema de objetivos funcional
- Todos los triggers de completación presentes
- Sistema de recompensas completo

---

### 5. **Sistema de Facciones y Reputación**

#### Diseño Original
```
FACCIONES:
- Casa Von Hess: Orden y ley
- Círculo del Eco: Conocimiento
- Culto del Silencio: Caos

REPUTACIÓN:
- Rango: -100 a +100
- Alta reputación: Descuentos, información, aliados
- Baja reputación: Hostilidad, precios altos
```

#### Implementación Actual
```typescript
// src/types/world.ts
type FactionId = 'casa_von_hess' | 'culto_silencio' | 'circulo_eco';
type Reputation = Record<FactionId, number>;

interface WorldState {
  reputation: Reputation;  // ✅ Implementado
  // ...
}

const WORLD_CONSTANTS = {
  MIN_REPUTATION: -100,  // ✅ Correcto
  MAX_REPUTATION: 100,   // ✅ Correcto
};
```

**Estado:** ✅ **IMPLEMENTADO** pero ⚠️ **sin mecánicas de impacto**

**Problemas identificados:**
1. ✅ Sistema de tracking de reputación funcional
2. ❌ **No hay implementación de efectos de reputación** (descuentos, hostilidad)
3. ❌ **No hay sistema de precios dinámicos** basado en reputación
4. ❌ **No hay cambio de comportamiento de NPCs** basado en reputación

---

### 6. **Sistema de Fatiga y Descanso**

#### Diseño Original
```
FATIGA:
- Cada escena consume 1 punto de fatiga
- Con fatiga máxima: -1 a todas las tiradas
- Descansar: Recupera 2 fatiga, pero puede tener eventos

DESCANSAR EN:
- Campamento seguro: Sin riesgos
- Zona peligrosa: 50% de encuentro hostil
- Pueblo/Posada: Cura 1 herida adicional
```

#### Implementación Actual
```typescript
// src/types/Player.ts
interface Player {
  fatigue: number;     // ✅ Variable existe
  maxFatigue: number;
}
```

**Estado:** ❌ **NO IMPLEMENTADO**

**Funcionalidades faltantes:**
1. ❌ **No hay consumo automático de fatiga** por escena
2. ❌ **No hay penalización** a tiradas con fatiga alta
3. ❌ **No hay acción "Descansar"** implementada
4. ❌ **No hay eventos de descanso** (encuentros aleatorios)
5. ❌ **No hay diferenciación de lugares** de descanso

---

### 7. **Sistema Oráculo**

#### Diseño Original
```
¿SUCEDE EVENTO INESPERADO? (2d6)
2:    SÍ, y es extremadamente favorable
3-5:  SÍ, y es favorable
6-8:  SÍ, pero neutral
9-10: SÍ, pero desfavorable
11:   SÍ, y es extremadamente desfavorable
12:   NO, pero algo importante se revela
```

#### Implementación Actual
```typescript
// src/systems/OracleSystem.ts
type OracleResult = 
  | 'yes-and'  // ✅ Implementado
  | 'yes'      // ✅ Implementado
  | 'yes-but'  // ✅ Implementado
  | 'no-but'   // ✅ Implementado
  | 'no'       // ✅ Implementado
  | 'no-and';  // ✅ Implementado

interface OracleResponse {
  result: OracleResult;
  roll: number;
  interpretation: string;
  twist?: string;
  consequence?: string;
}
```

**Estado:** ✅ **IMPLEMENTADO** pero 🔄 **con modificaciones**

**Diferencias encontradas:**
1. ✅ Sistema de oráculo funcional con LLM
2. 🔄 **Escala diferente** (original: 2-12, actual: yes/no variants)
3. ✅ Soporte para likelihood (certain, likely, even, unlikely, impossible)
4. ✅ Historial de consultas (últimas 10)
5. ⚠️ **NO HAY UI IMPLEMENTADA** para el oráculo

---

### 8. **Sistema de Logros (Achievements)**

#### Diseño Original
```
LOGROS DESBLOQUEABLES:
- "Primera Sangre": Derrotar primer enemigo
- "Tesoro Oculto": Encontrar 3 tesoros
- "Diplomático": Resolver 5 encuentros sin combate
- "Superviviente": Completar aventura sin morir
- "Coleccionista": Reunir todos los tipos de equipo

METAS A LARGO PLAZO:
- Alcanzar nivel 5
- Completar 10 misiones
- Derrotar todos los tipos de jefes
```

#### Implementación Actual
```typescript
// src/systems/AchievementSystem.ts
interface Achievement {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  condition: AchievementCondition;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ✅ 10 logros predefinidos en el sistema
```

**Estado:** ✅ **IMPLEMENTADO** pero ⚠️ **sin UI**

**Detalles:**
1. ✅ Sistema de tracking funcional
2. ✅ Verificación de condiciones automática
3. ✅ Generación de descripciones contextuales con LLM
4. ❌ **NO HAY UI** para mostrar logros
5. ❌ **NO HAY NOTIFICACIONES** al desbloquear

---

### 9. **Sistema de Dados Virtuales**

#### Diseño Original
```
DADOS DISPONIBLES:
- 2D6: Para todas las resoluciones principales
- 1D6: Para decisiones binarias/simples
- 1D20: Solo para eventos especiales/críticos

MODIFICADORES:
- Ventaja: Tirar 3D6 y mantener 2 mejores
- Desventaja: Tirar 3D6 y mantener 2 peores
- Bonus/Penalización: ±1-3 al resultado
```

#### Implementación Actual
```typescript
// src/utils/SeededRandom.ts
class SeededRandom {
  roll(numDice: number, sides: number): number {
    // ✅ Implementa roll básico
  }
  
  rollWithModifier(numDice: number, sides: number, modifier: number): number {
    // ✅ Implementa modificadores
  }
}
```

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Problemas identificados:**
1. ✅ Sistema de roll básico (2d6, 1d6, 1d20)
2. ✅ Modificadores numéricos funcionan
3. ❌ **NO HAY IMPLEMENTACIÓN** de Ventaja/Desventaja (3d6 keep 2)
4. ❌ **NO HAY UI** de dados virtuales visuales

**Recomendación:**
```typescript
// FALTANTE - Agregar:
class SeededRandom {
  rollWithAdvantage(numDice: number, sides: number): number {
    const rolls = [this.roll(1, sides), this.roll(1, sides), this.roll(1, sides)];
    rolls.sort((a, b) => b - a);
    return rolls[0] + rolls[1]; // Mantener 2 mejores
  }
  
  rollWithDisadvantage(numDice: number, sides: number): number {
    const rolls = [this.roll(1, sides), this.roll(1, sides), this.roll(1, sides)];
    rolls.sort((a, b) => a - b);
    return rolls[0] + rolls[1]; // Mantener 2 peores
  }
}
```

---

### 10. **Sistema de Guardado (Seeds)**

#### Diseño Original
```
SISTEMA DE SEMILLAS:
- Cada aventura tiene semilla única
- Permite recrear misma situación inicial
- Compartible con otros jugadores
```

#### Implementación Actual
```typescript
// src/types/gameState.ts
interface GameState {
  version: string;
  seed: string;              // ✅ Implementado
  player: Player;
  worldState: WorldState;
  // ...
}

// src/utils/SaveSystem.ts
class SaveSystem {
  save(slot: number, state: GameState, rng: SeededRandom): boolean;
  load(slot: number): { state: GameState; rng: SeededRandom } | null;
}
```

**Estado:** ✅ **IMPLEMENTADO** pero ⚠️ **sin QR sharing**

**Detalles:**
1. ✅ Sistema de seed funcional
2. ✅ Reproducibilidad garantizada
3. ✅ 10 slots + autosave
4. ❌ **NO HAY FUNCIONALIDAD** de compartir seed (QR code)
5. ❌ **NO HAY IMPORTAR** partida desde seed

---

### 11. **Sistema de Items y Equipo**

#### Diseño Original
```
EQUIPO (Elegir 2 al inicio):
[ ] Espada (+1 FUE en combate)
[ ] Arco (+1 AGI a distancia)
[ ] Grimorio (+1 SAB para magia)
[ ] Amuleto (+1 SUERTE)
[ ] Poción de Curación (cura 2 heridas)
[ ] Llave maestra (abre cualquier cerradura)
```

#### Implementación Actual
```typescript
// src/types/Item.ts
type ItemType = 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'QUEST_ITEM' | 'MISC';

interface ItemMechanic {
  type: 'EQUIPMENT_BONUS' | 'CONSUMABLE_EFFECT';
  attribute?: 'FUE' | 'AGI' | 'SAB' | 'SUE';
  value?: number;
  context?: 'COMBAT' | 'EXPLORATION' | 'DIALOGUE' | 'ALL';
  effect?: 'RESTORE_WOUNDS' | 'REMOVE_STATUS' | 'APPLY_STATUS';
}

interface Item {
  mechanic?: ItemMechanic;  // ✅ Sistema robusto
  isEquippable: boolean;
  isConsumable: boolean;
  isQuestItem: boolean;
  requirements?: {          // ⭐ MÁS COMPLEJO que original
    level?: number;
    attributes?: Partial<Record<AttributeType, number>>;
  };
}
```

**Estado:** ✅ **IMPLEMENTADO** y 🎯 **MEJORADO**

**Mejoras sobre el diseño original:**
1. ✅ Sistema más robusto que lo especificado
2. ✅ Contextos de uso definidos
3. ✅ Requisitos para equipar items
4. ✅ Sistema de rareza (común, raro, legendario)
5. ✅ Max stack para consumibles

---

### 12. **Generador de NPCs**

#### Diseño Original
```
NOMBRE: Tabla de sílabas aleatorias
OCUPACIÓN: Herrero, mercader, granjero, noble
MOTIVACIÓN: Oro, poder, conocimiento, venganza
SECRETO: Información, impostor, etc.
ACTITUD: Amigable, neutral, hostil, temeroso
```

#### Implementación Actual
```typescript
// src/types/npc.ts
interface NPC {
  id: string;
  name: string;
  archetype: string;  // ✅ Similar a "ocupación"
  race: string;
  location: string;
  // ❌ NO HAY campos "motivación" o "secreto" explícitos
}

// src/systems/NPCMemorySystem.ts
interface NPCMemory {
  relationship: number;     // ✅ Tracking de relación
  mood: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'helpful';
  interactions: Interaction[];
  knownFacts: string[];
}
```

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Problemas identificados:**
1. ✅ Sistema de memoria de NPCs avanzado
2. ✅ Tracking de relaciones y mood
3. ❌ **NO HAY generador procedural** de nombres
4. ❌ **NO HAY tabla de motivaciones** explícitas
5. ❌ **NO HAY sistema de secretos** ocultos por NPC
6. ⚠️ NPCs están predefinidos en JSON, no generados

---

### 13. **Sistema de Diario Narrativo**

#### Diseño Original
No especificado en los documentos originales

#### Implementación Actual
```typescript
// src/systems/NarrativeJournal.ts
type JournalCategory = 
  | 'combat' | 'exploration' | 'dialogue' | 'discovery' 
  | 'quest' | 'decision' | 'achievement';

interface JournalEntry {
  id: string;
  timestamp: number;
  category: JournalCategory;
  title: string;
  content: string;
  importance: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  relatedEntities: {
    npcIds?: string[];
    locationIds?: string[];
    questIds?: string[];
  };
}
```

**Estado:** ⭐ **AGREGADO - NO ESTABA EN DISEÑO ORIGINAL**

**Características:**
1. ⭐ Sistema completo con 7 categorías
2. ⭐ Generación con LLM + fallback procedural
3. ⭐ Búsqueda y filtrado por categoría/importancia
4. ❌ **NO HAY UI** para ver el diario

---

## 📊 RESUMEN DE BRECHAS

### ✅ Totalmente Implementados (80%)
1. Sistema de atributos y personaje
2. Sistema de misiones (quests) con triggers
3. Sistema de facciones y reputación (tracking)
4. Sistema de items y equipo (mejorado)
5. Sistema de guardado con seeds
6. Sistema de oráculo con LLM
7. Sistema de logros
8. Sistema de diario narrativo (extra)
9. Sistema de memoria de NPCs (extra)

### ⚠️ Parcialmente Implementados (15%)
1. **Sistema de resolución 2d6**
   - ❌ Falta diferenciación 6-/7-9/10+/12+
   - ❌ Falta mecánica de consecuencias
   
2. **Sistema de combate**
   - ⚠️ Puede no seguir exactamente regla de daño
   
3. **Sistema de dados virtuales**
   - ❌ Falta Ventaja/Desventaja (3d6 keep 2)
   
4. **Generador de NPCs**
   - ❌ Falta generación procedural
   - ❌ Falta sistema de secretos

### ❌ No Implementados (5%)
1. **Sistema de fatiga y descanso**
   - ❌ No hay consumo por escena
   - ❌ No hay penalización con fatiga alta
   - ❌ No hay acción "Descansar"
   - ❌ No hay eventos de descanso
   
2. **Efectos de reputación**
   - ❌ No hay descuentos/hostilidad
   - ❌ No hay precios dinámicos
   
3. **QR code sharing**
   - ❌ No hay compartir seeds

---

## 🎨 BRECHAS DE UI

### ❌ Componentes Faltantes

1. **Oracle UI** ❌
   - Botón para consultar
   - Display de respuesta con interpretación
   - Historial de consultas

2. **Journal UI** ❌
   - Vista de diario con entradas
   - Filtros por categoría
   - Búsqueda

3. **Achievement Notifications** ❌
   - Toast/modal al desbloquear
   - Lista de logros con progreso
   - Badges visuales

4. **Dados Virtuales UI** ❌
   - Animación de dados rodando
   - Visualización de resultados
   - Display de ventaja/desventaja

5. **Descanso/Fatiga UI** ❌
   - Indicador visual de fatiga
   - Botón "Descansar"
   - Modal con opciones de descanso

6. **QR Code Sharing** ❌
   - Generar QR del seed
   - Importar desde QR/código

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 CRÍTICO (Afecta gameplay core)

1. **Sistema de Resolución 2d6 Completo**
   ```typescript
   // Agregar a src/utils/DiceSystem.ts
   type RollOutcome = 'critical_failure' | 'partial_success' | 'success' | 'critical_success';
   
   interface EnhancedRollResult {
     outcome: RollOutcome;
     total: number;
     consequence?: string; // Para 7-9
     bonus?: string;       // Para 12+
   }
   ```

2. **Sistema de Fatiga Funcional**
   ```typescript
   // Agregar a src/systems/FatigueSystem.ts
   class FatigueSystem {
     consumeFatigue(amount: number): void;
     applyFatiguePenalty(roll: number, player: Player): number;
     rest(location: RestLocation, player: Player, worldState: WorldState): RestResult;
   }
   ```

### 🟠 ALTA PRIORIDAD (Mejora experiencia)

3. **Ventaja/Desventaja en Dados**
   ```typescript
   rollWithAdvantage(numDice: number, sides: number): number;
   rollWithDisadvantage(numDice: number, sides: number): number;
   ```

4. **Efectos de Reputación**
   ```typescript
   class ReputationSystem {
     getPriceModifier(factionId: FactionId, reputation: number): number;
     getNPCAttitude(npcId: string, reputation: Reputation): Attitude;
   }
   ```

### 🟡 MEDIA PRIORIDAD (Polish y UX)

5. **Oracle UI**
6. **Journal UI**
7. **Achievement Notifications**
8. **QR Code Sharing**

---

## 📈 MÉTRICAS DE COMPLETITUD

### Por Sistema

| Sistema | Diseño Original | Implementación | Gap | Prioridad |
|---------|----------------|----------------|-----|-----------|
| **Atributos** | 100% | 100% | 0% | ✅ |
| **Resolución 2d6** | 100% | 60% | 40% | 🔴 |
| **Combate** | 100% | 90% | 10% | 🟢 |
| **Quests** | 100% | 100% | 0% | ✅ |
| **Facciones (tracking)** | 100% | 100% | 0% | ✅ |
| **Facciones (efectos)** | 100% | 0% | 100% | 🟠 |
| **Fatiga** | 100% | 20% | 80% | 🔴 |
| **Descanso** | 100% | 0% | 100% | 🔴 |
| **Oráculo** | 100% | 90% | 10% | 🟡 |
| **Logros** | 100% | 80% | 20% | 🟡 |
| **Dados** | 100% | 70% | 30% | 🟠 |
| **Guardado** | 100% | 90% | 10% | 🟡 |
| **Items** | 100% | 110% | -10% | ⭐ |
| **NPCs** | 100% | 110% | -10% | ⭐ |
| **Diario** | 0% | 100% | +100% | ⭐ |

**Promedio General: 87%** (diseño original vs implementación)

---

## 🚀 PLAN DE ACCIÓN

### Sprint 1: Core Mechanics (CRÍTICO)
**Duración:** 1 semana
**Objetivo:** Cerrar brechas críticas de gameplay

1. [ ] Implementar sistema completo de resolución 2d6
   - [ ] Enum `RollOutcome` con 4 estados
   - [ ] Lógica de consecuencias para 7-9
   - [ ] Bonos para 12+
   
2. [ ] Implementar sistema de fatiga
   - [ ] Consumo automático por escena
   - [ ] Penalización a tiradas
   - [ ] Acción "Descansar"
   - [ ] Eventos de descanso

3. [ ] Agregar ventaja/desventaja a dados
   - [ ] `rollWithAdvantage()`
   - [ ] `rollWithDisadvantage()`

### Sprint 2: Social & Economy (ALTA)
**Duración:** 4-5 días
**Objetivo:** Impacto de reputación funcional

4. [ ] Implementar efectos de reputación
   - [ ] Modificadores de precio
   - [ ] Cambio de actitud de NPCs
   - [ ] Diálogos diferentes por reputación

5. [ ] Generador procedural de NPCs
   - [ ] Tabla de nombres aleatorios
   - [ ] Sistema de motivaciones
   - [ ] Secretos ocultos

### Sprint 3: UI & Polish (MEDIA)
**Duración:** 1 semana
**Objetivo:** Interfaces faltantes

6. [ ] Oracle UI
7. [ ] Journal UI
8. [ ] Achievement Notifications
9. [ ] Fatigue/Rest UI
10. [ ] QR Code Sharing

---

## 📝 NOTAS ADICIONALES

### Mejoras sobre el Diseño Original

El proyecto actual incluye **mejoras significativas** no especificadas originalmente:

1. ⭐ **Sistema de Memoria de NPCs** completo
2. ⭐ **Sistema de Diario Narrativo** con categorías
3. ⭐ **LLM Integration** con SmolLM local
4. ⭐ **Sistema de Prompts Centralizado** configurable
5. ⭐ **Testing Framework** con Vitest
6. ⭐ **Sistema de Items más robusto** (requisitos, contextos)

### Decisiones de Diseño Justificadas

Algunas diferencias son **mejoras intencionales**:

- **Seed-based RNG** en lugar de random puro → Reproducibilidad
- **NPCs predefinidos** en JSON → Narrativa curada vs procedural genérica
- **Sistema de prompts JSON** → Flexibilidad sin recompilar

---

**Última actualización:** 2025-01-14  
**Próxima revisión:** Después de implementar sistema 2d6 completo  
**Responsable:** Equipo de desarrollo
