import type { GameState } from '../types';
import type { LLMService } from '../services/llm/LLMService';

/**
 * Definición de un logro
 */
export interface Achievement {
  id: string;
  name: string;
  description: string; // Descripción generada dinámicamente
  category: 'combat' | 'exploration' | 'social' | 'progression' | 'secret' | 'collection';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string; // Emoji del logro
  unlockedAt?: number; // Timestamp del desbloqueo
  contextDescription?: string; // Descripción contextual del momento del desbloqueo
  isHidden: boolean; // Si debe mostrarse antes de desbloquear
}

/**
 * Criterio para desbloquear un logro
 */
export interface AchievementCriteria {
  achievementId: string;
  check: (state: GameState) => boolean;
  context?: (state: GameState) => string; // Genera contexto para el LLM
}

/**
 * Sistema de Logros
 * Detecta y desbloquea achievements con descripciones generadas por LLM
 */
export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map();
  private criteria: AchievementCriteria[] = [];
  private llmService?: LLMService;
  
  // Cola de notificaciones pendientes
  private pendingNotifications: Achievement[] = [];
  
  constructor(llmService?: LLMService) {
    this.llmService = llmService;
    this.initializeAchievements();
  }
  
  /**
   * Inicializa los logros base del juego
   */
  private initializeAchievements(): void {
    // Logros de combate
    this.addAchievement({
      id: 'first_blood',
      name: 'First Blood',
      description: 'Defeat your first enemy',
      category: 'combat',
      rarity: 'common',
      icon: '⚔️',
      isHidden: false,
    });
    
    this.addAchievement({
      id: 'warrior',
      name: 'Warrior',
      description: 'Defeat 10 enemies',
      category: 'combat',
      rarity: 'uncommon',
      icon: '🗡️',
      isHidden: false,
    });
    
    this.addAchievement({
      id: 'untouchable',
      name: 'Untouchable',
      description: 'Win 5 combats without taking damage',
      category: 'combat',
      rarity: 'epic',
      icon: '🛡️',
      isHidden: false,
    });
    
    // Logros de exploración
    this.addAchievement({
      id: 'explorer',
      name: 'Explorer',
      description: 'Visit 10 different locations',
      category: 'exploration',
      rarity: 'common',
      icon: '🗺️',
      isHidden: false,
    });
    
    this.addAchievement({
      id: 'treasure_hunter',
      name: 'Treasure Hunter',
      description: 'Find 5 hidden treasures',
      category: 'exploration',
      rarity: 'rare',
      icon: '💎',
      isHidden: false,
    });
    
    // Logros sociales
    this.addAchievement({
      id: 'diplomat',
      name: 'Diplomat',
      description: 'Resolve 3 conflicts peacefully',
      category: 'social',
      rarity: 'uncommon',
      icon: '🕊️',
      isHidden: false,
    });
    
    this.addAchievement({
      id: 'friend_to_all',
      name: 'Friend to All',
      description: 'Reach friendly status with 5 NPCs',
      category: 'social',
      rarity: 'rare',
      icon: '🤝',
      isHidden: false,
    });
    
    // Logros de progresión
    this.addAchievement({
      id: 'level_up',
      name: 'Growing Stronger',
      description: 'Reach level 5',
      category: 'progression',
      rarity: 'common',
      icon: '⭐',
      isHidden: false,
    });
    
    this.addAchievement({
      id: 'hero',
      name: 'Hero',
      description: 'Reach level 10',
      category: 'progression',
      rarity: 'rare',
      icon: '🌟',
      isHidden: false,
    });
    
    this.addAchievement({
      id: 'quest_master',
      name: 'Quest Master',
      description: 'Complete 10 quests',
      category: 'progression',
      rarity: 'uncommon',
      icon: '📜',
      isHidden: false,
    });
    
    // Logros secretos
    this.addAchievement({
      id: 'oracle_seeker',
      name: 'Oracle Seeker',
      description: 'Consult the oracle 10 times',
      category: 'secret',
      rarity: 'rare',
      icon: '🔮',
      isHidden: true,
    });
    
    this.addAchievement({
      id: 'lucky',
      name: 'Lucky',
      description: 'Roll three natural 12s in a row',
      category: 'secret',
      rarity: 'legendary',
      icon: '🎲',
      isHidden: true,
    });
    
    // Logros de colección
    this.addAchievement({
      id: 'hoarder',
      name: 'Hoarder',
      description: 'Collect 50 different items',
      category: 'collection',
      rarity: 'uncommon',
      icon: '📦',
      isHidden: false,
    });
    
    this.addAchievement({
      id: 'wealthy',
      name: 'Wealthy',
      description: 'Accumulate 1000 gold',
      category: 'collection',
      rarity: 'rare',
      icon: '💰',
      isHidden: false,
    });
  }
  
  /**
   * Añade un logro al sistema
   */
  addAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
  }
  
  /**
   * Registra un criterio de desbloqueo
   */
  registerCriteria(criteria: AchievementCriteria): void {
    this.criteria.push(criteria);
  }
  
  /**
   * Verifica logros contra el estado actual del juego
   */
  async checkAchievements(state: GameState): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];
    
    for (const criterion of this.criteria) {
      const achievement = this.achievements.get(criterion.achievementId);
      
      if (!achievement || achievement.unlockedAt) {
        continue; // Ya desbloqueado o no existe
      }
      
      if (criterion.check(state)) {
        // Desbloquear
        const context = criterion.context ? criterion.context(state) : '';
        const unlocked = await this.unlockAchievement(
          criterion.achievementId,
          context
        );
        
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    }
    
    return newlyUnlocked;
  }
  
  /**
   * Desbloquea un logro específico
   */
  async unlockAchievement(
    achievementId: string,
    context: string = ''
  ): Promise<Achievement | null> {
    const achievement = this.achievements.get(achievementId);
    
    if (!achievement || achievement.unlockedAt) {
      return null; // Ya desbloqueado o no existe
    }
    
    // Marcar como desbloqueado
    achievement.unlockedAt = Date.now();
    
    // Generar descripción contextual con LLM
    if (context && this.llmService) {
      try {
        const contextDesc = await this.generateContextDescription(
          achievement,
          context
        );
        achievement.contextDescription = contextDesc;
      } catch (error) {
        console.warn('Failed to generate achievement context:', error);
        achievement.contextDescription = this.generateProceduralContext(
          achievement
        );
      }
    } else {
      achievement.contextDescription = this.generateProceduralContext(
        achievement
      );
    }
    
    // Añadir a cola de notificaciones
    this.pendingNotifications.push(achievement);
    
    return achievement;
  }
  
  /**
   * Genera descripción contextual con LLM
   */
  private async generateContextDescription(
    achievement: Achievement,
    context: string
  ): Promise<string> {
    if (!this.llmService) {
      throw new Error('LLM service not available');
    }
    
    const prompt = [
      `An adventurer just unlocked the achievement "${achievement.name}".`,
      `Achievement description: ${achievement.description}`,
      `Context of unlock: ${context}`,
      `\nWrite a SHORT, celebratory message (1 sentence) describing this moment.`,
    ].join('\n');
    
    // Use generateNarrative with minimal context
    let response = 'Achievement unlocked!'; // Default fallback
    try {
      const result = await this.llmService.generateNarrative({
        context: {
          player: { name: 'Player', level: 1, attributes: { FUE: 0, AGI: 0, SAB: 0, SUE: 0 } } as any,
          location: { id: 'game', name: 'Game', description: prompt, type: 'city' },
          recentEvents: [],
          inventory: [],
          worldState: {} as any,
        },
        type: 'character_thought',
        maxLength: 60,
        temperature: 0.8,
      });
      response = result.text;
    } catch {
      // Use fallback if LLM fails
      response = 'Achievement unlocked!';
    }
    
    return response.trim();
  }
  
  /**
   * Genera descripción contextual procedural
   */
  private generateProceduralContext(
    achievement: Achievement
  ): string {
    const templates: Record<Achievement['rarity'], string[]> = {
      common: [
        `A milestone reached: ${achievement.name}!`,
        `Achievement unlocked: ${achievement.name}.`,
        `Progress made: ${achievement.name}.`,
      ],
      uncommon: [
        `Well done! ${achievement.name} achieved!`,
        `Impressive! ${achievement.name} unlocked!`,
        `A notable feat: ${achievement.name}.`,
      ],
      rare: [
        `Remarkable! ${achievement.name} earned!`,
        `An exceptional achievement: ${achievement.name}!`,
        `Few reach this milestone: ${achievement.name}.`,
      ],
      epic: [
        `Legendary prowess! ${achievement.name} conquered!`,
        `An epic accomplishment: ${achievement.name}!`,
        `The stuff of legends: ${achievement.name}.`,
      ],
      legendary: [
        `🌟 LEGENDARY! ${achievement.name} achieved! 🌟`,
        `History is made! ${achievement.name}!`,
        `Against all odds: ${achievement.name}!`,
      ],
    };
    
    const options = templates[achievement.rarity];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  /**
   * Obtiene la próxima notificación pendiente
   */
  getNextNotification(): Achievement | null {
    return this.pendingNotifications.shift() || null;
  }
  
  /**
   * Obtiene todos los logros pendientes de notificar
   */
  getPendingNotifications(): Achievement[] {
    return [...this.pendingNotifications];
  }
  
  /**
   * Limpia las notificaciones pendientes
   */
  clearNotifications(): void {
    this.pendingNotifications = [];
  }
  
  /**
   * Obtiene todos los logros
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }
  
  /**
   * Obtiene logros desbloqueados
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlockedAt !== undefined);
  }
  
  /**
   * Obtiene logros bloqueados
   */
  getLockedAchievements(): Achievement[] {
    return this.getAllAchievements()
      .filter(a => a.unlockedAt === undefined)
      .filter(a => !a.isHidden); // No mostrar secretos
  }
  
  /**
   * Obtiene logros por categoría
   */
  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.getAllAchievements().filter(a => a.category === category);
  }
  
  /**
   * Obtiene progreso total
   */
  getProgress(): {
    unlocked: number;
    total: number;
    percentage: number;
  } {
    const all = this.getAllAchievements();
    const unlocked = this.getUnlockedAchievements();
    
    return {
      unlocked: unlocked.length,
      total: all.length,
      percentage: all.length > 0 ? (unlocked.length / all.length) * 100 : 0,
    };
  }
  
  /**
   * Obtiene estadísticas por rareza
   */
  getRarityStats(): Record<Achievement['rarity'], { unlocked: number; total: number }> {
    const stats: Record<Achievement['rarity'], { unlocked: number; total: number }> = {
      common: { unlocked: 0, total: 0 },
      uncommon: { unlocked: 0, total: 0 },
      rare: { unlocked: 0, total: 0 },
      epic: { unlocked: 0, total: 0 },
      legendary: { unlocked: 0, total: 0 },
    };
    
    this.getAllAchievements().forEach(achievement => {
      stats[achievement.rarity].total++;
      if (achievement.unlockedAt) {
        stats[achievement.rarity].unlocked++;
      }
    });
    
    return stats;
  }
  
  /**
   * Serializa para guardado
   */
  serialize() {
    const achievementsData: Record<string, Achievement> = {};
    this.achievements.forEach((achievement, id) => {
      achievementsData[id] = achievement;
    });
    
    return {
      achievements: achievementsData,
      pendingNotifications: this.pendingNotifications,
    };
  }
  
  /**
   * Deserializa desde guardado
   */
  static deserialize(
    data: ReturnType<AchievementSystem['serialize']>,
    llmService?: LLMService
  ): AchievementSystem {
    const system = new AchievementSystem(llmService);
    
    // Restaurar logros desbloqueados
    Object.entries(data.achievements).forEach(([id, achievement]) => {
      system.achievements.set(id, achievement);
    });
    
    system.pendingNotifications = data.pendingNotifications;
    
    return system;
  }
}

/**
 * Criterios de logros predefinidos
 */
export function registerDefaultCriteria(
  system: AchievementSystem
): void {
  // First Blood
  system.registerCriteria({
    achievementId: 'first_blood',
    check: (state) => {
      const totalDefeated = Object.values(state.world?.enemiesDefeated || {}).reduce((a, b) => a + b, 0);
      return totalDefeated >= 1;
    },
    context: () => `Defeated first enemy in battle`,
  });
  
  // Warrior
  system.registerCriteria({
    achievementId: 'warrior',
    check: (state) => {
      const totalDefeated = Object.values(state.world?.enemiesDefeated || {}).reduce((a, b) => a + b, 0);
      return totalDefeated >= 10;
    },
    context: () => `Achieved 10 enemy defeats`,
  });
  
  // Explorer
  system.registerCriteria({
    achievementId: 'explorer',
    check: (state) => (state.world?.discoveredLocations?.length || 0) >= 10,
    context: () => `Explored 10 unique locations`,
  });
  
  // Level Up
  system.registerCriteria({
    achievementId: 'level_up',
    check: (state) => state.player.level >= 5,
    context: (state) => `Reached level ${state.player.level}`,
  });
  
  // Hero
  system.registerCriteria({
    achievementId: 'hero',
    check: (state) => state.player.level >= 10,
    context: (state) => `Became a true hero at level ${state.player.level}`,
  });
  
  // Quest Master
  system.registerCriteria({
    achievementId: 'quest_master',
    check: (state) => (state.world?.completedQuests?.length || 0) >= 10,
    context: () => `Completed 10th quest`,
  });
  
  // Wealthy
  system.registerCriteria({
    achievementId: 'wealthy',
    check: (state) => state.player.gold >= 1000,
    context: (state) => `Accumulated ${state.player.gold} gold`,
  });
  
  // Hoarder
  system.registerCriteria({
    achievementId: 'hoarder',
    check: (state) => state.player.inventory.length >= 50,
    context: (state) => `Collected ${state.player.inventory.length} items`,
  });
}
