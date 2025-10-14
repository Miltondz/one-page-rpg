/**
 * ID de una facción del mundo
 */
export type FactionId = 'casa_von_hess' | 'culto_silencio' | 'circulo_eco';

/**
 * Reputación con las facciones (-100 a +100)
 */
export type Reputation = Record<FactionId, number>;

/**
 * Estado global del mundo del juego
 */
export interface WorldState {
  /** Seed único para reproducibilidad */
  seed: string;

  /** Fecha de creación del mundo */
  createdAt: number;

  /** Tiempo de juego total en minutos */
  playTime: number;

  /** Reputación con cada facción */
  reputation: Reputation;

  /** IDs de misiones completadas */
  completedQuests: string[];

  /** IDs de logros desbloqueados */
  unlockedAchievements: string[];

  /** Flags globales del mundo (eventos ocurridos, etc.) */
  globalFlags: Record<string, boolean | string | number>;

  /** Locaciones descubiertas */
  discoveredLocations: string[];

  /** NPCs conocidos */
  knownNPCs: string[];

  /** Enemigos derrotados (tipo -> cantidad) */
  enemiesDefeated: Record<string, number>;

  /** Hora del día (dawn, day, dusk, night) */
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';

  /** Clima actual */
  weather: 'clear' | 'rain' | 'storm' | 'fog';

  /** Mundo actual (por ahora solo 'griswald') */
  currentWorld: string;

  /** Acto actual de la historia (0 = prólogo, 1-3 = actos principales) */
  currentAct: number;
}

/**
 * Constantes del mundo
 */
export const WORLD_CONSTANTS = {
  MIN_REPUTATION: -100,
  MAX_REPUTATION: 100,
  DEFAULT_WORLD: 'griswald',
  PROLOGUE_ACT: 0,
} as const;
