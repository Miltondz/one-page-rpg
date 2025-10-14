import type { AttributeType } from './attributes';

/**
 * Tipo de escena
 */
export type SceneType = 'combat' | 'exploration' | 'dialogue' | 'rest' | 'decision';

/**
 * Tipo de encuentro
 */
export type EncounterType = 
  | 'creature'   // Combate/resolución con criatura
  | 'npc'        // Diálogo/negociación
  | 'obstacle'   // Superar con atributo
  | 'treasure'   // Recompensa/riesgo
  | 'mystery'    // Investigar/resolver
  | 'event';     // Sorpresa/oportunidad

/**
 * Acción disponible en una escena
 */
export interface SceneAction {
  /** ID único de la acción */
  id: string;

  /** Texto del botón */
  label: string;

  /** Descripción de la acción */
  description?: string;

  /** Atributo requerido para la tirada (si aplica) */
  attribute?: AttributeType;

  /** Dificultad de la acción */
  difficulty?: number;

  /** Si la acción está deshabilitada */
  disabled?: boolean;

  /** Razón por la que está deshabilitada */
  disabledReason?: string;

  /** Tipo de acción */
  type: 'skill_check' | 'combat' | 'dialogue' | 'item' | 'rest' | 'travel';
}

/**
 * Encuentro en una escena
 */
export interface Encounter {
  /** Tipo de encuentro */
  type: EncounterType;

  /** IDs de enemigos presentes (si es combate) */
  enemies?: string[];

  /** ID del NPC presente (si es diálogo) */
  npc?: string;

  /** Atributo principal para resolver */
  primaryAttribute?: AttributeType;

  /** Dificultad del encuentro */
  difficulty?: number;

  /** Recompensas potenciales */
  rewards?: {
    xp?: number;
    gold?: number;
    items?: string[];
  };
}

/**
 * Escena del juego
 */
export interface Scene {
  /** ID único de la escena */
  id: string;

  /** Tipo de escena */
  type: SceneType;

  /** ID de la localización */
  locationId: string;

  /** Nombre de la localización */
  locationName: string;

  /** Descripción narrativa de la escena */
  narrative: string;

  /** Encuentro principal de la escena */
  encounter?: Encounter;

  /** Acciones disponibles para el jugador */
  availableActions: SceneAction[];

  /** Si la escena fue generada por LLM */
  useLLM: boolean;

  /** Timestamp de cuando se generó */
  generatedAt: number;
}
