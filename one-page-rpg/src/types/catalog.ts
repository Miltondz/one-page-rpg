/**
 * Catalog Types - Tipos para catálogos de datos del juego
 * 
 * Define las estructuras para manejar catálogos de items, enemigos,
 * NPCs y locaciones cargados desde JSON.
 */

import type { Item } from './item';
import type { Enemy } from './enemy';
import type { NPC } from './npc';

/**
 * Catálogo de items indexado por ID
 */
export interface ItemCatalog {
  [itemId: string]: Item;
}

/**
 * Catálogo de enemigos indexado por ID
 */
export interface EnemyCatalog {
  [enemyId: string]: Enemy;
}

/**
 * Catálogo de NPCs indexado por ID
 */
export interface NPCCatalog {
  [npcId: string]: NPC;
}

/**
 * Información de una locación del juego
 */
export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'city' | 'dungeon' | 'wilderness' | 'building' | 'special';
  connectedTo: string[];
  npcs?: string[];
  shops?: string[];
  questGivers?: string[];
  dangerLevel: number;
}

/**
 * Catálogo de locaciones indexado por ID
 */
export interface LocationCatalog {
  [locationId: string]: Location;
}

/**
 * Catálogo completo del juego
 */
export interface GameCatalog {
  items: ItemCatalog;
  enemies: EnemyCatalog;
  npcs: NPCCatalog;
  locations: LocationCatalog;
}

/**
 * Estado de carga de los catálogos
 */
export interface CatalogLoadState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  progress: number; // 0-100
}
