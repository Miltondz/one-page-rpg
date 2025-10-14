/**
 * Scene Generator - Generador Procedural de Escenas
 * 
 * Combina tablas procedurales (locación + encuentro + desafío + consecuencia)
 * para crear escenas narrativas únicas y coherentes.
 */

import type { Scene, Decision } from '../types';
import type { SeededRandom } from '../utils/SeededRandom';

/**
 * Tipos de escenas generables
 */
export type SceneType = 
  | 'exploration'      // Exploración de locaciones
  | 'combat'           // Combate con enemigos
  | 'dialogue'         // Interacción con NPCs
  | 'puzzle'           // Acertijo o desafío mental
  | 'rest'             // Descanso y recuperación
  | 'treasure'         // Descubrimiento de tesoro
  | 'trap'             // Trampa o peligro
  | 'mystery';         // Evento misterioso

/**
 * Tabla de locaciones (2d6)
 */
const LOCATION_TABLE: Record<number, { name: string; description: string; type: string }> = {
  2: { name: 'Catacumbas Olvidadas', description: 'Túneles oscuros repletos de esqueletos antiguos', type: 'dungeon' },
  3: { name: 'Bosque Sombrío', description: 'Árboles retorcidos y niebla espesa', type: 'wilderness' },
  4: { name: 'Ruinas del Templo', description: 'Piedras caídas cubiertas de musgo y símbolos arcanos', type: 'dungeon' },
  5: { name: 'Taberna del Cuervo', description: 'Local húmedo con olor a cerveza rancia', type: 'city' },
  6: { name: 'Plaza del Mercado', description: 'Gente sospechosa y mercaderes charlatanes', type: 'city' },
  7: { name: 'Callejón Trasero', description: 'Pasaje estrecho entre edificios derruidos', type: 'city' },
  8: { name: 'Torre Abandonada', description: 'Estructura en ruinas con vistas a la ciudad', type: 'interior' },
  9: { name: 'Cripta Sellada', description: 'Entrada con símbolos de advertencia antiguos', type: 'dungeon' },
  10: { name: 'Camino del Bosque', description: 'Sendero apenas visible entre la maleza', type: 'wilderness' },
  11: { name: 'Caverna de Cristales', description: 'Cueva iluminada por cristales brillantes', type: 'dungeon' },
  12: { name: 'Mansión Von Hess', description: 'Casa noble con secretos oscuros', type: 'interior' },
};

/**
 * Tabla de encuentros (2d6)
 */
const ENCOUNTER_TABLE: Record<number, { type: string; name: string; description: string }> = {
  2: { type: 'enemy', name: 'Cultista del Silencio', description: 'Figura encapuchada murmurando oraciones oscuras' },
  3: { type: 'enemy', name: 'Lobo Salvaje', description: 'Bestia hambrienta con ojos brillantes' },
  4: { type: 'npc', name: 'Comerciante Sospechoso', description: 'Hombre con mercancía extraña' },
  5: { type: 'trap', name: 'Trampa de Flechas', description: 'Mecanismo antiguo aún funcional' },
  6: { type: 'mystery', name: 'Símbolo Arcano', description: 'Marca brillante en la pared' },
  7: { type: 'treasure', name: 'Cofre Cerrado', description: 'Caja de madera con cerradura oxidada' },
  8: { type: 'npc', name: 'Guardia Corrupto', description: 'Soldado con intenciones dudosas' },
  9: { type: 'puzzle', name: 'Puerta Sellada', description: 'Portal con inscripciones enigmáticas' },
  10: { type: 'enemy', name: 'Espectro Inquieto', description: 'Fantasma de un alma atormentada' },
  11: { type: 'npc', name: 'Elara la Oráculo', description: 'Mujer sabia con conocimiento arcano' },
  12: { type: 'boss', name: 'Señor de las Sombras', description: 'Entidad poderosa y maligna' },
};

/**
 * Tabla de desafíos/objetivos (2d6)
 */
const CHALLENGE_TABLE: Record<number, { type: string; description: string; difficulty: number }> = {
  2: { type: 'combat', description: 'Derrota al enemigo', difficulty: 11 },
  3: { type: 'stealth', description: 'Pasa desapercibido', difficulty: 9 },
  4: { type: 'persuasion', description: 'Convence al NPC', difficulty: 8 },
  5: { type: 'investigation', description: 'Descubre la verdad', difficulty: 8 },
  6: { type: 'survival', description: 'Sobrevive al peligro', difficulty: 7 },
  7: { type: 'exploration', description: 'Encuentra el camino', difficulty: 7 },
  8: { type: 'puzzle', description: 'Resuelve el acertijo', difficulty: 9 },
  9: { type: 'athletics', description: 'Supera el obstáculo físico', difficulty: 8 },
  10: { type: 'arcana', description: 'Comprende lo arcano', difficulty: 10 },
  11: { type: 'intimidation', description: 'Amedrenta al oponente', difficulty: 9 },
  12: { type: 'boss_fight', description: 'Enfrenta al jefe', difficulty: 12 },
};

/**
 * Tabla de consecuencias (2d6)
 */
const CONSEQUENCE_TABLE: Record<number, { positive: string; negative: string }> = {
  2: { positive: 'Encuentras un item legendario', negative: 'Pierdes un item valioso' },
  3: { positive: 'Ganas +3 oro', negative: 'Recibes 2 heridas' },
  4: { positive: 'Obtienes información valiosa', negative: 'Te engañan con información falsa' },
  5: { positive: 'Ganas +1 reputación', negative: 'Pierdes -1 reputación' },
  6: { positive: 'Encuentras una poción de curación', negative: 'Recibes 1 herida' },
  7: { positive: 'Avanza la misión', negative: 'La misión se complica' },
  8: { positive: 'Desbloqueas un atajo', negative: 'El camino se cierra' },
  9: { positive: 'Ganas +2 XP', negative: 'Ganas +1 fatiga' },
  10: { positive: 'Conoces a un aliado', negative: 'Haces un enemigo' },
  11: { positive: 'Obtienes equipo nuevo', negative: 'Tu equipo se daña' },
  12: { positive: 'Logro desbloqueado', negative: 'Evento catastrófico' },
};

/**
 * Tabla de atmósferas/mood
 */
const ATMOSPHERE_TABLE: string[] = [
  'Un silencio inquietante llena el aire',
  'La niebla espesa dificulta la visión',
  'Un olor a humedad y podredumbre impregna el lugar',
  'Sombras danzantes se mueven en las paredes',
  'El viento susurra secretos antiguos',
  'Una sensación de ser observado te invade',
  'El eco de tus pasos resuena ominosamente',
  'Una luz tenue parpadea en la distancia',
  'El frío te cala hasta los huesos',
  'Un presentimiento de peligro te alerta',
];

/**
 * Opciones para generar una escena
 */
export interface SceneGeneratorOptions {
  /** Tipo de escena a generar (opcional) */
  sceneType?: SceneType;
  
  /** Forzar una locación específica */
  forceLocation?: string;
  
  /** Forzar un tipo de encuentro */
  forceEncounter?: string;
  
  /** Incluir detalles atmosféricos */
  includeAtmosphere?: boolean;
  
  /** Nivel de dificultad base (1-5) */
  difficultyLevel?: number;
}

/**
 * Generador de escenas procedurales
 */
export class SceneGenerator {
  private rng: SeededRandom;
  
  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  /**
   * Genera una escena completa proceduralmente
   */
  generateScene(options: SceneGeneratorOptions = {}): Scene {
    const {
      includeAtmosphere = true,
      difficultyLevel = 1,
    } = options;

    // 1. Roll para locación (2d6)
    const locationRoll = this.rng.roll2d6().total;
    const location = LOCATION_TABLE[locationRoll];

    // 2. Roll para encuentro (2d6)
    const encounterRoll = this.rng.roll2d6().total;
    const encounter = ENCOUNTER_TABLE[encounterRoll];

    // 3. Roll para desafío (2d6)
    const challengeRoll = this.rng.roll2d6().total;
    const challenge = CHALLENGE_TABLE[challengeRoll];

    // 4. Generar ID único
    const sceneId = this.rng.uuid();

    // 5. Construir descripción
    let description = `${location.description}. ${encounter.description}.`;
    
    if (includeAtmosphere) {
      const atmosphere = this.rng.pick(ATMOSPHERE_TABLE);
      description += ` ${atmosphere}.`;
    }

    // 6. Generar decisiones basadas en el tipo de encuentro
    const decisions = this.generateDecisions(encounter.type, challenge, difficultyLevel);

    // 7. Crear escena
    const scene: Scene = {
      id: sceneId,
      title: location.name,
      description,
      location: location.name,
      decisions,
      tags: [encounter.type, challenge.type],
    };

    return scene;
  }

  /**
   * Genera decisiones para una escena
   */
  private generateDecisions(
    encounterType: string,
    challenge: { type: string; description: string; difficulty: number },
    difficultyLevel: number
  ): Decision[] {
    const decisions: Decision[] = [];
    const adjustedDifficulty = challenge.difficulty + (difficultyLevel - 1);

    // Decisiones según tipo de encuentro
    switch (encounterType) {
      case 'enemy':
      case 'boss':
        decisions.push(
          {
            id: this.rng.uuid(),
            text: `Atacar (FUE ${adjustedDifficulty})`,
            requirements: { attribute: 'strength', difficulty: adjustedDifficulty },
            nextSceneId: null,
            consequences: [
              { type: 'start_combat', enemies: [encounterType === 'boss' ? 'boss' : 'enemy'] },
            ],
          },
          {
            id: this.rng.uuid(),
            text: 'Huir (AGI 7)',
            requirements: { attribute: 'agility', difficulty: 7 },
            nextSceneId: null,
            consequences: [
              { type: 'add_fatigue', amount: 1 },
            ],
          }
        );
        break;

      case 'npc':
        decisions.push(
          {
            id: this.rng.uuid(),
            text: `Hablar (SAB ${adjustedDifficulty - 2})`,
            requirements: { attribute: 'intelligence', difficulty: adjustedDifficulty - 2 },
            nextSceneId: null,
            consequences: [
              { type: 'dialogue', npc: 'generated_npc' },
            ],
          },
          {
            id: this.rng.uuid(),
            text: 'Atacar',
            requirements: {},
            nextSceneId: null,
            consequences: [
              { type: 'reputation', target: 'general', value: -2 },
              { type: 'start_combat', enemies: ['npc_hostile'] },
            ],
          }
        );
        break;

      case 'trap':
        decisions.push(
          {
            id: this.rng.uuid(),
            text: `Detectar y desactivar (AGI ${adjustedDifficulty})`,
            requirements: { attribute: 'agility', difficulty: adjustedDifficulty },
            nextSceneId: null,
            consequences: [
              { type: 'add_gold', amount: 3 },
            ],
          },
          {
            id: this.rng.uuid(),
            text: 'Avanzar con cuidado',
            requirements: {},
            nextSceneId: null,
            consequences: [
              { type: 'damage', amount: 1, damage_type: 'wounds' },
            ],
          }
        );
        break;

      case 'treasure':
        decisions.push(
          {
            id: this.rng.uuid(),
            text: 'Abrir el cofre',
            requirements: {},
            nextSceneId: null,
            consequences: [
              { type: 'add_gold', amount: this.rng.nextInt(3, 10) },
              { type: 'add_item', item: 'random_item' },
            ],
          },
          {
            id: this.rng.uuid(),
            text: `Examinar primero (SAB ${adjustedDifficulty - 1})`,
            requirements: { attribute: 'intelligence', difficulty: adjustedDifficulty - 1 },
            nextSceneId: null,
            consequences: [
              { type: 'add_gold', amount: this.rng.nextInt(5, 15) },
            ],
          }
        );
        break;

      case 'puzzle':
        decisions.push(
          {
            id: this.rng.uuid(),
            text: `Resolver el acertijo (SAB ${adjustedDifficulty})`,
            requirements: { attribute: 'intelligence', difficulty: adjustedDifficulty },
            nextSceneId: null,
            consequences: [
              { type: 'add_xp', amount: 2 },
              { type: 'add_item', item: 'artifact' },
            ],
          },
          {
            id: this.rng.uuid(),
            text: 'Usar fuerza bruta',
            requirements: { attribute: 'strength', difficulty: adjustedDifficulty + 2 },
            nextSceneId: null,
            consequences: [
              { type: 'damage', amount: 2, damage_type: 'wounds' },
            ],
          }
        );
        break;

      case 'mystery':
        decisions.push(
          {
            id: this.rng.uuid(),
            text: `Investigar (SAB ${adjustedDifficulty - 1})`,
            requirements: { attribute: 'intelligence', difficulty: adjustedDifficulty - 1 },
            nextSceneId: null,
            consequences: [
              { type: 'reveal_secret', secret: 'mystery_clue' },
              { type: 'add_xp', amount: 1 },
            ],
          },
          {
            id: this.rng.uuid(),
            text: 'Ignorar y continuar',
            requirements: {},
            nextSceneId: null,
            consequences: [],
          }
        );
        break;

      default:
        // Decisión genérica de exploración
        decisions.push(
          {
            id: this.rng.uuid(),
            text: 'Explorar el área',
            requirements: {},
            nextSceneId: null,
            consequences: [
              { type: 'advance_exploration', progress: 1 },
            ],
          }
        );
    }

    // Siempre incluir opción de descansar (si no es combate)
    if (encounterType !== 'enemy' && encounterType !== 'boss') {
      decisions.push({
        id: this.rng.uuid(),
        text: 'Descansar (recupera 1 herida y 1 fatiga)',
        requirements: {},
        nextSceneId: null,
        consequences: [
          { type: 'heal', amount: 1, heal_type: 'wounds' },
          { type: 'heal', amount: 1, heal_type: 'fatigue' },
        ],
      });
    }

    return decisions;
  }

  /**
   * Genera una serie de escenas conectadas (mini-aventura)
   */
  generateAdventure(sceneCount: number = 5): Scene[] {
    const scenes: Scene[] = [];
    
    for (let i = 0; i < sceneCount; i++) {
      const difficulty = Math.min(5, Math.floor(i / 2) + 1);
      const scene = this.generateScene({ 
        difficultyLevel: difficulty,
        includeAtmosphere: true 
      });
      
      // Conectar escenas
      if (scenes.length > 0) {
        const previousScene = scenes[scenes.length - 1];
        // La primera decisión de la escena anterior lleva a esta
        if (previousScene.decisions.length > 0) {
          previousScene.decisions[0].nextSceneId = scene.id;
        }
      }
      
      scenes.push(scene);
    }
    
    return scenes;
  }

  /**
   * Genera una escena de descanso/recuperación
   */
  generateRestScene(): Scene {
    const restLocations = [
      { name: 'Campamento Improvisado', description: 'Un lugar seguro para descansar junto al fuego' },
      { name: 'Refugio Oculto', description: 'Una cueva seca protegida del viento' },
      { name: 'Posada del Caminante', description: 'Una habitación modesta pero cálida' },
    ];
    
    const location = this.rng.pick(restLocations);
    
    return {
      id: this.rng.uuid(),
      title: location.name,
      description: location.description,
      location: location.name,
      decisions: [
        {
          id: this.rng.uuid(),
          text: 'Descansar (recupera todas las heridas y fatiga)',
          requirements: {},
          nextSceneId: null,
          consequences: [
            { type: 'heal', amount: 99, heal_type: 'wounds' },
            { type: 'heal', amount: 99, heal_type: 'fatigue' },
          ],
        },
        {
          id: this.rng.uuid(),
          text: 'Continuar la aventura',
          requirements: {},
          nextSceneId: null,
          consequences: [],
        },
      ],
      tags: ['rest', 'safe'],
    };
  }
}

export default SceneGenerator;
