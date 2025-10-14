import type { Attributes } from './attributes';

/**
 * Habilidad especial de un enemigo
 */
export interface EnemyAbility {
  /** ID de la habilidad */
  id: string;

  /** Nombre de la habilidad */
  name: string;

  /** Descripción de la habilidad */
  description: string;

  /** Mecánica de la habilidad */
  mechanic: {
    type: 'SPECIAL_ATTACK' | 'AURA' | 'SUMMON' | 'PASSIVE';
    effect: 'DEAL_DAMAGE' | 'APPLY_STATUS' | 'APPLY_MODIFIER' | 'HEAL';
    power?: number;
    damageType?: 'wounds' | 'fatigue';
    statusId?: string;
    attribute?: string;
    value?: number;
    range?: 'self' | 'enemy' | 'scene';
  };
}

/**
 * Estadísticas de un enemigo
 */
export interface EnemyStats {
  /** Fuerza del enemigo */
  FUE: number;

  /** Agilidad del enemigo */
  AGI: number;

  /** Defensa (dificultad para golpearlo) */
  DEF: number;

  /** Heridas máximas */
  Heridas: number;
}

/**
 * Tabla de botín de un enemigo
 */
export interface LootTable {
  /** Items comunes (alta probabilidad) */
  common?: string[];

  /** Items poco comunes (media probabilidad) */
  uncommon?: string[];

  /** Items raros (baja probabilidad) */
  rare?: string[];

  /** Items garantizados (siempre se obtienen) */
  guaranteed?: string[];
}

/**
 * Definición de un enemigo
 */
export interface EnemyDefinition {
  /** ID único del enemigo */
  id: string;

  /** Nombre del enemigo */
  name: string;

  /** Nivel del enemigo */
  level: number;

  /** Estadísticas del enemigo */
  stats: EnemyStats;

  /** Habilidades especiales */
  abilities?: EnemyAbility[];

  /** Tabla de botín */
  lootTable: LootTable;

  /** Descripción del enemigo */
  description: string;

  /** Comportamiento (agresivo, defensivo, etc.) */
  behavior?: string;

  /** Locaciones donde aparece */
  spawnLocations?: string[];

  /** Resistencias a daño */
  damageResistances?: string[];

  /** Vulnerabilidades a daño */
  damageVulnerabilities?: string[];
}

/**
 * Instancia de un enemigo en combate
 */
export interface Enemy {
  /** ID de la instancia */
  instanceId: string;

  /** Definición del tipo de enemigo */
  definition: EnemyDefinition;

  /** Heridas actuales */
  currentWounds: number;

  /** Estados aplicados */
  appliedStatuses: string[];

  /** Si el enemigo está derrotado */
  isDefeated: boolean;
}

/**
 * Pool de enemigos por nivel
 */
export type EnemyPool = 'level_1_3' | 'level_4_6' | 'level_7_10' | 'bosses';
