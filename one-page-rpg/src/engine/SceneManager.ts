/**
 * SceneManager - Gestor de escenas y flujo narrativo
 * 
 * Coordina el flujo de escenas, decisiones y eventos del juego.
 * Se integra con el sistema de quests y el estado del juego.
 */

import type { Scene, Decision } from '../types';
import type { Quest } from '../systems/QuestSystem';
import type { GameCatalog } from '../types/catalog';

export interface SceneContext {
  playerLevel: number;
  playerAttributes: Record<string, number>;
  completedQuests: string[];
  activeQuests: Quest[];
  reputation: Record<string, number>;
  globalFlags: Record<string, boolean | number | string>;
  inventory: string[];
  location: string;
}

export interface SceneTransition {
  nextSceneId: string;
  triggerCombat?: boolean;
  enemies?: string[];
  giveItems?: string[];
  removeItems?: string[];
  modifyReputation?: Record<string, number>;
  setFlags?: Record<string, boolean | number | string>;
  completeQuest?: string;
  startQuest?: string;
  narrativeText?: string;
}

/**
 * Gestor de escenas del juego
 */
export class SceneManager {
  private scenes: Record<string, Scene>;
  private currentSceneId: string;
  private context: SceneContext;
  private catalog: GameCatalog | null;
  private sceneHistory: string[] = [];

  constructor(
    scenes: Record<string, Scene>,
    initialSceneId: string,
    context: SceneContext,
    catalog: GameCatalog | null = null
  ) {
    this.scenes = scenes;
    this.currentSceneId = initialSceneId;
    this.context = context;
    this.catalog = catalog;
    this.sceneHistory.push(initialSceneId);
  }

  /**
   * Obtiene la escena actual
   */
  getCurrentScene(): Scene | null {
    return this.scenes[this.currentSceneId] || null;
  }

  /**
   * Obtiene el ID de la escena actual
   */
  getCurrentSceneId(): string {
    return this.currentSceneId;
  }

  /**
   * Obtiene las decisiones disponibles para la escena actual
   */
  getAvailableDecisions(): Decision[] {
    const scene = this.getCurrentScene();
    if (!scene || !scene.decisions) return [];

    // Filtrar decisiones basadas en condiciones
    return scene.decisions.filter(decision => 
      this.evaluateConditions(decision.conditions)
    );
  }

  /**
   * Procesa una decisión del jugador
   */
  processDecision(decisionId: string): SceneTransition | null {
    const scene = this.getCurrentScene();
    if (!scene) return null;

    const decision = scene.decisions?.find(d => d.id === decisionId);
    if (!decision) return null;

    // Construir transición basada en la decisión
    const transition: SceneTransition = {
      nextSceneId: decision.nextScene || this.currentSceneId,
      narrativeText: decision.description,
    };

    // Aplicar consecuencias
    if (decision.consequences) {
      this.applyConsequences(decision.consequences as any, transition);
    }

    // Actualizar historial
    if (transition.nextSceneId !== this.currentSceneId) {
      this.sceneHistory.push(transition.nextSceneId);
      this.currentSceneId = transition.nextSceneId;
    }

    return transition;
  }

  /**
   * Transiciona a una escena específica
   */
  transitionToScene(sceneId: string): boolean {
    if (!this.scenes[sceneId]) {
      console.error(`Scene not found: ${sceneId}`);
      return false;
    }

    this.currentSceneId = sceneId;
    this.sceneHistory.push(sceneId);
    return true;
  }

  /**
   * Evalúa condiciones para mostrar una decisión
   */
  private evaluateConditions(conditions?: Record<string, unknown>): boolean {
    if (!conditions) return true;

    // Evaluar cada condición
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'minLevel':
          if (this.context.playerLevel < (value as number)) return false;
          break;
        
        case 'hasItem':
          if (!this.context.inventory.includes(value as string)) return false;
          break;
        
        case 'completedQuest':
          if (!this.context.completedQuests.includes(value as string)) return false;
          break;
        
        case 'minReputation': {
          const [faction, minRep] = value as [string, number];
          if ((this.context.reputation[faction] || 0) < minRep) return false;
          break;
        }
        
        case 'flag': {
          const [flagName, flagValue] = value as [string, boolean | number | string];
          if (this.context.globalFlags[flagName] !== flagValue) return false;
          break;
        }
        
        case 'attribute': {
          const [attr, minValue] = value as [string, number];
          if ((this.context.playerAttributes[attr] || 0) < minValue) return false;
          break;
        }
      }
    }

    return true;
  }

  /**
   * Aplica consecuencias de una decisión
   */
  private applyConsequences(consequences: Record<string, unknown>, transition: SceneTransition): void {
    if (consequences.triggerCombat) {
      transition.triggerCombat = true;
      transition.enemies = (consequences.enemies as string[]) || [];
    }

    if (consequences.giveItems) {
      transition.giveItems = consequences.giveItems as string[];
    }

    if (consequences.removeItems) {
      transition.removeItems = consequences.removeItems as string[];
    }

    if (consequences.modifyReputation) {
      transition.modifyReputation = consequences.modifyReputation as Record<string, number>;
    }

    if (consequences.setFlags) {
      transition.setFlags = consequences.setFlags as Record<string, boolean | number | string>;
    }

    if (consequences.completeQuest) {
      transition.completeQuest = consequences.completeQuest as string;
    }

    if (consequences.startQuest) {
      transition.startQuest = consequences.startQuest as string;
    }
  }

  /**
   * Actualiza el contexto del jugador
   */
  updateContext(updates: Partial<SceneContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Obtiene el historial de escenas visitadas
   */
  getHistory(): string[] {
    return [...this.sceneHistory];
  }

  /**
   * Verifica si una escena ya fue visitada
   */
  hasVisited(sceneId: string): boolean {
    return this.sceneHistory.includes(sceneId);
  }

  /**
   * Obtiene información de una escena específica
   */
  getScene(sceneId: string): Scene | null {
    return this.scenes[sceneId] || null;
  }

  /**
   * Genera texto narrativo contextual para la escena actual
   */
  generateNarrativeContext(): string {
    const scene = this.getCurrentScene();
    if (!scene) return '';

    let context = `Estás en: ${scene.description || 'una ubicación desconocida'}\n`;
    
    // Añadir información de contexto
    if (this.context.location) {
      const location = this.catalog?.locations[this.context.location];
      if (location) {
        context += `\nLocación: ${location.name} - ${location.description}\n`;
      }
    }

    // Añadir quests activas relacionadas
    const relatedQuests = this.context.activeQuests.filter(q => 
      q.startingLocation === this.context.location
    );

    if (relatedQuests.length > 0) {
      context += '\n📜 Quests activas aquí:\n';
      relatedQuests.forEach(q => {
        context += `- ${q.title}\n`;
      });
    }

    return context;
  }

  /**
   * Obtiene sugerencias de acción basadas en el contexto
   */
  getSuggestedActions(): string[] {
    const scene = this.getCurrentScene();
    const suggestions: string[] = [];

    if (!scene) return suggestions;

    // Sugerir basado en decisiones disponibles
    const decisions = this.getAvailableDecisions();
    decisions.forEach(d => {
      suggestions.push(d.text);
    });

    // Sugerir basado en quests activas
    this.context.activeQuests.forEach(q => {
      if (q.objectives && q.objectives.length > 0) {
        const activeObjective = q.objectives.find(o => !o.completed);
        if (activeObjective) {
          suggestions.push(`Completar: ${activeObjective.description}`);
        }
      }
    });

    return suggestions;
  }
}

export default SceneManager;
