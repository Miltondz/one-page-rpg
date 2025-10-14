import type { Player } from '../../types/Player';
import type { WorldState } from '../../types/World';
import type { Item } from '../../types/Item';

/**
 * Contexto completo del juego para el LLM
 */
export interface LLMContext {
  /** Estado del jugador */
  player: Player;

  /** Ubicación actual del jugador */
  location: {
    id: string;
    name: string;
    description: string;
    type: 'city' | 'dungeon' | 'wilderness' | 'interior';
  };

  /** Eventos recientes (últimas 5-10 acciones) */
  recentEvents: string[];

  /** Items en el inventario del jugador */
  inventory: Item[];

  /** Estado global del mundo */
  worldState: WorldState;

  /** Contexto adicional opcional */
  additionalContext?: {
    /** NPCs presentes en la escena */
    presentNPCs?: string[];
    
    /** Enemigos presentes */
    presentEnemies?: string[];
    
    /** Hora del día */
    timeOfDay?: string;
    
    /** Clima actual */
    weather?: string;
    
    /** Misión activa */
    activeQuest?: string;
  };
}

/**
 * Tipo de generación narrativa
 */
export type NarrativeType = 
  | 'scene_description'      // Descripción de escena
  | 'dialogue'               // Diálogo de NPC
  | 'combat_flavor'          // Texto de sabor para combate
  | 'item_discovery'         // Descubrimiento de items
  | 'quest_update'           // Actualización de misión
  | 'environmental_detail'   // Detalle ambiental
  | 'character_thought';     // Pensamiento del personaje

/**
 * Parámetros para generación narrativa
 */
export interface NarrativeGenerationParams {
  /** Contexto del juego */
  context: LLMContext;
  
  /** Tipo de narrativa a generar */
  type: NarrativeType;
  
  /** Prompt específico adicional */
  specificPrompt?: string;
  
  /** Longitud máxima en tokens */
  maxLength?: number;
  
  /** Temperatura para sampling (0.0 - 1.0) */
  temperature?: number;
}

/**
 * Resultado de generación LLM
 */
export interface LLMGenerationResult {
  /** Texto generado */
  text: string;
  
  /** Indica si se usó el LLM o el fallback */
  usedLLM: boolean;
  
  /** Tiempo de generación en ms */
  generationTime: number;
  
  /** Metadatos adicionales */
  metadata?: {
    modelUsed?: string;
    tokensGenerated?: number;
    error?: string;
  };
}

/**
 * Configuración del servicio LLM
 */
export interface LLMConfig {
  /** Modelo a usar (por defecto SmolLM-360M-Instruct) */
  modelId: string;
  
  /** Habilitar/deshabilitar LLM */
  enabled: boolean;
  
  /** Usar cache del modelo */
  useCache: boolean;
  
  /** Parámetros de generación por defecto */
  defaultParams: {
    maxLength: number;
    temperature: number;
    topK: number;
    topP: number;
  };
  
  /** Timeout en ms para generación */
  timeout: number;
  
  /** Modo debug */
  debug: boolean;
}

/**
 * Configuración por defecto
 */
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  modelId: 'HuggingFaceTB/SmolLM-360M-Instruct',
  enabled: true,
  useCache: true,
  defaultParams: {
    maxLength: 150,
    temperature: 0.7,
    topK: 50,
    topP: 0.9,
  },
  timeout: 30000, // 30 segundos
  debug: false,
};
