# LLM Integration - SmolLM-360M-Instruct

Sistema de generación de narrativa dinámica usando un LLM local que se ejecuta completamente en el navegador.

## 🎯 Características

- ✅ **LLM Local**: Ejecuta SmolLM-360M-Instruct completamente en el navegador usando Transformers.js
- ✅ **Cache Inteligente**: El modelo se descarga una vez y se cachea en el navegador
- ✅ **Fallback Procedural**: Sistema de generación procedural automático si el LLM falla
- ✅ **Context-Aware**: Genera narrativa basada en el estado completo del juego
- ✅ **Múltiples Tipos**: Soporta escenas, diálogos, combate, pensamientos, y más
- ✅ **TypeScript**: Completamente tipado con TypeScript

## 📦 Instalación

El paquete `@xenova/transformers` ya está instalado en el proyecto:

```bash
npm install @xenova/transformers
```

## 🚀 Uso Básico

### 1. Generar Descripción de Escena

```typescript
import { getLLMService } from './services/llm';

const llm = getLLMService();

const result = await llm.generateNarrative({
  context: {
    player: playerState,
    location: {
      id: 'griswald_plaza',
      name: 'Plaza de Griswald',
      description: 'Una plaza oscura y húmeda',
      type: 'city'
    },
    recentEvents: ['Derrotaste a un ladrón', 'Encontraste una llave'],
    inventory: playerItems,
    worldState: gameState.world
  },
  type: 'scene_description',
  maxLength: 150,
  temperature: 0.7
});

console.log(result.text); // Narrativa generada
console.log(result.usedLLM); // true si usó LLM, false si usó fallback
```

### 2. Usar el NarrativeEngine Mejorado

```typescript
import { LLMNarrativeEngine } from './engine/LLMNarrativeEngine';

const engine = new LLMNarrativeEngine(scenesData, initialGameState);

// Pre-cargar el modelo al iniciar el juego
await engine.preloadLLM();

// Cargar escena con descripción enriquecida
const { scene, enhancedDescription } = await engine.loadSceneEnhanced(
  'scene_01',
  playerState,
  gameState,
  true // enhanceWithLLM
);

// Generar diálogo NPC dinámico
const dialogue = await engine.generateNPCDialogue(
  'Elara',
  'la misión del eco robado',
  playerState,
  gameState,
  currentScene
);

// Generar texto de combate
const combatText = await engine.generateCombatFlavor(
  'critical',
  playerState,
  gameState,
  'Guardia Corrupto'
);
```

## 🎨 Tipos de Narrativa Soportados

| Tipo | Descripción | Ejemplo de Uso |
|------|-------------|----------------|
| `scene_description` | Describe la escena actual | Entrada a una nueva ubicación |
| `dialogue` | Diálogo de NPCs | Conversación con personajes |
| `combat_flavor` | Texto de sabor para combate | Golpes, críticos, victorias |
| `item_discovery` | Descubrimiento de items | Encontrar objetos |
| `quest_update` | Actualización de misiones | Progreso en objetivos |
| `environmental_detail` | Detalles ambientales | Atmósfera y clima |
| `character_thought` | Pensamientos del personaje | Introspección |

## ⚙️ Configuración

### Configuración por Defecto

```typescript
{
  modelId: 'HuggingFaceTB/SmolLM-360M-Instruct',
  enabled: true,
  useCache: true,
  defaultParams: {
    maxLength: 150,
    temperature: 0.7,
    topK: 50,
    topP: 0.9
  },
  timeout: 30000, // 30 segundos
  debug: false
}
```

### Personalizar Configuración

```typescript
import { getLLMService } from './services/llm';

const llm = getLLMService({
  enabled: true,
  debug: true, // Ver logs detallados
  timeout: 60000, // 1 minuto
  defaultParams: {
    temperature: 0.8, // Más creativo
    maxLength: 200 // Textos más largos
  }
});
```

### Deshabilitar LLM (Solo Fallback)

```typescript
const llm = getLLMService({ enabled: false });
// O durante runtime:
llm.setEnabled(false);
```

## 🔧 API del LLMService

### `generateNarrative(params)`

Genera narrativa usando el LLM o fallback.

```typescript
interface NarrativeGenerationParams {
  context: LLMContext;
  type: NarrativeType;
  specificPrompt?: string;
  maxLength?: number;
  temperature?: number;
}

const result = await llm.generateNarrative({
  context,
  type: 'dialogue',
  specificPrompt: 'Elara habla sobre el misterio',
  maxLength: 100,
  temperature: 0.75
});
```

### `preload()`

Pre-carga el modelo LLM. Útil para inicialización.

```typescript
await llm.preload();
```

### `getStatus()`

Obtiene el estado actual del servicio.

```typescript
const status = llm.getStatus();
// {
//   enabled: true,
//   modelLoaded: true,
//   isLoading: false,
//   hasError: false,
//   error?: string
// }
```

### `setEnabled(enabled)`

Habilita/deshabilita el LLM en runtime.

```typescript
llm.setEnabled(false); // Solo usar fallback
llm.setEnabled(true);  // Volver a usar LLM
```

### `unload()`

Libera memoria del modelo.

```typescript
llm.unload();
```

## 📝 Contexto del Juego (LLMContext)

El contexto del juego que se pasa al LLM incluye:

```typescript
interface LLMContext {
  player: Player;              // Estado del jugador
  location: {                  // Ubicación actual
    id: string;
    name: string;
    description: string;
    type: 'city' | 'dungeon' | 'wilderness' | 'interior';
  };
  recentEvents: string[];      // Eventos recientes (últimos 5-10)
  inventory: Item[];           // Items del jugador
  worldState: WorldState;      // Estado global del mundo
  additionalContext?: {        // Contexto adicional opcional
    presentNPCs?: string[];
    presentEnemies?: string[];
    timeOfDay?: string;
    weather?: string;
    activeQuest?: string;
  };
}
```

## 🎭 Prompts Dinámicos

El sistema usa templates dinámicos que inyectan automáticamente:

- Estado del jugador (salud, nivel, atributos, inventario)
- Ubicación y ambiente (tipo, clima, hora del día)
- Eventos recientes (últimas acciones del jugador)
- NPCs y enemigos presentes
- Misión activa

**Ejemplo de prompt generado internamente:**

```
Eres un narrador maestro para un juego de rol dark fantasy...

CONTEXTO DEL JUEGO:
Kael, nivel 2 human adventurer | Salud: 75% (6/8) | STR:3 AGI:2 INT:1 | Items: 4 | Oro: 25
Ubicación: Plaza de Griswald (city) | Hora: night | Clima: fog

Eventos recientes:
1. Derrotaste a un Guardia Corrupto
2. Encontraste una Llave Antigua
3. Hablaste con Elara

TAREA: Describe la escena actual desde la perspectiva del jugador...
```

## 🔄 Sistema de Fallback

Si el LLM falla o está deshabilitado, el sistema usa generación procedural:

```typescript
// Automáticamente usa fallback si:
// - LLM está deshabilitado
// - Error al cargar el modelo
// - Timeout en la generación
// - Error en el contexto

const result = await llm.generateNarrative(params);
console.log(result.usedLLM); // false si usó fallback
```

El fallback genera texto coherente y contextual usando templates predefinidos y el estado del juego.

## 🧪 Testing

```typescript
import { getLLMService, resetLLMService } from './services/llm';

// Test con LLM deshabilitado
const llm = getLLMService({ enabled: false });
const result = await llm.generateNarrative(params);
expect(result.usedLLM).toBe(false);

// Limpiar para siguiente test
resetLLMService();
```

## 📊 Performance

- **Primera carga**: ~3-5 segundos (descarga modelo)
- **Cargas posteriores**: Instantáneo (cache del navegador)
- **Generación**: ~500-2000ms dependiendo del hardware
- **Tamaño del modelo**: ~140MB (se cachea localmente)

## 🐛 Debug

Habilitar modo debug para ver logs detallados:

```typescript
const llm = getLLMService({ debug: true });

// Verás logs como:
// [LLMService] Initialized with config: {...}
// [LLMService] Loading model: HuggingFaceTB/SmolLM-360M-Instruct
// [LLMService] Loading: model.onnx - 45%
// [LLMService] Model loaded successfully in 3245ms
// [LLMService] Generating with prompt: ...
// [LLMService] Generated in 1234ms: ...
```

## 🚨 Manejo de Errores

El sistema maneja automáticamente:

- Error al cargar modelo → usa fallback
- Timeout en generación → usa fallback
- Contexto inválido → usa fallback
- Modelo no soportado → usa fallback

Todos los errores se registran en consola pero no rompen el juego.

## 📚 Recursos

- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [SmolLM-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct)
- [ONNX Runtime](https://onnxruntime.ai/)

## 🎮 Integración con el Juego

El sistema LLM está completamente integrado con:

- ✅ `NarrativeEngine` - Motor narrativo base
- ✅ `LLMNarrativeEngine` - Motor mejorado con LLM
- ✅ `CombatEngine` - Sistema de combate
- ✅ `GameState` - Estado global del juego
- ✅ UI Components - Componentes React

## 📋 Próximas Mejoras

- [ ] Sistema de tracking de eventos para mejor contexto
- [ ] Cache de generaciones comunes
- [ ] Ajuste fino del modelo con datos del juego
- [ ] Soporte para múltiples idiomas
- [ ] Generación de misiones procedurales
- [ ] NPCs con memoria de conversaciones

---

**Implementado**: ✅ Epic completa - Local LLM Integration (SmolLM-360M-Instruct)
