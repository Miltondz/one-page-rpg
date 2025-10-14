import type { LLMContext, NarrativeType } from './types';

/**
 * Generador procedural de narrativa como fallback
 * Se usa cuando el LLM falla o está deshabilitado
 */

/**
 * Variantes de descripciones para diferentes tipos de locaciones
 */
const LOCATION_TEMPLATES = {
  city: [
    'Las calles de {location} están llenas de gente sospechosa.',
    'El bullicio de {location} es ensordecedor.',
    'Las sombras se alargan entre los edificios de {location}.',
    'Un olor a humedad y podredumbre emana de los callejones de {location}.',
  ],
  dungeon: [
    'La oscuridad de {location} parece engullirte.',
    'El eco de tus pasos resuena en las paredes de {location}.',
    'Un aire viciado y frío te recibe en {location}.',
    'Las antorchas proyectan sombras danzantes en {location}.',
  ],
  wilderness: [
    'El paisaje de {location} se extiende ante ti.',
    'El viento sopla con fuerza en {location}.',
    'La vegetación de {location} parece observarte.',
    'Un silencio inquietante reina en {location}.',
  ],
  interior: [
    'El interior de {location} está en penumbra.',
    'Un olor a madera vieja impregna {location}.',
    'Las sombras danzan en las esquinas de {location}.',
    'El silencio de {location} es casi tangible.',
  ],
};

/**
 * Frases de combate por situación
 */
const COMBAT_TEMPLATES = {
  advantage: [
    'Tu {attribute} superior te da ventaja en el combate.',
    'El enemigo parece intimidado por tu presencia.',
    'Tus movimientos son precisos y letales.',
  ],
  disadvantage: [
    'Tu salud está menguando. Debes ser cuidadoso.',
    'El enemigo parece tener la ventaja.',
    'Cada movimiento te cuesta más esfuerzo.',
  ],
  neutral: [
    'El combate está igualado.',
    'Ambos bandos evalúan sus siguientes movimientos.',
    'La tensión en el aire es palpable.',
  ],
};

/**
 * Pensamientos del personaje según su estado
 */
const CHARACTER_THOUGHTS = {
  lowHealth: [
    'Cada herida me recuerda mi mortalidad.',
    'No puedo caer aquí... no ahora.',
    'El dolor es intenso, pero debo continuar.',
  ],
  highHealth: [
    'Aún tengo fuerzas para seguir adelante.',
    'Me siento preparado para lo que venga.',
    'Esta aventura apenas comienza.',
  ],
  noGold: [
    'Mis bolsillos están vacíos... como siempre.',
    'Necesito encontrar una forma de ganar oro.',
    'La pobreza es una vieja compañera.',
  ],
  richGold: [
    'El peso del oro en mi bolsa es reconfortante.',
    'Con esto podré mejorar mi equipo.',
    'La fortuna finalmente me sonríe.',
  ],
};

/**
 * Selecciona un template aleatorio de un array
 */
function randomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Reemplaza variables en un template
 */
function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Genera descripción de escena procedural
 */
function generateSceneDescription(context: LLMContext): string {
  const { location, worldState } = context;
  const templates = LOCATION_TEMPLATES[location.type] || LOCATION_TEMPLATES.city;
  
  const parts = [
    fillTemplate(randomTemplate(templates), { location: location.name }),
    location.description,
  ];
  
  // Añadir contexto de clima
  if (worldState.weather !== 'clear') {
    const weatherDesc = {
      rain: 'La lluvia golpea incesantemente.',
      storm: 'Una tormenta ruge en el exterior.',
      fog: 'Una niebla densa lo cubre todo.',
    };
    parts.push(weatherDesc[worldState.weather]);
  }
  
  return parts.join(' ');
}

/**
 * Genera diálogo procedural genérico
 */
function generateDialogue(context: LLMContext, specific?: string): string {
  const npc = specific || context.additionalContext?.presentNPCs?.[0] || 'el personaje';
  
  const genericDialogues = [
    `"Ten cuidado ahí fuera," dice ${npc}.`,
    `${npc} te mira con desconfianza. "¿Qué buscas aquí?"`,
    `"He escuchado rumores extraños últimamente," comenta ${npc}.`,
    `${npc} suspira. "Estos son tiempos oscuros."`,
  ];
  
  return randomTemplate(genericDialogues);
}

/**
 * Genera texto de combate procedural
 */
function generateCombatFlavor(context: LLMContext): string {
  const { player } = context;
  const healthPercent = ((player.maxWounds - player.wounds) / player.maxWounds) * 100;
  
  let situation: 'advantage' | 'disadvantage' | 'neutral' = 'neutral';
  
  if (healthPercent > 75) {
    situation = 'advantage';
  } else if (healthPercent < 30) {
    situation = 'disadvantage';
  }
  
  const template = randomTemplate(COMBAT_TEMPLATES[situation]);
  
  // Determinar atributo más alto
  const attrs = player.attributes;
  let highestAttr = 'fuerza';
  if (attrs.agility > attrs.strength && attrs.agility > attrs.intelligence) {
    highestAttr = 'agilidad';
  } else if (attrs.intelligence > attrs.strength && attrs.intelligence > attrs.agility) {
    highestAttr = 'inteligencia';
  }
  
  return fillTemplate(template, { attribute: highestAttr });
}

/**
 * Genera descubrimiento de item procedural
 */
function generateItemDiscovery(context: LLMContext, specific?: string): string {
  const item = specific || 'un objeto';
  
  const templates = [
    `Entre las sombras, encuentras ${item}.`,
    `Tu mirada se detiene en ${item}.`,
    `Casi pasa desapercibido, pero ahí está: ${item}.`,
    `Un brillo tenue revela ${item}.`,
  ];
  
  return randomTemplate(templates);
}

/**
 * Genera actualización de misión procedural
 */
function generateQuestUpdate(context: LLMContext, specific?: string): string {
  const quest = specific || context.additionalContext?.activeQuest || 'tu misión';
  
  const templates = [
    `Has avanzado en ${quest}.`,
    `Cada paso te acerca más al objetivo de ${quest}.`,
    `${quest} comienza a revelar sus secretos.`,
    `Tu progreso en ${quest} no pasa desapercibido.`,
  ];
  
  return randomTemplate(templates);
}

/**
 * Genera detalle ambiental procedural
 */
function generateEnvironmentalDetail(context: LLMContext): string {
  const { worldState } = context;
  
  const timeDetails = {
    dawn: 'Los primeros rayos de sol comienzan a filtrarse.',
    day: 'La luz del día ilumina el camino.',
    dusk: 'El crepúsculo tiñe todo de tonos anaranjados.',
    night: 'La oscuridad de la noche lo envuelve todo.',
  };
  
  const weatherDetails = {
    clear: 'El cielo está despejado.',
    rain: 'Las gotas de lluvia crean un ritmo constante.',
    storm: 'Los truenos retumban a lo lejos.',
    fog: 'La niebla distorsiona las formas.',
  };
  
  return `${timeDetails[worldState.timeOfDay]} ${weatherDetails[worldState.weather]}`;
}

/**
 * Genera pensamiento del personaje procedural
 */
function generateCharacterThought(context: LLMContext): string {
  const { player } = context;
  const healthPercent = ((player.maxWounds - player.wounds) / player.maxWounds) * 100;
  
  let category: keyof typeof CHARACTER_THOUGHTS;
  
  if (healthPercent < 40) {
    category = 'lowHealth';
  } else if (healthPercent > 80) {
    category = 'highHealth';
  } else if (player.gold === 0) {
    category = 'noGold';
  } else if (player.gold > 50) {
    category = 'richGold';
  } else {
    category = 'highHealth'; // default
  }
  
  return randomTemplate(CHARACTER_THOUGHTS[category]);
}

/**
 * Genera narrativa procedural según el tipo
 */
export function generateProceduralNarrative(
  context: LLMContext,
  type: NarrativeType,
  specific?: string
): string {
  switch (type) {
    case 'scene_description':
      return generateSceneDescription(context);
    
    case 'dialogue':
      return generateDialogue(context, specific);
    
    case 'combat_flavor':
      return generateCombatFlavor(context);
    
    case 'item_discovery':
      return generateItemDiscovery(context, specific);
    
    case 'quest_update':
      return generateQuestUpdate(context, specific);
    
    case 'environmental_detail':
      return generateEnvironmentalDetail(context);
    
    case 'character_thought':
      return generateCharacterThought(context);
    
    default:
      return `Algo interesante sucede en ${context.location.name}.`;
  }
}
