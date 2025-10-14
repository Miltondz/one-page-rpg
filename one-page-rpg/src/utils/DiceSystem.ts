import { SeededRandom } from './SeededRandom';
import type { AttributeType } from '../types/attributes';

/**
 * Resultado de una tirada 2d6
 */
export type RollOutcome =
  | 'critical_failure' // 2-6: Fallo crítico
  | 'partial_success'  // 7-9: Éxito parcial con consecuencia
  | 'success'          // 10-11: Éxito total
  | 'critical_success'; // 12+: Éxito crítico con beneficio

/**
 * Nivel de dificultad para checks
 */
export type DifficultyLevel = 
  | 'easy'      // 6+
  | 'normal'    // 7+
  | 'difficult' // 9+
  | 'epic';     // 11+

/**
 * Tipo de ventaja en la tirada
 */
export type AdvantageType = 'none' | 'advantage' | 'disadvantage';

/**
 * Resultado detallado de una tirada
 */
export interface RollResult {
  /** Resultado final (outcome) */
  outcome: RollOutcome;
  
  /** Dados individuales tirados */
  dice: number[];
  
  /** Total de los dados */
  diceTotal: number;
  
  /** Modificador aplicado (atributo + otros) */
  modifier: number;
  
  /** Total final (dados + modificador) */
  total: number;
  
  /** Dificultad objetivo */
  difficulty: number;
  
  /** Si la tirada tuvo éxito */
  success: boolean;
  
  /** Consecuencia para partial_success */
  consequence?: string;
  
  /** Beneficio extra para critical_success */
  bonus?: string;
  
  /** Tipo de ventaja usado */
  advantageType: AdvantageType;
}

/**
 * Mapeo de dificultades a números objetivo
 */
const DIFFICULTY_MAP: Record<DifficultyLevel, number> = {
  easy: 6,
  normal: 7,
  difficult: 9,
  epic: 11,
};

/**
 * Consecuencias procedurales para éxitos parciales (7-9)
 */
const PARTIAL_SUCCESS_CONSEQUENCES = [
  'pero te cuesta 1 punto de fatiga extra',
  'pero alertas a enemigos cercanos',
  'pero pierdes o dañas un item',
  'pero te expones a peligro',
  'pero alguien se da cuenta',
  'pero toma más tiempo del esperado',
  'pero debes hacer un ruido',
  'pero dejas una pista',
];

/**
 * Bonos procedurales para éxitos críticos (12+)
 */
const CRITICAL_SUCCESS_BONUSES = [
  'y encuentras algo útil adicional',
  'y impresionas a los presentes',
  'y lo haces más rápido de lo esperado',
  'y no gastas recursos',
  'y aprendes información valiosa',
  'y ganas ventaja táctica',
  'y nadie se percata',
  'y inspiras a tus aliados',
];

/**
 * Sistema completo de dados y resolución 2d6
 */
export class DiceSystem {
  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  /**
   * Realiza una tirada de 2d6 con modificador
   * 
   * @param attribute - Modificador del atributo
   * @param difficulty - Número objetivo o nivel de dificultad
   * @param advantageType - Si tiene ventaja o desventaja
   * @param additionalModifier - Modificador adicional (ej: bonos de items)
   * @returns Resultado completo de la tirada
   */
  roll(
    attribute: number = 0,
    difficulty: number | DifficultyLevel = 'normal',
    advantageType: AdvantageType = 'none',
    additionalModifier: number = 0
  ): RollResult {
    // Resolver dificultad
    const targetNumber = typeof difficulty === 'number' 
      ? difficulty 
      : DIFFICULTY_MAP[difficulty];

    // Tirar dados según tipo de ventaja
    const dice = this.rollDice(advantageType);
    const diceTotal = dice[0] + dice[1];
    
    // Calcular total
    const modifier = attribute + additionalModifier;
    const total = diceTotal + modifier;
    
    // Determinar outcome
    const outcome = this.determineOutcome(total, targetNumber);
    const success = outcome === 'partial_success' || outcome === 'success' || outcome === 'critical_success';
    
    // Generar consecuencia o bono si aplica
    let consequence: string | undefined;
    let bonus: string | undefined;
    
    if (outcome === 'partial_success') {
      consequence = this.rng.pick(PARTIAL_SUCCESS_CONSEQUENCES);
    } else if (outcome === 'critical_success') {
      bonus = this.rng.pick(CRITICAL_SUCCESS_BONUSES);
    }
    
    return {
      outcome,
      dice,
      diceTotal,
      modifier,
      total,
      difficulty: targetNumber,
      success,
      consequence,
      bonus,
      advantageType,
    };
  }

  /**
   * Realiza un check rápido (solo retorna si tuvo éxito)
   */
  quickCheck(
    attribute: number,
    difficulty: number | DifficultyLevel = 'normal'
  ): boolean {
    const result = this.roll(attribute, difficulty);
    return result.success;
  }

  /**
   * Tira dados según el tipo de ventaja
   * 
   * - normal: 2d6
   * - advantage: 3d6, queda con los 2 mejores
   * - disadvantage: 3d6, queda con los 2 peores
   */
  private rollDice(advantageType: AdvantageType): [number, number] {
    if (advantageType === 'none') {
      // Normal: 2d6
      const roll = this.rng.roll2d6();
      return [roll.die1, roll.die2];
    } else if (advantageType === 'advantage') {
      // Advantage: 3d6 keep 2 mejores
      const rolls = [
        this.rng.nextInt(1, 6),
        this.rng.nextInt(1, 6),
        this.rng.nextInt(1, 6),
      ];
      rolls.sort((a, b) => b - a); // Ordenar descendente
      return [rolls[0], rolls[1]]; // Mantener los 2 mejores
    } else {
      // Disadvantage: 3d6 keep 2 peores
      const rolls = [
        this.rng.nextInt(1, 6),
        this.rng.nextInt(1, 6),
        this.rng.nextInt(1, 6),
      ];
      rolls.sort((a, b) => a - b); // Ordenar ascendente
      return [rolls[0], rolls[1]]; // Mantener los 2 peores
    }
  }

  /**
   * Determina el outcome basado en el total y la dificultad
   */
  private determineOutcome(total: number, difficulty: number): RollOutcome {
    if (total < difficulty) {
      // Fallo
      if (total <= 6) {
        return 'critical_failure';
      }
      // Si está cerca pero no alcanza, podría considerarse fallo normal
      return 'critical_failure';
    }
    
    // Éxito
    if (total >= 12) {
      return 'critical_success';
    }
    if (total >= 10) {
      return 'success';
    }
    // 7-9 y alcanza la dificultad
    if (total >= 7 && total < 10) {
      return 'partial_success';
    }
    
    return 'critical_failure';
  }

  /**
   * Genera un texto descriptivo del resultado
   */
  describeResult(result: RollResult): string {
    const { outcome, dice, modifier, total, consequence, bonus } = result;
    
    const diceStr = `[${dice[0]}, ${dice[1]}]`;
    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    
    let description = `Tiraste ${diceStr} ${modStr} = ${total}. `;
    
    switch (outcome) {
      case 'critical_failure':
        description += '💀 **Fallo Crítico!** Algo sale terriblemente mal.';
        break;
      case 'partial_success':
        description += `⚠️ **Éxito Parcial**: Logras tu objetivo, ${consequence}`;
        break;
      case 'success':
        description += '✅ **Éxito!** Logras lo que intentabas.';
        break;
      case 'critical_success':
        description += `🌟 **¡Éxito Crítico!** Logras tu objetivo perfectamente ${bonus}`;
        break;
    }
    
    return description;
  }

  /**
   * Check de combate con resultado detallado
   */
  combatRoll(
    attackAttribute: number,
    defenderDefense: number,
    advantageType: AdvantageType = 'none',
    weaponBonus: number = 0
  ): RollResult & { damage: number } {
    const result = this.roll(attackAttribute, defenderDefense, advantageType, weaponBonus);
    
    // Calcular daño basado en outcome
    let damage = 0;
    if (result.outcome === 'critical_success') {
      damage = 2; // Crítico hace 2 heridas
    } else if (result.outcome === 'success') {
      damage = 1; // Éxito normal hace 1 herida
    } else if (result.outcome === 'partial_success') {
      damage = 1; // Éxito parcial hace 1 herida pero con consecuencia
    }
    // critical_failure no hace daño (y el jugador podría recibir daño)
    
    return {
      ...result,
      damage,
    };
  }

  /**
   * Helper para skills checks comunes
   */
  skillCheck(
    _skill: AttributeType,
    attributeValue: number,
    difficulty: DifficultyLevel = 'normal',
    advantageType: AdvantageType = 'none'
  ): RollResult {
    return this.roll(attributeValue, difficulty, advantageType);
  }
}

/**
 * Factory function para crear un DiceSystem
 */
export function createDiceSystem(rng: SeededRandom): DiceSystem {
  return new DiceSystem(rng);
}

/**
 * Helper para convertir outcome a un número para comparaciones
 */
export function outcomeToNumber(outcome: RollOutcome): number {
  switch (outcome) {
    case 'critical_failure': return 0;
    case 'partial_success': return 1;
    case 'success': return 2;
    case 'critical_success': return 3;
    default: return 0;
  }
}

/**
 * Helper para comparar dos outcomes
 */
export function compareOutcomes(a: RollOutcome, b: RollOutcome): number {
  return outcomeToNumber(a) - outcomeToNumber(b);
}

export default DiceSystem;
