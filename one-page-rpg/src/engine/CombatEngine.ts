import { PlayerState, Enemy } from '../types';
import { DiceSystem, createDiceSystem, RollOutcome } from '../utils/DiceSystem';
import { SeededRandom } from '../utils/SeededRandom';

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
    dice: number[];
    modifier: number;
    total: number;
    difficulty: number;
    outcome?: RollOutcome;
    consequence?: string;
    bonus?: string;
  };
}

/**
 * Motor de Combate por Turnos
 */
export class CombatEngine {
  private state: CombatState;
  private dice: DiceSystem;

  constructor(player: PlayerState, enemies: Enemy[], rng?: SeededRandom) {
    // Inicializar sistema de dados
    this.dice = createDiceSystem(rng || new SeededRandom(Date.now().toString()));
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

    // Usar nuevo sistema de dados con combatRoll
    const weaponBonus = this.getWeaponBonus();
    const rollResult = this.dice.combatRoll(
      this.state.player.attributes[attribute],
      enemy.stats?.DEF || 7,
      'none', // TODO: determinar ventaja/desventaja basado en condiciones
      weaponBonus
    );

    const critical = rollResult.outcome === 'critical_success';
    const partialSuccess = rollResult.outcome === 'partial_success';

    if (rollResult.success) {
      // Aplicar daño
      enemy.currentWounds = Math.max(0, enemy.currentWounds - rollResult.damage);

      let message = this.dice.describeResult(rollResult);

      if (enemy.currentWounds <= 0) {
        enemy.isDead = true;
        message += ` ¡${enemy.name} ha sido derrotado!`;
      } else {
        message += ` ${enemy.name}: ${enemy.currentWounds}/${enemy.stats?.Heridas || 3} HP`;
      }

      return {
        success: true,
        damage: rollResult.damage,
        critical,
        message,
        rollResult: {
          dice: rollResult.dice,
          modifier: rollResult.modifier,
          total: rollResult.total,
          difficulty: rollResult.difficulty,
          outcome: rollResult.outcome,
          consequence: rollResult.consequence,
          bonus: rollResult.bonus,
        },
      };
    } else {
      // Fallo: jugador recibe daño
      const failureDamage = rollResult.outcome === 'critical_failure' ? 2 : 1;
      this.state.player.wounds = Math.max(0, this.state.player.wounds - failureDamage);

      return {
        success: false,
        damage: 0,
        message: `${this.dice.describeResult(rollResult)} ¡Recibes ${failureDamage} herida(s)! (${this.state.player.wounds}/${this.state.player.maxWounds} HP)`,
        rollResult: {
          dice: rollResult.dice,
          modifier: rollResult.modifier,
          total: rollResult.total,
          difficulty: rollResult.difficulty,
          outcome: rollResult.outcome,
        },
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
    // Usar sistema de dados para tirada de AGI vs dificultad 'normal' (7+)
    const rollResult = this.dice.roll(
      this.state.player.attributes.AGI || 0,
      'normal',
      'none',
      0
    );

    if (rollResult.success) {
      this.state.phase = 'victory'; // Técnicamente no es victoria, pero termina el combate
      return {
        success: true,
        message: `¡Lograste escapar! ${this.dice.describeResult(rollResult)}`,
        rollResult: {
          dice: rollResult.dice,
          modifier: rollResult.modifier,
          total: rollResult.total,
          difficulty: rollResult.difficulty,
          outcome: rollResult.outcome,
        },
      };
    } else {
      // Si falla al escapar, recibe 1 herida
      this.state.player.wounds = Math.max(0, this.state.player.wounds - 1);
      
      return {
        success: false,
        message: `No pudiste escapar. ${this.dice.describeResult(rollResult)} ¡Recibes 1 herida!`,
        rollResult: {
          dice: rollResult.dice,
          modifier: rollResult.modifier,
          total: rollResult.total,
          difficulty: rollResult.difficulty,
          outcome: rollResult.outcome,
        },
      };
    }
  }

  /**
   * Ataque de un enemigo
   */
  private enemyAttack(enemy: CombatEnemy): CombatActionResult {
    // Usar sistema de dados para ataque del enemigo
    const rollResult = this.dice.combatRoll(
      enemy.stats?.FUE || 0,
      7, // DEF base del jugador
      'none',
      0
    );

    const critical = rollResult.outcome === 'critical_success';

    if (rollResult.success) {
      // Aplicar daño al jugador
      this.state.player.wounds = Math.max(0, this.state.player.wounds - rollResult.damage);

      const message = `${enemy.name} te ataca: ${this.dice.describeResult(rollResult)} (${this.state.player.wounds}/${this.state.player.maxWounds} HP)`;

      return {
        success: true,
        damage: rollResult.damage,
        critical,
        message,
      };
    } else {
      return {
        success: false,
        message: `${enemy.name} falló su ataque: ${this.dice.describeResult(rollResult)}`,
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
   * Obtener bonus de arma (si está equipada)
   */
  private getWeaponBonus(): number {
    // TODO: Implementar cuando se tenga sistema de equipamiento
    // Por ahora retornar 0
    return 0;
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
