/**
 * Save System - Sistema de Guardado basado en Seeds
 * 
 * Permite serializar y deserializar el estado completo del juego
 * a un seed compacto que puede compartirse via URL, QR o texto.
 */

import type { GameState, Player } from '../types';
import { SeededRandom, generateRandomSeed } from './SeededRandom';

// TODO: Instalar pako para compresión: npm install pako
// import pako from 'pako';

/**
 * Versión del formato de save
 * Incrementar cuando cambie el schema
 */
const SAVE_VERSION = '1.0.0';

/**
 * Prefijo para identificar saves válidos
 */
const SAVE_PREFIX = 'OPR';

/**
 * Interface del save serializado
 */
export interface SerializedSave {
  version: string;
  seed: string;
  timestamp: number;
  rngState: number;
  gameState: Partial<GameState>;
}

/**
 * Resultado de cargar un save
 */
export interface LoadResult {
  success: boolean;
  gameState?: GameState;
  error?: string;
  version?: string;
}

/**
 * Opciones de serialización
 */
export interface SerializeOptions {
  /** Comprimir el resultado (más pequeño, menos legible) */
  compress?: boolean;
  
  /** Incluir información de debug */
  includeDebug?: boolean;
}

/**
 * Sistema de guardado y carga
 */
export class SaveSystem {
  /**
   * Serializa el estado completo del juego a un string
   */
  static serialize(
    gameState: GameState,
    rng: SeededRandom,
    options: SerializeOptions = {}
  ): string {
    const { compress = true, includeDebug = false } = options;

    try {
      // 1. Crear objeto de save
      const save: SerializedSave = {
        version: SAVE_VERSION,
        seed: gameState.world.seed,
        timestamp: Date.now(),
        rngState: rng.getState(),
        gameState: {
          player: this.serializePlayer(gameState.player),
          world: gameState.world,
          currentScene: gameState.currentScene,
          currentLocation: gameState.currentLocation,
          activeQuests: gameState.activeQuests,
        },
      };

      // 2. Convertir a JSON
      let jsonString = JSON.stringify(save);

      // 3. Comprimir si se solicita (temporalmente deshabilitado)
      if (compress) {
        // TODO: Habilitar cuando se instale pako
        // const compressed = pako.deflate(jsonString);
        // jsonString = btoa(String.fromCharCode(...compressed));
        jsonString = btoa(jsonString); // Base64 simple por ahora
      }

      // 4. Añadir prefijo y versión
      const finalSave = `${SAVE_PREFIX}${SAVE_VERSION}:${jsonString}`;

      if (includeDebug) {
        console.log('[SaveSystem] Serialized save:', {
          originalSize: JSON.stringify(save).length,
          compressedSize: finalSave.length,
          compressionRatio: (finalSave.length / JSON.stringify(save).length * 100).toFixed(2) + '%',
        });
      }

      return finalSave;
    } catch (error) {
      console.error('[SaveSystem] Serialization error:', error);
      throw new Error(`Failed to serialize game state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deserializa un string a GameState
   */
  static deserialize(saveString: string): LoadResult {
    try {
      // 1. Validar prefijo
      if (!saveString.startsWith(SAVE_PREFIX)) {
        return {
          success: false,
          error: 'Invalid save format: missing prefix',
        };
      }

      // 2. Extraer versión y datos
      const withoutPrefix = saveString.substring(SAVE_PREFIX.length);
      const [version, data] = withoutPrefix.split(':', 2);

      if (!version || !data) {
        return {
          success: false,
          error: 'Invalid save format: malformed data',
        };
      }

      // 3. Verificar compatibilidad de versión
      if (version !== SAVE_VERSION) {
        // TODO: Implementar migración de versiones antiguas
        console.warn(`[SaveSystem] Version mismatch: expected ${SAVE_VERSION}, got ${version}`);
      }

      // 4. Descomprimir
      let jsonString: string;
      try {
        // Intentar decodificar base64
        jsonString = atob(data);
        // TODO: Habilitar pako cuando se instale
        // const bytes = new Uint8Array(jsonString.length);
        // for (let i = 0; i < jsonString.length; i++) {
        //   bytes[i] = jsonString.charCodeAt(i);
        // }
        // jsonString = pako.inflate(bytes, { to: 'string' });
      } catch {
        // Si falla, asumir que no está codificado
        jsonString = data;
      }

      // 5. Parsear JSON
      const save: SerializedSave = JSON.parse(jsonString);

      // 6. Validar estructura
      if (!save.gameState || !save.seed) {
        return {
          success: false,
          error: 'Invalid save format: missing required fields',
        };
      }

      // 7. Reconstruir GameState completo
      const gameState = this.deserializeGameState(save.gameState, save.seed);

      // 8. Restaurar RNG state
      const rng = new SeededRandom(save.seed);
      rng.setState(save.rngState);

      return {
        success: true,
        gameState,
        version: save.version,
      };
    } catch (error) {
      console.error('[SaveSystem] Deserialization error:', error);
      return {
        success: false,
        error: `Failed to deserialize save: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Serializa el jugador (solo datos esenciales)
   */
  private static serializePlayer(player: Player): Partial<Player> {
    return {
      name: player.name,
      level: player.level,
      xp: player.xp,
      xpToNextLevel: player.xpToNextLevel,
      attributes: player.attributes,
      wounds: player.wounds,
      maxWounds: player.maxWounds,
      fatigue: player.fatigue,
      maxFatigue: player.maxFatigue,
      inventory: player.inventory,
      inventorySlots: player.inventorySlots,
      gold: player.gold,
      race: player.race,
      class: player.class,
    };
  }

  /**
   * Deserializa el GameState parcial a completo
   */
  private static deserializeGameState(
    partial: Partial<GameState>,
    seed: string
  ): GameState {
    // Valores por defecto si faltan
    const defaultGameState: GameState = {
      player: {
        name: 'Aventurero',
        level: 1,
        xp: 0,
        xpToNextLevel: 3,
        attributes: {
          strength: 2,
          agility: 2,
          intelligence: 1,
          luck: 1,
        },
        wounds: 3,
        maxWounds: 3,
        fatigue: 0,
        maxFatigue: 3,
        inventory: [],
        inventorySlots: 10,
        gold: 0,
        race: 'human',
        class: 'adventurer',
      },
      world: {
        seed,
        createdAt: Date.now(),
        playTime: 0,
        reputation: {
          casa_von_hess: 0,
          culto_silencio: 0,
          circulo_eco: 0,
        },
        completedQuests: [],
        unlockedAchievements: [],
        globalFlags: {},
        discoveredLocations: [],
        knownNPCs: [],
        enemiesDefeated: {},
        timeOfDay: 'day',
        weather: 'clear',
        currentWorld: 'griswald',
        currentAct: 0,
      },
      currentScene: 'intro',
      currentLocation: 'griswald',
      activeQuests: [],
    };

    // Merge con partial
    return {
      ...defaultGameState,
      ...partial,
      player: { ...defaultGameState.player, ...partial.player },
      world: { ...defaultGameState.world, ...partial.world },
    };
  }

  /**
   * Guarda en localStorage
   */
  static saveToLocalStorage(gameState: GameState, rng: SeededRandom, slot: string = 'autosave'): boolean {
    try {
      const saveString = this.serialize(gameState, rng);
      localStorage.setItem(`one-page-rpg-save-${slot}`, saveString);
      localStorage.setItem(`one-page-rpg-save-${slot}-timestamp`, Date.now().toString());
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Carga desde localStorage
   */
  static loadFromLocalStorage(slot: string = 'autosave'): LoadResult {
    try {
      const saveString = localStorage.getItem(`one-page-rpg-save-${slot}`);
      
      if (!saveString) {
        return {
          success: false,
          error: 'No save found in slot: ' + slot,
        };
      }

      return this.deserialize(saveString);
    } catch (error) {
      console.error('[SaveSystem] Failed to load from localStorage:', error);
      return {
        success: false,
        error: `Failed to load save: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Lista todos los saves en localStorage
   */
  static listSaves(): Array<{ slot: string; timestamp: number }> {
    const saves: Array<{ slot: string; timestamp: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('one-page-rpg-save-') && !key.endsWith('-timestamp')) {
        const slot = key.replace('one-page-rpg-save-', '');
        const timestampKey = `one-page-rpg-save-${slot}-timestamp`;
        const timestamp = parseInt(localStorage.getItem(timestampKey) || '0', 10);
        saves.push({ slot, timestamp });
      }
    }
    
    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Elimina un save
   */
  static deleteSave(slot: string): boolean {
    try {
      localStorage.removeItem(`one-page-rpg-save-${slot}`);
      localStorage.removeItem(`one-page-rpg-save-${slot}-timestamp`);
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Crea un nuevo juego con seed aleatorio
   */
  static createNewGame(): { gameState: GameState; rng: SeededRandom; seed: string } {
    const seed = generateRandomSeed();
    const rng = new SeededRandom(seed);

    const gameState: GameState = {
      player: {
        name: 'Aventurero',
        level: 1,
        xp: 0,
        xpToNextLevel: 3,
        attributes: {
          strength: 2,
          agility: 2,
          intelligence: 1,
          luck: 1,
        },
        wounds: 3,
        maxWounds: 3,
        fatigue: 0,
        maxFatigue: 3,
        inventory: [],
        inventorySlots: 10,
        gold: 0,
        race: 'human',
        class: 'adventurer',
      },
      world: {
        seed,
        createdAt: Date.now(),
        playTime: 0,
        reputation: {
          casa_von_hess: 0,
          culto_silencio: 0,
          circulo_eco: 0,
        },
        completedQuests: [],
        unlockedAchievements: [],
        globalFlags: {},
        discoveredLocations: [],
        knownNPCs: [],
        enemiesDefeated: {},
        timeOfDay: 'day',
        weather: 'clear',
        currentWorld: 'griswald',
        currentAct: 0,
      },
      currentScene: 'intro',
      currentLocation: 'griswald',
      activeQuests: [],
    };

    return { gameState, rng, seed };
  }

  /**
   * Valida si un string es un save válido
   */
  static isValidSave(saveString: string): boolean {
    if (!saveString || !saveString.startsWith(SAVE_PREFIX)) {
      return false;
    }

    try {
      const result = this.deserialize(saveString);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Exporta el save como JSON legible (para debug)
   */
  static exportAsJSON(gameState: GameState, rng: SeededRandom): string {
    const save: SerializedSave = {
      version: SAVE_VERSION,
      seed: gameState.world.seed,
      timestamp: Date.now(),
      rngState: rng.getState(),
      gameState: {
        player: this.serializePlayer(gameState.player),
        world: gameState.world,
        currentScene: gameState.currentScene,
        currentLocation: gameState.currentLocation,
        activeQuests: gameState.activeQuests,
      },
    };

    return JSON.stringify(save, null, 2);
  }
}

export default SaveSystem;
