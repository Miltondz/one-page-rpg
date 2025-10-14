/**
 * Módulo de integración LLM local (SmolLM-360M-Instruct)
 * 
 * Este módulo proporciona generación de narrativa dinámica usando un LLM
 * local que se ejecuta completamente en el navegador.
 */

// Servicio principal
export { LLMService, getLLMService, resetLLMService } from './LLMService';

// Tipos
export type {
  LLMContext,
  LLMConfig,
  NarrativeType,
  NarrativeGenerationParams,
  LLMGenerationResult,
} from './types';

export { DEFAULT_LLM_CONFIG } from './types';

// Utilidades
export { buildPrompt, validateContext } from './promptTemplates';
export { generateProceduralNarrative } from './fallbackGenerator';
