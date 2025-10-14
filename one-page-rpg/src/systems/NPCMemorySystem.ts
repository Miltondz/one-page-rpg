// NPC Memory System - tracks player interactions with NPCs
import type { NPC } from '../types/npc';

/**
 * Representa una interacción individual con un NPC
 */
export interface NPCInteraction {
  timestamp: number;
  npcId: string;
  type: 'dialogue' | 'trade' | 'quest' | 'combat' | 'gift' | 'betrayal' | 'help';
  summary: string; // Resumen breve de la interacción
  playerChoice?: string; // Qué eligió el jugador
  outcome: 'positive' | 'negative' | 'neutral';
  emotionalImpact: number; // -10 a +10
  context?: string; // Contexto adicional para el LLM
}

/**
 * Memoria persistente de un NPC específico
 */
export interface NPCMemory {
  npcId: string;
  npcName: string;
  firstMetAt: number; // timestamp
  lastSeenAt: number;
  totalInteractions: number;
  
  // Estado emocional y relación
  relationship: number; // -100 (enemigo) a +100 (aliado íntimo)
  mood: 'hostile' | 'suspicious' | 'neutral' | 'friendly' | 'devoted';
  trust: number; // 0-100
  
  // Historial de interacciones (últimas 20)
  interactions: NPCInteraction[];
  
  // Promesas y compromisos
  promises: {
    description: string;
    fulfilled: boolean;
    timestamp: number;
  }[];
  
  // Secretos compartidos
  secrets: string[];
  
  // Deudas y favores
  owedFavors: number; // Positivo = jugador debe favores, negativo = NPC debe favores
  
  // Tags especiales para contexto
  tags: string[]; // Ej: "saved-life", "betrayed", "romantic-interest", "mentor"
}

/**
 * Sistema de memoria global de NPCs
 */
export class NPCMemorySystem {
  private memories: Map<string, NPCMemory> = new Map();
  
  constructor(savedMemories?: Map<string, NPCMemory>) {
    if (savedMemories) {
      this.memories = new Map(savedMemories);
    }
  }
  
  /**
   * Registra el primer encuentro con un NPC
   */
  meetNPC(npc: NPC): void {
    if (this.memories.has(npc.id)) {
      // Ya conocido, solo actualizar última vez visto
      const memory = this.memories.get(npc.id)!;
      memory.lastSeenAt = Date.now();
      return;
    }
    
    // Primer encuentro
    const newMemory: NPCMemory = {
      npcId: npc.id,
      npcName: npc.name,
      firstMetAt: Date.now(),
      lastSeenAt: Date.now(),
      totalInteractions: 0,
      relationship: 0, // Neutral al principio
      mood: 'neutral',
      trust: 50, // Trust inicial medio
      interactions: [],
      promises: [],
      secrets: [],
      owedFavors: 0,
      tags: []
    };
    
    this.memories.set(npc.id, newMemory);
  }
  
  /**
   * Registra una nueva interacción con un NPC
   */
  recordInteraction(interaction: NPCInteraction): void {
    const memory = this.memories.get(interaction.npcId);
    if (!memory) {
      console.warn(`No memory found for NPC ${interaction.npcId}`);
      return;
    }
    
    // Agregar interacción (mantener solo últimas 20)
    memory.interactions.push(interaction);
    if (memory.interactions.length > 20) {
      memory.interactions.shift();
    }
    
    // Actualizar stats
    memory.totalInteractions++;
    memory.lastSeenAt = Date.now();
    
    // Actualizar relación basado en el impacto emocional
    memory.relationship = Math.max(-100, Math.min(100, 
      memory.relationship + interaction.emotionalImpact
    ));
    
    // Actualizar trust
    if (interaction.outcome === 'positive') {
      memory.trust = Math.min(100, memory.trust + 5);
    } else if (interaction.outcome === 'negative') {
      memory.trust = Math.max(0, memory.trust - 10);
    }
    
    // Actualizar mood basado en relación actual
    memory.mood = this.calculateMood(memory.relationship, memory.trust);
    
    // Auto-tag interacciones importantes
    this.autoTagInteraction(memory, interaction);
  }
  
  /**
   * Calcula el mood basado en relación y trust
   */
  private calculateMood(relationship: number, trust: number): NPCMemory['mood'] {
    if (relationship < -50 || trust < 20) return 'hostile';
    if (relationship < -20 || trust < 40) return 'suspicious';
    if (relationship > 50 && trust > 70) return 'devoted';
    if (relationship > 20) return 'friendly';
    return 'neutral';
  }
  
  /**
   * Auto-tagea interacciones significativas
   */
  private autoTagInteraction(memory: NPCMemory, interaction: NPCInteraction): void {
    if (interaction.type === 'betrayal' && !memory.tags.includes('betrayed')) {
      memory.tags.push('betrayed');
    }
    
    if (interaction.emotionalImpact >= 8 && interaction.outcome === 'positive') {
      if (!memory.tags.includes('saved-life')) {
        memory.tags.push('saved-life');
      }
    }
    
    if (memory.totalInteractions > 10 && memory.relationship > 60) {
      if (!memory.tags.includes('close-friend')) {
        memory.tags.push('close-friend');
      }
    }
  }
  
  /**
   * Registra una promesa hecha
   */
  makePromise(npcId: string, description: string): void {
    const memory = this.memories.get(npcId);
    if (!memory) return;
    
    memory.promises.push({
      description,
      fulfilled: false,
      timestamp: Date.now()
    });
  }
  
  /**
   * Marca una promesa como cumplida
   */
  fulfillPromise(npcId: string, promiseDescription: string): void {
    const memory = this.memories.get(npcId);
    if (!memory) return;
    
    const promise = memory.promises.find(p => 
      p.description.toLowerCase().includes(promiseDescription.toLowerCase())
    );
    
    if (promise && !promise.fulfilled) {
      promise.fulfilled = true;
      // Boost de relación por cumplir promesa
      memory.relationship = Math.min(100, memory.relationship + 10);
      memory.trust = Math.min(100, memory.trust + 15);
    }
  }
  
  /**
   * Comparte un secreto con el NPC
   */
  shareSecret(npcId: string, secret: string): void {
    const memory = this.memories.get(npcId);
    if (!memory) return;
    
    if (!memory.secrets.includes(secret)) {
      memory.secrets.push(secret);
      memory.trust = Math.min(100, memory.trust + 5);
    }
  }
  
  /**
   * Registra una deuda o favor
   */
  registerFavor(npcId: string, playerOwes: boolean): void {
    const memory = this.memories.get(npcId);
    if (!memory) return;
    
    memory.owedFavors += playerOwes ? 1 : -1;
  }
  
  /**
   * Obtiene la memoria de un NPC
   */
  getMemory(npcId: string): NPCMemory | undefined {
    return this.memories.get(npcId);
  }
  
  /**
   * Obtiene todas las memorias
   */
  getAllMemories(): Map<string, NPCMemory> {
    return this.memories;
  }
  
  /**
   * Genera un contexto rico para el LLM basado en la memoria
   */
  generateLLMContext(npcId: string): string {
    const memory = this.memories.get(npcId);
    if (!memory) {
      return 'First meeting with this character.';
    }
    
    const parts: string[] = [];
    
    // Relación básica
    parts.push(`Relationship level: ${memory.relationship} (${memory.mood})`);
    parts.push(`Trust: ${memory.trust}/100`);
    parts.push(`Met ${memory.totalInteractions} times`);
    
    // Interacciones recientes (últimas 5)
    if (memory.interactions.length > 0) {
      parts.push('\nRecent interactions:');
      memory.interactions.slice(-5).forEach(interaction => {
        parts.push(`- ${interaction.type}: ${interaction.summary} (${interaction.outcome})`);
      });
    }
    
    // Promesas pendientes
    const pending = memory.promises.filter(p => !p.fulfilled);
    if (pending.length > 0) {
      parts.push('\nUnfulfilled promises:');
      pending.forEach(p => parts.push(`- ${p.description}`));
    }
    
    // Secretos compartidos
    if (memory.secrets.length > 0) {
      parts.push('\nShared secrets:');
      memory.secrets.forEach(s => parts.push(`- ${s}`));
    }
    
    // Favores
    if (memory.owedFavors !== 0) {
      const ower = memory.owedFavors > 0 ? 'Player' : memory.npcName;
      parts.push(`\n${ower} owes ${Math.abs(memory.owedFavors)} favor(s)`);
    }
    
    // Tags especiales
    if (memory.tags.length > 0) {
      parts.push(`\nSpecial tags: ${memory.tags.join(', ')}`);
    }
    
    return parts.join('\n');
  }
  
  /**
   * Serializa para guardado
   */
  serialize(): Record<string, NPCMemory> {
    const serialized: Record<string, NPCMemory> = {};
    this.memories.forEach((memory, npcId) => {
      serialized[npcId] = memory;
    });
    return serialized;
  }
  
  /**
   * Deserializa desde guardado
   */
  static deserialize(data: Record<string, NPCMemory>): NPCMemorySystem {
    const memories = new Map<string, NPCMemory>();
    Object.entries(data).forEach(([npcId, memory]) => {
      memories.set(npcId, memory);
    });
    return new NPCMemorySystem(memories);
  }
}

/**
 * Helper: Crea una interacción rápida
 */
export function createInteraction(
  npcId: string,
  type: NPCInteraction['type'],
  summary: string,
  outcome: NPCInteraction['outcome'],
  emotionalImpact: number,
  playerChoice?: string
): NPCInteraction {
  return {
    timestamp: Date.now(),
    npcId,
    type,
    summary,
    outcome,
    emotionalImpact,
    playerChoice,
  };
}
