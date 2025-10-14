import { describe, it, expect, beforeEach } from 'vitest';
import { createNPCGenerator, NPCGenerator } from '../generators/NPCGenerator';
import { SeededRandom } from '../utils/SeededRandom';

describe('NPCGenerator', () => {
  let generator: NPCGenerator;
  let rng: SeededRandom;

  beforeEach(() => {
    rng = new SeededRandom('test-npc-seed');
    generator = createNPCGenerator(rng);
  });

  describe('generateName', () => {
    it('debe generar nombre masculino válido', () => {
      const name = generator.generateName('male');
      
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(3);
      expect(name.length).toBeLessThan(15);
      // Primera letra debe ser mayúscula
      expect(name[0]).toBe(name[0].toUpperCase());
    });

    it('debe generar nombre femenino válido', () => {
      const name = generator.generateName('female');
      
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(3);
      expect(name.length).toBeLessThan(15);
      expect(name[0]).toBe(name[0].toUpperCase());
    });

    it('debe generar nombre nonbinary válido', () => {
      const name = generator.generateName('nonbinary');
      
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(3);
      expect(name.length).toBeLessThan(15);
      expect(name[0]).toBe(name[0].toUpperCase());
    });

    it('debe generar nombres diferentes con diferentes seeds', () => {
      const rng1 = new SeededRandom('seed1');
      const rng2 = new SeededRandom('seed2');
      const gen1 = createNPCGenerator(rng1);
      const gen2 = createNPCGenerator(rng2);

      const names1 = [];
      const names2: string[] = [];

      for (let i = 0; i < 10; i++) {
        names1.push(gen1.generateName('male'));
        names2.push(gen2.generateName('male'));
      }

      // Al menos algunos deberían ser diferentes
      const allSame = names1.every((name, i) => name === names2[i]);
      expect(allSame).toBe(false);
    });

    it('debe generar mismo nombre con mismo seed', () => {
      const rng1 = new SeededRandom('same-seed');
      const rng2 = new SeededRandom('same-seed');
      const gen1 = createNPCGenerator(rng1);
      const gen2 = createNPCGenerator(rng2);

      const name1 = gen1.generateName('female');
      const name2 = gen2.generateName('female');

      expect(name1).toBe(name2);
    });
  });

  describe('generate', () => {
    it('debe generar perfil completo de NPC', () => {
      const profile = generator.generate();

      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('gender');
      expect(profile).toHaveProperty('age');
      expect(profile).toHaveProperty('archetype');
      expect(profile).toHaveProperty('personality');
      expect(profile).toHaveProperty('motivation');
      expect(profile).toHaveProperty('motivationDescription');
      expect(profile).toHaveProperty('quirk');
      expect(profile).toHaveProperty('voice');
      
      expect(['male', 'female', 'nonbinary']).toContain(profile.gender);
      expect(profile.age).toBeGreaterThanOrEqual(18);
      expect(profile.age).toBeLessThanOrEqual(70);
      expect(profile.personality).toBeInstanceOf(Array);
      expect(profile.personality.length).toBeGreaterThanOrEqual(2);
      expect(profile.personality.length).toBeLessThanOrEqual(3);
    });

    it('debe generar NPC con secreto cuando includeSecret = true', () => {
      const profile = generator.generate(undefined, true);
      
      expect(profile.secret).toBeDefined();
      expect(profile.secret).toHaveProperty('type');
      expect(profile.secret).toHaveProperty('description');
      expect(profile.secret).toHaveProperty('severity');
      expect(profile.secret).toHaveProperty('willingToShare');
      
      expect(['minor', 'moderate', 'major']).toContain(profile.secret!.severity);
      expect(profile.secret!.willingToShare).toBeGreaterThanOrEqual(0);
      expect(profile.secret!.willingToShare).toBeLessThanOrEqual(100);
    });

    it('debe generar NPC sin secreto cuando includeSecret = false', () => {
      const profile = generator.generate(undefined, false);
      
      expect(profile.secret).toBeUndefined();
    });

    it('debe generar NPC con arquetipo específico', () => {
      const profile = generator.generate('merchant');
      
      expect(profile.archetype).toBe('merchant');
    });

    it('debe generar edad adulta (18-70)', () => {
      for (let i = 0; i < 20; i++) {
        const profile = generator.generate();
        expect(profile.age).toBeGreaterThanOrEqual(18);
        expect(profile.age).toBeLessThanOrEqual(70);
      }
    });

    it('debe generar motivaciones válidas', () => {
      const validMotivations = [
        'gold', 'power', 'knowledge', 'revenge', 'love',
        'survival', 'redemption', 'duty', 'freedom', 'faith'
      ];

      for (let i = 0; i < 10; i++) {
        const profile = generator.generate();
        expect(validMotivations).toContain(profile.motivation);
        expect(profile.motivationDescription).toBeDefined();
        expect(profile.motivationDescription.length).toBeGreaterThan(10);
      }
    });

    it('debe generar secretos relacionados con motivaciones', () => {
      const profile = generator.generate(undefined, true);
      
      expect(profile.secret).toBeDefined();
      
      // Secretos válidos
      const validSecrets = [
        'hidden_identity', 'dark_past', 'double_agent', 'forbidden_love',
        'hidden_treasure', 'magical_curse', 'knows_truth', 'terminal_illness',
        'impostor', 'heir_to_throne'
      ];
      
      expect(validSecrets).toContain(profile.secret!.type);
    });

    it('debe generar quirks únicos', () => {
      const quirks = new Set();
      
      for (let i = 0; i < 20; i++) {
        const profile = generator.generate();
        quirks.add(profile.quirk);
      }
      
      // Debería haber variedad (al menos 5 diferentes en 20 generaciones)
      expect(quirks.size).toBeGreaterThanOrEqual(5);
    });

    it('debe generar patrones de voz únicos', () => {
      const voices = new Set();
      
      for (let i = 0; i < 20; i++) {
        const profile = generator.generate();
        voices.add(profile.voice);
      }
      
      // Debería haber variedad (al menos 5 diferentes en 20 generaciones)
      expect(voices.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('generateBatch', () => {
    it('debe generar múltiples NPCs', () => {
      const profiles = generator.generateBatch(5);
      
      expect(profiles).toHaveLength(5);
      profiles.forEach(profile => {
        expect(profile).toHaveProperty('name');
        expect(profile).toHaveProperty('archetype');
      });
    });

    it('debe generar NPCs con arquetipos específicos', () => {
      const archetypes = ['merchant', 'guard', 'priest'];
      const profiles = generator.generateBatch(6, archetypes);
      
      expect(profiles).toHaveLength(6);
      profiles.forEach(profile => {
        expect(archetypes).toContain(profile.archetype);
      });
    });

    it('debe generar NPCs con nombres únicos en el mismo batch', () => {
      const profiles = generator.generateBatch(10);
      const names = profiles.map(p => p.name);
      const uniqueNames = new Set(names);
      
      // Debería haber bastante variedad
      expect(uniqueNames.size).toBeGreaterThanOrEqual(8);
    });

    it('debe generar variedad de géneros', () => {
      const profiles = generator.generateBatch(20);
      const genders = new Set(profiles.map(p => p.gender));
      
      // Debería tener al menos 2 géneros diferentes
      expect(genders.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('toNPC', () => {
    it('debe convertir perfil a NPC válido', () => {
      const profile = generator.generate('merchant');
      const npc = generator.toNPC(profile, 'test-location', 'casa_von_hess');
      
      expect(npc).toHaveProperty('id');
      expect(npc).toHaveProperty('name');
      expect(npc).toHaveProperty('location');
      expect(npc).toHaveProperty('faction');
      expect(npc).toHaveProperty('role');
      expect(npc).toHaveProperty('archetype');
      
      expect(npc.name).toBe(profile.name);
      expect(npc.location).toBe('test-location');
      expect(npc.faction).toBe('casa_von_hess');
      expect(npc.role).toBe('merchant');
      expect(npc.archetype).toBe('merchant');
    });

    it('debe generar ID único para cada NPC', () => {
      const profile1 = generator.generate();
      const profile2 = generator.generate();
      
      const npc1 = generator.toNPC(profile1, 'location1');
      const npc2 = generator.toNPC(profile2, 'location2');
      
      expect(npc1.id).not.toBe(npc2.id);
    });

    it('debe manejar NPC sin facción', () => {
      const profile = generator.generate();
      const npc = generator.toNPC(profile, 'test-location');
      
      expect(npc.faction).toBeUndefined();
    });
  });

  describe('reproducibility', () => {
    it('debe generar mismo NPC con mismo seed', () => {
      const rng1 = new SeededRandom('reproducible-seed');
      const rng2 = new SeededRandom('reproducible-seed');
      const gen1 = createNPCGenerator(rng1);
      const gen2 = createNPCGenerator(rng2);

      const profile1 = gen1.generate('merchant', true);
      const profile2 = gen2.generate('merchant', true);

      expect(profile1.name).toBe(profile2.name);
      expect(profile1.age).toBe(profile2.age);
      expect(profile1.motivation).toBe(profile2.motivation);
      expect(profile1.personality).toEqual(profile2.personality);
      expect(profile1.secret?.type).toBe(profile2.secret?.type);
    });

    it('debe generar diferentes NPCs con diferente seed', () => {
      const rng1 = new SeededRandom('seed-a');
      const rng2 = new SeededRandom('seed-b');
      const gen1 = createNPCGenerator(rng1);
      const gen2 = createNPCGenerator(rng2);

      const profile1 = gen1.generate();
      const profile2 = gen2.generate();

      // Al menos algunas propiedades deberían ser diferentes
      const namesDifferent = profile1.name !== profile2.name;
      const ageDifferent = profile1.age !== profile2.age;
      const motivationDifferent = profile1.motivation !== profile2.motivation;

      expect(namesDifferent || ageDifferent || motivationDifferent).toBe(true);
    });

    it('debe generar mismo batch con mismo seed', () => {
      const rng1 = new SeededRandom('batch-seed');
      const rng2 = new SeededRandom('batch-seed');
      const gen1 = createNPCGenerator(rng1);
      const gen2 = createNPCGenerator(rng2);

      const batch1 = gen1.generateBatch(5);
      const batch2 = gen2.generateBatch(5);

      expect(batch1.length).toBe(batch2.length);
      
      for (let i = 0; i < batch1.length; i++) {
        expect(batch1[i].name).toBe(batch2[i].name);
        expect(batch1[i].age).toBe(batch2[i].age);
        expect(batch1[i].motivation).toBe(batch2[i].motivation);
      }
    });
  });

  describe('secret severity', () => {
    it('minor secrets deben tener mayor probabilidad de compartirse', () => {
      // Generar múltiples NPCs y verificar distribución de severidad
      const secrets = [];
      
      for (let i = 0; i < 50; i++) {
        const profile = generator.generate(undefined, true);
        if (profile.secret) {
          secrets.push(profile.secret);
        }
      }

      expect(secrets.length).toBeGreaterThan(30); // Mayoría debería tener secreto

      // Minor secrets: 40-70% willing to share
      const minorSecrets = secrets.filter(s => s.severity === 'minor');
      minorSecrets.forEach(secret => {
        expect(secret.willingToShare).toBeGreaterThanOrEqual(40);
        expect(secret.willingToShare).toBeLessThanOrEqual(70);
      });

      // Moderate secrets: 20-40% willing to share
      const moderateSecrets = secrets.filter(s => s.severity === 'moderate');
      moderateSecrets.forEach(secret => {
        expect(secret.willingToShare).toBeGreaterThanOrEqual(20);
        expect(secret.willingToShare).toBeLessThanOrEqual(40);
      });

      // Major secrets: 5-20% willing to share
      const majorSecrets = secrets.filter(s => s.severity === 'major');
      majorSecrets.forEach(secret => {
        expect(secret.willingToShare).toBeGreaterThanOrEqual(5);
        expect(secret.willingToShare).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('archetype distribution', () => {
    it('debe generar variedad de arquetipos sin especificar', () => {
      const archetypes = new Set();
      
      for (let i = 0; i < 30; i++) {
        const profile = generator.generate();
        archetypes.add(profile.archetype);
      }
      
      // Debería haber al menos 5 arquetipos diferentes en 30 generaciones
      expect(archetypes.size).toBeGreaterThanOrEqual(5);
    });

    it('debe respetar arquetipo especificado', () => {
      const specificArchetypes = ['merchant', 'guard', 'priest', 'thief'];
      
      specificArchetypes.forEach(archetype => {
        const profile = generator.generate(archetype);
        expect(profile.archetype).toBe(archetype);
      });
    });
  });

  describe('personality traits', () => {
    it('debe generar 2-3 rasgos de personalidad', () => {
      for (let i = 0; i < 20; i++) {
        const profile = generator.generate();
        expect(profile.personality.length).toBeGreaterThanOrEqual(2);
        expect(profile.personality.length).toBeLessThanOrEqual(3);
      }
    });

    it('rasgos de personalidad deben ser únicos en el mismo NPC', () => {
      for (let i = 0; i < 20; i++) {
        const profile = generator.generate();
        const uniqueTraits = new Set(profile.personality);
        expect(uniqueTraits.size).toBe(profile.personality.length);
      }
    });

    it('debe generar variedad de rasgos', () => {
      const allTraits = new Set();
      
      for (let i = 0; i < 30; i++) {
        const profile = generator.generate();
        profile.personality.forEach(trait => allTraits.add(trait));
      }
      
      // Debería haber al menos 10 rasgos diferentes en 30 NPCs
      expect(allTraits.size).toBeGreaterThanOrEqual(10);
    });
  });
});
