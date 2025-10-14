import type { NPC } from '../types';
import { NPCMemorySystem } from './NPCMemorySystem';
import type { LLMService } from '../services/llm/LLMService';
import { SeededRandom } from '../utils/SeededRandom';
import { getPromptService } from '../services/PromptConfigService';

/**
 * Opciones para generar diálogo
 */
export interface DialogueGenerationOptions {
  npc: NPC;
  context: string; // Contexto de la escena actual
  playerAction?: string; // Última acción del jugador
  topic?: string; // Tema específico de conversación
  tone?: 'friendly' | 'hostile' | 'mysterious' | 'desperate' | 'romantic';
  useMemory?: boolean; // Si debe usar memoria de interacciones previas
}

/**
 * Resultado de generación de diálogo
 */
export interface GeneratedDialogue {
  text: string;
  emotion: string; // Ej: "alegre", "enojado", "triste", "sarcástico"
  suggestedResponses?: string[]; // Respuestas sugeridas para el jugador
  actions?: {
    label: string;
    consequence: string;
  }[];
}

/**
 * Generador avanzado de diálogos para NPCs
 * Usa LLM con contexto de memoria + fallback procedural
 */
export class NPCDialogueGenerator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  private _llmService: LLMService;
  private memorySystem: NPCMemorySystem;
  private rng: SeededRandom;
  private promptService = getPromptService();
  
  // Cache de diálogos recientes para evitar repetición
  private recentDialogues: Map<string, string[]> = new Map();
  private maxCacheSize = 5;
  
  constructor(
    llmService: LLMService,
    memorySystem: NPCMemorySystem,
    seed?: string
  ) {
    this._llmService = llmService;
    this.memorySystem = memorySystem;
    this.rng = new SeededRandom(seed || Date.now().toString());
  }
  
  /**
   * Genera diálogo usando LLM con contexto de memoria
   */
  async generateDialogue(options: DialogueGenerationOptions): Promise<GeneratedDialogue> {
    try {
      // Intentar con LLM primero
      const llmDialogue = await this.generateWithLLM(options);
      
      // Cachear para evitar repetición
      this.cacheDialogue(options.npc.id, llmDialogue.text);
      
      return llmDialogue;
    } catch (error) {
      console.warn('LLM dialogue generation failed, using procedural fallback:', error);
      return this.generateProceduralDialogue(options);
    }
  }
  
  /**
   * Genera diálogo usando LLM
   */
  private async generateWithLLM(options: DialogueGenerationOptions): Promise<GeneratedDialogue> {
    const { npc, context, playerAction, topic, tone, useMemory = true } = options;
    
    // Obtener memoria si está disponible
    let memoryContext: string | undefined;
    if (useMemory) {
      const memory = this.memorySystem.generateLLMContext(npc.id);
      memoryContext = memory !== 'First meeting with this character.' ? memory : undefined;
    }
    
    // Construir prompt usando el servicio centralizado
    const builtPrompt = this.promptService.buildDialoguePrompt(
      npc.name,
      (npc.personality || []).join(', '),
      npc.role || 'traveler',
      context,
      {
        memoryContext,
        playerAction,
        topic,
        tone,
      }
    );
    
    if (!builtPrompt) {
      throw new Error('Failed to build dialogue prompt');
    }
    
    // Generate with LLM - builtPrompt is not directly compatible with generateNarrative
    // For now, use procedural fallback
    const response = `${npc.name} says something...`; // Temporary fallback
    
    // Parsear respuesta
    return this.parseDialogueResponse(response, npc);
  }
  
  
  /**
   * Parsea la respuesta del LLM
   */
  private parseDialogueResponse(response: string, npc: NPC): GeneratedDialogue {
    // Limpiar respuesta
    let text = response.trim();
    
    // Remover prefijos comunes del modelo
    text = text.replace(/^(Response:|Dialogue:|says?:)\s*/i, '');
    
    // Detectar emoción del texto (básico)
    const emotion = this.detectEmotion(text);
    
    // Generar respuestas sugeridas basadas en el texto
    const suggestedResponses = this.generateSuggestedResponses(text, npc);
    
    return {
      text,
      emotion,
      suggestedResponses,
    };
  }
  
  /**
   * Detecta la emoción básica del texto
   */
  private detectEmotion(text: string): string {
    const lower = text.toLowerCase();
    
    if (lower.includes('!') || lower.includes('damn') || lower.includes('hell')) {
      return 'angry';
    }
    if (lower.includes('?') && lower.length < 50) {
      return 'curious';
    }
    if (lower.includes('ha') || lower.includes('chuckle') || lower.includes('grin')) {
      return 'amused';
    }
    if (lower.includes('...') || lower.includes('whisper')) {
      return 'mysterious';
    }
    if (lower.includes('please') || lower.includes('beg')) {
      return 'desperate';
    }
    
    return 'neutral';
  }
  
  /**
   * Genera respuestas sugeridas para el jugador
   */
  private generateSuggestedResponses(_dialogueText: string, npc: NPC): string[] {
    const memory = this.memorySystem.getMemory(npc.id);
    
    const responses: string[] = [];
    
    // Respuesta basada en relación
    if (memory) {
      if (memory.mood === 'friendly' || memory.mood === 'devoted') {
        responses.push('I trust you, friend.');
        responses.push('Tell me more.');
      } else if (memory.mood === 'hostile') {
        responses.push('Stand back!');
        responses.push('[Attack]');
      } else {
        responses.push('Why should I believe you?');
        responses.push('What do you want?');
      }
    } else {
      // Primer encuentro
      responses.push('Who are you?');
      responses.push('What brings you here?');
      responses.push('[Leave]');
    }
    
    return responses.slice(0, 3); // Max 3 respuestas
  }
  
  /**
   * Genera diálogo procedural como fallback
   */
  private generateProceduralDialogue(options: DialogueGenerationOptions): GeneratedDialogue {
    const { npc, context } = options;
    const memory = this.memorySystem.getMemory(npc.id);
    
    // Templates basados en personalidad y memoria
    const templates = this.getDialogueTemplates(npc, memory?.mood || 'neutral');
    
    // Seleccionar template aleatorio que no haya sido usado recientemente
    const available = this.filterRecentDialogues(npc.id, templates);
    const template = this.rng.choice(available.length > 0 ? available : templates);
    
    // Reemplazar variables
    const text = template
      .replace('{name}', npc.name)
      .replace('{context}', context);
    
    // Detectar emoción
    const emotion = this.detectEmotion(text);
    
    // Respuestas sugeridas
    const suggestedResponses = this.generateSuggestedResponses(text, npc);
    
    return {
      text,
      emotion,
      suggestedResponses,
    };
  }
  
  /**
   * Obtiene templates de diálogo según personalidad y mood
   */
  private getDialogueTemplates(npc: NPC, mood: string): string[] {
    const personality = (npc.personality && npc.personality[0]) || 'neutral';
    
    const baseTemplates: Record<string, string[]> = {
      friendly: [
        "Hey there! Good to see you again.",
        "Oh, it's you! How have you been?",
        "Welcome, friend! What brings you by?",
      ],
      hostile: [
        "You again... What do you want?",
        "State your business and be quick about it.",
        "I don't have time for this.",
      ],
      mysterious: [
        "The winds speak of your arrival...",
        "I've been expecting you... or someone like you.",
        "Curious. Very curious indeed.",
      ],
      greedy: [
        "Got any coin for old {name}?",
        "Business or pleasure? Either way, it'll cost you.",
        "Everything has a price, friend.",
      ],
      wise: [
        "Patience, young one. All will be revealed in time.",
        "You seek knowledge? Knowledge demands sacrifice.",
        "The path before you is not what it seems.",
      ],
      cowardly: [
        "P-please, I don't want any trouble!",
        "Take what you want, just don't hurt me!",
        "I-I'm just a simple person...",
      ],
      brave: [
        "Fear not, for I stand with you!",
        "Together we can face any challenge!",
        "Courage, friend! Our cause is just!",
      ],
    };
    
    // Modificar según mood
    if (mood === 'devoted') {
      return [
        "I would follow you to the ends of the earth.",
        "Your word is my command, friend.",
        "What would you have me do?",
      ];
    }
    
    if (mood === 'suspicious') {
      return [
        "Why are you really here?",
        "I don't trust you... not yet.",
        "Prove your intentions.",
      ];
    }
    
    return baseTemplates[personality] || baseTemplates.friendly;
  }
  
  /**
   * Filtra diálogos usados recientemente
   */
  private filterRecentDialogues(npcId: string, templates: string[]): string[] {
    const recent = this.recentDialogues.get(npcId) || [];
    return templates.filter(t => !recent.includes(t));
  }
  
  /**
   * Cachea un diálogo para evitar repetición
   */
  private cacheDialogue(npcId: string, dialogue: string): void {
    if (!this.recentDialogues.has(npcId)) {
      this.recentDialogues.set(npcId, []);
    }
    
    const cache = this.recentDialogues.get(npcId)!;
    cache.push(dialogue);
    
    // Mantener solo los últimos N diálogos
    if (cache.length > this.maxCacheSize) {
      cache.shift();
    }
  }
  
  /**
   * Genera un diálogo de reacción a una acción del jugador
   */
  async generateReaction(
    npc: NPC,
    playerAction: string,
    context: string
  ): Promise<GeneratedDialogue> {
    return this.generateDialogue({
      npc,
      context,
      playerAction,
      useMemory: true,
    });
  }
  
  /**
   * Genera un saludo inicial
   */
  async generateGreeting(
    npc: NPC,
    context: string,
    isFirstMeeting: boolean
  ): Promise<GeneratedDialogue> {
    const tone = isFirstMeeting ? undefined : 'friendly';
    
    return this.generateDialogue({
      npc,
      context,
      tone,
      useMemory: !isFirstMeeting,
    });
  }
  
  /**
   * Genera diálogo para una quest
   */
  async generateQuestDialogue(
    npc: NPC,
    questDescription: string,
    isQuestGiver: boolean
  ): Promise<GeneratedDialogue> {
    const topic = isQuestGiver 
      ? `offering a quest: ${questDescription}`
      : `discussing the quest: ${questDescription}`;
    
    return this.generateDialogue({
      npc,
      context: 'Quest discussion',
      topic,
      useMemory: true,
    });
  }
}

/**
 * Helper: Crea una instancia del generador
 */
export function createDialogueGenerator(
  llmService: LLMService,
  memorySystem: NPCMemorySystem,
  seed?: string
): NPCDialogueGenerator {
  return new NPCDialogueGenerator(llmService, memorySystem, seed);
}
