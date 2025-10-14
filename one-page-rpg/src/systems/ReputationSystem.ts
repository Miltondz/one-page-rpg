import type { FactionId, Reputation } from '../types/world';
import type { NPC } from '../types/npc';
import type { NPCMemory } from './NPCMemorySystem';

/**
 * Actitud de un NPC basada en reputación
 */
export type NPCAttitude =
  | 'hostile'      // -80 a -100: Ataca en cuanto te ve
  | 'unfriendly'   // -40 a -79: No quiere tratar contigo
  | 'neutral'      // -39 a +39: Trato estándar
  | 'friendly'     // +40 a +79: Dispuesto a ayudar
  | 'devoted';     // +80 a +100: Fiel aliado

/**
 * Nivel de descuento por reputación
 */
export interface PriceModifiers {
  buyModifier: number;    // Multiplicador para compras (ej: 0.8 = 20% descuento)
  sellModifier: number;   // Multiplicador para ventas (ej: 1.2 = 20% más)
}

/**
 * Beneficios especiales por reputación alta
 */
export interface ReputationBenefits {
  /** Acceso a items especiales */
  specialItemsUnlocked: boolean;
  
  /** Descuento en todos los servicios */
  globalDiscount: number; // 0-50%
  
  /** Información exclusiva disponible */
  exclusiveInfoAvailable: boolean;
  
  /** Puede pedir favores */
  canRequestFavors: boolean;
  
  /** Refugio seguro en territorio de la facción */
  safehaven: boolean;
}

/**
 * Penalizaciones por reputación baja
 */
export interface ReputationPenalties {
  /** Guardias te atacan al verte */
  attackOnSight: boolean;
  
  /** Precios inflados */
  priceInflation: number; // 0-100%
  
  /** NPCs hostiles */
  npcsHostile: boolean;
  
  /** No te dejan entrar a ciertas áreas */
  accessRestricted: string[]; // IDs de locaciones
  
  /** Recompensa por tu cabeza */
  bounty?: number;
}

/**
 * Sistema de Reputación con Efectos
 * Gestiona impacto de reputación en precios, NPCs y acceso
 */
export class ReputationSystem {
  /**
   * Calcula la actitud de un NPC basado en reputación de facción y memoria personal
   */
  calculateNPCAttitude(
    npc: NPC,
    factionReputation: Reputation,
    npcMemory?: NPCMemory
  ): NPCAttitude {
    // Si hay memoria personal del NPC, tiene prioridad
    if (npcMemory) {
      const personalRep = npcMemory.relationship;
      return this.reputationToAttitude(personalRep);
    }
    
    // Si no hay memoria, usar reputación de facción del NPC
    const npcFaction = npc.faction as FactionId | undefined;
    if (npcFaction && npcFaction in factionReputation) {
      const factionRep = factionReputation[npcFaction];
      return this.reputationToAttitude(factionRep);
    }
    
    // Default neutral
    return 'neutral';
  }
  
  /**
   * Convierte un valor de reputación a actitud
   */
  private reputationToAttitude(reputation: number): NPCAttitude {
    if (reputation >= 80) return 'devoted';
    if (reputation >= 40) return 'friendly';
    if (reputation >= -39) return 'neutral';
    if (reputation >= -79) return 'unfriendly';
    return 'hostile';
  }
  
  /**
   * Calcula modificadores de precio basados en reputación
   */
  getPriceModifiers(
    merchantFaction: FactionId | undefined,
    factionReputation: Reputation,
    npcMemory?: NPCMemory
  ): PriceModifiers {
    let reputation = 0;
    
    // Priorizar memoria personal
    if (npcMemory) {
      reputation = npcMemory.relationship;
    } else if (merchantFaction && merchantFaction in factionReputation) {
      reputation = factionReputation[merchantFaction];
    }
    
    // Calcular modificadores
    // Reputación positiva = descuentos al comprar, mejores precios al vender
    // Reputación negativa = sobreprecio al comprar, peores precios al vender
    
    let buyModifier = 1.0;
    let sellModifier = 1.0;
    
    if (reputation >= 80) {
      // Devoted: 30% descuento compras, 30% más por ventas
      buyModifier = 0.7;
      sellModifier = 1.3;
    } else if (reputation >= 60) {
      // High friendly: 20% descuento compras, 20% más por ventas
      buyModifier = 0.8;
      sellModifier = 1.2;
    } else if (reputation >= 40) {
      // Friendly: 10% descuento compras, 10% más por ventas
      buyModifier = 0.9;
      sellModifier = 1.1;
    } else if (reputation >= -39) {
      // Neutral: sin modificadores
      buyModifier = 1.0;
      sellModifier = 1.0;
    } else if (reputation >= -60) {
      // Unfriendly: 20% sobreprecio compras, 20% menos por ventas
      buyModifier = 1.2;
      sellModifier = 0.8;
    } else if (reputation >= -80) {
      // Very unfriendly: 40% sobreprecio compras, 40% menos por ventas
      buyModifier = 1.4;
      sellModifier = 0.6;
    } else {
      // Hostile: 60% sobreprecio compras, 50% menos por ventas (si aceptan tratar)
      buyModifier = 1.6;
      sellModifier = 0.5;
    }
    
    return { buyModifier, sellModifier };
  }
  
  /**
   * Obtiene beneficios especiales por reputación alta
   */
  getReputationBenefits(
    faction: FactionId,
    factionReputation: Reputation
  ): ReputationBenefits {
    const rep = factionReputation[faction];
    
    return {
      specialItemsUnlocked: rep >= 60,
      globalDiscount: Math.max(0, Math.floor((rep - 40) / 2)), // 0-30%
      exclusiveInfoAvailable: rep >= 50,
      canRequestFavors: rep >= 70,
      safehaven: rep >= 80,
    };
  }
  
  /**
   * Obtiene penalizaciones por reputación baja
   */
  getReputationPenalties(
    faction: FactionId,
    factionReputation: Reputation
  ): ReputationPenalties {
    const rep = factionReputation[faction];
    
    return {
      attackOnSight: rep <= -80,
      priceInflation: Math.max(0, Math.floor((Math.abs(rep) - 40) * 0.75)), // 0-45%
      npcsHostile: rep <= -60,
      accessRestricted: rep <= -70 ? this.getRestrictedLocations(faction) : [],
      bounty: rep <= -90 ? this.calculateBounty(rep) : undefined,
    };
  }
  
  /**
   * Obtiene locaciones restringidas para una facción
   */
  private getRestrictedLocations(faction: FactionId): string[] {
    const restrictions: Record<FactionId, string[]> = {
      casa_von_hess: ['castillo_von_hess', 'cuartel_guardia'],
      culto_silencio: ['templo_silencio', 'santuario_culto'],
      circulo_eco: ['torre_eco', 'biblioteca_arcana'],
    };
    
    return restrictions[faction] || [];
  }
  
  /**
   * Calcula recompensa por cabeza basada en reputación
   */
  private calculateBounty(reputation: number): number {
    // Entre -90 y -100: 100-500 oro
    const severity = Math.abs(reputation) - 90;
    return 100 + (severity * 40);
  }
  
  /**
   * Determina si un NPC aceptará comerciar
   */
  willTrade(
    attitude: NPCAttitude,
    npcRole?: string
  ): boolean {
    // Mercaderes siempre intentan comerciar (excepto si hostile)
    if (npcRole === 'merchant' || npcRole === 'vendor') {
      return attitude !== 'hostile';
    }
    
    // Otros NPCs solo comercian si son friendly o devoted
    return attitude === 'friendly' || attitude === 'devoted';
  }
  
  /**
   * Determina si un NPC compartirá información
   */
  willShareInfo(
    attitude: NPCAttitude,
    informationImportance: 'trivial' | 'normal' | 'important' | 'secret'
  ): boolean {
    switch (informationImportance) {
      case 'trivial':
        return attitude !== 'hostile';
      case 'normal':
        return attitude === 'neutral' || attitude === 'friendly' || attitude === 'devoted';
      case 'important':
        return attitude === 'friendly' || attitude === 'devoted';
      case 'secret':
        return attitude === 'devoted';
      default:
        return false;
    }
  }
  
  /**
   * Determina si un NPC aceptará hacer un favor
   */
  willDoFavor(
    attitude: NPCAttitude,
    favorDifficulty: 'easy' | 'medium' | 'hard' | 'dangerous'
  ): boolean {
    switch (favorDifficulty) {
      case 'easy':
        return attitude === 'friendly' || attitude === 'devoted';
      case 'medium':
        return attitude === 'devoted';
      case 'hard':
      case 'dangerous':
        // Solo devoted y si hay historia suficiente
        return attitude === 'devoted';
      default:
        return false;
    }
  }
  
  /**
   * Calcula cambio en reputación basado en una acción
   */
  calculateReputationChange(
    action: 'help' | 'betray' | 'quest_complete' | 'quest_fail' | 'kill_member' | 'donate',
    actionMagnitude: number = 1 // 1-10
  ): number {
    const baseChanges: Record<string, number> = {
      help: 5,
      betray: -30,
      quest_complete: 10,
      quest_fail: -5,
      kill_member: -20,
      donate: 3,
    };
    
    const baseChange = baseChanges[action] || 0;
    return baseChange * actionMagnitude;
  }
  
  /**
   * Aplica cambio de reputación a todas las facciones relacionadas
   */
  applyReputationChange(
    primaryFaction: FactionId,
    change: number,
    currentReputation: Reputation
  ): Reputation {
    const newReputation = { ...currentReputation };
    
    // Aplicar cambio a facción principal
    newReputation[primaryFaction] = this.clampReputation(
      newReputation[primaryFaction] + change
    );
    
    // Aplicar efectos en facciones relacionadas
    const relationshipEffects = this.getFactionRelationships();
    
    for (const [otherFaction, relationship] of Object.entries(relationshipEffects[primaryFaction] || {})) {
      const otherFactionId = otherFaction as FactionId;
      // Facciones enemigas pierden reputación cuando ganas en la otra
      // Facciones aliadas ganan reputación cuando ganas en la otra
      const indirectChange = change * relationship * 0.3; // 30% del cambio primario
      
      newReputation[otherFactionId] = this.clampReputation(
        newReputation[otherFactionId] + indirectChange
      );
    }
    
    return newReputation;
  }
  
  /**
   * Define relaciones entre facciones (-1 = enemigos, 0 = neutral, 1 = aliados)
   */
  private getFactionRelationships(): Record<FactionId, Partial<Record<FactionId, number>>> {
    return {
      casa_von_hess: {
        culto_silencio: -0.5,
        circulo_eco: -0.8,
      },
      culto_silencio: {
        casa_von_hess: -0.5,
        circulo_eco: -1.0, // Enemigos mortales
      },
      circulo_eco: {
        casa_von_hess: -0.8,
        culto_silencio: -1.0, // Enemigos mortales
      },
    };
  }
  
  /**
   * Clamp reputación entre -100 y 100
   */
  private clampReputation(value: number): number {
    return Math.max(-100, Math.min(100, value));
  }
  
  /**
   * Genera texto descriptivo de reputación para UI
   */
  describeReputation(reputation: number): string {
    if (reputation >= 90) return '🌟 Héroe legendario';
    if (reputation >= 75) return '⭐ Campeón de la causa';
    if (reputation >= 60) return '✨ Aliado valioso';
    if (reputation >= 40) return '👍 Bien considerado';
    if (reputation >= 20) return '🙂 Conocido positivamente';
    if (reputation >= -19) return '😐 Desconocido';
    if (reputation >= -39) return '😕 Visto con sospecha';
    if (reputation >= -59) return '😠 Mal visto';
    if (reputation >= -79) return '🚫 Enemigo declarado';
    return '💀 Enemigo mortal - ¡Recompensa por tu cabeza!';
  }
}

export default ReputationSystem;
