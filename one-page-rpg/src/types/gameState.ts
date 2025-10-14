import type { Player } from './player';
import type { WorldState } from './world';
import type { Scene } from './scene';
import type { NPC } from './npc';
import type { Quest } from './quest';
import type { CriticalDecision } from './decision';

/**
 * Versión del esquema de estado
 */
export const GAME_STATE_VERSION = '1.0.0';

/**
 * Estado completo del juego
 * Este es el tipo principal que se serializa para guardar/cargar partidas
 */
export interface GameState {
  /** Versión del esquema */
  version: string;

  /** Seed único para reproducibilidad */
  seed: string;

  /** Jugador */
  player: Player;

  /** Estado del mundo */
  worldState: WorldState;

  /** Escena actual */
  currentScene: Scene;

  /** Historial de eventos (para narrativa consistente) */
  eventHistory: string[];

  /** Misiones activas */
  activeQuests: Quest[];

  /** Misiones completadas */
  completedQuests: Quest[];

  /** NPCs conocidos con su estado actual */
  npcs: Record<string, NPC>;

  /** Decisiones críticas tomadas */
  resolvedDecisions: CriticalDecision[];

  /** Timestamp de creación */
  createdAt: number;

  /** Timestamp de última actualización */
  updatedAt: number;

  /** Sesión actual (para estadísticas) */
  sessionStats: {
    /** Enemigos derrotados en esta sesión */
    enemiesDefeatedThisSession: number;

    /** Oro ganado en esta sesión */
    goldEarnedThisSession: number;

    /** Tiempo jugado en esta sesión (minutos) */
    playTimeThisSession: number;

    /** Decisiones tomadas en esta sesión */
    decisionsMadeThisSession: number;
  };

  /** Configuración del juego */
  config: {
    /** Si el LLM está habilitado */
    llmEnabled: boolean;

    /** Velocidad del texto (ms por carácter) */
    textSpeed: number;

    /** Volumen de efectos de sonido (0-1) */
    soundVolume: number;

    /** Modo de dificultad */
    difficulty: 'easy' | 'normal' | 'hard';
  };
}

/**
 * Estado inicial del juego
 */
export interface InitialGameState {
  playerName: string;
  selectedRace: string;
  selectedClass: string;
  attributes: Record<string, number>;
  startingItems: string[];
  seed?: string;
}
