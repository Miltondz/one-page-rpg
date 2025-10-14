import type { Attributes } from './attributes';

/**
 * Estado del personaje del jugador
 */
export interface Player {
  /** Nombre del personaje */
  name: string;

  /** Nivel actual (1-10) */
  level: number;

  /** Puntos de experiencia acumulados */
  xp: number;
  
  /** Puntos de experiencia acumulados (alias de xp) */
  experience: number;

  /** XP necesarios para subir de nivel */
  xpToNextLevel: number;
  
  /** XP necesarios para subir de nivel (alias de xpToNextLevel) */
  experienceToNextLevel: number;

  /** Atributos del personaje */
  attributes: Attributes;

  /** Heridas actuales (0-3 base, expandible a 5) */
  wounds: number;

  /** Heridas máximas */
  maxWounds: number;

  /** Fatiga actual (0-3 base) */
  fatigue: number;

  /** Fatiga máxima */
  maxFatigue: number;

  /** IDs de objetos en el inventario */
  inventory: string[];

  /** Slots de inventario disponibles */
  inventorySlots: number;

  /** Oro actual */
  gold: number;
  
  /** Items equipados (opcional) */
  equippedItems?: Record<string, string>;
  
  /** Efectos de estado activos (opcional) */
  statusEffects?: Array<{
    id: string;
    name: string;
    duration: number;
    effect: string;
  }>;

  /** Raza del personaje (por ahora solo 'human') */
  race?: string;

  /** Clase del personaje (por ahora solo 'adventurer') */
  class?: string;
}

/**
 * Alias para PlayerState (mismo que Player)
 */
export type PlayerState = Player;

/**
 * Constantes para el jugador
 */
export const PLAYER_CONSTANTS = {
  BASE_WOUNDS: 3,
  BASE_FATIGUE: 3,
  XP_PER_LEVEL: 3,
  STARTING_GOLD: 0,
  INVENTORY_SLOTS: 10,
  MAX_LEVEL: 10,
} as const;
