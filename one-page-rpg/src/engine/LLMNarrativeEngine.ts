import { NarrativeEngine } from './NarrativeEngine';
import type { Scene, GameState, PlayerState } from '../types';
import { getLLMService } from '../services/llm';
// LLM Narrative Engine - enhanced narrative generation
import { getPromptService } from '../services/PromptConfigService';

/**
 * Motor Narrativo mejorado con integración de LLM
 * 
 * Extiende el NarrativeEngine básico añadiendo generación dinámica
 * de contenido narrativo usando el LLM local o fallback procedural.
 */
export class LLMNarrativeEngine extends NarrativeEngine {
  private llmService = getLLMService({ debug: false });
  private promptService = getPromptService();
  private llmEnabled = true;

  /**
   * Carga una escena y opcionalmente enriquece su descripción con LLM
   */
  async loadSceneEnhanced(
    sceneId: string,
    _playerState: PlayerState,
    gameState: GameState,
    enhanceWithLLM = true
  ): Promise<{ scene: Scene | null; enhancedDescription?: string }> {
    const scene = this.loadScene(sceneId);
    
    if (!scene) {
      return { scene: null };
    }

    if (!enhanceWithLLM || !this.llmEnabled) {
      return { scene };
    }

    try {
      // Usar template de descripción de escena desde el JSON
      const builtPrompt = this.promptService.buildSceneDescriptionPrompt(
        scene.location || 'Unknown location',
        this.inferLocationType(scene),
        gameState.world?.mood || 'neutral',
        gameState.world?.weather || 'clear'
      );
      
      if (!builtPrompt) {
        throw new Error('Failed to build scene description prompt');
      }
      
      // TODO: LLMService doesn't have a generate method, needs refactoring
      // const response = await this.llmService.generate(builtPrompt.prompt, builtPrompt.config);
      const response = 'LLM generation temporarily disabled';

      return {
        scene,
        enhancedDescription: response,
      };
    } catch (error) {
      console.warn('[LLMNarrativeEngine] Failed to enhance scene:', error);
      return { scene };
    }
  }

  /**
   * Genera diálogo dinámico para un NPC
   */
  async generateNPCDialogue(
    npcName: string
  ): Promise<string> {
    if (!this.llmEnabled) {
      return `${npcName}: "Eso es interesante..."`;
    }

    try {
      // Usar buildDynamicPrompt para diálogo dinámico (temporalmente deshabilitado)
      // TODO: Descomentar cuando LLMService tenga el método generate
      
      // TODO: LLMService doesn't have a generate method, needs refactoring
      // const response = await this.llmService.generate(builtPrompt.prompt, builtPrompt.config);
      // return response;
      return `${npcName}: "..."`; // Temporary fallback
    } catch (error) {
      console.warn('[LLMNarrativeEngine] Failed to generate dialogue:', error);
      return `${npcName}: "Mmm..."`;
    }
  }

  /**
   * Genera texto de sabor para combate
   */
  async generateCombatFlavor(
    eventType: 'hit' | 'miss' | 'critical' | 'defeat' | 'victory'
  ): Promise<string> {
    if (!this.llmEnabled) {
      return this.getBasicCombatText(eventType);
    }

    try {
      const currentScene = this.getCurrentScene();
      if (!currentScene) {
        return this.getBasicCombatText(eventType);
      }

      // Usar buildDynamicPrompt para texto de combate (temporalmente deshabilitado)
      // TODO: Descomentar cuando LLMService tenga el método generate
      
      // TODO: LLMService doesn't have a generate method, needs refactoring
      // const response = await this.llmService.generate(builtPrompt.prompt, builtPrompt.config);
      // return response;
      return this.getBasicCombatText(eventType); // Temporary fallback
    } catch (error) {
      console.warn('[LLMNarrativeEngine] Failed to generate combat flavor:', error);
      return this.getBasicCombatText(eventType);
    }
  }

  /**
   * Genera descripción al descubrir un item
   */
  async generateItemDiscoveryText(
    itemName: string
  ): Promise<string> {
    if (!this.llmEnabled) {
      return `Encontraste: ${itemName}`;
    }

    try {
      const currentScene = this.getCurrentScene();
      if (!currentScene) {
        return `Encontraste: ${itemName}`;
      }

      // Usar buildDynamicPrompt para descubrimiento de item (temporalmente deshabilitado)
      // TODO: Descomentar cuando LLMService tenga el método generate
      
      // TODO: LLMService doesn't have a generate method, needs refactoring
      // const response = await this.llmService.generate(builtPrompt.prompt, builtPrompt.config);
      // return response;
      return `Encontraste: ${itemName}`; // Temporary fallback
    } catch (error) {
      console.warn('[LLMNarrativeEngine] Failed to generate item discovery:', error);
      return `Encontraste: ${itemName}`;
    }
  }

  /**
   * Genera pensamiento interno del personaje
   */
  async generateCharacterThought(): Promise<string> {
    if (!this.llmEnabled) {
      return 'Debo tener cuidado...';
    }

    try {
      const currentScene = this.getCurrentScene();
      if (!currentScene) {
        return 'Debo tener cuidado...';
      }

      // Usar buildDynamicPrompt para pensamiento del personaje (temporalmente deshabilitado)
      // TODO: Descomentar cuando LLMService tenga el método generate
      
      // TODO: LLMService doesn't have a generate method, needs refactoring
      // const response = await this.llmService.generate(builtPrompt.prompt, builtPrompt.config);
      // return response;
      return 'Debo tener cuidado...'; // Temporary fallback
    } catch (error) {
      console.warn('[LLMNarrativeEngine] Failed to generate thought:', error);
      return 'Debo tener cuidado...';
    }
  }

  /**
   * Genera detalle ambiental adicional
   */
  async generateEnvironmentalDetail(): Promise<string> {
    if (!this.llmEnabled) {
      return '';
    }

    try {
      const currentScene = this.getCurrentScene();
      if (!currentScene) {
        return '';
      }

      // Usar buildDynamicPrompt para detalle ambiental (temporalmente deshabilitado)
      // TODO: Descomentar cuando LLMService tenga el método generate

      // TODO: LLMService doesn't have a generate method, needs refactoring
      // const response = await this.llmService.generate(builtPrompt.prompt, builtPrompt.config);
      // return response;
      return ''; // Temporary fallback
    } catch (error) {
      console.warn('[LLMNarrativeEngine] Failed to generate environmental detail:', error);
      return '';
    }
  }

  /* TODO: Descomentar cuando se integre LLM completamente
  private buildLLMContext(
    playerState: PlayerState,
    gameState: GameState,
    currentScene: Scene,
    additionalContext?: Partial<LLMContext['additionalContext']>
  ): LLMContext {
    const location = {
      id: currentScene.id,
      name: currentScene.location || 'Ubicación desconocida',
      description: currentScene.description,
      type: this.inferLocationType(currentScene),
    };
    const recentEvents: string[] = [];
    return {
      player: playerState,
      location,
      recentEvents,
      inventory: playerState.inventory,
      worldState: gameState.world,
      additionalContext: {
        timeOfDay: gameState.world?.timeOfDay || 'day',
        weather: gameState.world?.weather || 'clear',
        ...additionalContext,
      },
    };
  }
  */

  /**
   * Infiere el tipo de ubicación desde una escena
   */
  private inferLocationType(scene: Scene): 'city' | 'dungeon' | 'wilderness' | 'interior' {
    const location = scene.location?.toLowerCase() || '';
    const description = scene.description?.toLowerCase() || '';

    if (location.includes('dungeon') || location.includes('catacumb') || location.includes('cueva')) {
      return 'dungeon';
    }

    if (location.includes('ciudad') || location.includes('town') || location.includes('pueblo')) {
      return 'city';
    }

    if (description.includes('interior') || description.includes('habitación') || description.includes('sala')) {
      return 'interior';
    }

    return 'wilderness';
  }

  /**
   * Obtiene prompt específico para eventos de combate
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  private __getCombatPrompt(eventType: string, enemyName?: string): string {
    const enemy = enemyName || 'el enemigo';
    
    switch (eventType) {
      case 'hit':
        return `golpea exitosamente a ${enemy}`;
      case 'miss':
        return `falla el ataque contra ${enemy}`;
      case 'critical':
        return `golpe crítico devastador contra ${enemy}`;
      case 'defeat':
        return `${enemy} es derrotado`;
      case 'victory':
        return `victoria sobre ${enemy}`;
      default:
        return `acción de combate contra ${enemy}`;
    }
  }

  /**
   * Texto de combate básico (fallback)
   */
  private getBasicCombatText(eventType: string): string {
    const texts = {
      hit: '¡Tu golpe impacta!',
      miss: 'Tu ataque falla.',
      critical: '¡Golpe crítico devastador!',
      defeat: 'El enemigo cae derrotado.',
      victory: '¡Victoria!',
    };
    
    return texts[eventType as keyof typeof texts] || 'Algo sucede en el combate.';
  }

  /**
   * Habilita o deshabilita la generación con LLM
   */
  setLLMEnabled(enabled: boolean): void {
    this.llmEnabled = enabled;
    this.llmService.setEnabled(enabled);
  }

  /**
   * Obtiene el estado del servicio LLM
   */
  getLLMStatus() {
    return this.llmService.getStatus();
  }

  /**
   * Pre-carga el modelo LLM (útil en la inicialización)
   */
  async preloadLLM(): Promise<void> {
    if (this.llmEnabled) {
      await this.llmService.preload();
    }
  }
}

export default LLMNarrativeEngine;
