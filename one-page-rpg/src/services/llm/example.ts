/**
 * Ejemplo de uso del sistema LLM Integration
 * 
 * Este archivo muestra cómo usar el LLMService y LLMNarrativeEngine
 * en diferentes escenarios del juego.
 */

import { getLLMService } from './index';
import { LLMNarrativeEngine } from '../../engine/LLMNarrativeEngine';
import type { Player } from '../../types/Player';
import type { WorldState } from '../../types/World';
import type { Item } from '../../types/Item';
import type { GameState, Scene } from '../../types';

// ============================================================================
// EJEMPLO 1: Uso básico del LLMService
// ============================================================================

async function exampleBasicLLM() {
  console.log('=== EJEMPLO 1: Uso básico del LLMService ===\n');
  
  // Obtener servicio singleton
  const llm = getLLMService({ debug: true });
  
  // Crear contexto de ejemplo
  const mockPlayer: Player = {
    name: 'Kael',
    level: 2,
    xp: 5,
    xpToNextLevel: 10,
    attributes: {
      strength: 3,
      agility: 2,
      intelligence: 1,
    },
    wounds: 2,
    maxWounds: 8,
    fatigue: 1,
    maxFatigue: 4,
    inventory: ['sword', 'health_potion'],
    inventorySlots: 10,
    gold: 25,
    race: 'human',
    class: 'adventurer',
  };
  
  const mockWorldState: WorldState = {
    seed: 'example',
    createdAt: Date.now(),
    playTime: 30,
    reputation: {
      casa_von_hess: 0,
      culto_silencio: 0,
      circulo_eco: 10,
    },
    completedQuests: [],
    unlockedAchievements: [],
    globalFlags: {},
    discoveredLocations: ['griswald'],
    knownNPCs: ['elara'],
    enemiesDefeated: { 'guardia_corrupto': 1 },
    timeOfDay: 'night',
    weather: 'fog',
    currentWorld: 'griswald',
    currentAct: 0,
  };
  
  // Generar descripción de escena
  const result = await llm.generateNarrative({
    context: {
      player: mockPlayer,
      location: {
        id: 'griswald_plaza',
        name: 'Plaza de Griswald',
        description: 'Una plaza húmeda y oscura donde las sombras parecen cobrar vida.',
        type: 'city',
      },
      recentEvents: [
        'Derrotaste a un Guardia Corrupto',
        'Encontraste una Llave Antigua',
        'Hablaste con Elara sobre el Eco Robado',
      ],
      inventory: [] as Item[],
      worldState: mockWorldState,
    },
    type: 'scene_description',
    maxLength: 150,
    temperature: 0.7,
  });
  
  console.log('Descripción generada:');
  console.log(result.text);
  console.log(`\nUsó LLM: ${result.usedLLM}`);
  console.log(`Tiempo: ${result.generationTime}ms`);
  console.log(`Modelo: ${result.metadata?.modelUsed}\n`);
}

// ============================================================================
// EJEMPLO 2: Uso del LLMNarrativeEngine
// ============================================================================

async function exampleNarrativeEngine() {
  console.log('=== EJEMPLO 2: LLMNarrativeEngine ===\n');
  
  // Mock de datos
  const mockScenes: Record<string, Scene> = {
    scene_01: {
      id: 'scene_01',
      title: 'La Taberna del Eco Perdido',
      description: 'Una taberna oscura y húmeda. El olor a cerveza rancia impregna el aire.',
      location: 'Griswald',
      decisions: [],
    },
  };
  
  const mockPlayer: Player = {
    name: 'Kael',
    level: 2,
    xp: 5,
    xpToNextLevel: 10,
    attributes: { strength: 3, agility: 2, intelligence: 1 },
    wounds: 2,
    maxWounds: 8,
    fatigue: 1,
    maxFatigue: 4,
    inventory: ['sword', 'health_potion'],
    inventorySlots: 10,
    gold: 25,
    race: 'human',
    class: 'adventurer',
  };
  
  const mockGameState: GameState = {
    player: mockPlayer,
    world: {
      seed: 'example',
      createdAt: Date.now(),
      playTime: 30,
      reputation: { casa_von_hess: 0, culto_silencio: 0, circulo_eco: 10 },
      completedQuests: [],
      unlockedAchievements: [],
      globalFlags: {},
      discoveredLocations: ['griswald'],
      knownNPCs: ['elara'],
      enemiesDefeated: { 'guardia_corrupto': 1 },
      timeOfDay: 'night',
      weather: 'fog',
      currentWorld: 'griswald',
      currentAct: 0,
    },
    currentScene: 'scene_01',
    currentLocation: 'griswald',
    activeQuests: [],
  };
  
  // Crear engine
  const engine = new LLMNarrativeEngine(mockScenes, mockGameState);
  
  // Pre-cargar modelo (opcional, mejora UX)
  console.log('Pre-cargando modelo LLM...');
  await engine.preloadLLM();
  console.log('Modelo listo!\n');
  
  // 1. Cargar escena enriquecida
  console.log('1. Cargando escena enriquecida...');
  const { scene, enhancedDescription } = await engine.loadSceneEnhanced(
    'scene_01',
    mockPlayer,
    mockGameState,
    true
  );
  
  if (enhancedDescription) {
    console.log('Descripción enriquecida:');
    console.log(enhancedDescription);
  }
  console.log();
  
  // 2. Generar diálogo NPC
  console.log('2. Generando diálogo de NPC...');
  const dialogue = await engine.generateNPCDialogue(
    'Elara',
    'el misterioso eco robado',
    mockPlayer,
    mockGameState,
    scene!
  );
  console.log('Diálogo:');
  console.log(dialogue);
  console.log();
  
  // 3. Generar texto de combate
  console.log('3. Generando texto de combate...');
  const combatText = await engine.generateCombatFlavor(
    'critical',
    mockPlayer,
    mockGameState,
    'Guardia Corrupto'
  );
  console.log('Combate:');
  console.log(combatText);
  console.log();
  
  // 4. Generar descubrimiento de item
  console.log('4. Generando descubrimiento de item...');
  const itemText = await engine.generateItemDiscoveryText(
    'Llave Antigua',
    mockPlayer,
    mockGameState
  );
  console.log('Item:');
  console.log(itemText);
  console.log();
  
  // 5. Generar pensamiento del personaje
  console.log('5. Generando pensamiento del personaje...');
  const thought = await engine.generateCharacterThought(
    'la extraña sensación de ser observado',
    mockPlayer,
    mockGameState
  );
  console.log('Pensamiento:');
  console.log(thought);
  console.log();
  
  // 6. Estado del LLM
  console.log('6. Estado del servicio LLM:');
  const status = engine.getLLMStatus();
  console.log(JSON.stringify(status, null, 2));
}

// ============================================================================
// EJEMPLO 3: Comparación LLM vs Fallback
// ============================================================================

async function exampleComparison() {
  console.log('=== EJEMPLO 3: Comparación LLM vs Fallback ===\n');
  
  const mockContext = {
    player: {
      name: 'Kael',
      level: 2,
      attributes: { strength: 3, agility: 2, intelligence: 1 },
      wounds: 2,
      maxWounds: 8,
      gold: 25,
    } as Player,
    location: {
      id: 'dungeon_01',
      name: 'Catacumbas Olvidadas',
      description: 'Oscuras catacumbas llenas de telarañas',
      type: 'dungeon' as const,
    },
    recentEvents: ['Entraste a las catacumbas', 'Escuchaste un ruido extraño'],
    inventory: [] as Item[],
    worldState: {
      timeOfDay: 'night',
      weather: 'clear',
    } as WorldState,
  };
  
  // Con LLM habilitado
  console.log('Con LLM habilitado:');
  const llmEnabled = getLLMService({ enabled: true });
  const resultLLM = await llmEnabled.generateNarrative({
    context: mockContext,
    type: 'environmental_detail',
  });
  console.log(resultLLM.text);
  console.log(`Usó LLM: ${resultLLM.usedLLM}\n`);
  
  // Con LLM deshabilitado (solo fallback)
  console.log('Con LLM deshabilitado (fallback):');
  const llmDisabled = getLLMService({ enabled: false });
  const resultFallback = await llmDisabled.generateNarrative({
    context: mockContext,
    type: 'environmental_detail',
  });
  console.log(resultFallback.text);
  console.log(`Usó LLM: ${resultFallback.usedLLM}\n`);
}

// ============================================================================
// EJECUTAR EJEMPLOS
// ============================================================================

async function runExamples() {
  try {
    // await exampleBasicLLM();
    // console.log('\n' + '='.repeat(60) + '\n');
    
    await exampleNarrativeEngine();
    // console.log('\n' + '='.repeat(60) + '\n');
    
    // await exampleComparison();
    
    console.log('\n✅ Todos los ejemplos completados');
  } catch (error) {
    console.error('❌ Error en ejemplos:', error);
  }
}

// Descomentar para ejecutar:
// runExamples();

export { exampleBasicLLM, exampleNarrativeEngine, exampleComparison, runExamples };
