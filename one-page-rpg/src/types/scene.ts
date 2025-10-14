import type { AttributeType } from './attributes';

/**
 * Tipo de escena
 */
export type SceneType = 'combat' | 'exploration' | 'dialogue' | 'rest' | 'decision';

/**
 * Requerimientos para una decisión
 */
export interface DecisionRequirements {
  /** Atributo requerido para tirada */
  attribute?: string;
  
  /** Dificultad de la tirada */
  difficulty?: number;
  
  /** Oro requerido */
  gold?: number;
  
  /** Items requeridos */
  items?: string[];
  
  /** Flags requeridos */
  flags?: Record<string, boolean | string | number>;
  
  /** Escena alternativa si falla la tirada */
  failureSceneId?: string;
}

/**
 * Consecuencia de una decisión
 */
export interface DecisionConsequence {
  /** Tipo de consecuencia */
  type: string;
  
  /** Datos adicionales según el tipo */
  [key: string]: unknown;
}

/**
 * Decisión disponible en una escena
 * (Diferentes de CriticalDecision que son decisiones de trama principal)
 */
export interface Decision {
  /** ID único de la decisión */
  id: string;
  
  /** Texto que ve el jugador */
  text: string;
  
  /** ID de la siguiente escena (next_scene en JSON, nextScene en código) */
  next_scene?: string;
  nextScene?: string;
  nextSceneId?: string | null;
  
  /** Requerimientos para esta decisión */
  requirements?: DecisionRequirements;
  
  /** Consecuencias al elegir esta decisión */
  consequences?: DecisionConsequence[];
  
  /** Condiciones para que aparezca esta decisión */
  conditions?: Record<string, unknown>;
  
  /** Descripción adicional */
  description?: string;
}

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

  /** Título de la escena */
  title?: string;

  /** Tipo de escena */
  type?: SceneType;

  /** ID de la localización */
  locationId?: string;
  
  /** Locación (alias de locationId para compatibilidad con JSON) */
  location?: string;

  /** Nombre de la localización */
  locationName?: string;

  /** Descripción narrativa de la escena */
  narrative?: string;
  
  /** Descripción alternativa */
  description?: string;

  /** Encuentro principal de la escena */
  encounter?: Encounter;

  /** Acciones disponibles para el jugador */
  availableActions?: SceneAction[];
  
  /** Decisiones disponibles en esta escena (usado en escenas narrativas) */
  decisions?: Decision[];
  
  /** NPCs presentes en la escena */
  npcs_present?: string[];
  
  /** Enemigos presentes */
  enemies?: string[];
  
  /** Items recibidos al entrar a esta escena */
  items_received?: string[];
  
  /** Atmósfera de la escena */
  atmosphere?: string;
  
  /** Mood musical */
  music_mood?: string;
  
  /** Tags de la escena */
  tags?: string[];

  /** Si la escena fue generada por LLM */
  useLLM?: boolean;

  /** Timestamp de cuando se generó */
  generatedAt?: number;
}
