import { describe, it, expect, beforeEach } from 'vitest';
import { ReputationSystem } from '../systems/ReputationSystem';
import type { NPC, Reputation } from '../types';
import type { NPCMemory } from '../systems/NPCMemorySystem';

describe('ReputationSystem', () => {
  let repSystem: ReputationSystem;

  beforeEach(() => {
    repSystem = new ReputationSystem();
  });

  describe('calculateNPCAttitude', () => {
    const mockNPC: NPC = {
      id: 'test-npc',
      name: 'Test NPC',
      location: 'test-location',
      faction: 'casa_von_hess',
      role: 'merchant',
      archetype: 'merchant',
      race: 'Human',
      relationship: 0,
      mood: 'neutral',
      knowledge: [],
      questsGiven: [],
      interactions: [],
      isAlive: true,
      isMet: false,
    };

    it('debe calcular actitud hostile con reputación muy baja (-80 a -100)', () => {
      const rep: Reputation = { casa_von_hess: -90, circulo_eco: 0, culto_silencio: 0 };
      const attitude = repSystem.calculateNPCAttitude(mockNPC, rep);
      expect(attitude).toBe('hostile');
    });

    it('debe calcular actitud unfriendly con reputación baja (-40 a -79)', () => {
      const rep: Reputation = { casa_von_hess: -50, circulo_eco: 0, culto_silencio: 0 };
      const attitude = repSystem.calculateNPCAttitude(mockNPC, rep);
      expect(attitude).toBe('unfriendly');
    });

    it('debe calcular actitud neutral con reputación media (-39 a +39)', () => {
      const rep: Reputation = { casa_von_hess: 20, circulo_eco: 0, culto_silencio: 0 };
      const attitude = repSystem.calculateNPCAttitude(mockNPC, rep);
      expect(attitude).toBe('neutral');
    });

    it('debe calcular actitud friendly con reputación alta (+40 a +79)', () => {
      const rep: Reputation = { casa_von_hess: 60, circulo_eco: 0, culto_silencio: 0 };
      const attitude = repSystem.calculateNPCAttitude(mockNPC, rep);
      expect(attitude).toBe('friendly');
    });

    it('debe calcular actitud devoted con reputación muy alta (+80 a +100)', () => {
      const rep: Reputation = { casa_von_hess: 90, circulo_eco: 0, culto_silencio: 0 };
      const attitude = repSystem.calculateNPCAttitude(mockNPC, rep);
      expect(attitude).toBe('devoted');
    });

    it('debe priorizar memoria personal sobre reputación de facción', () => {
      const rep: Reputation = { casa_von_hess: 80, circulo_eco: 0, culto_silencio: 0 };
      const memory: NPCMemory = {
        npcId: 'test-npc',
        npcName: 'Test NPC',
        firstMetAt: Date.now() - 10000,
        lastSeenAt: Date.now(),
        totalInteractions: 5,
        relationship: -50, // Memoria personal negativa
        mood: 'suspicious',
        trust: 30,
        interactions: [],
        promises: [],
        secrets: [],
        owedFavors: 0,
        tags: [],
      };

      const attitude = repSystem.calculateNPCAttitude(mockNPC, rep, memory);
      
      // Debería ser unfriendly por memoria personal, no devoted por facción
      expect(attitude).toBe('unfriendly');
    });

    it('debe usar reputación de facción neutral si NPC no tiene facción', () => {
      const npcWithoutFaction: NPC = {
        ...mockNPC,
        faction: undefined,
      };
      const rep: Reputation = { casa_von_hess: 90, circulo_eco: 0, culto_silencio: 0 };
      
      const attitude = repSystem.calculateNPCAttitude(npcWithoutFaction, rep);
      expect(attitude).toBe('neutral');
    });
  });

  describe('getPriceModifiers', () => {
    it('debe aplicar descuento correcto para reputación +80 (devoted)', () => {
      const rep: Reputation = { casa_von_hess: 85, circulo_eco: 0, culto_silencio: 0 };
      const modifiers = repSystem.getPriceModifiers('casa_von_hess', rep);

      expect(modifiers.buyModifier).toBeCloseTo(0.7, 2); // 30% descuento
      expect(modifiers.sellModifier).toBeCloseTo(1.3, 2); // 30% más por ventas
    });

    it('debe aplicar descuento correcto para reputación +60', () => {
      const rep: Reputation = { casa_von_hess: 65, circulo_eco: 0, culto_silencio: 0 };
      const modifiers = repSystem.getPriceModifiers('casa_von_hess', rep);

      expect(modifiers.buyModifier).toBeCloseTo(0.8, 2); // 20% descuento
      expect(modifiers.sellModifier).toBeCloseTo(1.2, 2); // 20% más por ventas
    });

    it('debe aplicar descuento correcto para reputación +40 (friendly)', () => {
      const rep: Reputation = { casa_von_hess: 45, circulo_eco: 0, culto_silencio: 0 };
      const modifiers = repSystem.getPriceModifiers('casa_von_hess', rep);

      expect(modifiers.buyModifier).toBeCloseTo(0.9, 2); // 10% descuento
      expect(modifiers.sellModifier).toBeCloseTo(1.1, 2); // 10% más por ventas
    });

    it('debe no aplicar modificador para reputación neutral (0)', () => {
      const rep: Reputation = { casa_von_hess: 0, circulo_eco: 0, culto_silencio: 0 };
      const modifiers = repSystem.getPriceModifiers('casa_von_hess', rep);

      expect(modifiers.buyModifier).toBe(1.0);
      expect(modifiers.sellModifier).toBe(1.0);
    });

    it('debe aplicar sobreprecio correcto para reputación -60', () => {
      const rep: Reputation = { casa_von_hess: -65, circulo_eco: 0, culto_silencio: 0 };
      const modifiers = repSystem.getPriceModifiers('casa_von_hess', rep);

      expect(modifiers.buyModifier).toBeCloseTo(1.2, 2); // 20% sobreprecio
      expect(modifiers.sellModifier).toBeCloseTo(0.8, 2); // 20% menos por ventas
    });

    it('debe aplicar sobreprecio máximo para reputación -90 (hostile)', () => {
      const rep: Reputation = { casa_von_hess: -95, circulo_eco: 0, culto_silencio: 0 };
      const modifiers = repSystem.getPriceModifiers('casa_von_hess', rep);

      expect(modifiers.buyModifier).toBeCloseTo(1.6, 2); // 60% sobreprecio
      expect(modifiers.sellModifier).toBeCloseTo(0.5, 2); // 50% menos por ventas
    });

    it('debe priorizar memoria personal sobre reputación de facción', () => {
      const rep: Reputation = { casa_von_hess: 80, circulo_eco: 0, culto_silencio: 0 };
      const memory: NPCMemory = {
        npcId: 'test-merchant',
        npcName: 'Test Merchant',
        firstMetAt: Date.now() - 10000,
        lastSeenAt: Date.now(),
        totalInteractions: 3,
        relationship: -60, // Memoria personal negativa
        mood: 'suspicious',
        trust: 20,
        interactions: [],
        promises: [],
        secrets: [],
        owedFavors: 0,
        tags: [],
      };

      const modifiers = repSystem.getPriceModifiers('casa_von_hess', rep, memory);

      // Debería aplicar sobreprecio por memoria negativa, no descuento
      expect(modifiers.buyModifier).toBeGreaterThan(1.0);
      expect(modifiers.sellModifier).toBeLessThan(1.0);
    });
  });

  describe('getReputationBenefits', () => {
    it('debe otorgar información exclusiva con reputación +50', () => {
      const rep: Reputation = { casa_von_hess: 55, circulo_eco: 0, culto_silencio: 0 };
      const benefits = repSystem.getReputationBenefits('casa_von_hess', rep);

      expect(benefits.exclusiveInfoAvailable).toBe(true);
      expect(benefits.specialItemsUnlocked).toBe(false);
    });

    it('debe otorgar acceso a items especiales con reputación +60', () => {
      const rep: Reputation = { casa_von_hess: 65, circulo_eco: 0, culto_silencio: 0 };
      const benefits = repSystem.getReputationBenefits('casa_von_hess', rep);

      expect(benefits.specialItemsUnlocked).toBe(true);
      expect(benefits.canRequestFavors).toBe(false);
    });

    it('debe permitir pedir favores con reputación +70', () => {
      const rep: Reputation = { casa_von_hess: 75, circulo_eco: 0, culto_silencio: 0 };
      const benefits = repSystem.getReputationBenefits('casa_von_hess', rep);

      expect(benefits.canRequestFavors).toBe(true);
      expect(benefits.safehaven).toBe(false);
    });

    it('debe otorgar refugio seguro con reputación +80', () => {
      const rep: Reputation = { casa_von_hess: 85, circulo_eco: 0, culto_silencio: 0 };
      const benefits = repSystem.getReputationBenefits('casa_von_hess', rep);

      expect(benefits.safehaven).toBe(true);
    });

    it('debe no otorgar beneficios con reputación baja', () => {
      const rep: Reputation = { casa_von_hess: 30, circulo_eco: 0, culto_silencio: 0 };
      const benefits = repSystem.getReputationBenefits('casa_von_hess', rep);

      expect(benefits.exclusiveInfoAvailable).toBe(false);
      expect(benefits.specialItemsUnlocked).toBe(false);
      expect(benefits.canRequestFavors).toBe(false);
      expect(benefits.safehaven).toBe(false);
    });
  });

  describe('getReputationPenalties', () => {
    it('debe causar NPCs hostiles con reputación -60', () => {
      const rep: Reputation = { casa_von_hess: -65, circulo_eco: 0, culto_silencio: 0 };
      const penalties = repSystem.getReputationPenalties('casa_von_hess', rep);

      expect(penalties.npcsHostile).toBe(true);
      expect(penalties.accessRestricted.length).toBe(0);
    });

    it('debe restringir acceso a locaciones con reputación -70', () => {
      const rep: Reputation = { casa_von_hess: -75, circulo_eco: 0, culto_silencio: 0 };
      const penalties = repSystem.getReputationPenalties('casa_von_hess', rep);

      expect(penalties.accessRestricted.length).toBeGreaterThan(0);
      expect(penalties.attackOnSight).toBe(false);
    });

    it('debe causar attack on sight con reputación -80', () => {
      const rep: Reputation = { casa_von_hess: -85, circulo_eco: 0, culto_silencio: 0 };
      const penalties = repSystem.getReputationPenalties('casa_von_hess', rep);

      expect(penalties.attackOnSight).toBe(true);
      expect(penalties.bounty).toBeUndefined();
    });

    it('debe poner recompensa con reputación -90', () => {
      const rep: Reputation = { casa_von_hess: -95, circulo_eco: 0, culto_silencio: 0 };
      const penalties = repSystem.getReputationPenalties('casa_von_hess', rep);

      expect(penalties.bounty).toBeDefined();
      expect(penalties.bounty).toBeGreaterThanOrEqual(100);
      expect(penalties.bounty).toBeLessThanOrEqual(500);
    });

    it('debe no aplicar penalizaciones con reputación neutral', () => {
      const rep: Reputation = { casa_von_hess: 0, circulo_eco: 0, culto_silencio: 0 };
      const penalties = repSystem.getReputationPenalties('casa_von_hess', rep);

      expect(penalties.npcsHostile).toBe(false);
      expect(penalties.accessRestricted.length).toBe(0);
      expect(penalties.attackOnSight).toBe(false);
      expect(penalties.bounty).toBeUndefined();
    });
  });

  describe('willTrade', () => {
    it('merchant no debe comerciar con actitud hostile', () => {
      const willTrade = repSystem.willTrade('hostile', 'merchant');
      expect(willTrade).toBe(false);
    });

    it('merchant debe comerciar con actitud unfriendly', () => {
      const willTrade = repSystem.willTrade('unfriendly', 'merchant');
      expect(willTrade).toBe(true);
    });

    it('merchant debe comerciar con actitud neutral', () => {
      const willTrade = repSystem.willTrade('neutral', 'merchant');
      expect(willTrade).toBe(true);
    });

    it('merchant debe comerciar con actitud friendly y devoted', () => {
      expect(repSystem.willTrade('friendly', 'merchant')).toBe(true);
      expect(repSystem.willTrade('devoted', 'merchant')).toBe(true);
    });

    it('NPC normal no debe comerciar con unfriendly', () => {
      const willTrade = repSystem.willTrade('unfriendly', 'civilian');
      expect(willTrade).toBe(false);
    });
  });

  describe('willShareInfo', () => {
    it('debe compartir información trivial con cualquier actitud no hostile', () => {
      expect(repSystem.willShareInfo('unfriendly', 'trivial')).toBe(true);
      expect(repSystem.willShareInfo('neutral', 'trivial')).toBe(true);
      expect(repSystem.willShareInfo('friendly', 'trivial')).toBe(true);
    });

    it('no debe compartir información trivial con hostile', () => {
      expect(repSystem.willShareInfo('hostile', 'trivial')).toBe(false);
    });

    it('debe compartir información normal con neutral o mejor', () => {
      expect(repSystem.willShareInfo('unfriendly', 'normal')).toBe(false);
      expect(repSystem.willShareInfo('neutral', 'normal')).toBe(true);
      expect(repSystem.willShareInfo('friendly', 'normal')).toBe(true);
    });

    it('debe compartir información importante solo con friendly o devoted', () => {
      expect(repSystem.willShareInfo('neutral', 'important')).toBe(false);
      expect(repSystem.willShareInfo('friendly', 'important')).toBe(true);
      expect(repSystem.willShareInfo('devoted', 'important')).toBe(true);
    });

    it('debe compartir secretos solo con devoted', () => {
      expect(repSystem.willShareInfo('friendly', 'secret')).toBe(false);
      expect(repSystem.willShareInfo('devoted', 'secret')).toBe(true);
    });
  });

  describe('willDoFavor', () => {
    it('debe hacer favor fácil con friendly o devoted', () => {
      expect(repSystem.willDoFavor('neutral', 'easy')).toBe(false);
      expect(repSystem.willDoFavor('friendly', 'easy')).toBe(true);
      expect(repSystem.willDoFavor('devoted', 'easy')).toBe(true);
    });

    it('debe hacer favor medio solo con devoted', () => {
      expect(repSystem.willDoFavor('friendly', 'medium')).toBe(false);
      expect(repSystem.willDoFavor('devoted', 'medium')).toBe(true);
    });

    it('debe hacer favor difícil solo con devoted', () => {
      expect(repSystem.willDoFavor('friendly', 'hard')).toBe(false);
      expect(repSystem.willDoFavor('devoted', 'hard')).toBe(true);
    });

    it('debe hacer favor peligroso solo con devoted', () => {
      expect(repSystem.willDoFavor('friendly', 'dangerous')).toBe(false);
      expect(repSystem.willDoFavor('devoted', 'dangerous')).toBe(true);
    });
  });

  describe('applyReputationChange', () => {
    it('debe aplicar cambio directo a facción primaria', () => {
      const initialRep: Reputation = { casa_von_hess: 50, circulo_eco: 0, culto_silencio: 0 };
      const newRep = repSystem.applyReputationChange('casa_von_hess', 10, initialRep);

      expect(newRep.casa_von_hess).toBe(60);
    });

    it('debe afectar facciones relacionadas negativamente (casa_von_hess <-> circulo_eco)', () => {
      const initialRep: Reputation = { casa_von_hess: 50, circulo_eco: 0, culto_silencio: 0 };
      const newRep = repSystem.applyReputationChange('casa_von_hess', 10, initialRep);

      // Circulo_eco es enemigo de casa_von_hess con relación -0.3
      // Debería perder 3 puntos (10 * 0.3)
      expect(newRep.circulo_eco).toBe(-3);
    });

    it('debe afectar facciones relacionadas negativamente (circulo_eco <-> culto_silencio)', () => {
      const initialRep: Reputation = { casa_von_hess: 0, circulo_eco: 50, culto_silencio: 0 };
      const newRep = repSystem.applyReputationChange('circulo_eco', 10, initialRep);

      // Culto_silencio es enemigo mortal de circulo_eco con relación -0.5
      // Debería perder 5 puntos (10 * 0.5)
      expect(newRep.culto_silencio).toBe(-5);
    });

    it('debe respetar límite superior de reputación (+100)', () => {
      const initialRep: Reputation = { casa_von_hess: 95, circulo_eco: 0, culto_silencio: 0 };
      const newRep = repSystem.applyReputationChange('casa_von_hess', 20, initialRep);

      expect(newRep.casa_von_hess).toBe(100);
    });

    it('debe respetar límite inferior de reputación (-100)', () => {
      const initialRep: Reputation = { casa_von_hess: -95, circulo_eco: 0, culto_silencio: 0 };
      const newRep = repSystem.applyReputationChange('casa_von_hess', -20, initialRep);

      expect(newRep.casa_von_hess).toBe(-100);
    });

    it('debe manejar cambio negativo correctamente', () => {
      const initialRep: Reputation = { casa_von_hess: 50, circulo_eco: 0, culto_silencio: 0 };
      const newRep = repSystem.applyReputationChange('casa_von_hess', -15, initialRep);

      expect(newRep.casa_von_hess).toBe(35);
    });
  });

  describe('describeReputation', () => {
    it('debe describir reputación hostile', () => {
      const description = repSystem.describeReputation(-90);
      expect(description.toLowerCase()).toContain('hostil');
    });

    it('debe describir reputación unfriendly', () => {
      const description = repSystem.describeReputation(-50);
      expect(description.toLowerCase()).toContain('desfavorable');
    });

    it('debe describir reputación neutral', () => {
      const description = repSystem.describeReputation(0);
      expect(description.toLowerCase()).toContain('neutral');
    });

    it('debe describir reputación friendly', () => {
      const description = repSystem.describeReputation(60);
      expect(description.toLowerCase()).toContain('amistosa');
    });

    it('debe describir reputación devoted', () => {
      const description = repSystem.describeReputation(90);
      expect(description.toLowerCase()).toContain('excelente');
    });
  });
});
