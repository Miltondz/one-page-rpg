/**
 * Game Engines
 * 
 * Módulos centrales que gestionan la lógica del juego
 */

import { NarrativeEngine } from './NarrativeEngine';
import { LLMNarrativeEngine } from './LLMNarrativeEngine';
import { CombatEngine } from './CombatEngine';

// Motor narrativo básico
export { NarrativeEngine };

// Motor narrativo mejorado con LLM
export { LLMNarrativeEngine };

// Motor de combate
export { CombatEngine };

export default {
  NarrativeEngine,
  LLMNarrativeEngine,
  CombatEngine,
};
