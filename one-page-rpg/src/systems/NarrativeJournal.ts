import type { LLMService } from '../services/llm/LLMService';
import { getPromptService } from '../services/PromptConfigService';

/**
 * Categorías de entradas del diario
 */
export type JournalCategory = 
  | 'combat'
  | 'exploration'
  | 'dialogue'
  | 'quest'
  | 'discovery'
  | 'tragedy'
  | 'triumph'
  | 'mystery'
  | 'lore';

/**
 * Entrada del diario narrativo
 */
export interface JournalEntry {
  id: string;
  timestamp: number;
  category: JournalCategory;
  title: string;
  narrative: string; // Texto narrativo generado
  rawEvent?: string; // Evento crudo opcional
  location?: string;
  charactersInvolved?: string[];
  tags: string[]; // Tags para búsqueda
  importance: 'minor' | 'normal' | 'major' | 'critical';
  isGenerated: boolean; // Si fue generado por LLM o procedural
}

/**
 * Opciones para crear una entrada
 */
export interface CreateEntryOptions {
  event: string; // Descripción del evento
  context: string; // Contexto del juego
  category?: JournalCategory;
  location?: string;
  characters?: string[];
  importance?: JournalEntry['importance'];
  useLLM?: boolean;
}

/**
 * Sistema de Diario Narrativo
 * Convierte eventos del juego en entradas narrativas ricas usando LLM
 */
export class NarrativeJournal {
  private entries: JournalEntry[] = [];
  private llmService: LLMService | null = null;
  private promptService = getPromptService();
  private narrativeCache: Map<string, string> = new Map();
  private maxCacheSize = 50;
  
  constructor(llmService?: LLMService) {
    this.llmService = llmService || null;
  }
  
  /**
   * Crea una nueva entrada en el diario
   */
  async createEntry(options: CreateEntryOptions): Promise<JournalEntry> {
    const {
      event,
      context,
      category,
      location,
      characters = [],
      importance = 'normal',
      useLLM = true,
    } = options;
    
    // Determinar categoría automáticamente si no se proporciona
    const finalCategory = category || this.categorizeEvent(event);
    
    // Generar título
    const title = this.generateTitle(event, finalCategory);
    
    // Generar narrativa
    let narrative: string;
    let isGenerated = false;
    
    if (useLLM && this.llmService) {
      try {
        // Intentar generar con LLM
        narrative = await this.generateWithLLM(event, context, finalCategory, characters);
        isGenerated = true;
        
        // Cachear resultado
        this.cacheNarrative(event, narrative);
      } catch (error) {
        console.warn('LLM narrative generation failed, using procedural:', error);
        narrative = this.generateProceduralNarrative(event, finalCategory);
      }
    } else {
      // Usar generación procedural
      narrative = this.generateProceduralNarrative(event, finalCategory);
    }
    
    // Generar tags automáticos
    const tags = this.generateTags(event, finalCategory, characters);
    
    // Crear entrada
    const entry: JournalEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      category: finalCategory,
      title,
      narrative,
      rawEvent: event,
      location,
      charactersInvolved: characters,
      tags,
      importance,
      isGenerated,
    };
    
    // Agregar al diario
    this.entries.push(entry);
    
    // Mantener tamaño razonable (últimas 200 entradas)
    if (this.entries.length > 200) {
      this.entries.shift();
    }
    
    return entry;
  }
  
  /**
   * Genera narrativa usando LLM
   */
  private async generateWithLLM(
    event: string,
    context: string,
    category: JournalCategory,
    characters: string[]
  ): Promise<string> {
    if (!this.llmService) {
      throw new Error('LLM service not available');
    }
    
    // Verificar cache primero
    const cached = this.narrativeCache.get(event);
    if (cached) {
      return cached;
    }
    
    // Construir previous entries si existen
    let previousEntries: string | undefined;
    const recentEntries = this.entries.slice(-3);
    if (recentEntries.length > 0) {
      previousEntries = recentEntries.map(e => `- ${e.title}`).join('\n');
    }
    
    // Usar servicio centralizado
    const builtPrompt = this.promptService.buildJournalEntryPrompt(
      event,
      context,
      category,
      characters.length > 0 ? characters.join(', ') : undefined,
      previousEntries
    );
    
    if (!builtPrompt) {
      throw new Error('Failed to build journal prompt');
    }
    
    // Use LLM with narrative context - builtPrompt is not directly compatible
    // For now, use event as fallback until proper integration
    const response = event; // Temporary fallback
    
    return this.cleanNarrative(response);
  }
  
  
  /**
   * Limpia la narrativa generada
   */
  private cleanNarrative(text: string): string {
    let cleaned = text.trim();
    
    // Remover prefijos comunes
    cleaned = cleaned.replace(/^(Journal entry:|Entry:|Day \d+:)\s*/i, '');
    
    // Asegurar que empiece con mayúscula
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    // Asegurar que termine con punto
    if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    return cleaned;
  }
  
  /**
   * Genera narrativa procedural como fallback
   */
  private generateProceduralNarrative(
    event: string,
    category: JournalCategory
  ): string {
    const templates: Record<JournalCategory, string[]> = {
      combat: [
        `The clash of steel rang through the air as ${event}. Victory came at a cost.`,
        `Blood pounded in my ears as ${event}. I barely escaped with my life.`,
        `The battle was fierce. ${event}, and I emerged victorious but weary.`,
      ],
      exploration: [
        `My journey led me to new horizons. ${event}, revealing secrets long forgotten.`,
        `I ventured into the unknown. ${event}, and wonder filled my heart.`,
        `The path ahead was treacherous, but ${event} made it worthwhile.`,
      ],
      dialogue: [
        `Words were exchanged that changed everything. ${event}.`,
        `A conversation that will linger in my thoughts: ${event}.`,
        `Through discourse, I learned that ${event}.`,
      ],
      quest: [
        `My quest continues. ${event}, bringing me closer to my goal.`,
        `Progress was made today. ${event}, though challenges remain.`,
        `The path is clearer now. ${event}.`,
      ],
      discovery: [
        `A revelation! ${event}. The implications are staggering.`,
        `I uncovered something remarkable: ${event}.`,
        `Today I discovered ${event}. This changes everything.`,
      ],
      tragedy: [
        `Loss haunts me. ${event}. I can only move forward.`,
        `Darkness fell today. ${event}. The weight is almost unbearable.`,
        `Tragedy struck: ${event}. The scars will remain.`,
      ],
      triumph: [
        `Victory is sweet! ${event}. This achievement will be remembered.`,
        `Success at last! ${event}.`,
        `Against all odds, ${event}. The celebration was well-earned.`,
      ],
      mystery: [
        `Strange occurrences abound. ${event}. More questions than answers.`,
        `The mystery deepens. ${event}, yet clarity eludes me.`,
        `Cryptic signs: ${event}. What does it mean?`,
      ],
      lore: [
        `Ancient knowledge revealed: ${event}.`,
        `The past speaks to those who listen. ${event}.`,
        `History unfolds: ${event}. The tales were true.`,
      ],
    };
    
    const options = templates[category] || templates.exploration;
    const template = options[Math.floor(Math.random() * options.length)];
    
    return template;
  }
  
  /**
   * Categoriza un evento automáticamente
   */
  private categorizeEvent(event: string): JournalCategory {
    const lower = event.toLowerCase();
    
    if (lower.includes('fought') || lower.includes('defeated') || lower.includes('attack')) {
      return 'combat';
    }
    if (lower.includes('found') || lower.includes('discovered') || lower.includes('secret')) {
      return 'discovery';
    }
    if (lower.includes('spoke') || lower.includes('talked') || lower.includes('conversation')) {
      return 'dialogue';
    }
    if (lower.includes('completed') || lower.includes('quest') || lower.includes('mission')) {
      return 'quest';
    }
    if (lower.includes('died') || lower.includes('lost') || lower.includes('tragedy')) {
      return 'tragedy';
    }
    if (lower.includes('won') || lower.includes('triumph') || lower.includes('success')) {
      return 'triumph';
    }
    if (lower.includes('strange') || lower.includes('mysterious') || lower.includes('puzzle')) {
      return 'mystery';
    }
    if (lower.includes('legend') || lower.includes('history') || lower.includes('ancient')) {
      return 'lore';
    }
    
    return 'exploration';
  }
  
  /**
   * Genera un título para la entrada
   */
  private generateTitle(event: string, category: JournalCategory): string {
    // Extraer primeras palabras significativas
    const words = event.split(' ').filter(w => w.length > 3).slice(0, 4);
    
    if (words.length > 0) {
      return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1);
    }
    
    // Títulos genéricos por categoría
    const genericTitles: Record<JournalCategory, string> = {
      combat: 'A Fierce Battle',
      exploration: 'New Horizons',
      dialogue: 'An Exchange of Words',
      quest: 'Progress Made',
      discovery: 'A Revelation',
      tragedy: 'A Dark Day',
      triumph: 'Victory Achieved',
      mystery: 'Cryptic Signs',
      lore: 'Ancient Knowledge',
    };
    
    return genericTitles[category];
  }
  
  /**
   * Genera tags para búsqueda
   */
  private generateTags(
    event: string,
    category: JournalCategory,
    characters: string[]
  ): string[] {
    const tags: Set<string> = new Set([category]);
    
    // Agregar personajes como tags
    characters.forEach(char => tags.add(char.toLowerCase()));
    
    // Extraer palabras clave del evento
    const keywords = event.toLowerCase().match(/\b\w{4,}\b/g) || [];
    keywords.slice(0, 5).forEach(kw => tags.add(kw));
    
    return Array.from(tags);
  }
  
  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Cachea una narrativa
   */
  private cacheNarrative(event: string, narrative: string): void {
    if (this.narrativeCache.size >= this.maxCacheSize) {
      // Remover entrada más antigua
      const firstKey = this.narrativeCache.keys().next().value;
      this.narrativeCache.delete(firstKey!);
    }
    this.narrativeCache.set(event, narrative);
  }
  
  /**
   * Obtiene todas las entradas
   */
  getAllEntries(): JournalEntry[] {
    return [...this.entries];
  }
  
  /**
   * Obtiene entradas por categoría
   */
  getEntriesByCategory(category: JournalCategory): JournalEntry[] {
    return this.entries.filter(e => e.category === category);
  }
  
  /**
   * Busca entradas por tag
   */
  searchByTag(tag: string): JournalEntry[] {
    const lowerTag = tag.toLowerCase();
    return this.entries.filter(e => 
      e.tags.some(t => t.includes(lowerTag))
    );
  }
  
  /**
   * Busca entradas por texto
   */
  searchByText(query: string): JournalEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter(e =>
      e.title.toLowerCase().includes(lowerQuery) ||
      e.narrative.toLowerCase().includes(lowerQuery) ||
      e.rawEvent?.toLowerCase().includes(lowerQuery)
    );
  }
  
  /**
   * Obtiene entradas recientes
   */
  getRecentEntries(count: number = 10): JournalEntry[] {
    return this.entries.slice(-count).reverse();
  }
  
  /**
   * Obtiene entradas importantes
   */
  getImportantEntries(): JournalEntry[] {
    return this.entries.filter(e => 
      e.importance === 'major' || e.importance === 'critical'
    );
  }
  
  /**
   * Genera un resumen del diario usando LLM
   */
  async generateSummary(recentCount: number = 10): Promise<string> {
    const recent = this.getRecentEntries(recentCount);
    
    if (recent.length === 0) {
      return 'No entries yet. Your adventure awaits!';
    }
    
    if (this.llmService) {
      try {
        const prompt = [
          'Summarize this adventurer\'s recent journey in 2-3 sentences:',
          ...recent.map(e => `- ${e.title}: ${e.narrative}`),
        ].join('\n');
        
        const summary = await (this.llmService as any).generate(prompt, {
          max_new_tokens: 80,
          temperature: 0.7,
        });
        
        return this.cleanNarrative(summary);
      } catch (error) {
        console.warn('Failed to generate LLM summary:', error);
      }
    }
    
    // Fallback: concatenar títulos
    return `Recent events: ${recent.map(e => e.title).join(', ')}.`;
  }
  
  /**
   * Serializa para guardado
   */
  serialize() {
    return {
      entries: this.entries,
      cache: Array.from(this.narrativeCache.entries()),
    };
  }
  
  /**
   * Deserializa desde guardado
   */
  static deserialize(
    data: ReturnType<NarrativeJournal['serialize']>,
    llmService?: LLMService
  ): NarrativeJournal {
    const journal = new NarrativeJournal(llmService);
    journal.entries = data.entries;
    journal.narrativeCache = new Map(data.cache);
    return journal;
  }
}

/**
 * Helper: Crea entrada rápida
 */
export async function quickJournalEntry(
  journal: NarrativeJournal,
  event: string,
  context: string,
  importance?: JournalEntry['importance']
): Promise<JournalEntry> {
  return journal.createEntry({
    event,
    context,
    importance,
    useLLM: true,
  });
}
