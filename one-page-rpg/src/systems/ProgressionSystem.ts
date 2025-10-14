/**
 * Progression System - Sistema de Progresión del Jugador
 * 
 * Maneja XP, level-ups, rewards y progresión de atributos
 */

import type { Player } from '../types/player';
import type { Attributes } from '../types/attributes';

/**
 * Recompensas por subir de nivel
 */
export interface LevelUpReward {
  /** Puntos de atributo para distribuir */
  attributePoints: number;
  
  /** Curación de heridas */
  healWounds: number;
  
  /** Curación de fatiga */
  healFatigue: number;
  
  /** Nuevo item desbloqueado (opcional) */
  newItem?: string;
  
  /** Aumento de slots de inventario */
  inventorySlots: number;
  
  /** Oro adicional */
  goldBonus: number;
}

/**
 * Resultado de intentar subir de nivel
 */
export interface LevelUpResult {
  /** Si subió de nivel */
  leveledUp: boolean;
  
  /** Nuevo nivel alcanzado */
  newLevel: number;
  
  /** Recompensas obtenidas */
  rewards: LevelUpReward;
  
  /** XP sobrante después del level-up */
  remainingXP: number;
  
  /** Si alcanzó nivel máximo */
  maxLevelReached: boolean;
}

/**
 * Sistema de progresión
 */
export class ProgressionSystem {
  /** XP necesario por nivel (3 XP por nivel según spec) */
  private static readonly XP_PER_LEVEL = 3;
  
  /** Nivel máximo */
  private static readonly MAX_LEVEL = 10;
  
  /** Nivel inicial */
  private static readonly STARTING_LEVEL = 1;

  /**
   * Calcula cuánto XP se necesita para el siguiente nivel
   */
  static getXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= this.MAX_LEVEL) {
      return 0; // Ya está en nivel máximo
    }
    return this.XP_PER_LEVEL;
  }

  /**
   * Añade XP al jugador y procesa level-ups automáticamente
   */
  static addXP(player: Player, amount: number): LevelUpResult[] {
    const results: LevelUpResult[] = [];
    
    // Añadir XP
    player.xp += amount;
    player.experience = player.xp; // Sincronizar alias
    
    // Procesar level-ups en cadena
    while (player.xp >= player.xpToNextLevel && player.level < this.MAX_LEVEL) {
      const result = this.processLevelUp(player);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Alias para addXP (compatibilidad)
   */
  static addExperience(player: Player, amount: number): LevelUpResult[] {
    return this.addXP(player, amount);
  }

  /**
   * Procesa un level-up
   */
  private static processLevelUp(player: Player): LevelUpResult {
    // Calcular XP sobrante
    const remainingXP = player.xp - player.xpToNextLevel;
    
    // Subir nivel
    player.level += 1;
    player.xp = remainingXP;
    
    // Actualizar XP para siguiente nivel
    player.xpToNextLevel = this.getXPForNextLevel(player.level);
    
    // Calcular recompensas
    const rewards = this.calculateRewards(player.level);
    
    // Aplicar recompensas base (curación automática)
    this.applyAutomaticRewards(player, rewards);
    
    return {
      leveledUp: true,
      newLevel: player.level,
      rewards,
      remainingXP,
      maxLevelReached: player.level >= this.MAX_LEVEL,
    };
  }

  /**
   * Calcula recompensas por nivel
   */
  private static calculateRewards(newLevel: number): LevelUpReward {
    // Recompensas base por cada nivel
    const baseRewards: LevelUpReward = {
      attributePoints: 1,
      healWounds: 99, // Curación completa
      healFatigue: 99, // Curación completa
      inventorySlots: 0,
      goldBonus: 5,
    };

    // Recompensas especiales por niveles específicos
    if (newLevel === 3) {
      baseRewards.inventorySlots = 2;
      baseRewards.newItem = 'advanced_gear';
    } else if (newLevel === 5) {
      baseRewards.inventorySlots = 2;
      baseRewards.attributePoints = 2; // Extra point
      baseRewards.goldBonus = 10;
    } else if (newLevel === 7) {
      baseRewards.inventorySlots = 2;
      baseRewards.newItem = 'legendary_item';
    } else if (newLevel === 10) {
      baseRewards.inventorySlots = 5;
      baseRewards.attributePoints = 3;
      baseRewards.goldBonus = 50;
      baseRewards.newItem = 'ultimate_gear';
    }

    return baseRewards;
  }

  /**
   * Aplica recompensas automáticas (curación, oro, inventory slots)
   */
  private static applyAutomaticRewards(player: Player, rewards: LevelUpReward): void {
    // Curar heridas
    player.wounds = Math.min(player.maxWounds, player.wounds + rewards.healWounds);
    
    // Curar fatiga
    player.fatigue = Math.max(0, player.fatigue - rewards.healFatigue);
    
    // Añadir oro
    player.gold += rewards.goldBonus;
    
    // Aumentar slots de inventario
    player.inventorySlots += rewards.inventorySlots;
  }

  /**
   * Aplica un punto de atributo (debe llamarse manualmente desde UI)
   */
  static applyAttributePoint(
    player: Player,
    attribute: keyof Attributes
  ): { success: boolean; message: string } {
    const maxAttributeValue = 3;
    
    // Validar que no exceda el máximo
    if (player.attributes[attribute] >= maxAttributeValue) {
      return {
        success: false,
        message: `${attribute} ya está al máximo (${maxAttributeValue})`,
      };
    }
    
    // Aplicar punto
    player.attributes[attribute] += 1;
    
    // Actualizar stats derivados si es necesario
    this.updateDerivedStats(player);
    
    return {
      success: true,
      message: `+1 ${attribute}`,
    };
  }

  /**
   * Actualiza stats derivados basados en atributos
   */
  private static updateDerivedStats(player: Player): void {
    // Calcular max wounds basado en nivel
    // Base: 3, +1 cada 2 niveles
    player.maxWounds = 3 + Math.floor(player.level / 2);
    
    // Calcular max fatigue basado en nivel
    player.maxFatigue = 3 + Math.floor(player.level / 2);
    
    // Asegurar que wounds y fatigue no excedan max
    player.wounds = Math.min(player.wounds, player.maxWounds);
    player.fatigue = Math.max(0, player.fatigue);
  }

  /**
   * Calcula el progreso de XP como porcentaje (0-100)
   */
  static getXPProgress(player: Player): number {
    if (player.level >= this.MAX_LEVEL) {
      return 100;
    }
    
    if (player.xpToNextLevel === 0) {
      return 100;
    }
    
    return Math.floor((player.xp / player.xpToNextLevel) * 100);
  }

  /**
   * Verifica si el jugador puede subir de nivel
   */
  static canLevelUp(player: Player): boolean {
    return player.xp >= player.xpToNextLevel && player.level < this.MAX_LEVEL;
  }

  /**
   * Obtiene información de progresión del jugador
   */
  static getProgressionInfo(player: Player): {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    xpProgress: number;
    canLevelUp: boolean;
    maxLevelReached: boolean;
    attributePointsAvailable: number;
  } {
    return {
      currentLevel: player.level,
      currentXP: player.xp,
      xpToNextLevel: player.xpToNextLevel,
      xpProgress: this.getXPProgress(player),
      canLevelUp: this.canLevelUp(player),
      maxLevelReached: player.level >= this.MAX_LEVEL,
      attributePointsAvailable: 0, // TODO: Track esto en Player state
    };
  }

  /**
   * Calcula el nivel total de poder del jugador
   */
  static calculatePowerLevel(player: Player): number {
    let power = 0;
    
    // Base por nivel
    power += player.level * 10;
    
    // Atributos
    power += player.attributes.FUE * 5;
    power += player.attributes.AGI * 5;
    power += player.attributes.SAB * 5;
    power += player.attributes.SUE * 3;
    
    // Salud actual
    power += player.wounds * 2;
    
    // Inventario
    power += player.inventory.length * 3;
    
    return power;
  }

  /**
   * Resetea el progreso a nivel 1 (para new game+)
   */
  static resetProgression(player: Player, keepAttributes: boolean = false): void {
    const savedAttributes = { ...player.attributes };
    
    player.level = this.STARTING_LEVEL;
    player.xp = 0;
    player.xpToNextLevel = this.getXPForNextLevel(this.STARTING_LEVEL);
    player.wounds = 3;
    player.maxWounds = 3;
    player.fatigue = 0;
    player.maxFatigue = 3;
    player.gold = 0;
    player.inventory = [];
    player.inventorySlots = 10;
    
    if (keepAttributes) {
      player.attributes = savedAttributes;
    } else {
      player.attributes = {
        FUE: 2,
        AGI: 2,
        SAB: 1,
        SUE: 1,
      };
    }
  }

  /**
   * Obtiene descripción de las recompensas de un nivel
   */
  static getLevelRewardsDescription(level: number): string {
    const rewards = this.calculateRewards(level);
    const parts: string[] = [];
    
    parts.push(`+${rewards.attributePoints} punto(s) de atributo`);
    parts.push('Curación completa');
    parts.push(`+${rewards.goldBonus} oro`);
    
    if (rewards.inventorySlots > 0) {
      parts.push(`+${rewards.inventorySlots} slots de inventario`);
    }
    
    if (rewards.newItem) {
      parts.push(`Nuevo item: ${rewards.newItem}`);
    }
    
    return parts.join(', ');
  }

  /**
   * Simula progresión hasta un nivel específico (útil para testing)
   */
  static simulateProgressionTo(player: Player, targetLevel: number): void {
    while (player.level < targetLevel && player.level < this.MAX_LEVEL) {
      const xpNeeded = player.xpToNextLevel;
      this.addXP(player, xpNeeded);
    }
  }
}

export default ProgressionSystem;
