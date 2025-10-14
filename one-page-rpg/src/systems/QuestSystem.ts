/**
 * Quest System - Sistema de Misiones y Tracking
 * 
 * Genera misiones procedurales usando 2d6 y mantiene tracking de progreso
 */

import type { SeededRandom } from '../utils/SeededRandom';
import type { Player } from '../types/Player';
import type { WorldState } from '../types/World';

/**
 * Tipos de misiones generables
 */
export type QuestType =
  | 'delivery'      // Entregar algo a alguien
  | 'combat'        // Derrotar enemigos
  | 'explore'       // Explorar una locación
  | 'talk'          // Hablar con NPCs
  | 'collect'       // Recolectar items
  | 'escort'        // Escoltar NPC
  | 'investigate';  // Investigar misterio

/**
 * Objetivo de misión
 */
export interface QuestObjective {
  id: string;
  type: QuestType;
  description: string;
  required: boolean;
  completed: boolean;
  location?: string;
  targetNpc?: string;
  enemies?: string[];
  items?: string[];
  count?: number;
  currentCount?: number;
  rewards: {
    xp?: number;
    gold?: number;
    items?: string[];
  };
}

/**
 * Misión completa
 */
export interface Quest {
  id: string;
  title: string;
  type: 'main_quest' | 'side_quest' | 'random_event';
  levelRange: [number, number];
  giver: string;
  startingLocation: string;
  description: string;
  objectives: QuestObjective[];
  rewards: {
    xp: number;
    gold: number;
    items?: string[];
  };
  active: boolean;
  completed: boolean;
  failed: boolean;
}

/**
 * Tabla de tipos de misión (2d6)
 */
const QUEST_TYPE_TABLE: Record<number, QuestType> = {
  2: 'investigate',
  3: 'delivery',
  4: 'talk',
  5: 'collect',
  6: 'explore',
  7: 'combat',
  8: 'combat',
  9: 'escort',
  10: 'explore',
  11: 'delivery',
  12: 'investigate',
};

/**
 * Tabla de NPCs (2d6)
 */
const NPC_TABLE: Record<number, string> = {
  2: 'Eremita Misterioso',
  3: 'Mercader Ambulante',
  4: 'Guardia Corrupto',
  5: 'Campesino Desesperado',
  6: 'Curandera del Pueblo',
  7: 'Tabernero Chismoso',
  8: 'Herrero del Pueblo',
  9: 'Sacerdote Oscuro',
  10: 'Noble Arruinado',
  11: 'Mago Exiliado',
  12: 'Líder del Culto',
};

/**
 * Tabla de locaciones (2d6)
 */
const LOCATION_TABLE: Record<number, string> = {
  2: 'Catacumbas Prohibidas',
  3: 'Bosque Maldito',
  4: 'Ruinas Antiguas',
  5: 'Aldea Abandonada',
  6: 'Taberna del Cuervo',
  7: 'Plaza del Mercado',
  8: 'Torre del Vigilante',
  9: 'Cripta Sellada',
  10: 'Minas Profundas',
  11: 'Caverna de Cristales',
  12: 'Mansión Embrujada',
};

/**
 * Tabla de recompensas (2d6)
 */
const REWARD_TABLE: Record<number, { xp: number; gold: number }> = {
  2: { xp: 3, gold: 25 },
  3: { xp: 1, gold: 10 },
  4: { xp: 1, gold: 15 },
  5: { xp: 2, gold: 10 },
  6: { xp: 1, gold: 20 },
  7: { xp: 2, gold: 15 },
  8: { xp: 2, gold: 20 },
  9: { xp: 2, gold: 25 },
  10: { xp: 3, gold: 20 },
  11: { xp: 3, gold: 30 },
  12: { xp: 5, gold: 50 },
};

/**
 * Sistema de misiones
 */
export class QuestSystem {
  private rng: SeededRandom;
  private activeQuests: Quest[] = [];
  private completedQuests: string[] = [];

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  /**
   * Genera una misión procedural usando 2d6
   */
  generateQuest(playerLevel: number, type: 'main_quest' | 'side_quest' | 'random_event' = 'side_quest'): Quest {
    // Rolls para generar la misión
    const questTypeRoll = this.rng.roll2d6().total;
    const giverRoll = this.rng.roll2d6().total;
    const locationRoll = this.rng.roll2d6().total;
    const rewardRoll = this.rng.roll2d6().total;

    const questType = QUEST_TYPE_TABLE[questTypeRoll];
    const giver = NPC_TABLE[giverRoll];
    const location = LOCATION_TABLE[locationRoll];
    const rewards = REWARD_TABLE[rewardRoll];

    // Ajustar recompensas según nivel
    const levelMultiplier = 1 + (playerLevel - 1) * 0.5;
    const adjustedRewards = {
      xp: Math.floor(rewards.xp * levelMultiplier),
      gold: Math.floor(rewards.gold * levelMultiplier),
    };

    // Generar objetivos basados en el tipo
    const objectives = this.generateObjectives(questType, location, playerLevel);

    // Generar título descriptivo
    const title = this.generateQuestTitle(questType, location);

    // Generar descripción
    const description = this.generateQuestDescription(questType, giver, location);

    const quest: Quest = {
      id: this.rng.uuid(),
      title,
      type,
      levelRange: [Math.max(1, playerLevel - 1), playerLevel + 1],
      giver,
      startingLocation: location,
      description,
      objectives,
      rewards: adjustedRewards,
      active: false,
      completed: false,
      failed: false,
    };

    return quest;
  }

  /**
   * Genera objetivos para una misión
   */
  private generateObjectives(type: QuestType, location: string, playerLevel: number): QuestObjective[] {
    const objectives: QuestObjective[] = [];

    switch (type) {
      case 'delivery':
        objectives.push({
          id: this.rng.uuid(),
          type: 'collect',
          description: 'Obtener el paquete',
          required: true,
          completed: false,
          items: ['package'],
          count: 1,
          currentCount: 0,
          rewards: { xp: 0 },
        });
        objectives.push({
          id: this.rng.uuid(),
          type: 'delivery',
          description: `Entregar el paquete en ${location}`,
          required: true,
          completed: false,
          location,
          items: ['package'],
          rewards: { xp: 1 },
        });
        break;

      case 'combat':
        const enemyCount = this.rng.nextInt(2, 4);
        objectives.push({
          id: this.rng.uuid(),
          type: 'combat',
          description: `Derrota ${enemyCount} enemigos en ${location}`,
          required: true,
          completed: false,
          location,
          enemies: Array(enemyCount).fill('generic_enemy'),
          count: enemyCount,
          currentCount: 0,
          rewards: { xp: Math.max(1, Math.floor(enemyCount / 2)), gold: enemyCount * 5 },
        });
        break;

      case 'explore':
        objectives.push({
          id: this.rng.uuid(),
          type: 'explore',
          description: `Explorar ${location}`,
          required: true,
          completed: false,
          location,
          rewards: { xp: 1 },
        });
        objectives.push({
          id: this.rng.uuid(),
          type: 'collect',
          description: 'Encontrar 3 pistas',
          required: true,
          completed: false,
          items: ['clue'],
          count: 3,
          currentCount: 0,
          rewards: { xp: 1 },
        });
        break;

      case 'talk':
        objectives.push({
          id: this.rng.uuid(),
          type: 'talk',
          description: `Hablar con el informante en ${location}`,
          required: true,
          completed: false,
          location,
          targetNpc: 'informant',
          rewards: { xp: 1 },
        });
        break;

      case 'collect':
        const itemCount = this.rng.nextInt(3, 6);
        objectives.push({
          id: this.rng.uuid(),
          type: 'collect',
          description: `Recolectar ${itemCount} items en ${location}`,
          required: true,
          completed: false,
          location,
          items: ['quest_item'],
          count: itemCount,
          currentCount: 0,
          rewards: { xp: 2, gold: 10 },
        });
        break;

      case 'escort':
        objectives.push({
          id: this.rng.uuid(),
          type: 'escort',
          description: `Escoltar al NPC a ${location}`,
          required: true,
          completed: false,
          location,
          targetNpc: 'escort_target',
          rewards: { xp: 2, gold: 15 },
        });
        break;

      case 'investigate':
        objectives.push({
          id: this.rng.uuid(),
          type: 'explore',
          description: `Investigar ${location}`,
          required: true,
          completed: false,
          location,
          rewards: { xp: 1 },
        });
        objectives.push({
          id: this.rng.uuid(),
          type: 'talk',
          description: 'Interrogar a 2 testigos',
          required: true,
          completed: false,
          count: 2,
          currentCount: 0,
          rewards: { xp: 1 },
        });
        objectives.push({
          id: this.rng.uuid(),
          type: 'collect',
          description: 'Reunir 3 evidencias',
          required: true,
          completed: false,
          items: ['evidence'],
          count: 3,
          currentCount: 0,
          rewards: { xp: 1 },
        });
        break;
    }

    return objectives;
  }

  /**
   * Genera título para la misión
   */
  private generateQuestTitle(type: QuestType, location: string): string {
    const titlePrefixes: Record<QuestType, string[]> = {
      delivery: ['Entrega Urgente', 'El Paquete', 'Misión de Correo'],
      combat: ['Exterminio', 'Limpieza', 'Caza'],
      explore: ['Expedición', 'Exploración', 'Descubrimiento'],
      talk: ['Audiencia', 'Encuentro', 'Negociación'],
      collect: ['Recolección', 'La Búsqueda', 'Reunión'],
      escort: ['Escolta', 'Protección', 'Guía'],
      investigate: ['Investigación', 'El Misterio', 'Caso'],
    };

    const prefix = this.rng.pick(titlePrefixes[type]);
    return `${prefix} en ${location}`;
  }

  /**
   * Genera descripción para la misión
   */
  private generateQuestDescription(type: QuestType, giver: string, location: string): string {
    const descriptions: Record<QuestType, string[]> = {
      delivery: [
        `${giver} necesita que entregues un paquete importante en ${location}.`,
        `Debes llevar un objeto secreto a ${location} para ${giver}.`,
      ],
      combat: [
        `${giver} te pide que elimines las amenazas en ${location}.`,
        `Criaturas peligrosas acechan ${location}. ${giver} necesita tu ayuda.`,
      ],
      explore: [
        `${giver} quiere que explores ${location} y reportes tus hallazgos.`,
        `Hay secretos ocultos en ${location}. ${giver} te envía a investigar.`,
      ],
      talk: [
        `${giver} necesita que hables con alguien en ${location}.`,
        `Debes entregar un mensaje de ${giver} a un contacto en ${location}.`,
      ],
      collect: [
        `${giver} busca items específicos que solo se encuentran en ${location}.`,
        `Necesitas recolectar materiales raros de ${location} para ${giver}.`,
      ],
      escort: [
        `${giver} necesita protección para llegar a ${location}.`,
        `Debes escoltar a ${giver} sano y salvo hasta ${location}.`,
      ],
      investigate: [
        `${giver} te contrata para resolver un misterio en ${location}.`,
        `Eventos extraños ocurren en ${location}. ${giver} quiere respuestas.`,
      ],
    };

    return this.rng.pick(descriptions[type]);
  }

  /**
   * Activa una misión
   */
  activateQuest(quest: Quest): void {
    quest.active = true;
    if (!this.activeQuests.find(q => q.id === quest.id)) {
      this.activeQuests.push(quest);
    }
  }

  /**
   * Completa un objetivo de misión
   */
  completeObjective(questId: string, objectiveId: string): {
    success: boolean;
    objective?: QuestObjective;
    questCompleted: boolean;
    rewards: { xp: number; gold: number; items?: string[] };
  } {
    const quest = this.activeQuests.find(q => q.id === questId);
    
    if (!quest) {
      return {
        success: false,
        questCompleted: false,
        rewards: { xp: 0, gold: 0 },
      };
    }

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    
    if (!objective || objective.completed) {
      return {
        success: false,
        questCompleted: false,
        rewards: { xp: 0, gold: 0 },
      };
    }

    // Marcar objetivo como completado
    objective.completed = true;

    // Verificar si la misión está completa
    const requiredObjectives = quest.objectives.filter(obj => obj.required);
    const allRequiredComplete = requiredObjectives.every(obj => obj.completed);

    if (allRequiredComplete) {
      quest.completed = true;
      quest.active = false;
      this.completedQuests.push(quest.id);
    }

    return {
      success: true,
      objective,
      questCompleted: allRequiredComplete,
      rewards: {
        xp: objective.rewards.xp || 0,
        gold: objective.rewards.gold || 0,
        items: objective.rewards.items,
      },
    };
  }

  /**
   * Progresa un objetivo de tipo contador
   */
  progressObjective(questId: string, objectiveId: string, amount: number = 1): {
    success: boolean;
    currentCount: number;
    completed: boolean;
  } {
    const quest = this.activeQuests.find(q => q.id === questId);
    
    if (!quest) {
      return { success: false, currentCount: 0, completed: false };
    }

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    
    if (!objective || !objective.count) {
      return { success: false, currentCount: 0, completed: false };
    }

    objective.currentCount = (objective.currentCount || 0) + amount;
    
    if (objective.currentCount >= objective.count) {
      objective.completed = true;
    }

    return {
      success: true,
      currentCount: objective.currentCount,
      completed: objective.completed,
    };
  }

  /**
   * Obtiene todas las misiones activas
   */
  getActiveQuests(): Quest[] {
    return this.activeQuests.filter(q => q.active);
  }

  /**
   * Obtiene los objetivos actuales de una misión
   */
  getQuestObjectives(questId: string): QuestObjective[] {
    const quest = this.activeQuests.find(q => q.id === questId);
    return quest ? quest.objectives : [];
  }

  /**
   * Calcula el progreso de una misión (0-100%)
   */
  getQuestProgress(questId: string): number {
    const quest = this.activeQuests.find(q => q.id === questId);
    
    if (!quest) return 0;

    const requiredObjectives = quest.objectives.filter(obj => obj.required);
    const completedRequired = requiredObjectives.filter(obj => obj.completed).length;
    
    return Math.floor((completedRequired / requiredObjectives.length) * 100);
  }

  /**
   * Abandona una misión
   */
  abandonQuest(questId: string): boolean {
    const index = this.activeQuests.findIndex(q => q.id === questId);
    
    if (index === -1) return false;

    this.activeQuests.splice(index, 1);
    return true;
  }

  /**
   * Obtiene misiones completadas
   */
  getCompletedQuests(): string[] {
    return [...this.completedQuests];
  }

  /**
   * Verifica si una misión está disponible para el jugador
   */
  isQuestAvailable(quest: Quest, playerLevel: number): boolean {
    const [minLevel, maxLevel] = quest.levelRange;
    return playerLevel >= minLevel && playerLevel <= maxLevel;
  }
}

// Exportar tablas para uso externo
export { QUEST_TYPE_TABLE, NPC_TABLE, LOCATION_TABLE, REWARD_TABLE };

export default QuestSystem;
