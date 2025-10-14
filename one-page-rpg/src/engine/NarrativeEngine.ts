import type { Scene, Decision, PlayerState } from '../types';

/**
 * Motor Narrativo - Procesa escenas y decisiones
 * 
 * Responsabilidades:
 * - Cargar escenas desde JSON
 * - Procesar decisiones del jugador
 * - Aplicar consecuencias
 * - Manejar transiciones entre escenas
 */
export class NarrativeEngine {
  private scenes: Map<string, Scene>;
  private currentScene: Scene | null = null;
  // private gameState: GameState; // TODO: Use this for tracking state changes

  constructor(scenesData: Record<string, Scene>) {
    this.scenes = new Map(Object.entries(scenesData));
    // this.gameState = initialGameState; // TODO: Store for tracking
  }

  /**
   * Cargar una escena por su ID
   */
  loadScene(sceneId: string): Scene | null {
    const scene = this.scenes.get(sceneId);
    
    if (!scene) {
      console.error(`Scene not found: ${sceneId}`);
      return null;
    }

    this.currentScene = scene;
    return scene;
  }

  /**
   * Obtener la escena actual
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Procesar una decisión del jugador
   */
  async processDecision(
    decision: Decision,
    playerState: PlayerState
  ): Promise<{
    success: boolean;
    nextSceneId: string | null;
    consequences: Array<Record<string, unknown>>;
    requiresRoll?: boolean;
    rollResult?: {
      attribute: string;
      roll: number;
      modifier: number;
      total: number;
      difficulty: number;
      success: boolean;
    };
  }> {
    const results: Array<Record<string, unknown>> = [];
    let success = true;
    let rollResult = undefined;

    // Verificar requerimientos
    if (decision.requirements) {
      const req = decision.requirements;

      // Verificar tirada de dados
      if (req.attribute && req.difficulty) {
        rollResult = this.rollCheck(
          req.attribute as keyof PlayerState['attributes'],
          req.difficulty,
          playerState
        );
        success = rollResult.success;

        if (!success) {
          // Si falla, usar escena de fallo si existe
          if (req.failureSceneId) {
            return {
              success: false,
              nextSceneId: req.failureSceneId,
              consequences: results,
              requiresRoll: true,
              rollResult,
            };
          }
        }
      }

      // Verificar oro
      if (req.gold && playerState.gold < req.gold) {
        return {
          success: false,
          nextSceneId: null,
          consequences: [{ type: 'error', message: 'No tienes suficiente oro' }],
        };
      }

      // Verificar items
      if (req.items) {
        const hasAllItems = req.items.every((itemId) =>
          playerState.inventory.some((item) => item === itemId)
        );
        if (!hasAllItems) {
          return {
            success: false,
            nextSceneId: null,
            consequences: [{ type: 'error', message: 'Te faltan items requeridos' }],
          };
        }
      }
    }

    // Aplicar consecuencias si la decisión fue exitosa
    if (success && decision.consequences) {
      for (const consequence of decision.consequences) {
        const result = await this.applyConsequence(consequence, playerState);
        results.push(result);
      }
    }

    return {
      success,
      nextSceneId: decision.nextSceneId ?? null,
      consequences: results,
      requiresRoll: !!rollResult,
      rollResult,
    };
  }

  /**
   * Realizar una tirada de dados 2d6
   */
  private rollCheck(
    attribute: keyof PlayerState['attributes'],
    difficulty: number,
    playerState: PlayerState
  ) {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = die1 + die2;
    const modifier = playerState.attributes[attribute];
    const total = roll + modifier;

    return {
      attribute,
      roll,
      modifier,
      total,
      difficulty,
      success: total >= difficulty,
      die1,
      die2,
    };
  }

  /**
   * Aplicar una consecuencia
   */
  private async applyConsequence(
    consequence: Record<string, unknown>,
    playerState: PlayerState
  ): Promise<Record<string, unknown>> {
    switch (consequence.type) {
      case 'damage':
        return this.applyDamage(consequence, playerState);

      case 'heal':
        return this.applyHealing(consequence, playerState);

      case 'add_item':
        return this.addItem(consequence);

      case 'remove_item':
        return this.removeItem(consequence, playerState);

      case 'add_gold':
        return this.addGold(consequence, playerState);

      case 'remove_gold':
        return this.removeGold(consequence, playerState);

      case 'apply_status':
        return this.applyStatus(consequence);

      case 'start_combat':
        return { type: 'start_combat', enemies: consequence.enemies };

      case 'start_boss_combat':
        return { type: 'start_boss_combat', boss: consequence.boss };

      case 'complete_objective':
        return { type: 'complete_objective', objectiveId: consequence.objective_id };

      case 'start_objective':
        return { type: 'start_objective', objectiveId: consequence.objective_id };

      case 'relationship':
        return {
          type: 'relationship',
          target: consequence.target,
          value: consequence.value,
        };

      default:
        console.warn(`Unknown consequence type: ${consequence.type}`);
        return { type: 'unknown', data: consequence };
    }
  }

  private applyDamage(consequence: Record<string, unknown>, playerState: PlayerState) {
    const amount = (consequence.amount as number) || 1;
    const damageType = consequence.damage_type || 'wounds';

    if (damageType === 'wounds') {
      playerState.wounds = Math.max(0, playerState.wounds - amount);
    } else if (damageType === 'fatigue') {
      playerState.fatigue = Math.max(0, playerState.fatigue - amount);
    }

    return {
      type: 'damage',
      damageType,
      amount,
      message: `Recibiste ${amount} de daño (${damageType})`,
    };
  }

  private applyHealing(consequence: Record<string, unknown>, playerState: PlayerState) {
    const amount = (consequence.amount as number) || 1;
    const healType = consequence.heal_type || 'wounds';

    if (healType === 'wounds') {
      const maxWounds = this.calculateMaxWounds(playerState);
      playerState.wounds = Math.min(maxWounds, playerState.wounds + amount);
    } else if (healType === 'fatigue') {
      const maxFatigue = this.calculateMaxFatigue(playerState);
      playerState.fatigue = Math.min(maxFatigue, playerState.fatigue + amount);
    }

    return {
      type: 'heal',
      healType,
      amount,
      message: `Recuperaste ${amount} ${healType}`,
    };
  }

  private addItem(consequence: Record<string, unknown>) {
    // TODO: Implementar lógica completa con límite de inventario
    return {
      type: 'add_item',
      item: consequence.item,
      message: `Obtuviste: ${consequence.item}`,
    };
  }

  private removeItem(consequence: Record<string, unknown>, playerState: PlayerState) {
    const index = playerState.inventory.findIndex((i) => i === consequence.item);
    if (index !== -1) {
      playerState.inventory.splice(index, 1);
    }

    return {
      type: 'remove_item',
      item: consequence.item,
      message: `Perdiste: ${consequence.item}`,
    };
  }

  private addGold(consequence: Record<string, unknown>, playerState: PlayerState) {
    const amount = (consequence.amount as number) || 0;
    playerState.gold += amount;

    return {
      type: 'add_gold',
      amount,
      message: `Ganaste ${amount} oro`,
    };
  }

  private removeGold(consequence: Record<string, unknown>, playerState: PlayerState) {
    const amount = (consequence.amount as number) || 0;
    playerState.gold = Math.max(0, playerState.gold - amount);

    return {
      type: 'remove_gold',
      amount,
      message: `Perdiste ${amount} oro`,
    };
  }

  private applyStatus(consequence: Record<string, unknown>) {
    // TODO: Implementar sistema completo de status effects
    return {
      type: 'apply_status',
      statusId: consequence.status_id,
      duration: consequence.duration,
      message: `Estado aplicado: ${consequence.status_id}`,
    };
  }

  private calculateMaxWounds(playerState: PlayerState): number {
    return 3 + Math.floor(playerState.level / 2);
  }

  private calculateMaxFatigue(playerState: PlayerState): number {
    return 3 + Math.floor(playerState.level / 2);
  }

  /**
   * Verificar si una decisión está disponible
   */
  isDecisionAvailable(decision: Decision, playerState: PlayerState): boolean {
    if (!decision.requirements) return true;

    const req = decision.requirements;

    // Verificar oro
    if (req.gold && playerState.gold < req.gold) {
      return false;
    }

    // Verificar items
    if (req.items) {
      const hasAllItems = req.items.every((itemId) =>
        playerState.inventory.some((item) => item === itemId)
      );
      if (!hasAllItems) return false;
    }

    // Verificar flags (TODO: implementar sistema de flags)
    if (req.flags) {
      // Por ahora, siempre disponible
    }

    return true;
  }

  /**
   * Obtener el texto de una decisión con requisitos
   */
  getDecisionDisplayText(decision: Decision): string {
    let text = decision.text;

    if (decision.requirements) {
      const req = decision.requirements;
      
      if (req.attribute && req.difficulty) {
        text += ` (${req.attribute} ${req.difficulty})`;
      }
      
      if (req.gold) {
        text += ` [${req.gold} oro]`;
      }
    }

    return text;
  }
}

export default NarrativeEngine;
