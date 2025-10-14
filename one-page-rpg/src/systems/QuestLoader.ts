/**
 * Quest Loader - Adaptador para cargar misiones desde JSON
 * 
 * Convierte el formato JSON de campaña al formato interno del QuestSystem
 */

import type { Quest, QuestObjective, QuestType } from './QuestSystem';

/**
 * Estructura de quest en JSON (formato de campaña)
 */
export interface QuestJSON {
  quest: {
    id: string;
    title: string;
    type: 'main_quest' | 'side_quest' | 'random_event';
    level_range: [number, number];
    giver: string;
    starting_location: string;
    description: string;
    objectives: ObjectiveJSON[];
    branches?: BranchJSON[];
    rewards: {
      base: {
        xp: number;
        gold: number;
        items?: string[];
      };
      optional_bonus?: {
        xp?: number;
        gold?: number;
        items?: string[];
      };
    };
    failure_conditions?: FailureConditionJSON[];
  };
}

export interface ObjectiveJSON {
  id: string;
  type: string;
  description: string;
  required: boolean;
  completed: boolean;
  location?: string;
  target_npc?: string;
  enemies?: string[];
  boss?: string;
  item?: string;
  items?: string[];
  count?: number;
  rewards?: {
    xp?: number;
    gold?: number;
    items?: string[];
  };
}

export interface BranchJSON {
  id: string;
  trigger: string;
  description: string;
  consequences: ConsequenceJSON[];
}

export interface ConsequenceJSON {
  type: 'relationship' | 'reward' | 'unlock_quest' | 'unlock_location';
  target?: string;
  value?: number;
  gold?: number;
  items?: string[];
  quest_id?: string;
  location_id?: string;
}

export interface FailureConditionJSON {
  condition: string;
  result: string;
}

/**
 * Cargador de misiones desde JSON
 */
export class QuestLoader {
  /**
   * Convierte una quest de formato JSON a formato interno
   */
  static fromJSON(questJSON: QuestJSON): Quest {
    const quest = questJSON.quest;

    // Convertir objetivos
    const objectives = quest.objectives.map(obj => this.convertObjective(obj));

    // Calcular recompensas totales
    const baseRewards = quest.rewards.base;
    const bonusRewards = quest.rewards.optional_bonus || {};
    
    const totalRewards = {
      xp: baseRewards.xp + (bonusRewards.xp || 0),
      gold: baseRewards.gold + (bonusRewards.gold || 0),
      items: [
        ...(baseRewards.items || []),
        ...(bonusRewards.items || []),
      ],
    };

    const convertedQuest: Quest = {
      id: quest.id,
      title: quest.title,
      type: quest.type,
      levelRange: quest.level_range as [number, number],
      giver: quest.giver,
      startingLocation: quest.starting_location,
      description: quest.description,
      objectives,
      rewards: totalRewards,
      active: false,
      completed: false,
      failed: false,
    };

    return convertedQuest;
  }

  /**
   * Convierte un objetivo de JSON a formato interno
   */
  private static convertObjective(obj: ObjectiveJSON): QuestObjective {
    // Normalizar tipo de objetivo
    let type: QuestType;
    switch (obj.type) {
      case 'talk':
        type = 'talk';
        break;
      case 'combat':
        type = 'combat';
        break;
      case 'delivery':
        type = 'delivery';
        break;
      case 'explore':
        type = 'explore';
        break;
      case 'collect':
        type = 'collect';
        break;
      default:
        type = 'talk'; // Fallback
    }

    const objective: QuestObjective = {
      id: obj.id,
      type,
      description: obj.description,
      required: obj.required,
      completed: obj.completed,
      location: obj.location,
      targetNpc: obj.target_npc,
      rewards: obj.rewards || { xp: 0 },
    };

    // Manejar enemigos (combat)
    if (obj.enemies || obj.boss) {
      objective.enemies = obj.boss ? [obj.boss] : obj.enemies;
      objective.count = objective.enemies?.length || 0;
      objective.currentCount = 0;
    }

    // Manejar items (collect/delivery)
    if (obj.item) {
      objective.items = [obj.item];
      objective.count = 1;
      objective.currentCount = 0;
    } else if (obj.items) {
      objective.items = obj.items;
      objective.count = obj.count || obj.items.length;
      objective.currentCount = 0;
    }

    return objective;
  }

  /**
   * Carga una quest desde una URL/path de JSON
   */
  static async loadFromPath(path: string): Promise<Quest | null> {
    try {
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`Failed to load quest from ${path}: ${response.statusText}`);
      }

      const questJSON: QuestJSON = await response.json();
      return this.fromJSON(questJSON);
    } catch (error) {
      console.error('Error loading quest:', error);
      return null;
    }
  }

  /**
   * Carga múltiples quests desde varios paths
   */
  static async loadMultiple(paths: string[]): Promise<Quest[]> {
    const quests = await Promise.all(
      paths.map(path => this.loadFromPath(path))
    );

    return quests.filter((q): q is Quest => q !== null);
  }

  /**
   * Extrae branches de una quest JSON
   * (Se pueden usar para lógica de decisiones narrativas)
   */
  static extractBranches(questJSON: QuestJSON): BranchJSON[] {
    return questJSON.quest.branches || [];
  }

  /**
   * Extrae condiciones de fallo de una quest JSON
   */
  static extractFailureConditions(questJSON: QuestJSON): FailureConditionJSON[] {
    return questJSON.quest.failure_conditions || [];
  }

  /**
   * Verifica si un objetivo puede ser completado según las condiciones actuales
   */
  static canCompleteObjective(
    objective: QuestObjective,
    playerInventory: string[],
    currentLocation: string
  ): { canComplete: boolean; reason?: string } {
    // Verificar locación
    if (objective.location && objective.location !== currentLocation) {
      return {
        canComplete: false,
        reason: `Debes estar en: ${objective.location}`,
      };
    }

    // Verificar items necesarios (delivery)
    if (objective.type === 'delivery' && objective.items) {
      const hasAllItems = objective.items.every(item =>
        playerInventory.includes(item)
      );

      if (!hasAllItems) {
        return {
          canComplete: false,
          reason: `Necesitas: ${objective.items.join(', ')}`,
        };
      }
    }

    // Verificar contadores (combat, collect)
    if (objective.count && objective.currentCount !== undefined) {
      if (objective.currentCount < objective.count) {
        return {
          canComplete: false,
          reason: `Progreso: ${objective.currentCount}/${objective.count}`,
        };
      }
    }

    return { canComplete: true };
  }
}

export default QuestLoader;
