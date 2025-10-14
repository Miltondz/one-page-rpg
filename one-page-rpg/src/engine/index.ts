/**
 * Game Engines
 * 
 * Módulos centrales que gestionan la lógica del juego
 */

// Motor narrativo básico
export { NarrativeEngine } from './NarrativeEngine';

// Motor narrativo mejorado con LLM
export { LLMNarrativeEngine } from './LLMNarrativeEngine';

// Motor de combate
export { CombatEngine } from './CombatEngine';

export default {
  NarrativeEngine,
  LLMNarrativeEngine,
  CombatEngine,
};
