import type { AttributeType } from './attributes';

/**
 * Resultado de una tirada de dados
 */
export interface DiceRoll {
  /** Resultado de cada dado */
  dice: number[];

  /** Suma total de los dados */
  total: number;

  /** Modificador aplicado */
  modifier: number;

  /** Resultado final (total + modifier) */
  result: number;

  /** Si fue un crítico (dobles 1 o dobles 6) */
  isCritical: boolean;

  /** Tipo de crítico si aplica */
  criticalType?: 'disaster' | 'miracle';
}

/**
 * Tipo de modificador para la tirada
 */
export type DiceModifierType = 'advantage' | 'disadvantage' | 'normal';

/**
 * Dificultad de una tirada
 */
export type Difficulty = 'easy' | 'normal' | 'hard' | 'epic';

/**
 * Mapeo de dificultades a números objetivo
 */
export const DIFFICULTY_THRESHOLDS: Record<Difficulty, number> = {
  easy: 6,
  normal: 7,
  hard: 9,
  epic: 11,
} as const;

/**
 * Resultado de la resolución de una acción
 */
export type ResolutionOutcome =
  | 'critical_fail'    // 2-6: Fallo crítico
  | 'partial_fail'     // 7-9: Fallo parcial
  | 'success'          // 10-11: Éxito
  | 'critical_success'; // 12+: Éxito crítico

/**
 * Resultado completo de una acción resuelta
 */
export interface ActionResolution {
  /** Tirada de dados realizada */
  roll: DiceRoll;

  /** Atributo utilizado */
  attribute: AttributeType;

  /** Valor del atributo */
  attributeValue: number;

  /** Dificultad objetivo */
  difficulty: number;

  /** Tipo de resultado */
  outcome: ResolutionOutcome;

  /** Descripción del resultado */
  description: string;

  /** Si la acción tuvo éxito */
  success: boolean;
}

/**
 * Obtiene el outcome basado en el resultado final
 */
export function getOutcome(result: number): ResolutionOutcome {
  if (result <= 6) return 'critical_fail';
  if (result <= 9) return 'partial_fail';
  if (result <= 11) return 'success';
  return 'critical_success';
}
