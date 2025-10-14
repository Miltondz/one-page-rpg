import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { GameState, PlayerState, Scene, Decision } from '../types';
import { NarrativeEngine } from '../engine/NarrativeEngine';
import { useMultipleGameData } from '../hooks/useGameData';
import { QuestManager } from '../systems/QuestManager';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SeededRandom } from '../utils/SeededRandom';
import { SaveSystem } from '../utils/SaveSystem';
import type { Quest } from '../systems/QuestSystem';

interface GameContextType {
  gameState: GameState | null;
  playerState: PlayerState | null;
  currentScene: Scene | null;
  narrativeEngine: NarrativeEngine | null;
  questManager: QuestManager | null;
  progressionSystem: ProgressionSystem | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  initializeGame: (playerName: string, attributes: Record<string, number>) => void;
  loadScene: (sceneId: string) => void;
  makeDecision: (decision: Decision) => Promise<void>;
  updatePlayerState: (updates: Partial<PlayerState>) => void;
  
  // Quest Actions
  completeQuestObjective: (questId: string, objectiveId: string) => void;
  progressQuestObjective: (questId: string, objectiveId: string, amount?: number) => void;
  getActiveQuests: () => Quest[];
  getQuestProgress: (questId: string) => number;
  generateProceduralQuest: (playerLevel: number) => Quest;
  activateQuest: (questId: string) => void;
  abandonQuest: (questId: string) => void;
  
  // Progression Actions
  gainExperience: (amount: number) => void;
  applyAttributePoint: (attribute: 'FUE' | 'AGI' | 'SAB' | 'SUE') => void;
  
  // Save/Load Actions
  saveGame: (slot?: string) => boolean;
  loadGame: (slot: string) => boolean;
  getSaveSlots: () => Array<{ slot: string; timestamp: number }>;
  deleteSave: (slot: string) => boolean;
  hasSavedGame: () => boolean;
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
  const [questManager, setQuestManager] = useState<QuestManager | null>(null);
  const [progressionSystem, setProgressionSystem] = useState<ProgressionSystem | null>(null);
  const [rng, setRng] = useState<SeededRandom | null>(null);

  // Inicializar engine cuando los datos estén cargados
  useEffect(() => {
    if (!loading && data && Object.keys(data).length > 0) {
      try {
        // Combinar escenas de ambas partes
        const allScenes = {
          ...(data.scenes_part1 as any)?.scenes || {},
          ...(data.scenes_part2 as any)?.scenes || {},
        };

        // Crear estado inicial del juego (no usado directamente, reservado para futuro)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
        const _initialGameState: GameState = {
          player: null as unknown as PlayerState, // Se inicializará después
          currentSceneId: 'scene_01_intro',
          currentLocation: 'murogris_guarida_alenko',
          questStates: {},
        worldState: {
          factionRelationships: {},
          globalFlags: {},
          timeElapsed: 0,
          completedQuests: [],
          unlockedAchievements: [],
          discoveredLocations: [],
          knownNPCs: [],
          enemiesDefeated: {},
          timeOfDay: 'day',
          weather: 'clear',
          currentWorld: 'griswald',
          currentAct: 0,
        },
          eventLog: [],
          saveMetadata: {
            version: '0.1.0',
            timestamp: Date.now(),
            playtime: 0,
          },
        };

        const engine = new NarrativeEngine(allScenes);
        setNarrativeEngine(engine);
        
        // Inicializar RNG
        const seed = `game-seed-${Date.now()}`;
        const gameRng = new SeededRandom(seed);
        setRng(gameRng);
        
        // Inicializar Quest Manager
        const qManager = new QuestManager(gameRng);
        setQuestManager(qManager);
        
        // Inicializar Progression System
        const progression = new ProgressionSystem();
        setProgressionSystem(progression);
        
        console.log('✅ Narrative Engine initialized');
        console.log(`📖 Loaded ${Object.keys(allScenes).length} scenes`);
        console.log('✅ Quest Manager initialized');
        console.log('✅ Progression System initialized');
        
        // Cargar quest del prólogo
        qManager.loadCampaignQuest('/game_data/quests/prologue_quest.json')
          .then(quest => {
            if (quest) {
              console.log(`📜 Loaded campaign quest: ${quest.title}`);
            }
          })
          .catch(err => console.error('Error loading prologue quest:', err));
      } catch (err) {
        console.error('Error initializing game systems:', err);
      }
    }
  }, [data, loading]);

  /**
   * Inicializar el juego con un nuevo personaje
   */
  const initializeGame = (playerName: string, attributes: Record<string, number>) => {
    if (!narrativeEngine) {
      console.error('Narrative engine not initialized');
      return;
    }

    const initialPlayer: PlayerState = {
      name: playerName,
      level: 1,
      xp: 0,
      experience: 0,
      xpToNextLevel: 3,
      experienceToNextLevel: 3,
      attributes: attributes as any,
      wounds: 3,
      maxWounds: 3,
      fatigue: 3,
      maxFatigue: 3,
      gold: 0,
      inventory: [],
      inventorySlots: 10,
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
        completedQuests: [],
        unlockedAchievements: [],
        discoveredLocations: ['murogris_guarida_alenko'],
        knownNPCs: [],
        enemiesDefeated: {},
        timeOfDay: 'day',
        weather: 'clear',
        currentWorld: 'griswald',
        currentAct: 0,
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
    
    // Inicializar sistema de progresión con el jugador
    if (progressionSystem) {
      // No necesita inicialización especial, pero podemos verificar
      console.log('📊 Progression system ready');
    }
    
    // Activar quest del prólogo si está cargada
    if (questManager) {
      const prologueQuest = questManager.getQuest('prologo_deuda_ecos');
      if (prologueQuest) {
        questManager.activateQuest('prologo_deuda_ecos');
        console.log('🎯 Prologue quest activated');
      }
    }
    
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
      eventLog: [...(gameState.eventLog || []), newEvent],
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

  // ==================== QUEST ACTIONS ====================

  /**
   * Completar un objetivo de quest
   */
  const completeQuestObjective = (questId: string, objectiveId: string) => {
    if (!questManager || !playerState) return;

    const result = questManager.completeObjective(questId, objectiveId);

    if (result.success) {
      console.log(`✅ Objective completed: ${result.objective?.description}`);
      
      // Aplicar recompensas
      const { xp, gold, items } = result.rewards;
      
      if (xp > 0) {
        gainExperience(xp);
      }
      
      if (gold > 0) {
        updatePlayerState({ gold: playerState.gold + gold });
        console.log(`💰 +${gold} oro`);
      }
      
      if (items && items.length > 0) {
        updatePlayerState({ 
          inventory: [...playerState.inventory, ...items] 
        });
        console.log(`🎁 Items recibidos: ${items.join(', ')}`);
      }
      
      if (result.questCompleted) {
        console.log('🎉 ¡Quest completada!');
        
        // Aplicar recompensas finales de la quest
        const quest = questManager.getQuest(questId);
        if (quest) {
          if (quest.rewards.xp > 0) {
            gainExperience(quest.rewards.xp);
          }
          if (quest.rewards.gold > 0) {
            updatePlayerState({ gold: playerState.gold + quest.rewards.gold });
            console.log(`💰 Recompensa final: +${quest.rewards.gold} oro`);
          }
        }
      }
    }
  };

  /**
   * Progresar un objetivo con contador
   */
  const progressQuestObjective = (questId: string, objectiveId: string, amount: number = 1) => {
    if (!questManager) return;

    const result = questManager.progressObjective(questId, objectiveId, amount);

    if (result.success) {
      console.log(`📊 Progress: ${result.currentCount}`);
      
      if (result.completed) {
        // Auto-completar cuando alcanza el objetivo
        completeQuestObjective(questId, objectiveId);
      }
    }
  };

  /**
   * Obtener quests activas
   */
  const getActiveQuests = (): Quest[] => {
    if (!questManager) return [];
    return questManager.getActiveQuests();
  };

  /**
   * Obtener progreso de una quest
   */
  const getQuestProgress = (questId: string): number => {
    if (!questManager) return 0;
    return questManager.getQuestProgress(questId);
  };

  /**
   * Generar quest procedural
   */
  const generateProceduralQuest = (playerLevel: number): Quest => {
    if (!questManager) {
      throw new Error('Quest Manager not initialized');
    }
    return questManager.generateProceduralQuest(playerLevel, 'side_quest');
  };

  /**
   * Activar una quest
   */
  const activateQuest = (questId: string) => {
    if (!questManager) return;
    questManager.activateQuest(questId);
    console.log(`🎯 Quest activated: ${questId}`);
  };

  /**
   * Abandonar una quest
   */
  const abandonQuest = (questId: string) => {
    if (!questManager) return;
    const success = questManager.abandonQuest(questId);
    if (success) {
      console.log(`❌ Quest abandoned: ${questId}`);
    }
  };

  // ==================== PROGRESSION ACTIONS ====================

  /**
   * Ganar experiencia y manejar subidas de nivel
   */
  const gainExperience = (amount: number) => {
    if (!playerState) return;

    console.log(`⭐ +${amount} XP`);
    
    const levelUpResults = ProgressionSystem.addExperience(playerState, amount);
    
    if (levelUpResults.length > 0) {
      levelUpResults.forEach(levelUpResult => {
        console.log(`🎊 ¡LEVEL UP! Nivel ${levelUpResult.newLevel}`);
        console.log(`📊 Recompensas:`);
        console.log(`  • ${levelUpResult.rewards.attributePoints} puntos de atributo`);
        console.log(`  • ${levelUpResult.rewards.healWounds} curación de heridas`);
        console.log(`  • ${levelUpResult.rewards.inventorySlots} slots de inventario`);
        console.log(`  • ${levelUpResult.rewards.goldBonus} oro`);
      });
    }
    
    // Las recompensas ya se aplicaron en el playerState por referencia
    // Solo necesitamos actualizar el estado
    setPlayerState({ ...playerState });
  };

  /**
   * Aplicar punto de atributo
   */
  const applyAttributePoint = (attribute: 'FUE' | 'AGI' | 'SAB' | 'SUE') => {
    if (!playerState) return;

    const result = ProgressionSystem.applyAttributePoint(playerState, attribute);
    
    if (result.success) {
      console.log(`✨ +1 ${attribute}`);
      setPlayerState({ ...playerState });
    } else {
      console.warn(result.message);
    }
  };

  // ==================== SAVE/LOAD ACTIONS ====================

  /**
   * Guardar juego
   */
  const saveGame = (slot: string = 'autosave'): boolean => {
    if (!gameState || !questManager || !rng) {
      console.error('Game not fully initialized');
      return false;
    }

    try {
      // Preparar estado extendido con quests
      const extendedState = {
        ...gameState,
        questData: questManager.serialize(),
      };

      // Guardar
      const success = SaveSystem.saveToLocalStorage(extendedState as GameState, rng, slot);
      
      if (success) {
        console.log(`💾 Game saved to slot: ${slot}`);
      }
      
      return success;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  };

  /**
   * Cargar juego
   */
  const loadGame = (slot: string): boolean => {
    if (!questManager) {
      console.error('Quest Manager not initialized');
      return false;
    }

    try {
      const result = SaveSystem.loadFromLocalStorage(slot);
      
      if (!result.success || !result.gameState) {
        console.error('Failed to load game:', result.error);
        return false;
      }

      // Restaurar estado base
      setGameState(result.gameState);
      setPlayerState(result.gameState.player as PlayerState);
      
      // Restaurar quests si existen
      const extendedState = result.gameState as GameState & { questData?: any };
      if (extendedState.questData) {
        questManager.deserialize(extendedState.questData as any);
      }
      
      console.log(`📂 Game loaded from slot: ${slot}`);
      return true;
    } catch (error) {
      console.error('Error loading game:', error);
      return false;
    }
  };

  /**
   * Obtener slots de guardado disponibles
   */
  const getSaveSlots = () => {
    return SaveSystem.listSaves();
  };

  /**
   * Eliminar un guardado
   */
  const deleteSave = (slot: string): boolean => {
    return SaveSystem.deleteSave(slot);
  };

  /**
   * Verificar si hay guardados disponibles
   */
  const hasSavedGame = (): boolean => {
    const saves = SaveSystem.listSaves();
    return saves.length > 0;
  };

  const value: GameContextType = {
    gameState,
    playerState,
    currentScene,
    narrativeEngine,
    questManager,
    progressionSystem,
    loading,
    error,
    initializeGame,
    loadScene,
    makeDecision,
    updatePlayerState,
    completeQuestObjective,
    progressQuestObjective,
    getActiveQuests,
    getQuestProgress,
    generateProceduralQuest,
    activateQuest,
    abandonQuest,
    gainExperience,
    applyAttributePoint,
    saveGame,
    loadGame,
    getSaveSlots,
    deleteSave,
    hasSavedGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * Hook para usar el contexto del juego
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
