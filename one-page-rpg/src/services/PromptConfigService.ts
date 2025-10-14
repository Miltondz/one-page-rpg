/**
 * Servicio de configuración de prompts LLM
 * Carga prompts desde archivo JSON y gestiona templates
 */

export interface PromptTemplate {
  template: string;
  variables: string[];
  conditionalSections?: Record<string, Record<string, string>>;
  config: {
    max_new_tokens: number;
    temperature: number;
    top_p: number;
    repetition_penalty?: number;
  };
}

export interface PromptConfig {
  version: string;
  lastUpdated: string;
  description: string;
  global: {
    systemContext: string;
    constraints: Record<string, string>;
  };
  dialogue: {
    greeting: {
      firstMeeting: PromptTemplate;
      recurring: PromptTemplate;
    };
    standard: PromptTemplate;
    reaction: PromptTemplate;
    quest: {
      offering: PromptTemplate;
      discussing: PromptTemplate;
    };
  };
  oracle: {
    interpretation: PromptTemplate;
    resultExplanations: Record<string, string>;
  };
  journal: {
    entry: PromptTemplate;
    summary: PromptTemplate;
  };
  achievements: {
    contextDescription: PromptTemplate;
  };
  narrative: {
    sceneDescription: PromptTemplate;
    eventOutcome: PromptTemplate;
    mysteryClue: PromptTemplate;
  };
  combat: {
    enemyTaunt: PromptTemplate;
    victoryDescription: PromptTemplate;
  };
  lore: {
    legendGeneration: PromptTemplate;
    ancientText: PromptTemplate;
  };
  fallbackSettings: {
    description: string;
    config: {
      max_new_tokens: number;
      temperature: number;
      top_p: number;
      repetition_penalty: number;
    };
  };
  metadata: {
    model: string;
    optimizedFor: string;
    notes: string[];
    guidelines: string[];
  };
}

/**
 * Resultado de construcción de prompt
 */
export interface BuiltPrompt {
  prompt: string;
  config: {
    max_new_tokens: number;
    temperature: number;
    top_p: number;
    repetition_penalty?: number;
  };
}

/**
 * Servicio de gestión de prompts configurables
 */
export class PromptConfigService {
  private config: PromptConfig | null = null;
  private configPath = '/config/llm-prompts.json';
  
  /**
   * Carga la configuración de prompts desde JSON
   */
  async loadConfig(): Promise<void> {
    try {
      const response = await fetch(this.configPath);
      if (!response.ok) {
        throw new Error(`Failed to load prompts config: ${response.statusText}`);
      }
      this.config = await response.json();
      console.log(`✅ Prompts config loaded (v${this.config?.version})`);
    } catch (error) {
      console.error('❌ Failed to load prompts config:', error);
      throw error;
    }
  }
  
  /**
   * Recarga la configuración (útil para hot-reload en desarrollo)
   */
  async reloadConfig(): Promise<void> {
    this.config = null;
    await this.loadConfig();
  }
  
  /**
   * Obtiene un template por ruta (ej: "dialogue.greeting.firstMeeting")
   */
  getTemplate(path: string): PromptTemplate | null {
    if (!this.config) {
      console.warn('Prompts config not loaded');
      return null;
    }
    
    const parts = path.split('.');
    let current: any = this.config;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        console.warn(`Template not found: ${path}`);
        return null;
      }
    }
    
    return current as PromptTemplate;
  }
  
  /**
   * Construye un prompt a partir de un template y variables
   */
  buildPrompt(
    templatePath: string,
    variables: Record<string, any>,
    conditionalFlags?: Record<string, boolean>
  ): BuiltPrompt | null {
    const template = this.getTemplate(templatePath);
    if (!template) {
      return this.getFallbackPrompt();
    }
    
    let prompt = template.template;
    
    // Procesar secciones condicionales primero
    if (template.conditionalSections && conditionalFlags) {
      for (const [sectionName, conditions] of Object.entries(template.conditionalSections)) {
        const flag = conditionalFlags[sectionName];
        const conditionKey = flag ? Object.keys(conditions)[0] : Object.keys(conditions)[1];
        const sectionContent = conditions[conditionKey] || '';
        
        // Reemplazar variables en la sección condicional
        let processedSection = sectionContent;
        for (const [key, value] of Object.entries(variables)) {
          processedSection = processedSection.replace(
            new RegExp(`\\{${key}\\}`, 'g'),
            String(value)
          );
        }
        
        // Reemplazar el placeholder de la sección
        prompt = prompt.replace(`{${sectionName}}`, processedSection);
      }
    }
    
    // Reemplazar variables restantes
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(
        new RegExp(`\\{${key}\\}`, 'g'),
        String(value)
      );
    }
    
    // Limpiar placeholders no reemplazados
    prompt = prompt.replace(/\{[^}]+\}/g, '');
    
    return {
      prompt,
      config: template.config,
    };
  }
  
  /**
   * Construye prompt de diálogo estándar
   */
  buildDialoguePrompt(
    npcName: string,
    personality: string,
    role: string,
    context: string,
    options?: {
      memoryContext?: string;
      playerAction?: string;
      topic?: string;
      tone?: string;
    }
  ): BuiltPrompt | null {
    return this.buildPrompt(
      'dialogue.standard',
      {
        npcName,
        personality,
        role,
        context,
        memoryContext: options?.memoryContext || '',
        playerAction: options?.playerAction || '',
        topic: options?.topic || '',
        tone: options?.tone || '',
      },
      {
        memorySection: !!options?.memoryContext,
        actionSection: !!options?.playerAction,
        topicSection: !!options?.topic,
        toneSection: !!options?.tone,
      }
    );
  }
  
  /**
   * Construye prompt de saludo
   */
  buildGreetingPrompt(
    npcName: string,
    personality: string,
    role: string,
    context: string,
    isFirstMeeting: boolean,
    memoryContext?: string
  ): BuiltPrompt | null {
    const templatePath = isFirstMeeting 
      ? 'dialogue.greeting.firstMeeting'
      : 'dialogue.greeting.recurring';
    
    return this.buildPrompt(templatePath, {
      npcName,
      personality,
      role,
      context,
      memoryContext: memoryContext || '',
    });
  }
  
  /**
   * Construye prompt de oráculo
   */
  buildOraclePrompt(
    context: string,
    question: string,
    roll: number,
    result: string,
    recentQueries?: string,
    isExtremeRoll?: boolean
  ): BuiltPrompt | null {
    const resultExplanation = this.getOracleResultExplanation(result);
    
    return this.buildPrompt(
      'oracle.interpretation',
      {
        context,
        question,
        roll: roll.toString(),
        resultExplanation,
        recentQueries: recentQueries || '',
      },
      {
        historySection: !!recentQueries,
        twistSection: isExtremeRoll || false,
      }
    );
  }
  
  /**
   * Construye prompt de entrada de diario
   */
  buildJournalEntryPrompt(
    event: string,
    context: string,
    category: string,
    characters?: string,
    previousEntries?: string
  ): BuiltPrompt | null {
    return this.buildPrompt(
      'journal.entry',
      {
        event,
        context,
        category,
        characters: characters || '',
        previousEntries: previousEntries || '',
      },
      {
        charactersSection: !!characters,
        previousEntriesSection: !!previousEntries,
      }
    );
  }
  
  /**
   * Construye prompt de logro
   */
  buildAchievementPrompt(
    achievementName: string,
    description: string,
    context: string
  ): BuiltPrompt | null {
    return this.buildPrompt('achievements.contextDescription', {
      achievementName,
      description,
      context,
    });
  }
  
  /**
   * Construye prompt de descripción de escena
   */
  buildSceneDescriptionPrompt(
    location: string,
    sceneType: string,
    mood: string,
    weather?: string
  ): BuiltPrompt | null {
    return this.buildPrompt(
      'narrative.sceneDescription',
      {
        location,
        sceneType,
        mood,
        weather: weather || '',
      },
      {
        weatherSection: !!weather,
      }
    );
  }
  
  /**
   * Obtiene explicación del resultado del oráculo
   */
  private getOracleResultExplanation(result: string): string {
    if (!this.config) {
      return result;
    }
    return this.config.oracle.resultExplanations[result] || result;
  }
  
  /**
   * Obtiene configuración fallback
   */
  private getFallbackPrompt(): BuiltPrompt {
    return {
      prompt: 'Generate a response for a fantasy RPG game.',
      config: this.config?.fallbackSettings.config || {
        max_new_tokens: 100,
        temperature: 0.8,
        top_p: 0.9,
        repetition_penalty: 1.1,
      },
    };
  }
  
  /**
   * Obtiene el contexto global del sistema
   */
  getSystemContext(): string {
    return this.config?.global.systemContext || '';
  }
  
  /**
   * Obtiene metadata de configuración
   */
  getMetadata() {
    return this.config?.metadata || null;
  }
  
  /**
   * Valida que todas las variables requeridas estén presentes
   */
  validateVariables(
    templatePath: string,
    providedVariables: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const template = this.getTemplate(templatePath);
    if (!template) {
      return { valid: false, missing: ['template_not_found'] };
    }
    
    const missing = template.variables.filter(
      v => !(v in providedVariables)
    );
    
    return {
      valid: missing.length === 0,
      missing,
    };
  }
  
  /**
   * Obtiene lista de todos los templates disponibles
   */
  listTemplates(): string[] {
    if (!this.config) {
      return [];
    }
    
    const templates: string[] = [];
    
    const traverse = (obj: any, path: string = '') => {
      for (const key in obj) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if ('template' in value && 'variables' in value) {
            templates.push(currentPath);
          } else {
            traverse(value, currentPath);
          }
        }
      }
    };
    
    traverse(this.config);
    return templates;
  }
  
  /**
   * Construye un prompt dinámico usando el contexto global del JSON
   * Para casos donde no existe un template predefinido
   */
  buildDynamicPrompt(
    instruction: string,
    context: Record<string, any>,
    options?: {
      includeSystemContext?: boolean;
      includeConstraints?: boolean;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
    }
  ): BuiltPrompt {
    const parts: string[] = [];
    
    // Incluir contexto del sistema si está habilitado
    if (options?.includeSystemContext !== false && this.config) {
      parts.push(this.config.global.systemContext);
      parts.push(''); // Línea en blanco
    }
    
    // Añadir el contexto proporcionado
    for (const [key, value] of Object.entries(context)) {
      if (value !== undefined && value !== null && value !== '') {
        parts.push(`${this.formatContextKey(key)}: ${value}`);
      }
    }
    
    if (context && Object.keys(context).length > 0) {
      parts.push(''); // Línea en blanco
    }
    
    // Añadir la instrucción principal
    parts.push(instruction);
    
    // Incluir constraints si está habilitado
    if (options?.includeConstraints !== false && this.config) {
      parts.push(''); // Línea en blanco
      for (const constraint of Object.values(this.config.global.constraints)) {
        parts.push(constraint);
      }
    }
    
    // Usar configuración proporcionada o fallback
    const config = {
      max_new_tokens: options?.maxTokens || this.config?.fallbackSettings.config.max_new_tokens || 100,
      temperature: options?.temperature || this.config?.fallbackSettings.config.temperature || 0.8,
      top_p: options?.topP || this.config?.fallbackSettings.config.top_p || 0.9,
      repetition_penalty: this.config?.fallbackSettings.config.repetition_penalty || 1.1,
    };
    
    return {
      prompt: parts.join('\n'),
      config,
    };
  }
  
  /**
   * Formatea una clave de contexto para que sea legible
   */
  private formatContextKey(key: string): string {
    // Convierte camelCase o snake_case a Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  /**
   * Construye un prompt combinando un template base con contexto adicional
   */
  buildHybridPrompt(
    templatePath: string,
    variables: Record<string, any>,
    additionalContext?: string,
    conditionalFlags?: Record<string, boolean>
  ): BuiltPrompt | null {
    const basePrompt = this.buildPrompt(templatePath, variables, conditionalFlags);
    
    if (!basePrompt) {
      return null;
    }
    
    if (additionalContext) {
      basePrompt.prompt += '\n\n' + additionalContext;
    }
    
    return basePrompt;
  }
  
  /**
   * Obtiene solo el system context global para usar como prefijo
   */
  getGlobalSystemContext(): string {
    return this.config?.global.systemContext || '';
  }
  
  /**
   * Obtiene las constraints globales como string
   */
  getGlobalConstraints(): string {
    if (!this.config) return '';
    return Object.values(this.config.global.constraints).join('\n');
  }
  
  /**
   * Verifica si la configuración está cargada
   */
  isLoaded(): boolean {
    return this.config !== null;
  }
  
  /**
   * Obtiene versión de la configuración
   */
  getVersion(): string | null {
    return this.config?.version || null;
  }
}

// Singleton instance
let promptServiceInstance: PromptConfigService | null = null;

/**
 * Obtiene la instancia singleton del servicio
 */
export function getPromptService(): PromptConfigService {
  if (!promptServiceInstance) {
    promptServiceInstance = new PromptConfigService();
  }
  return promptServiceInstance;
}

/**
 * Hook helper para usar en componentes React
 */
export async function usePrompts() {
  const service = getPromptService();
  
  if (!service.isLoaded()) {
    await service.loadConfig();
  }
  
  return service;
}
