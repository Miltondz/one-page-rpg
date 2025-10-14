/**
 * Quest Manager - Sistema Unificado de Gestión de Misiones
 * 
 * Coordina tanto misiones cargadas desde JSON (campaña)
 * como misiones generadas proceduralmente (2d6)
 */

import { QuestSystem, Quest, QuestObjective } from './QuestSystem';
import { QuestLoader, QuestJSON, BranchJSON, ConsequenceJSON } from './QuestLoader';
import type { SeededRandom } from '../utils/SeededRandom';

/**
 * Metadata adicional para quest de campaña
 */
interface CampaignQuestData {
  branches: BranchJSON[];
  failureConditions: { condition: string; result: string }[];
}

/**
 * Manager principal del sistema de quests
 */
export class QuestManager {
  private questSystem: QuestSystem;
  private campaignQuests: Map<string, Quest> = new Map();
  private campaignMetadata: Map<string, CampaignQuestData> = new Map();
  private questSources: Map<string, 'campaign' | 'procedural'> = new Map();

  constructor(rng: SeededRandom) {
    this.questSystem = new QuestSystem(rng);
  }

  /**
   * Carga una quest desde JSON (campaña)
   */
  async loadCampaignQuest(path: string): Promise<Quest | null> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load quest from ${path}`);
      }

      const questJSON: QuestJSON = await response.json();
      const quest = QuestLoader.fromJSON(questJSON);

      // Guardar quest y metadata
      this.campaignQuests.set(quest.id, quest);
      this.questSources.set(quest.id, 'campaign');
      
      // Guardar branches y failure conditions
      this.campaignMetadata.set(quest.id, {
        branches: QuestLoader.extractBranches(questJSON),
        failureConditions: QuestLoader.extractFailureConditions(questJSON),
      });

      console.log(`📜 Loaded campaign quest: ${quest.title} (${quest.id})`);
      return quest;
    } catch (error) {
      console.error('Error loading campaign quest:', error);
      return null;
    }
  }

  /**
   * Carga múltiples quests de campaña
   */
  async loadCampaignQuests(paths: string[]): Promise<Quest[]> {
    const quests = await Promise.all(paths.map(path => this.loadCampaignQuest(path)));
    return quests.filter((q): q is Quest => q !== null);
  }

  /**
   * Genera una quest procedural usando 2d6
   */
  generateProceduralQuest(
    playerLevel: number,
    type: 'main_quest' | 'side_quest' | 'random_event' = 'side_quest'
  ): Quest {
    const quest = this.questSystem.generateQuest(playerLevel, type);
    this.questSources.set(quest.id, 'procedural');
    
    console.log(`🎲 Generated procedural quest: ${quest.title} (${quest.id})`);
    return quest;
  }

  /**
   * Activa una quest (de cualquier fuente)
   */
  activateQuest(questId: string): boolean {
    // Buscar en campaign quests
    const campaignQuest = this.campaignQuests.get(questId);
    if (campaignQuest) {
      this.questSystem.activateQuest(campaignQuest);
      return true;
    }

    // Si no está en campaign, buscar en active quests del sistema
    const activeQuests = this.questSystem.getActiveQuests();
    const quest = activeQuests.find(q => q.id === questId);
    
    if (quest) {
      this.questSystem.activateQuest(quest);
      return true;
    }

    console.warn(`Quest ${questId} not found`);
    return false;
  }

  /**
   * Completa un objetivo
   */
  completeObjective(questId: string, objectiveId: string): {
    success: boolean;
    objective?: QuestObjective;
    questCompleted: boolean;
    rewards: { xp: number; gold: number; items?: string[] };
  } {
    return this.questSystem.completeObjective(questId, objectiveId);
  }

  /**
   * Progresa un objetivo con contador
   */
  progressObjective(questId: string, objectiveId: string, amount: number = 1): {
    success: boolean;
    currentCount: number;
    completed: boolean;
  } {
    return this.questSystem.progressObjective(questId, objectiveId, amount);
  }

  /**
   * Obtiene una quest por ID (de cualquier fuente)
   */
  getQuest(questId: string): Quest | undefined {
    // Primero buscar en active quests
    const activeQuests = this.questSystem.getActiveQuests();
    const activeQuest = activeQuests.find(q => q.id === questId);
    
    if (activeQuest) {
      return activeQuest;
    }

    // Luego buscar en campaign quests no activadas
    return this.campaignQuests.get(questId);
  }

  /**
   * Obtiene todas las quests activas
   */
  getActiveQuests(): Quest[] {
    return this.questSystem.getActiveQuests();
  }

  /**
   * Obtiene quests activas de campaña
   */
  getActiveCampaignQuests(): Quest[] {
    return this.questSystem
      .getActiveQuests()
      .filter(q => this.questSources.get(q.id) === 'campaign');
  }

  /**
   * Obtiene quests activas procedurales
   */
  getActiveProceduralQuests(): Quest[] {
    return this.questSystem
      .getActiveQuests()
      .filter(q => this.questSources.get(q.id) === 'procedural');
  }

  /**
   * Obtiene los objetivos de una quest
   */
  getQuestObjectives(questId: string): QuestObjective[] {
    return this.questSystem.getQuestObjectives(questId);
  }

  /**
   * Obtiene el progreso de una quest (0-100%)
   */
  getQuestProgress(questId: string): number {
    return this.questSystem.getQuestProgress(questId);
  }

  /**
   * Abandona una quest
   */
  abandonQuest(questId: string): boolean {
    return this.questSystem.abandonQuest(questId);
  }

  /**
   * Obtiene quests completadas
   */
  getCompletedQuests(): string[] {
    return this.questSystem.getCompletedQuests();
  }

  /**
   * Verifica si una quest está disponible para el jugador
   */
  isQuestAvailable(questId: string, playerLevel: number): boolean {
    const quest = this.getQuest(questId);
    if (!quest) return false;
    
    return this.questSystem.isQuestAvailable(quest, playerLevel);
  }

  /**
   * Obtiene las branches de una quest de campaña
   */
  getQuestBranches(questId: string): BranchJSON[] {
    const metadata = this.campaignMetadata.get(questId);
    return metadata?.branches || [];
  }

  /**
   * Obtiene las condiciones de fallo de una quest de campaña
   */
  getQuestFailureConditions(questId: string): { condition: string; result: string }[] {
    const metadata = this.campaignMetadata.get(questId);
    return metadata?.failureConditions || [];
  }

  /**
   * Ejecuta una branch de decisión en una quest de campaña
   */
  executeBranch(
    questId: string,
    branchId: string,
    applyConsequences: (consequences: ConsequenceJSON[]) => void
  ): boolean {
    const metadata = this.campaignMetadata.get(questId);
    if (!metadata) {
      console.warn(`No metadata found for quest ${questId}`);
      return false;
    }

    const branch = metadata.branches.find(b => b.id === branchId);
    if (!branch) {
      console.warn(`Branch ${branchId} not found in quest ${questId}`);
      return false;
    }

    console.log(`🔀 Executing branch: ${branch.description}`);
    
    // Aplicar consecuencias
    applyConsequences(branch.consequences);
    
    return true;
  }

  /**
   * Verifica condición de fallo
   */
  checkFailureCondition(questId: string, condition: string): string | null {
    const metadata = this.campaignMetadata.get(questId);
    if (!metadata) return null;

    const failure = metadata.failureConditions.find(f => f.condition === condition);
    return failure?.result || null;
  }

  /**
   * Verifica si un objetivo puede completarse
   */
  canCompleteObjective(
    questId: string,
    objectiveId: string,
    playerInventory: string[],
    currentLocation: string
  ): { canComplete: boolean; reason?: string } {
    const objectives = this.getQuestObjectives(questId);
    const objective = objectives.find(obj => obj.id === objectiveId);

    if (!objective) {
      return {
        canComplete: false,
        reason: 'Objetivo no encontrado',
      };
    }

    return QuestLoader.canCompleteObjective(objective, playerInventory, currentLocation);
  }

  /**
   * Obtiene todas las quests disponibles de campaña no activadas
   */
  getAvailableCampaignQuests(playerLevel: number): Quest[] {
    const activeIds = new Set(this.questSystem.getActiveQuests().map(q => q.id));
    const completedIds = new Set(this.questSystem.getCompletedQuests());

    return Array.from(this.campaignQuests.values()).filter(quest => {
      // No mostrar si ya está activa o completada
      if (activeIds.has(quest.id) || completedIds.has(quest.id)) {
        return false;
      }

      // Verificar nivel
      return this.questSystem.isQuestAvailable(quest, playerLevel);
    });
  }

  /**
   * Genera N quests procedurales para el jugador
   */
  generateProceduralQuestsForPlayer(playerLevel: number, count: number = 3): Quest[] {
    const quests: Quest[] = [];

    for (let i = 0; i < count; i++) {
      const quest = this.generateProceduralQuest(playerLevel, 'side_quest');
      quests.push(quest);
    }

    return quests;
  }

  /**
   * Serializa el estado actual para guardado
   */
  serialize(): {
    activeQuests: Quest[];
    completedQuests: string[];
    questSources: Record<string, 'campaign' | 'procedural'>;
  } {
    return {
      activeQuests: this.questSystem.getActiveQuests(),
      completedQuests: this.questSystem.getCompletedQuests(),
      questSources: Object.fromEntries(this.questSources),
    };
  }

  /**
   * Restaura el estado desde guardado
   */
  deserialize(data: {
    activeQuests: Quest[];
    completedQuests: string[];
    questSources: Record<string, 'campaign' | 'procedural'>;
  }): void {
    // Restaurar quest sources
    this.questSources = new Map(Object.entries(data.questSources));

    // Restaurar quests activas
    data.activeQuests.forEach(quest => {
      this.questSystem.activateQuest(quest);
    });

    // Nota: completedQuests se maneja internamente en QuestSystem
  }

  /**
   * Debug: muestra estado del sistema
   */
  debugPrint(): void {
    console.log('=== QUEST MANAGER DEBUG ===');
    console.log('Campaign Quests:', this.campaignQuests.size);
    console.log('Active Quests:', this.questSystem.getActiveQuests().length);
    console.log('Completed Quests:', this.questSystem.getCompletedQuests().length);
    
    console.log('\nActive Quests:');
    this.questSystem.getActiveQuests().forEach(quest => {
      const source = this.questSources.get(quest.id);
      const progress = this.getQuestProgress(quest.id);
      console.log(`  - [${source}] ${quest.title} (${progress}%)`);
    });
  }
}

export default QuestManager;
