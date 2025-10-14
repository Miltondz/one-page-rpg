import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, PlayerState, Scene, Decision } from '../types';
import { NarrativeEngine } from '../engine/NarrativeEngine';
import { useMultipleGameData } from '../hooks/useGameData';

interface GameContextType {
  gameState: GameState | null;
  playerState: PlayerState | null;
  currentScene: Scene | null;
  narrativeEngine: NarrativeEngine | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  initializeGame: (playerName: string, attributes: any) => void;
  loadScene: (sceneId: string) => void;
  makeDecision: (decision: Decision) => Promise<void>;
  updatePlayerState: (updates: Partial<PlayerState>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GAME_DATA_PATHS = {
  scenes_part1: '/game_data/story/prologue_scenes_part1.json',
  scenes_part2: '/game_data/story/prologue_scenes_part2.json',
  quest: '/game_data/quests/prologue_quest.json',
  locations: '/game_data/locations/locations.json',
  npcs: '/game_data/characters/npcs.json',
  creatures: '/game_data/creatures/creatures.json',
  items: '/game_data/items/items.json',
};

/**
 * Provider del contexto del juego
 */
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, loading, error } = useMultipleGameData(GAME_DATA_PATHS);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [narrativeEngine, setNarrativeEngine] = useState<NarrativeEngine | null>(null);

  // Inicializar engine cuando los datos estén cargados
  useEffect(() => {
    if (!loading && data && Object.keys(data).length > 0) {
      try {
        // Combinar escenas de ambas partes
        const allScenes = {
          ...data.scenes_part1?.scenes || {},
          ...data.scenes_part2?.scenes || {},
        };

        // Crear estado inicial del juego
        const initialGameState: GameState = {
          player: null as any, // Se inicializará después
          currentSceneId: 'scene_01_intro',
          currentLocation: 'murogris_guarida_alenko',
          questStates: {},
          worldState: {
            factionRelationships: {},
            globalFlags: {},
            timeElapsed: 0,
          },
          eventLog: [],
          saveMetadata: {
            version: '0.1.0',
            timestamp: Date.now(),
            playtime: 0,
          },
        };

        const engine = new NarrativeEngine(allScenes, initialGameState);
        setNarrativeEngine(engine);
        
        console.log('✅ Narrative Engine initialized');
        console.log(`📖 Loaded ${Object.keys(allScenes).length} scenes`);
      } catch (err) {
        console.error('Error initializing narrative engine:', err);
      }
    }
  }, [data, loading]);

  /**
   * Inicializar el juego con un nuevo personaje
   */
  const initializeGame = (playerName: string, attributes: any) => {
    if (!narrativeEngine) {
      console.error('Narrative engine not initialized');
      return;
    }

    const initialPlayer: PlayerState = {
      name: playerName,
      level: 1,
      experience: 0,
      experienceToNextLevel: 3,
      attributes,
      wounds: 3,
      maxWounds: 3,
      fatigue: 3,
      maxFatigue: 3,
      gold: 0,
      inventory: [],
      equippedItems: {},
      statusEffects: [],
    };

    setPlayerState(initialPlayer);

    const initialGameState: GameState = {
      player: initialPlayer,
      currentSceneId: 'scene_01_intro',
      currentLocation: 'murogris_guarida_alenko',
      questStates: {
        prologo_deuda_ecos: {
          questId: 'prologo_deuda_ecos',
          status: 'active',
          objectives: [],
          progress: 0,
        },
      },
      worldState: {
        factionRelationships: {},
        globalFlags: {},
        timeElapsed: 0,
      },
      eventLog: [
        {
          type: 'system',
          message: 'Juego iniciado',
          timestamp: Date.now(),
        },
      ],
      saveMetadata: {
        version: '0.1.0',
        timestamp: Date.now(),
        playtime: 0,
      },
    };

    setGameState(initialGameState);
    
    // Cargar la primera escena
    loadScene('scene_01_intro');

    console.log('🎮 Game initialized:', { playerName, attributes });
  };

  /**
   * Cargar una escena
   */
  const loadScene = (sceneId: string) => {
    if (!narrativeEngine) {
      console.error('Narrative engine not initialized');
      return;
    }

    const scene = narrativeEngine.loadScene(sceneId);
    if (scene) {
      setCurrentScene(scene);
      
      // Actualizar estado del juego
      if (gameState) {
        setGameState({
          ...gameState,
          currentSceneId: sceneId,
          currentLocation: scene.location || gameState.currentLocation,
        });
      }

      console.log(`📖 Loaded scene: ${scene.title} (${sceneId})`);
    }
  };

  /**
   * Procesar una decisión del jugador
   */
  const makeDecision = async (decision: Decision) => {
    if (!narrativeEngine || !playerState || !gameState) {
      console.error('Game not fully initialized');
      return;
    }

    console.log(`🎯 Processing decision: ${decision.text}`);

    const result = await narrativeEngine.processDecision(decision, playerState);

    // Actualizar el estado del jugador (se modifica por referencia)
    setPlayerState({ ...playerState });

    // Agregar evento al log
    const newEvent = {
      type: 'decision',
      message: decision.text,
      timestamp: Date.now(),
      result: result.success ? 'success' : 'failure',
    };

    setGameState({
      ...gameState,
      eventLog: [...gameState.eventLog, newEvent],
    });

    // Si hubo tirada de dados, mostrar resultado
    if (result.rollResult) {
      console.log('🎲 Roll result:', result.rollResult);
    }

    // Cargar siguiente escena si existe
    if (result.success && result.nextSceneId) {
      loadScene(result.nextSceneId);
    }

    // Procesar consecuencias
    for (const consequence of result.consequences) {
      console.log('⚡ Consequence:', consequence);
      
      // TODO: Manejar consecuencias especiales (combate, etc.)
      if (consequence.type === 'start_combat') {
        console.log('⚔️ Starting combat with:', consequence.enemies);
      }
    }
  };

  /**
   * Actualizar estado del jugador
   */
  const updatePlayerState = (updates: Partial<PlayerState>) => {
    if (!playerState) return;
    
    setPlayerState({
      ...playerState,
      ...updates,
    });
  };

  const value: GameContextType = {
    gameState,
    playerState,
    currentScene,
    narrativeEngine,
    loading,
    error,
    initializeGame,
    loadScene,
    makeDecision,
    updatePlayerState,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * Hook para usar el contexto del juego
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
