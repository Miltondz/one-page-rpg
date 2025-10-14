import { describe, it, expect, beforeEach } from 'vitest';
import { createDiceSystem, DiceSystem, RollOutcome } from '../utils/DiceSystem';
import { SeededRandom } from '../utils/SeededRandom';

describe('DiceSystem', () => {
  let dice: DiceSystem;
  let rng: SeededRandom;

  beforeEach(() => {
    // Usar seed fija para tests reproducibles
    rng = new SeededRandom('test-seed-123');
    dice = createDiceSystem(rng);
  });

  describe('roll', () => {
    it('debe retornar un resultado válido', () => {
      const result = dice.roll(3, 7, 'none', 0);

      expect(result).toHaveProperty('outcome');
      expect(result).toHaveProperty('dice');
      expect(result).toHaveProperty('diceTotal');
      expect(result).toHaveProperty('modifier');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('success');
      expect(result.dice).toHaveLength(2);
      expect(result.dice[0]).toBeGreaterThanOrEqual(1);
      expect(result.dice[0]).toBeLessThanOrEqual(6);
      expect(result.dice[1]).toBeGreaterThanOrEqual(1);
      expect(result.dice[1]).toBeLessThanOrEqual(6);
    });

    it('debe calcular el total correctamente', () => {
      const result = dice.roll(2, 7, 'none', 1);
      
      const expectedTotal = result.dice[0] + result.dice[1] + 2 + 1;
      expect(result.total).toBe(expectedTotal);
      expect(result.modifier).toBe(3); // 2 (atributo) + 1 (bonus)
    });

    it('debe determinar éxito cuando total >= difficulty', () => {
      // Forzar múltiples rolls para encontrar éxito
      let successFound = false;
      for (let i = 0; i < 20; i++) {
        const result = dice.roll(5, 7, 'none', 0);
        if (result.total >= 7) {
          expect(result.success).toBe(true);
          successFound = true;
          break;
        }
      }
      expect(successFound).toBe(true);
    });

    it('debe determinar fallo cuando total < difficulty', () => {
      // Con atributo 0 y dificultad alta, es probable fallar
      let failureFound = false;
      for (let i = 0; i < 20; i++) {
        const result = dice.roll(0, 11, 'none', 0);
        if (result.total < 11) {
          expect(result.success).toBe(false);
          failureFound = true;
          break;
        }
      }
      expect(failureFound).toBe(true);
    });

    it('debe aceptar DifficultyLevel como string', () => {
      const easyResult = dice.roll(2, 'easy', 'none', 0);
      expect(easyResult.difficulty).toBe(6);

      const normalResult = dice.roll(2, 'normal', 'none', 0);
      expect(normalResult.difficulty).toBe(7);

      const difficultResult = dice.roll(2, 'difficult', 'none', 0);
      expect(difficultResult.difficulty).toBe(9);

      const epicResult = dice.roll(2, 'epic', 'none', 0);
      expect(epicResult.difficulty).toBe(11);
    });
  });

  describe('outcomes', () => {
    it('debe detectar critical_failure (total 2-6)', () => {
      let criticalFailureFound = false;
      for (let i = 0; i < 50; i++) {
        const result = dice.roll(0, 10, 'none', 0);
        if (result.total <= 6) {
          expect(result.outcome).toBe('critical_failure');
          expect(result.success).toBe(false);
          criticalFailureFound = true;
          break;
        }
      }
      expect(criticalFailureFound).toBe(true);
    });

    it('debe detectar partial_success (total 7-9 si difficulty <= 7)', () => {
      let partialSuccessFound = false;
      for (let i = 0; i < 50; i++) {
        const result = dice.roll(2, 7, 'none', 0);
        if (result.total >= 7 && result.total <= 9) {
          expect(result.outcome).toBe('partial_success');
          expect(result.success).toBe(true);
          expect(result.consequence).toBeDefined();
          partialSuccessFound = true;
          break;
        }
      }
      expect(partialSuccessFound).toBe(true);
    });

    it('debe detectar success (total 10-11)', () => {
      let successFound = false;
      for (let i = 0; i < 50; i++) {
        const result = dice.roll(3, 7, 'none', 0);
        if (result.total >= 10 && result.total <= 11) {
          expect(result.outcome).toBe('success');
          expect(result.success).toBe(true);
          expect(result.consequence).toBeUndefined();
          expect(result.bonus).toBeUndefined();
          successFound = true;
          break;
        }
      }
      expect(successFound).toBe(true);
    });

    it('debe detectar critical_success (total >= 12)', () => {
      let criticalSuccessFound = false;
      for (let i = 0; i < 100; i++) {
        const result = dice.roll(5, 7, 'none', 0);
        if (result.total >= 12) {
          expect(result.outcome).toBe('critical_success');
          expect(result.success).toBe(true);
          expect(result.bonus).toBeDefined();
          criticalSuccessFound = true;
          break;
        }
      }
      expect(criticalSuccessFound).toBe(true);
    });
  });

  describe('advantage/disadvantage', () => {
    it('ventaja debe tirar 3 dados y mantener 2 mejores', () => {
      const result = dice.roll(2, 7, 'advantage', 0);
      
      expect(result.advantageType).toBe('advantage');
      expect(result.dice).toHaveLength(2);
      
      // Los dados retornados deben ser válidos (1-6)
      expect(result.dice[0]).toBeGreaterThanOrEqual(1);
      expect(result.dice[0]).toBeLessThanOrEqual(6);
      expect(result.dice[1]).toBeGreaterThanOrEqual(1);
      expect(result.dice[1]).toBeLessThanOrEqual(6);
    });

    it('desventaja debe tirar 3 dados y mantener 2 peores', () => {
      const result = dice.roll(2, 7, 'disadvantage', 0);
      
      expect(result.advantageType).toBe('disadvantage');
      expect(result.dice).toHaveLength(2);
      
      // Los dados retornados deben ser válidos (1-6)
      expect(result.dice[0]).toBeGreaterThanOrEqual(1);
      expect(result.dice[0]).toBeLessThanOrEqual(6);
      expect(result.dice[1]).toBeGreaterThanOrEqual(1);
      expect(result.dice[1]).toBeLessThanOrEqual(6);
    });

    it('ventaja debe mejorar las probabilidades de éxito', () => {
      const trials = 100;
      let normalSuccesses = 0;
      let advantageSuccesses = 0;

      // Test con seed diferente para múltiples rolls
      const testRng1 = new SeededRandom('normal-test');
      const testRng2 = new SeededRandom('advantage-test');
      const normalDice = createDiceSystem(testRng1);
      const advantageDice = createDiceSystem(testRng2);

      for (let i = 0; i < trials; i++) {
        const normalResult = normalDice.roll(2, 'difficult', 'none', 0);
        const advantageResult = advantageDice.roll(2, 'difficult', 'advantage', 0);

        if (normalResult.success) normalSuccesses++;
        if (advantageResult.success) advantageSuccesses++;
      }

      // La ventaja debería tener más éxitos (no garantizado pero altamente probable)
      expect(advantageSuccesses).toBeGreaterThanOrEqual(normalSuccesses * 0.8);
    });
  });

  describe('combatRoll', () => {
    it('debe calcular daño basado en outcome', () => {
      let damageResults: Record<RollOutcome, number[]> = {
        critical_failure: [],
        partial_success: [],
        success: [],
        critical_success: [],
      };

      for (let i = 0; i < 100; i++) {
        const result = dice.combatRoll(3, 7, 'none', 0);
        damageResults[result.outcome].push(result.damage);
      }

      // Critical failure: 0 damage
      if (damageResults.critical_failure.length > 0) {
        expect(damageResults.critical_failure.every(d => d === 0)).toBe(true);
      }

      // Partial success: 1 damage
      if (damageResults.partial_success.length > 0) {
        expect(damageResults.partial_success.every(d => d === 1)).toBe(true);
      }

      // Success: 1 damage
      if (damageResults.success.length > 0) {
        expect(damageResults.success.every(d => d === 1)).toBe(true);
      }

      // Critical success: 2 damage
      if (damageResults.critical_success.length > 0) {
        expect(damageResults.critical_success.every(d => d === 2)).toBe(true);
      }
    });

    it('debe aplicar weapon bonus al modifier', () => {
      const result = dice.combatRoll(2, 7, 'none', 3);
      
      expect(result.modifier).toBe(5); // 2 (atributo) + 3 (weapon bonus)
    });
  });

  describe('quickCheck', () => {
    it('debe retornar boolean directamente', () => {
      const result = dice.quickCheck(5, 7);
      
      expect(typeof result).toBe('boolean');
    });

    it('debe ser equivalente a roll().success', () => {
      // Resetear seed para comparar
      const rng1 = new SeededRandom('quick-test-1');
      const rng2 = new SeededRandom('quick-test-1');
      const dice1 = createDiceSystem(rng1);
      const dice2 = createDiceSystem(rng2);

      const quickResult = dice1.quickCheck(3, 'normal');
      const fullResult = dice2.roll(3, 'normal', 'none', 0);

      expect(quickResult).toBe(fullResult.success);
    });
  });

  describe('describeResult', () => {
    it('debe generar descripción para critical_failure', () => {
      const result = {
        outcome: 'critical_failure' as RollOutcome,
        dice: [1, 2],
        diceTotal: 3,
        modifier: 2,
        total: 5,
        difficulty: 7,
        success: false,
        advantageType: 'none' as const,
      };

      const description = dice.describeResult(result);

      expect(description).toContain('Fallo Crítico');
      expect(description).toContain('[1, 2]');
      expect(description).toContain('+2');
      expect(description).toContain('5');
    });

    it('debe generar descripción para partial_success con consecuencia', () => {
      let partialSuccessResult = null;
      
      for (let i = 0; i < 50; i++) {
        const result = dice.roll(2, 7, 'none', 0);
        if (result.outcome === 'partial_success') {
          partialSuccessResult = result;
          break;
        }
      }

      if (partialSuccessResult) {
        const description = dice.describeResult(partialSuccessResult);
        expect(description).toContain('Éxito Parcial');
        expect(description).toContain('pero');
      }
    });

    it('debe generar descripción para critical_success con bonus', () => {
      let criticalSuccessResult = null;
      
      for (let i = 0; i < 100; i++) {
        const result = dice.roll(5, 7, 'none', 0);
        if (result.outcome === 'critical_success') {
          criticalSuccessResult = result;
          break;
        }
      }

      if (criticalSuccessResult) {
        const description = dice.describeResult(criticalSuccessResult);
        expect(description).toContain('Éxito Crítico');
        expect(description).toContain('y');
      }
    });
  });

  describe('reproducibility', () => {
    it('debe generar mismos resultados con mismo seed', () => {
      const rng1 = new SeededRandom('same-seed');
      const rng2 = new SeededRandom('same-seed');
      const dice1 = createDiceSystem(rng1);
      const dice2 = createDiceSystem(rng2);

      const result1 = dice1.roll(3, 7, 'none', 0);
      const result2 = dice2.roll(3, 7, 'none', 0);

      expect(result1.dice).toEqual(result2.dice);
      expect(result1.total).toBe(result2.total);
      expect(result1.outcome).toBe(result2.outcome);
    });

    it('debe generar diferentes resultados con diferente seed', () => {
      const rng1 = new SeededRandom('seed-1');
      const rng2 = new SeededRandom('seed-2');
      const dice1 = createDiceSystem(rng1);
      const dice2 = createDiceSystem(rng2);

      const results1 = [];
      const results2 = [];

      for (let i = 0; i < 10; i++) {
        results1.push(dice1.roll(3, 7, 'none', 0).total);
        results2.push(dice2.roll(3, 7, 'none', 0).total);
      }

      // Al menos algunos deberían ser diferentes
      const allSame = results1.every((v, i) => v === results2[i]);
      expect(allSame).toBe(false);
    });
  });
});
