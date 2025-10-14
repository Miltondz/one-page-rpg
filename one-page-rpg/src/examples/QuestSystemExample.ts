/**
 * Ejemplo de Uso del Sistema de Quests
 * 
 * Demuestra cómo integrar y usar el QuestManager con quests
 * de campaña (JSON) y procedurales (2d6)
 */

import { QuestManager } from '../systems/QuestManager';
import { SeededRandom } from '../utils/SeededRandom';
import type { ConsequenceJSON } from '../systems/QuestLoader';

/**
 * Ejemplo 1: Setup inicial del sistema
 */
export async function setupQuestSystem() {
  // 1. Crear RNG con seed
  const rng = new SeededRandom('campaign-seed-12345');
  
  // 2. Crear quest manager
  const questManager = new QuestManager(rng);
  
  // 3. Cargar quest del prólogo
  console.log('📚 Cargando quests de campaña...');
  const prologueQuest = await questManager.loadCampaignQuest(
    '/game_data/quests/prologue_quest.json'
  );
  
  if (prologueQuest) {
    console.log(`✅ Cargada: ${prologueQuest.title}`);
    
    // 4. Activar quest del prólogo
    questManager.activateQuest(prologueQuest.id);
    console.log('🎯 Quest activada!');
  }
  
  // 5. Generar 3 quests procedurales para nivel 1
  console.log('\n🎲 Generando quests procedurales...');
  const proceduralQuests = questManager.generateProceduralQuestsForPlayer(1, 3);
  
  proceduralQuests.forEach((quest, i) => {
    console.log(`  ${i + 1}. ${quest.title} (${quest.giver})`);
  });
  
  return questManager;
}

/**
 * Ejemplo 2: Completar objetivos de la quest del prólogo
 */
export function completePrologueObjectives(questManager: QuestManager) {
  const questId = 'prologo_deuda_ecos';
  
  console.log('\n=== PROGRESANDO PRÓLOGO ===');
  
  // Objetivo 1: Hablar con Alenko
  console.log('\n1. Hablando con Alenko...');
  const result1 = questManager.completeObjective(questId, 'obj_1_accept_job');
  
  if (result1.success) {
    console.log(`✅ Objetivo completado! +${result1.rewards.xp} XP`);
  }
  
  // Mostrar progreso actual
  const progress1 = questManager.getQuestProgress(questId);
  console.log(`📊 Progreso de quest: ${progress1}%`);
  
  // Objetivo 2: Sobrevivir emboscada (combat con contador)
  console.log('\n2. Sobreviviendo emboscada...');
  
  // Derrotar primer enemigo
  questManager.progressObjective(questId, 'obj_2_survive_ambush', 1);
  console.log('⚔️ Enemigo 1 derrotado');
  
  // Derrotar segundo enemigo
  const combatProgress = questManager.progressObjective(questId, 'obj_2_survive_ambush', 1);
  console.log('⚔️ Enemigo 2 derrotado');
  
  if (combatProgress.completed) {
    console.log('✅ ¡Emboscada superada!');
    const result2 = questManager.completeObjective(questId, 'obj_2_survive_ambush');
    console.log(`+${result2.rewards.xp} XP`);
  }
  
  // Progreso actualizado
  const progress2 = questManager.getQuestProgress(questId);
  console.log(`📊 Progreso de quest: ${progress2}%`);
}

/**
 * Ejemplo 3: Verificar condiciones antes de completar
 */
export function checkObjectiveConditions(questManager: QuestManager) {
  const questId = 'prologo_deuda_ecos';
  const objectiveId = 'obj_3_deliver_box';
  
  console.log('\n=== VERIFICANDO CONDICIONES ===');
  
  // Situación 1: Jugador no tiene el item
  const check1 = questManager.canCompleteObjective(
    questId,
    objectiveId,
    [], // inventario vacío
    'cueva_aislada'
  );
  
  if (!check1.canComplete) {
    console.log(`❌ No puedes completar: ${check1.reason}`);
  }
  
  // Situación 2: Jugador está en otro lugar
  const check2 = questManager.canCompleteObjective(
    questId,
    objectiveId,
    ['caja_sellada_velo'],
    'murogris_guarida_alenko' // lugar equivocado
  );
  
  if (!check2.canComplete) {
    console.log(`❌ No puedes completar: ${check2.reason}`);
  }
  
  // Situación 3: Todo correcto
  const check3 = questManager.canCompleteObjective(
    questId,
    objectiveId,
    ['caja_sellada_velo'], // tiene el item
    'cueva_aislada' // en el lugar correcto
  );
  
  if (check3.canComplete) {
    console.log('✅ ¡Puedes completar el objetivo!');
  }
}

/**
 * Ejemplo 4: Ejecutar decisión narrativa (branch)
 */
export function makeNarrativeDecision(
  questManager: QuestManager,
  decision: 'betray' | 'help'
) {
  const questId = 'prologo_deuda_ecos';
  
  console.log('\n=== DECISIÓN NARRATIVA ===');
  
  const branchId = decision === 'betray' 
    ? 'branch_betray_hermit' 
    : 'branch_help_hermit';
  
  // Handler para aplicar consecuencias
  const applyConsequences = (consequences: ConsequenceJSON[]) => {
    console.log('\n📜 Aplicando consecuencias:');
    
    consequences.forEach(cons => {
      switch (cons.type) {
        case 'relationship':
          console.log(`  👥 ${cons.target}: ${cons.value! > 0 ? '+' : ''}${cons.value}`);
          // Aquí aplicarías el cambio real en el estado del juego
          break;
          
        case 'reward':
          if (cons.gold) {
            console.log(`  💰 +${cons.gold} oro`);
          }
          if (cons.items) {
            console.log(`  🎁 Items: ${cons.items.join(', ')}`);
          }
          break;
          
        case 'unlock_quest':
          console.log(`  🔓 Nueva quest desbloqueada: ${cons.quest_id}`);
          break;
      }
    });
  };
  
  // Ejecutar branch
  const success = questManager.executeBranch(questId, branchId, applyConsequences);
  
  if (success) {
    console.log('\n✅ Decisión ejecutada con éxito');
  }
}

/**
 * Ejemplo 5: Gestión de quests procedurales
 */
export function manageProcedGralQuests(questManager: QuestManager, playerLevel: number) {
  console.log('\n=== QUESTS PROCEDURALES ===');
  
  // Generar quest aleatoria
  const randomQuest = questManager.generateProceduralQuest(playerLevel, 'side_quest');
  
  console.log(`\n🎲 Quest generada: ${randomQuest.title}`);
  console.log(`   Giver: ${randomQuest.giver}`);
  console.log(`   Location: ${randomQuest.startingLocation}`);
  console.log(`   Rewards: ${randomQuest.rewards.xp} XP, ${randomQuest.rewards.gold} oro`);
  console.log(`   Objetivos:`);
  
  randomQuest.objectives.forEach((obj, i) => {
    console.log(`     ${i + 1}. ${obj.description}`);
  });
  
  // Activar quest
  questManager.activateQuest(randomQuest.id);
  
  // Simular completado de objetivos
  console.log('\n⚡ Completando objetivos...');
  randomQuest.objectives.forEach(obj => {
    if (obj.count && obj.currentCount !== undefined) {
      // Objetivo con contador
      for (let i = 0; i < obj.count; i++) {
        questManager.progressObjective(randomQuest.id, obj.id, 1);
      }
    }
    
    const result = questManager.completeObjective(randomQuest.id, obj.id);
    if (result.success) {
      console.log(`  ✅ ${obj.description}`);
    }
  });
  
  // Verificar si se completó
  const progress = questManager.getQuestProgress(randomQuest.id);
  if (progress === 100) {
    console.log('\n🎉 ¡Quest completada!');
    console.log(`   Total XP: ${randomQuest.rewards.xp}`);
    console.log(`   Total Oro: ${randomQuest.rewards.gold}`);
  }
}

/**
 * Ejemplo 6: Mostrar estado del sistema
 */
export function displayQuestStatus(questManager: QuestManager) {
  console.log('\n=== ESTADO DE QUESTS ===');
  
  // Quests activas de campaña
  const campaignQuests = questManager.getActiveCampaignQuests();
  console.log(`\n📜 Quests de Campaña (${campaignQuests.length}):`);
  campaignQuests.forEach(quest => {
    const progress = questManager.getQuestProgress(quest.id);
    console.log(`  - ${quest.title} (${progress}%)`);
    
    const objectives = questManager.getQuestObjectives(quest.id);
    objectives.forEach(obj => {
      const icon = obj.completed ? '✓' : ' ';
      console.log(`    [${icon}] ${obj.description}`);
    });
  });
  
  // Quests procedurales activas
  const proceduralQuests = questManager.getActiveProceduralQuests();
  console.log(`\n🎲 Quests Procedurales (${proceduralQuests.length}):`);
  proceduralQuests.forEach(quest => {
    const progress = questManager.getQuestProgress(quest.id);
    console.log(`  - ${quest.title} (${progress}%)`);
  });
  
  // Quests completadas
  const completed = questManager.getCompletedQuests();
  console.log(`\n✅ Quests Completadas: ${completed.length}`);
}

/**
 * Ejemplo 7: Guardado y carga
 */
export function saveAndLoadQuests(questManager: QuestManager) {
  console.log('\n=== GUARDADO Y CARGA ===');
  
  // Guardar
  const saveData = questManager.serialize();
  const jsonString = JSON.stringify(saveData, null, 2);
  console.log('💾 Datos guardados:');
  console.log(jsonString);
  
  // En un juego real, guardarías en localStorage o backend
  // localStorage.setItem('quests', jsonString);
  
  // Cargar
  console.log('\n📂 Restaurando...');
  questManager.deserialize(saveData);
  console.log('✅ Estado restaurado');
}

/**
 * Demo completo del sistema
 */
export async function runFullDemo() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   DEMO: Sistema de Quests Unificado   ║');
  console.log('╚════════════════════════════════════════╝');
  
  // Setup
  const questManager = await setupQuestSystem();
  
  // Completar prólogo
  completePrologueObjectives(questManager);
  
  // Verificar condiciones
  checkObjectiveConditions(questManager);
  
  // Decisión narrativa
  makeNarrativeDecision(questManager, 'help');
  
  // Quests procedurales
  manageProcedGralQuests(questManager, 2);
  
  // Estado final
  displayQuestStatus(questManager);
  
  // Guardado
  saveAndLoadQuests(questManager);
  
  // Debug info
  questManager.debugPrint();
  
  console.log('\n✅ Demo completado!');
}

// Exportar función principal para testing
export default runFullDemo;
