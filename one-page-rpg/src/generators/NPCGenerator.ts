import { SeededRandom } from '../utils/SeededRandom';
import type { NPC } from '../types/npc';

/**
 * Motivación de un NPC
 */
export type NPCMotivation =
  | 'gold'          // Riqueza
  | 'power'         // Poder político o mágico
  | 'knowledge'     // Conocimiento arcano
  | 'revenge'       // Venganza personal
  | 'love'          // Amor o familia
  | 'survival'      // Supervivencia básica
  | 'redemption'    // Redención por pasado oscuro
  | 'duty'          // Deber u honor
  | 'freedom'       // Libertad o autonomía
  | 'faith';        // Fe religiosa

/**
 * Tipo de secreto que tiene el NPC
 */
export type NPCSecretType =
  | 'hidden_identity'  // No es quien dice ser
  | 'dark_past'        // Cometió crímenes
  | 'double_agent'     // Trabaja para dos facciones
  | 'forbidden_love'   // Amor prohibido
  | 'hidden_treasure'  // Sabe dónde hay un tesoro
  | 'magical_curse'    // Está bajo una maldición
  | 'knows_truth'      // Conoce verdad importante
  | 'terminal_illness' // Está muriendo
  | 'impostor'         // Suplantó a alguien
  | 'heir_to_throne';  // Heredero oculto

/**
 * Secreto completo de un NPC
 */
export interface NPCSecret {
  type: NPCSecretType;
  description: string;
  severity: 'minor' | 'moderate' | 'major'; // Qué tan grave es que se sepa
  willingToShare: number; // 0-100: probabilidad de compartir si hay suficiente confianza
}

/**
 * Perfil completo generado para un NPC
 */
export interface GeneratedNPCProfile {
  name: string;
  gender: 'male' | 'female' | 'nonbinary';
  age: number;
  archetype: string;
  personality: string[];
  motivation: NPCMotivation;
  motivationDescription: string;
  secret?: NPCSecret;
  quirk: string; // Peculiaridad memorable
  voice: string; // Cómo habla
}

/**
 * Generador procedural de NPCs
 */
export class NPCGenerator {
  private rng: SeededRandom;
  
  // Sílabas para nombres masculinos
  private readonly maleSyllables = {
    first: ['Kal', 'Dro', 'Gor', 'Kar', 'Mar', 'Ber', 'Al', 'El', 'Tor', 'Bro', 'Gra', 'Thom', 'Ren', 'Dar', 'Syl'],
    middle: ['en', 'on', 'ar', 'or', 'el', 'an', 'ir', 'ak', 'ok', 'er'],
    last: ['do', 'ko', 'los', 'rick', 'vin', 'win', 'ron', 'ton', 'den', 'mor']
  };
  
  // Sílabas para nombres femeninos
  private readonly femaleSyllables = {
    first: ['El', 'Ara', 'Mir', 'Lil', 'Isa', 'Sel', 'Ysa', 'Ner', 'Val', 'Cass', 'Ryn', 'Thalia', 'Es', 'Fae', 'Lyra'],
    middle: ['en', 'ar', 'an', 'ys', 'el', 'is', 'yn', 'ia', 'or'],
    last: ['a', 'wen', 'ra', 'la', 'ina', 'lyn', 'eth', 'iel', 'yn', 'is']
  };
  
  // Arquetipos comunes
  private readonly archetypes = [
    'merchant', 'guard', 'farmer', 'scholar', 'priest', 'thief', 
    'blacksmith', 'innkeeper', 'hunter', 'herbalist', 'noble', 
    'beggar', 'soldier', 'sailor', 'miner', 'fisherman'
  ];
  
  // Rasgos de personalidad
  private readonly personalityTraits = [
    'brave', 'cowardly', 'greedy', 'generous', 'honest', 'deceitful',
    'loyal', 'treacherous', 'optimistic', 'pessimistic', 'cautious',
    'reckless', 'wise', 'foolish', 'kind', 'cruel', 'proud', 'humble',
    'curious', 'indifferent', 'patient', 'impatient', 'calm', 'nervous'
  ];
  
  // Peculiaridades memorables
  private readonly quirks = [
    'habla con acento extraño',
    'siempre está comiendo algo',
    'no puede mentir',
    'tartamudea cuando está nervioso',
    'tiene un loro en el hombro',
    'cuenta chistes malos constantemente',
    'es extremadamente supersticioso',
    'toca objetos tres veces por suerte',
    'cita proverbios antiguos',
    'silba melodías olvidadas',
    'tiene una risa contagiosa',
    'nunca mira a los ojos',
    'habla en tercera persona',
    'colecciona objetos extraños'
  ];
  
  // Formas de hablar
  private readonly voicePatterns = [
    'habla muy rápido y nervioso',
    'habla lento y con pausas dramáticas',
    'susurra todo',
    'grita constantemente',
    'usa muchas metáforas',
    'habla en preguntas retóricas',
    'muy directo y sin rodeos',
    'extremadamente formal',
    'usa jerga callejera',
    'mezcla idiomas',
    'poetico y florido',
    'monosilábico y conciso'
  ];
  
  constructor(rng: SeededRandom) {
    this.rng = rng;
  }
  
  /**
   * Genera un NPC completo
   */
  generate(archetype?: string, includeSecret: boolean = true): GeneratedNPCProfile {
    // Género
    const gender = this.rng.pick(['male', 'female', 'nonbinary'] as const);
    
    // Nombre
    const name = this.generateName(gender);
    
    // Edad
    const age = this.rng.nextInt(18, 70);
    
    // Arquetipo
    const selectedArchetype = archetype || this.rng.pick(this.archetypes);
    
    // Personalidad (2-3 rasgos)
    const personality = this.rng.shuffle(this.personalityTraits).slice(0, this.rng.nextInt(2, 3));
    
    // Motivación
    const motivation = this.generateMotivation();
    
    // Secreto (70% de probabilidad)
    const secret = includeSecret && this.rng.chance(0.7) 
      ? this.generateSecret(motivation.type) 
      : undefined;
    
    // Peculiaridad
    const quirk = this.rng.pick(this.quirks);
    
    // Voz
    const voice = this.rng.pick(this.voicePatterns);
    
    return {
      name,
      gender,
      age,
      archetype: selectedArchetype,
      personality,
      motivation: motivation.type,
      motivationDescription: motivation.description,
      secret,
      quirk,
      voice,
    };
  }
  
  /**
   * Genera un nombre basado en género
   */
  generateName(gender: 'male' | 'female' | 'nonbinary'): string {
    const syllables = gender === 'male' 
      ? this.maleSyllables 
      : this.femaleSyllables;
    
    const first = this.rng.pick(syllables.first);
    
    // 60% de probabilidad de tener sílaba media
    if (this.rng.chance(0.6)) {
      const middle = this.rng.pick(syllables.middle);
      const last = this.rng.pick(syllables.last);
      return first + middle + last;
    } else {
      const last = this.rng.pick(syllables.last);
      return first + last;
    }
  }
  
  /**
   * Genera motivación con descripción
   */
  private generateMotivation(): { type: NPCMotivation; description: string } {
    const motivations: Array<{ type: NPCMotivation; descriptions: string[] }> = [
      {
        type: 'gold',
        descriptions: [
          'necesita oro para pagar una deuda',
          'quiere hacerse rico para retirarse',
          'está ahorrando para algo importante'
        ]
      },
      {
        type: 'power',
        descriptions: [
          'busca ascender en la jerarquía',
          'quiere controlar el destino del reino',
          'ansía poder mágico prohibido'
        ]
      },
      {
        type: 'knowledge',
        descriptions: [
          'busca conocimiento arcano perdido',
          'quiere descubrir la verdad sobre el pasado',
          'investiga secretos prohibidos'
        ]
      },
      {
        type: 'revenge',
        descriptions: [
          'busca venganza por la muerte de un ser querido',
          'fue traicionado y quiere justicia',
          'juró venganza contra una facción'
        ]
      },
      {
        type: 'love',
        descriptions: [
          'protege a su familia a toda costa',
          'busca reunirse con un amor perdido',
          'haría cualquier cosa por sus hijos'
        ]
      },
      {
        type: 'survival',
        descriptions: [
          'solo quiere sobrevivir un día más',
          'huye de un peligro mortal',
          'está desesperado por protegerse'
        ]
      },
      {
        type: 'redemption',
        descriptions: [
          'busca redimirse por crímenes pasados',
          'intenta enmendar errores del pasado',
          'quiere morir con honor'
        ]
      },
      {
        type: 'duty',
        descriptions: [
          'cumple con su deber sin importar el costo',
          'juró lealtad y nunca la romperá',
          'sigue el código de honor de su orden'
        ]
      },
      {
        type: 'freedom',
        descriptions: [
          'lucha contra la opresión',
          'quiere liberarse de un contrato',
          'anhela vivir sin ataduras'
        ]
      },
      {
        type: 'faith',
        descriptions: [
          'sigue ciegamente su fe religiosa',
          'busca cumplir una profecía',
          'cree ser elegido por los dioses'
        ]
      }
    ];
    
    const selected = this.rng.pick(motivations);
    const description = this.rng.pick(selected.descriptions);
    
    return {
      type: selected.type,
      description
    };
  }
  
  /**
   * Genera un secreto relacionado con la motivación
   */
  private generateSecret(motivation: NPCMotivation): NPCSecret {
    const secretTemplates: Array<{
      type: NPCSecretType;
      description: string;
      severity: 'minor' | 'moderate' | 'major';
      motivations: NPCMotivation[];
    }> = [
      {
        type: 'hidden_identity',
        description: 'En realidad es un noble disfrazado de plebeyo',
        severity: 'major',
        motivations: ['power', 'freedom', 'revenge']
      },
      {
        type: 'dark_past',
        description: 'Cometió asesinato en el pasado y huye de la justicia',
        severity: 'major',
        motivations: ['redemption', 'survival', 'revenge']
      },
      {
        type: 'double_agent',
        description: 'Trabaja como espía para una facción enemiga',
        severity: 'major',
        motivations: ['gold', 'power', 'survival']
      },
      {
        type: 'forbidden_love',
        description: 'Está enamorado de alguien de una facción enemiga',
        severity: 'moderate',
        motivations: ['love', 'freedom']
      },
      {
        type: 'hidden_treasure',
        description: 'Conoce la ubicación de un tesoro perdido',
        severity: 'moderate',
        motivations: ['gold', 'knowledge']
      },
      {
        type: 'magical_curse',
        description: 'Está bajo una maldición que esconde cuidadosamente',
        severity: 'moderate',
        motivations: ['survival', 'redemption', 'knowledge']
      },
      {
        type: 'knows_truth',
        description: 'Sabe la verdad sobre el origen de la Plaga del Silencio',
        severity: 'major',
        motivations: ['knowledge', 'duty', 'faith']
      },
      {
        type: 'terminal_illness',
        description: 'Está muriendo y nadie lo sabe',
        severity: 'moderate',
        motivations: ['redemption', 'love', 'duty']
      },
      {
        type: 'impostor',
        description: 'Suplantó la identidad de alguien que murió',
        severity: 'major',
        motivations: ['survival', 'gold', 'power']
      },
      {
        type: 'heir_to_throne',
        description: 'Es el heredero legítimo al trono, pero en el exilio',
        severity: 'major',
        motivations: ['power', 'duty', 'revenge']
      }
    ];
    
    // Filtrar secretos relacionados con la motivación
    const relevantSecrets = secretTemplates.filter(s => 
      s.motivations.includes(motivation)
    );
    
    // Si no hay relevantes, usar cualquiera
    const pool = relevantSecrets.length > 0 ? relevantSecrets : secretTemplates;
    const selected = this.rng.pick(pool);
    
    // Probabilidad de compartir basada en severidad
    let willingToShare = 0;
    switch (selected.severity) {
      case 'minor':
        willingToShare = this.rng.nextInt(40, 70);
        break;
      case 'moderate':
        willingToShare = this.rng.nextInt(20, 40);
        break;
      case 'major':
        willingToShare = this.rng.nextInt(5, 20);
        break;
    }
    
    return {
      type: selected.type,
      description: selected.description,
      severity: selected.severity,
      willingToShare
    };
  }
  
  /**
   * Genera múltiples NPCs con variedad
   */
  generateBatch(count: number, archetypes?: string[]): GeneratedNPCProfile[] {
    const npcs: GeneratedNPCProfile[] = [];
    
    for (let i = 0; i < count; i++) {
      const archetype = archetypes 
        ? this.rng.pick(archetypes) 
        : undefined;
      
      npcs.push(this.generate(archetype, true));
    }
    
    return npcs;
  }
  
  /**
   * Convierte un perfil generado a un NPC del juego
   */
  toNPC(profile: GeneratedNPCProfile, location: string, faction?: string): NPC {
    return {
      id: this.rng.uuid(),
      name: profile.name,
      archetype: profile.archetype,
      race: 'human',
      location,
      faction,
      personality: profile.personality,
      role: profile.archetype,
      description: `${profile.name}, ${profile.age} años. ${profile.quirk}`,
    };
  }
}

/**
 * Factory function para crear un NPCGenerator
 */
export function createNPCGenerator(rng: SeededRandom): NPCGenerator {
  return new NPCGenerator(rng);
}

export default NPCGenerator;
