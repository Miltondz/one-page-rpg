import { PlayerState, Enemy } from '../types';

/**
 * Estado del combate
 */
export interface CombatState {
  player: PlayerState;
  enemies: CombatEnemy[];
  turn: number;
  phase: 'player' | 'enemy' | 'victory' | 'defeat';
  combatLog: CombatLogEntry[];
  playerAction?: PlayerCombatAction;
}

/**
 * Enemigo en combate con estado adicional
 */
export interface CombatEnemy extends Enemy {
  currentWounds: number;
  statusEffects: StatusEffect[];
  isDead: boolean;
}

/**
 * Entrada del log de combate
 */
export interface CombatLogEntry {
  turn: number;
  actor: string;
  action: string;
  target?: string;
  result: string;
  damage?: number;
  timestamp: number;
}

/**
 * Efecto de estado en combate
 */
export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  effect: 'poison' | 'stun' | 'buff' | 'debuff';
  value: number;
}

/**
 * Acciones de combate del jugador
 */
export type PlayerCombatAction =
  | { type: 'attack'; targetIndex: number; attribute: 'FUE' | 'AGI' }
  | { type: 'defend' }
  | { type: 'use_item'; itemId: string; targetIndex?: number }
  | { type: 'flee' };

/**
 * Resultado de una acción de combate
 */
export interface CombatActionResult {
  success: boolean;
  damage?: number;
  healing?: number;
  statusApplied?: StatusEffect;
  critical?: boolean;
  message: string;
  rollResult?: {
    dice: [number, number];
    modifier: number;
    total: number;
    difficulty: number;
  };
}

/**
 * Motor de Combate por Turnos
 */
export class CombatEngine {
  private state: CombatState;

  constructor(player: PlayerState, enemies: Enemy[]) {
    this.state = {
      player,
      enemies: enemies.map(enemy => ({
        ...enemy,
        currentWounds: enemy.stats?.Heridas || 3,
        statusEffects: [],
        isDead: false,
      })),
      turn: 1,
      phase: 'player',
      combatLog: [{
        turn: 0,
        actor: 'Sistema',
        action: 'inicio',
        result: `¡Combate iniciado contra ${enemies.length} enemigo(s)!`,
        timestamp: Date.now(),
      }],
    };
  }

  /**
   * Obtener estado actual del combate
   */
  getState(): CombatState {
    return { ...this.state };
  }

  /**
   * Verificar si el combate ha terminado
   */
  isCombatOver(): boolean {
    return this.state.phase === 'victory' || this.state.phase === 'defeat';
  }

  /**
   * Procesar acción del jugador
   */
  async processPlayerAction(action: PlayerCombatAction): Promise<CombatActionResult> {
    if (this.state.phase !== 'player') {
      throw new Error('No es el turno del jugador');
    }

    let result: CombatActionResult;

    switch (action.type) {
      case 'attack':
        result = this.playerAttack(action.targetIndex, action.attribute);
        break;
      case 'defend':
        result = this.playerDefend();
        break;
      case 'use_item':
        result = this.playerUseItem(action.itemId, action.targetIndex);
        break;
      case 'flee':
        result = this.playerFlee();
        break;
      default:
        throw new Error('Acción desconocida');
    }

    // Guardar acción del jugador
    this.state.playerAction = action;

    // Añadir al log
    this.addToLog(
      this.state.player.name,
      action.type,
      action.type === 'attack' ? this.state.enemies[action.targetIndex]?.name : undefined,
      result.message
    );

    // Verificar si todos los enemigos murieron
    if (this.areAllEnemiesDead()) {
      this.state.phase = 'victory';
      this.addToLog('Sistema', 'fin', undefined, '¡Victoria! Todos los enemigos han sido derrotados.');
      return result;
    }

    // Cambiar a turno enemigo
    this.state.phase = 'enemy';

    return result;
  }

  /**
   * Procesar turno de los enemigos
   */
  async processEnemyTurn(): Promise<CombatActionResult[]> {
    if (this.state.phase !== 'enemy') {
      throw new Error('No es el turno de los enemigos');
    }

    const results: CombatActionResult[] = [];

    for (const enemy of this.state.enemies) {
      if (enemy.isDead) continue;

      // Los enemigos siempre atacan (IA simple)
      const result = this.enemyAttack(enemy);
      results.push(result);

      this.addToLog(
        enemy.name,
        'attack',
        this.state.player.name,
        result.message,
        result.damage
      );

      // Verificar si el jugador murió
      if (this.state.player.wounds <= 0) {
        this.state.phase = 'defeat';
        this.addToLog('Sistema', 'fin', undefined, 'Has sido derrotado...');
        return results;
      }
    }

    // Avanzar turno y volver al jugador
    this.state.turn++;
    this.state.phase = 'player';

    // Procesar efectos de estado al inicio del turno
    this.processStatusEffects();

    return results;
  }

  /**
   * Ataque del jugador
   */
  private playerAttack(targetIndex: number, attribute: 'FUE' | 'AGI'): CombatActionResult {
    const enemy = this.state.enemies[targetIndex];
    
    if (!enemy || enemy.isDead) {
      return {
        success: false,
        message: 'Objetivo inválido',
      };
    }

    // Tirada de ataque: 2d6 + atributo vs DEF del enemigo
    const roll = this.rollDice();
    const modifier = this.state.player.attributes[attribute];
    const total = roll[0] + roll[1] + modifier;
    const difficulty = enemy.stats?.DEF || 7;

    const rollResult = {
      dice: roll as [number, number],
      modifier,
      total,
      difficulty,
    };

    // Verificar si fue crítico (doble 6)
    const critical = roll[0] === 6 && roll[1] === 6;

    if (total >= difficulty || critical) {
      // Calcular daño base
      let damage = 1;
      
      if (critical) {
        damage = 2;
      } else if (total >= difficulty + 3) {
        damage = 2; // Éxito excepcional
      }

      // Aplicar daño
      enemy.currentWounds = Math.max(0, enemy.currentWounds - damage);

      if (enemy.currentWounds <= 0) {
        enemy.isDead = true;
        return {
          success: true,
          damage,
          critical,
          message: `¡${critical ? 'CRÍTICO! ' : ''}Golpeaste a ${enemy.name} por ${damage} de daño! ${enemy.name} ha sido derrotado!`,
          rollResult,
        };
      }

      return {
        success: true,
        damage,
        critical,
        message: `${critical ? '¡CRÍTICO! ' : ''}Golpeaste a ${enemy.name} por ${damage} de daño. (${enemy.currentWounds}/${enemy.stats?.Heridas || 3} HP)`,
        rollResult,
      };
    } else {
      return {
        success: false,
        message: `Tu ataque falló contra ${enemy.name}. (${total} vs ${difficulty})`,
        rollResult,
      };
    }
  }

  /**
   * Defender (reduce daño en el siguiente turno)
   */
  private playerDefend(): CombatActionResult {
    // TODO: Implementar buff de defensa temporal
    return {
      success: true,
      message: 'Te preparas para defender. El próximo ataque hará menos daño.',
    };
  }

  /**
   * Usar item en combate
   */
  private playerUseItem(itemId: string, targetIndex?: number): CombatActionResult {
    // TODO: Implementar uso de items (pociones, etc.)
    
    if (itemId === 'pocion_curacion') {
      const healing = 2;
      this.state.player.wounds = Math.min(
        this.state.player.maxWounds,
        this.state.player.wounds + healing
      );

      return {
        success: true,
        healing,
        message: `Usaste una Poción de Curación y recuperaste ${healing} HP.`,
      };
    }

    return {
      success: false,
      message: 'Item no disponible en combate.',
    };
  }

  /**
   * Intentar huir del combate
   */
  private playerFlee(): CombatActionResult {
    // Tirada de AGI vs 8
    const roll = this.rollDice();
    const modifier = this.state.player.attributes.AGI || 0;
    const total = roll[0] + roll[1] + modifier;
    const difficulty = 8;

    if (total >= difficulty) {
      this.state.phase = 'victory'; // Técnicamente no es victoria, pero termina el combate
      return {
        success: true,
        message: `¡Lograste escapar! (${total} vs ${difficulty})`,
        rollResult: {
          dice: roll as [number, number],
          modifier,
          total,
          difficulty,
        },
      };
    } else {
      return {
        success: false,
        message: `No pudiste escapar. (${total} vs ${difficulty})`,
        rollResult: {
          dice: roll as [number, number],
          modifier,
          total,
          difficulty,
        },
      };
    }
  }

  /**
   * Ataque de un enemigo
   */
  private enemyAttack(enemy: CombatEnemy): CombatActionResult {
    // Tirada de ataque del enemigo: 2d6 + FUE vs 7 (DEF base del jugador)
    const roll = this.rollDice();
    const modifier = enemy.stats?.FUE || 0;
    const total = roll[0] + roll[1] + modifier;
    const difficulty = 7; // DEF base del jugador

    const critical = roll[0] === 6 && roll[1] === 6;

    if (total >= difficulty || critical) {
      let damage = 1;
      
      if (critical) {
        damage = 2;
      } else if (total >= difficulty + 3) {
        damage = 2;
      }

      // Aplicar daño al jugador
      this.state.player.wounds = Math.max(0, this.state.player.wounds - damage);

      return {
        success: true,
        damage,
        critical,
        message: `${enemy.name} te ataca ${critical ? '¡CRÍTICO! ' : ''}y hace ${damage} de daño. (${this.state.player.wounds}/${this.state.player.maxWounds} HP)`,
      };
    } else {
      return {
        success: false,
        message: `${enemy.name} falló su ataque. (${total} vs ${difficulty})`,
      };
    }
  }

  /**
   * Procesar efectos de estado al inicio del turno
   */
  private processStatusEffects(): void {
    // Procesar efectos del jugador
    this.state.player.statusEffects = this.state.player.statusEffects.filter(effect => {
      // TODO: Aplicar efectos (veneno, etc.)
      effect.duration--;
      return effect.duration > 0;
    });

    // Procesar efectos de enemigos
    this.state.enemies.forEach(enemy => {
      enemy.statusEffects = enemy.statusEffects.filter(effect => {
        effect.duration--;
        return effect.duration > 0;
      });
    });
  }

  /**
   * Tirar 2 dados de 6 caras
   */
  private rollDice(): [number, number] {
    return [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
  }

  /**
   * Verificar si todos los enemigos están muertos
   */
  private areAllEnemiesDead(): boolean {
    return this.state.enemies.every(enemy => enemy.isDead);
  }

  /**
   * Añadir entrada al log de combate
   */
  private addToLog(
    actor: string,
    action: string,
    target: string | undefined,
    result: string,
    damage?: number
  ): void {
    this.state.combatLog.push({
      turn: this.state.turn,
      actor,
      action,
      target,
      result,
      damage,
      timestamp: Date.now(),
    });
  }

  /**
   * Obtener recompensas del combate
   */
  getRewards(): { xp: number; gold: number; items: string[] } {
    const rewards = {
      xp: 0,
      gold: 0,
      items: [] as string[],
    };

    this.state.enemies.forEach(enemy => {
      if (enemy.isDead) {
        // XP basado en nivel del enemigo
        rewards.xp += enemy.level || 1;

        // Oro y items del loot table
        if (enemy.loot_table) {
          // TODO: Implementar sistema de loot aleatorio
          if (enemy.loot_table.common) {
            rewards.items.push(...enemy.loot_table.common);
          }
        }
      }
    });

    return rewards;
  }
}

export default CombatEngine;
