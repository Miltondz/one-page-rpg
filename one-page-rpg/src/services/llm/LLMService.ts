import { pipeline, Pipeline } from '@xenova/transformers';
import type {
  LLMConfig,
  LLMContext,
  NarrativeGenerationParams,
  LLMGenerationResult,
  NarrativeType,
} from './types';
import { DEFAULT_LLM_CONFIG } from './types';
import { buildPrompt, validateContext } from './promptTemplates';
import { generateProceduralNarrative } from './fallbackGenerator';

/**
 * Servicio de generación de narrativa con LLM local (SmolLM-360M-Instruct)
 * 
 * Este servicio carga el modelo SmolLM-360M-Instruct en el navegador usando
 * Transformers.js y genera narrativa dinámica basada en el estado del juego.
 * 
 * Características:
 * - Carga lazy del modelo (solo cuando se necesita)
 * - Cache del modelo en navegador
 * - Fallback automático a generación procedural
 * - Timeout configurable
 * - Modo debug para desarrollo
 */
export class LLMService {
  private config: LLMConfig;
  private model: Pipeline | null = null;
  private isLoading = false;
  private loadError: Error | null = null;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = { ...DEFAULT_LLM_CONFIG, ...config };
    
    if (this.config.debug) {
      console.log('[LLMService] Initialized with config:', this.config);
    }
  }

  /**
   * Carga el modelo LLM
   * Solo se ejecuta una vez (lazy loading)
   */
  private async loadModel(): Promise<void> {
    if (this.model) {
      return; // Ya está cargado
    }

    if (this.isLoading) {
      // Esperar a que termine la carga actual
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    const startTime = Date.now();

    try {
      if (this.config.debug) {
        console.log('[LLMService] Loading model:', this.config.modelId);
      }

      // Cargar el modelo de generación de texto
      this.model = await pipeline('text-generation', this.config.modelId, {
        // @ts-expect-error - Opciones específicas de Transformers.js
        cache_dir: this.config.useCache ? undefined : null,
        progress_callback: (progress: { status?: string; file?: string; progress?: number }) => {
          if (this.config.debug && progress?.status === 'progress') {
            console.log(
              `[LLMService] Loading: ${progress.file} - ${Math.round(progress.progress || 0)}%`
            );
          }
        },
      }) as Pipeline;

      const loadTime = Date.now() - startTime;
      
      if (this.config.debug) {
        console.log(`[LLMService] Model loaded successfully in ${loadTime}ms`);
      }

      this.loadError = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.loadError = new Error(`Failed to load LLM model: ${errorMessage}`);
      
      console.error('[LLMService] Model loading failed:', error);
      
      if (this.config.debug) {
        console.warn('[LLMService] Will fallback to procedural generation');
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Genera narrativa usando el LLM
   */
  private async generateWithLLM(
    prompt: string,
    maxLength: number,
    temperature: number
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      const result = await this.model(prompt, {
        max_new_tokens: maxLength,
        temperature,
        top_k: this.config.defaultParams.topK,
        top_p: this.config.defaultParams.topP,
        do_sample: true,
        num_return_sequences: 1,
      });

      // Extraer el texto generado
      const generated = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
      
      if (!generated) {
        throw new Error('No text generated from model');
      }

      // Limpiar el prompt del resultado (el modelo a veces lo incluye)
      let cleanedText = generated.replace(prompt, '').trim();
      
      // Limpiar posibles artefactos
      cleanedText = cleanedText
        .replace(/^["'\s]+|["'\s]+$/g, '') // Quitar comillas iniciales/finales
        .replace(/\n{3,}/g, '\n\n') // Normalizar saltos de línea
        .trim();

      return cleanedText;
    } catch (error) {
      throw new Error(`LLM generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Genera narrativa con timeout
   */
  private async generateWithTimeout(
    prompt: string,
    maxLength: number,
    temperature: number
  ): Promise<string> {
    return Promise.race([
      this.generateWithLLM(prompt, maxLength, temperature),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Generation timeout')), this.config.timeout)
      ),
    ]);
  }

  /**
   * Método principal: genera narrativa adaptada al contexto del juego
   */
  async generateNarrative(params: NarrativeGenerationParams): Promise<LLMGenerationResult> {
    const startTime = Date.now();
    const {
      context,
      type,
      specificPrompt,
      maxLength = this.config.defaultParams.maxLength,
      temperature = this.config.defaultParams.temperature,
    } = params;

    // Validar contexto
    const validation = validateContext(context);
    if (!validation.valid) {
      console.warn('[LLMService] Invalid context:', validation.errors);
      return this.generateFallback(context, type, specificPrompt, startTime);
    }

    // Si el LLM está deshabilitado, usar fallback directamente
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('[LLMService] LLM disabled, using procedural fallback');
      }
      return this.generateFallback(context, type, specificPrompt, startTime);
    }

    try {
      // Cargar modelo si no está cargado
      await this.loadModel();

      // Si hubo error al cargar, usar fallback
      if (this.loadError || !this.model) {
        return this.generateFallback(context, type, specificPrompt, startTime);
      }

      // Construir prompt
      const prompt = buildPrompt(context, type, specificPrompt);

      if (this.config.debug) {
        console.log('[LLMService] Generating with prompt:', prompt.slice(0, 200) + '...');
      }

      // Generar con LLM
      const text = await this.generateWithTimeout(prompt, maxLength, temperature);
      const generationTime = Date.now() - startTime;

      if (this.config.debug) {
        console.log(`[LLMService] Generated in ${generationTime}ms:`, text.slice(0, 100));
      }

      return {
        text,
        usedLLM: true,
        generationTime,
        metadata: {
          modelUsed: this.config.modelId,
          tokensGenerated: text.split(/\s+/).length, // Aproximación
        },
      };
    } catch (error) {
      console.warn('[LLMService] LLM generation failed, using fallback:', error);
      return this.generateFallback(context, type, specificPrompt, startTime, error);
    }
  }

  /**
   * Genera usando el sistema procedural de fallback
   */
  private generateFallback(
    context: LLMContext,
    type: NarrativeType,
    specificPrompt: string | undefined,
    startTime: number,
    error?: unknown
  ): LLMGenerationResult {
    const text = generateProceduralNarrative(context, type, specificPrompt);
    const generationTime = Date.now() - startTime;

    return {
      text,
      usedLLM: false,
      generationTime,
      metadata: {
        modelUsed: 'procedural',
        error: error instanceof Error ? error.message : undefined,
      },
    };
  }

  /**
   * Habilita o deshabilita el LLM
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (this.config.debug) {
      console.log(`[LLMService] LLM ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Obtiene el estado actual del servicio
   */
  getStatus(): {
    enabled: boolean;
    modelLoaded: boolean;
    isLoading: boolean;
    hasError: boolean;
    error?: string;
  } {
    return {
      enabled: this.config.enabled,
      modelLoaded: this.model !== null,
      isLoading: this.isLoading,
      hasError: this.loadError !== null,
      error: this.loadError?.message,
    };
  }

  /**
   * Pre-carga el modelo (útil para inicialización)
   */
  async preload(): Promise<void> {
    if (this.config.enabled) {
      await this.loadModel();
    }
  }

  /**
   * Libera recursos del modelo (para liberar memoria)
   */
  unload(): void {
    this.model = null;
    this.loadError = null;
    if (this.config.debug) {
      console.log('[LLMService] Model unloaded');
    }
  }
}

// Instancia singleton del servicio
let instance: LLMService | null = null;

/**
 * Obtiene la instancia singleton del servicio LLM
 */
export function getLLMService(config?: Partial<LLMConfig>): LLMService {
  if (!instance) {
    instance = new LLMService(config);
  }
  return instance;
}

/**
 * Reinicia el servicio LLM (útil para testing o cambio de configuración)
 */
export function resetLLMService(): void {
  if (instance) {
    instance.unload();
    instance = null;
  }
}
