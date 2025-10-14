import type { LLMContext, NarrativeType } from './types';

/**
 * Construye un resumen compacto del estado del jugador
 */
function buildPlayerSummary(context: LLMContext): string {
  const { player } = context;
  const health = player.maxWounds - player.wounds;
  const healthPercent = Math.round((health / player.maxWounds) * 100);
  
  return [
    `${player.name}, nivel ${player.level} ${player.race} ${player.class}`,
    `Salud: ${healthPercent}% (${health}/${player.maxWounds})`,
    `FUE:${player.attributes.FUE} AGI:${player.attributes.AGI} SAB:${player.attributes.SAB} SUE:${player.attributes.SUE}`,
    `Items: ${context.inventory.length} | Oro: ${player.gold}`,
  ].join(' | ');
}

/**
 * Construye resumen de la ubicación
 */
function buildLocationSummary(context: LLMContext): string {
  const { location, worldState } = context;
  return [
    `Ubicación: ${location.name} (${location.type})`,
    `Hora: ${worldState.timeOfDay}`,
    `Clima: ${worldState.weather}`,
  ].join(' | ');
}

/**
 * Construye resumen de eventos recientes
 */
function buildRecentEventsSummary(context: LLMContext): string {
  if (context.recentEvents.length === 0) {
    return 'El jugador acaba de comenzar su aventura.';
  }
  
  const lastEvents = context.recentEvents.slice(-3);
  return 'Eventos recientes:\n' + lastEvents.map((e, i) => `${i + 1}. ${e}`).join('\n');
}

/**
 * Prompt base del sistema para el LLM
 */
const SYSTEM_PROMPT = `Eres un narrador maestro para un juego de rol dark fantasy llamado "One Page RPG".

Tu objetivo es generar narrativa inmersiva, atmosférica y concisa que:
- Respete el estado actual del juego (salud, ubicación, inventario, eventos)
- Use un tono oscuro, misterioso y evocativo
- Sea específica y relevante a la situación
- Tenga entre 1-3 párrafos cortos (máximo 150 palabras)
- Evite repetir información ya conocida
- Añada detalles sensoriales (olores, sonidos, texturas)
- Mantenga la tensión narrativa

Reglas importantes:
- NO inventes nuevos personajes o items sin contexto
- NO contradiga el estado del juego
- NO uses formato de lista o puntos
- SÍ usa descripciones vividas y evocativas
- SÍ mantén un tono coherente con dark fantasy`;

/**
 * Templates específicos por tipo de narrativa
 */
const NARRATIVE_TEMPLATES: Record<NarrativeType, (context: LLMContext, specific?: string) => string> = {
  scene_description: (context, specific) => {
    const playerInfo = buildPlayerSummary(context);
    const locationInfo = buildLocationSummary(context);
    const eventsInfo = buildRecentEventsSummary(context);
    
    return `${SYSTEM_PROMPT}

CONTEXTO DEL JUEGO:
${playerInfo}
${locationInfo}

${eventsInfo}

TAREA: Describe la escena actual desde la perspectiva del jugador. ${specific || 'Captura la atmósfera del lugar y la situación.'}

DESCRIPCIÓN:`;
  },

  dialogue: (context, specific) => {
    const playerInfo = buildPlayerSummary(context);
    const npcInfo = context.additionalContext?.presentNPCs?.join(', ') || 'un personaje';
    
    return `${SYSTEM_PROMPT}

CONTEXTO DEL JUEGO:
${playerInfo}
NPCs presentes: ${npcInfo}

${buildRecentEventsSummary(context)}

TAREA: Genera el diálogo de ${specific || npcInfo}. ${specific ? `Sobre: ${specific}` : 'Debe ser coherente con la situación actual.'}

DIÁLOGO:`;
  },

  combat_flavor: (context, specific) => {
    const playerInfo = buildPlayerSummary(context);
    const enemies = context.additionalContext?.presentEnemies?.join(', ') || 'enemigos';
    
    return `${SYSTEM_PROMPT}

CONTEXTO COMBATE:
${playerInfo}
Enemigos: ${enemies}

${buildRecentEventsSummary(context)}

TAREA: Genera texto de sabor para ${specific || 'el combate'}. Debe ser dinámico, visceral y emocionante.

NARRACIÓN:`;
  },

  item_discovery: (context, specific) => {
    const playerInfo = buildPlayerSummary(context);
    const locationInfo = buildLocationSummary(context);
    
    return `${SYSTEM_PROMPT}

CONTEXTO:
${playerInfo}
${locationInfo}

TAREA: Describe el descubrimiento de ${specific || 'un objeto'}. Hazlo intrigante y memorable.

DESCUBRIMIENTO:`;
  },

  quest_update: (context, specific) => {
    const playerInfo = buildPlayerSummary(context);
    const quest = context.additionalContext?.activeQuest || specific || 'la misión actual';
    
    return `${SYSTEM_PROMPT}

CONTEXTO:
${playerInfo}
Misión: ${quest}

${buildRecentEventsSummary(context)}

TAREA: Narra una actualización de la misión. ${specific || 'Debe reflejar el progreso del jugador.'}

ACTUALIZACIÓN:`;
  },

  environmental_detail: (context, specific) => {
    const locationInfo = buildLocationSummary(context);
    
    return `${SYSTEM_PROMPT}

CONTEXTO:
${locationInfo}

TAREA: Añade un detalle ambiental interesante ${specific ? `sobre ${specific}` : 'del entorno'}. Debe ser evocativo y añadir atmósfera.

DETALLE:`;
  },

  character_thought: (context, specific) => {
    const playerInfo = buildPlayerSummary(context);
    
    return `${SYSTEM_PROMPT}

CONTEXTO:
${playerInfo}

${buildRecentEventsSummary(context)}

TAREA: Genera un pensamiento interno del personaje ${specific ? `sobre ${specific}` : 'relacionado con la situación actual'}. Primera persona, introspectivo.

PENSAMIENTO:`;
  },
};

/**
 * Genera el prompt completo para el LLM
 */
export function buildPrompt(
  context: LLMContext,
  type: NarrativeType,
  specificPrompt?: string
): string {
  const templateFn = NARRATIVE_TEMPLATES[type];
  
  if (!templateFn) {
    throw new Error(`Template no encontrado para tipo: ${type}`);
  }
  
  return templateFn(context, specificPrompt);
}

/**
 * Valida que el contexto tenga la información mínima necesaria
 */
export function validateContext(context: LLMContext): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!context.player) {
    errors.push('Contexto sin información del jugador');
  }
  
  if (!context.location) {
    errors.push('Contexto sin información de ubicación');
  }
  
  if (!context.worldState) {
    errors.push('Contexto sin estado del mundo');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
