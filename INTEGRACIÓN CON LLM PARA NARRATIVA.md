INTEGRACIÓN CON LLM PARA NARRATIVA
----------------------------------

### 5\. Arquitectura de Asistencia con LLM

javascript

class LLMAssistant {
  constructor(apiKey, contextWindow = 4000) {
    this.apiKey = apiKey;
    this.contextWindow = contextWindow;
    this.conversationHistory = [];
    this.worldContext = {};
  }

  async generateNarrative(prompt, context) {
    const systemPrompt = this.buildSystemPrompt(context);
    const fullPrompt = this.buildUserPrompt(prompt, context);

    try {
      const response = await this.callLLMAPI(systemPrompt, fullPrompt);
      return this.parseLLMResponse(response);
    } catch (error) {
      return this.getFallbackResponse(prompt, context);
    }
  }

  buildSystemPrompt(context) {
    return ` Eres un asistente narrativo para un juego RPG solitario. Tu tarea es generar descripciones inmersivas y coherentes basadas en el contexto proporcionado.

REGLAS:
- Mantén un estilo de fantasía medieval consistente
- Sé conciso pero descriptivo (50-150 palabras máximo)
- Incluye detalles sensoriales (vista, sonido, olor)
- Mantén coherencia con el contexto del mundo
- No reveles información que debería ser descubierta
- Usa un tono apropiado para la situación (misterioso, épico, peligroso)

CONTEXTO ACTUAL: ${JSON.stringify(context, null, 2)} Responde SOLO con la descripción narrativa solicitada. `;
  }

  buildUserPrompt(userPrompt, context) {
    return ` SITUACIÓN: ${userPrompt} GENERA una descripción narrativa para esta situación que incluya:
1. Ambiente y atmósfera
2. Detalles sensoriales relevantes
3. Presencia de personajes/criaturas si aplica
4. Elementos interactivos destacados
5. Pistas sutiles sobre posibles acciones

Mantén el texto entre 50-150 palabras. `;
  }
}

### 6\. Implementación Práctica con APIs

Opción A: OpenAI GPT

javascript

async callOpenAIAPI(systemPrompt, userPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 200,
      temperature: 0.8
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

Opción B: Local con Ollama/LLM Local

javascript

async callLocalLLM(systemPrompt, userPrompt) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral',
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 150
      }
    })
  });

  const data = await response.json();
  return data.response;
}

Opción C: Fallback sin LLM (Procedural)

javascript

getFallbackResponse(prompt, context) {
  // Sistema procedural como respaldo cuando no hay LLM disponible
  const fallbackGenerators = {
    combat: this.proceduralCombatDescription,
    exploration: this.proceduralLocationDescription,
    dialogue: this.proceduralNPCDialogue
  };

  const generatorType = this.determinePromptType(prompt);
  return fallbackGenerators[generatorType](context);
}

### 7\. Integración en el Flujo del Juego

jsx

// Hook personalizado para narrativa con LLM
const useLLMNarrative = (worldState) => {
  const [isLoading, setIsLoading] = useState(false);
  const llmAssistant = useRef(new LLMAssistant(process.env.REACT_APP_OPENAI_KEY));

  const generateSceneDescription = async (sceneData) => {
    if (!sceneData.useLLM) {
      return generateProceduralDescription(sceneData);
    }

    setIsLoading(true);
    try {
      const prompt = this.buildScenePrompt(sceneData);
      const description = await llmAssistant.current.generateNarrative(prompt, worldState);
      return description;
    } catch (error) {
      console.error('LLM Error, using fallback:', error);
      return generateProceduralDescription(sceneData);
    } finally {
      setIsLoading(false);
    }
  };

  return { generateSceneDescription, isLoading };
};

// Componente de Escena Mejorado
const EnhancedScene = ({ sceneData, worldState }) => {
  const [description, setDescription] = useState('');
  const { generateSceneDescription, isLoading } = useLLMNarrative(worldState);

  useEffect(() => {
    const loadDescription = async () => {
      const newDescription = await generateSceneDescription(sceneData);
      setDescription(newDescription);
    };

    loadDescription();
  }, [sceneData]);

  return (
    <div className="game-scene">  {/* Graphics */}  <RetroSceneGraphics
        location={sceneData.location}
        characters={sceneData.characters}
        enemies={sceneData.enemies}
      />  {/* Narrative */}  <div className="narrative-panel">  {isLoading ? (
          <div className="loading-pulse">⎼⎼⎼ ⎼⎼⎼ ⎼⎼⎼</div>
        ) : (
          <TypewriterText text={description} speed={20} />
        )}  </div>  {/* Controls */}  <SceneControls
        availableActions={sceneData.actions}
        onActionSelected={handleAction}
      />  </div>
  );
};

### 8\. Sistema de Caché y Optimización

javascript

class NarrativeCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100;
  }

  getKey(sceneData) {
    // Crear clave única basada en los datos de la escena
    return JSON.stringify({
      location: sceneData.location,
      enemies: sceneData.enemies?.map(e => e.type),
      npcs: sceneData.npcs?.map(n => n.type),
      eventType: sceneData.eventType
    });
  }

  get(sceneData) {
    const key = this.getKey(sceneData);
    return this.cache.get(key);
  }

  set(sceneData, narrative) {
    const key = this.getKey(sceneData);

    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first inserted)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      narrative,
      timestamp: Date.now(),
      usageCount: 0
    });
  }

  // Precargar narrativas comunes
  async preloadCommonScenes() {
    const commonScenes = [
      { location: 'forest', eventType: 'combat', enemies: ['goblin'] },
      { location: 'tavern', eventType: 'dialogue', npcs: ['bartender'] },
      { location: 'dungeon', eventType: 'exploration' }
    ];

    for (const scene of commonScenes) {
      const narrative = await generateSceneDescription(scene);
      this.set(scene, narrative);
    }
  }
}

### 9\. Ejemplo de Flujo Completo Integrado

jsx

const GameScreen = () => {
  const [currentScene, setCurrentScene] = useState(initialScene);
  const [worldState, setWorldState] = useState(initialWorldState);
  const narrativeCache = useRef(new NarrativeCache());
  const { generateSceneDescription } = useLLMNarrative(worldState);

  const handleSceneTransition = async (newSceneData) => {
    // Verificar caché primero
    let narrative = narrativeCache.current.get(newSceneData);

    if (!narrative) {
      // Generar nueva narrativa
      narrative = await generateSceneDescription(newSceneData);
      narrativeCache.current.set(newSceneData, narrative);
    }

    setCurrentScene({
      ...newSceneData,
      narrative,
      graphics: generateSceneGraphics(newSceneData)
    });
  };

  const handlePlayerAction = async (action) => {
    // Resolver mecánica del juego
    const result = resolveGameMechanics(action, worldState);

    // Actualizar estado del mundo
    setWorldState(result.newWorldState);

    // Transición a nueva escena
    await handleSceneTransition(result.nextScene);
  };

  return (
    <div className="retro-game-container">  <div className="game-screen">  {/* Cabecera con estadísticas en estilo retro */}  <RetroStatsPanel
          health={worldState.player.health}
          gold={worldState.player.gold}
          level={worldState.player.level}
        />  {/* Área gráfica principal */}  <div className="graphics-area">  {currentScene.graphics}  </div>  {/* Panel de narrativa con estilo terminal retro */}  <RetroNarrativePanel
          text={currentScene.narrative}
          onComplete={() => setShowActions(true)}
        />  {/* Panel de acciones */}  {showActions && (
          <RetroActionPanel
            actions={currentScene.availableActions}
            onActionSelected={handlePlayerAction}
          />
        )}  </div>  {/* Efectos de sonido retro */}  <RetroSoundEffects scene={currentScene} />  </div>
  );
};


