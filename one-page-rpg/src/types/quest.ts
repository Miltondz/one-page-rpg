/**
 * Tipo de misión
 */
export type QuestType = 'main' | 'side' | 'random';

/**
 * Estado de una misión
 */
export type QuestStatus = 'not_started' | 'active' | 'completed' | 'failed';

/**
 * Tipo de evento para completar un objetivo
 */
export type CompletionEventType =
  | 'ENTER_LOCATION'
  | 'ITEM_ACQUIRED'
  | 'DECISION_MADE'
  | 'NPC_TALKED_TO'
  | 'ENEMY_DEFEATED'
  | 'GOLD_REACHED'
  | 'LEVEL_REACHED';

/**
 * Trigger para completar un objetivo
 */
export interface CompletionTrigger {
  /** Tipo de evento */
  event: CompletionEventType;

  /** ID de la entidad relacionada */
  locationId?: string;
  itemId?: string;
  decisionId?: string;
  npcId?: string;
  enemyId?: string;

  /** Cantidad requerida */
  amount?: number;
}

/**
 * Objetivo de una misión
 */
export interface QuestObjective {
  /** Texto descriptivo del objetivo */
  text: string;

  /** Trigger para completarlo */
  completionTrigger: CompletionTrigger;

  /** Si está completado */
  isCompleted: boolean;

  /** Si es opcional */
  isOptional?: boolean;
}

/**
 * Recompensas de una misión
 */
export interface QuestRewards {
  /** Puntos de experiencia */
  xp?: number;

  /** Oro */
  gold?: number;

  /** Items */
  items?: string[];

  /** Cambios de reputación */
  factionReputation?: Record<string, number>;

  /** Atributo permanente */
  attributeBonus?: {
    attribute: string;
    value: number;
  };
}

/**
 * Misión del juego
 */
export interface Quest {
  /** ID único de la misión */
  id: string;

  /** Nombre de la misión */
  name: string;

  /** Tipo de misión */
  type: QuestType;

  /** Acto en el que ocurre */
  act: number;

  /** ID del NPC que da la misión */
  giver: string;

  /** Descripción de la misión */
  description: string;

  /** Objetivos de la misión */
  objectives: QuestObjective[];

  /** Recompensas */
  rewards: QuestRewards;

  /** Estado actual */
  status: QuestStatus;

  /** ID de la siguiente misión en la cadena */
  nextQuest?: string;

  /** Timestamp de inicio */
  startedAt?: number;

  /** Timestamp de finalización */
  completedAt?: number;
}

/**
 * Componentes para generador de side quests
 */
export interface SideQuestComponents {
  /** Templates de misión */
  templates: string[];

  /** Componentes reutilizables */
  components: {
    givers: Array<{ text: string }>;
    locationsGiver: string[];
    actions: string[];
    targets: Array<{ id: string; text: string }>;
    locationsTarget: Array<{ id: string; text: string; enemies: string[] }>;
    complications: Array<{
      id: string;
      text: string;
      effect: {
        spawnEnemyPool?: string;
        triggerDecision?: string;
      };
    }>;
    rewardsPool: Record<string, QuestRewards>;
  };
}
