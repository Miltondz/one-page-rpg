# 🎯 Sistema de Configuración de Prompts LLM

## 📋 Descripción General

Este sistema permite gestionar todos los prompts del LLM desde un archivo JSON centralizado (`public/config/llm-prompts.json`), facilitando la iteración y mejora de prompts sin modificar el código fuente.

---

## 🏗️ Arquitectura

```
public/config/
└── llm-prompts.json          # Configuración de prompts

src/services/
└── PromptConfigService.ts    # Servicio de gestión

src/systems/
├── NPCDialogueGenerator.ts   # Usa PromptConfigService
├── OracleSystem.ts            # Usa PromptConfigService
├── NarrativeJournal.ts        # Usa PromptConfigService
└── AchievementSystem.ts       # Usa PromptConfigService
```

---

## 📝 Estructura del JSON de Configuración

### Formato General

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-14",
  
  "global": {
    "systemContext": "Context global para todos los prompts",
    "constraints": {
      "maxLength": "Restricción de longitud",
      "tone": "Tono general",
      "style": "Estilo de escritura"
    }
  },
  
  "categoria": {
    "subcategoria": {
      "template": "Prompt con {variables} para reemplazar",
      "variables": ["variable1", "variable2"],
      "conditionalSections": {
        "sectionName": {
          "conditionTrue": "Contenido si true",
          "conditionFalse": "Contenido si false"
        }
      },
      "config": {
        "max_new_tokens": 100,
        "temperature": 0.8,
        "top_p": 0.9
      }
    }
  }
}
```

### Variables en Templates

Las variables se definen usando sintaxis `{nombreVariable}` y se reemplazan automáticamente:

```json
{
  "template": "You are {npcName}, a {personality} character.\n\nContext: {context}\n\nGenerate a response.",
  "variables": ["npcName", "personality", "context"]
}
```

### Secciones Condicionales

Permiten incluir/excluir partes del prompt dinámicamente:

```json
{
  "template": "You are {name}.\n{memorySection}Generate a greeting.",
  "conditionalSections": {
    "memorySection": {
      "withMemory": "Your history with the player:\n{memoryContext}\n\n",
      "withoutMemory": "This is your first meeting.\n\n"
    }
  }
}
```

---

## 💻 Uso del PromptConfigService

### Inicialización

```typescript
import { getPromptService } from '@/services/PromptConfigService';

// Obtener instancia singleton
const promptService = getPromptService();

// Cargar configuración (solo una vez al inicio)
await promptService.loadConfig();
```

### Construcción de Prompts

#### Método Genérico

```typescript
const result = promptService.buildPrompt(
  'dialogue.standard',  // Path del template
  {
    npcName: 'Eldrin',
    personality: 'mysterious',
    role: 'wizard',
    context: 'dark forest at night',
    memoryContext: 'Met 3 times, friendly relationship'
  },
  {
    memorySection: true,  // Flags para secciones condicionales
    actionSection: false
  }
);

if (result) {
  const { prompt, config } = result;
  
  // Usar con LLMService
  const response = await llmService.generate(prompt, config);
}
```

#### Métodos Helper

```typescript
// Diálogo estándar
const dialoguePrompt = promptService.buildDialoguePrompt(
  'Eldrin',
  'mysterious',
  'wizard',
  'dark forest',
  {
    memoryContext: 'Previous interactions...',
    playerAction: 'asked about the ancient ruins',
    topic: 'forbidden knowledge',
    tone: 'mysterious'
  }
);

// Saludo
const greetingPrompt = promptService.buildGreetingPrompt(
  'Eldrin',
  'mysterious',
  'wizard',
  'dark forest',
  false,  // isFirstMeeting
  'Met 3 times...'
);

// Oráculo
const oraclePrompt = promptService.buildOraclePrompt(
  'searching for treasure',
  'Will I find the artifact?',
  11,  // roll
  'yes-and',
  'Previous questions:\n- Is it dangerous? → yes-but',
  true  // isExtremeRoll
);

// Journal
const journalPrompt = promptService.buildJournalEntryPrompt(
  'Defeated the shadow beast',
  'Dark cave illuminated by torchlight',
  'combat',
  'Eldrin the wizard',
  'Previous entries:\n- Entered the cave\n- Found ancient runes'
);

// Achievement
const achievementPrompt = promptService.buildAchievementPrompt(
  'First Blood',
  'Defeat your first enemy',
  'Defeated goblin in the forest clearing'
);

// Scene Description
const scenePrompt = promptService.buildSceneDescriptionPrompt(
  'Ancient Temple',
  'exploration',
  'mysterious',
  'heavy rain'
);
```

---

## 🔧 Integración con Sistemas Existentes

### NPCDialogueGenerator

**Antes (hardcoded):**
```typescript
private buildDialoguePrompt(npc: NPC, context: string): string {
  return `You are ${npc.name}, a ${npc.personality.join(', ')} character.\n\n` +
         `Context: ${context}\n\n` +
         `Generate a SHORT dialogue response.`;
}
```

**Después (con PromptConfigService):**
```typescript
import { getPromptService } from '@/services/PromptConfigService';

private async buildDialoguePrompt(npc: NPC, context: string): Promise<string> {
  const promptService = getPromptService();
  
  const result = promptService.buildDialoguePrompt(
    npc.name,
    npc.personality.join(', '),
    npc.role || 'traveler',
    context,
    {
      memoryContext: this.memorySystem.generateLLMContext(npc.id)
    }
  );
  
  return result?.prompt || this.fallbackPrompt();
}
```

### OracleSystem

**Antes:**
```typescript
private buildOraclePrompt(question: string, result: string): string {
  return `You are a mystical oracle.\n\nQuestion: "${question}"\n` +
         `Result: ${result}\n\nProvide an interpretation.`;
}
```

**Después:**
```typescript
import { getPromptService } from '@/services/PromptConfigService';

private async buildOraclePrompt(
  question: string,
  context: string,
  roll: number,
  result: string
): Promise<string> {
  const promptService = getPromptService();
  
  const recentQueries = this.queryHistory
    .slice(-3)
    .map(q => `- "${q.question}" → ${q.result}`)
    .join('\n');
  
  const result = promptService.buildOraclePrompt(
    context,
    question,
    roll,
    result,
    recentQueries,
    roll <= 2 || roll >= 11  // isExtremeRoll
  );
  
  return result?.prompt || this.fallbackPrompt();
}
```

---

## 🎨 Editando y Ajustando Prompts

### Workflow Recomendado

1. **Editar JSON** (`public/config/llm-prompts.json`)
   ```json
   {
     "dialogue": {
       "greeting": {
         "firstMeeting": {
           "template": "NUEVO PROMPT CON {variables}",
           "config": {
             "temperature": 0.85  // Ajustar parámetros
           }
         }
       }
     }
   }
   ```

2. **Recargar en desarrollo**
   ```typescript
   // En consola del navegador o componente de debug
   const promptService = getPromptService();
   await promptService.reloadConfig();
   ```

3. **Probar resultado**
   - Ejecutar acción que usa el prompt
   - Verificar calidad de respuesta
   - Iterar según sea necesario

4. **Commit cambios**
   ```bash
   git add public/config/llm-prompts.json
   git commit -m "feat(prompts): Improved dialogue greeting template"
   ```

### Tips de Optimización

#### 1. Longitud del Prompt
- ✅ **Conciso:** "Generate a SHORT greeting (1-2 sentences)."
- ❌ **Verboso:** "Please generate a greeting that is short in length, approximately one to two sentences long, no more than that."

#### 2. Especificidad
- ✅ **Específico:** "Describe the outcome in 1-2 dramatic sentences."
- ❌ **Vago:** "Describe what happened."

#### 3. Contexto Necesario
- ✅ **Contextual:** "You are {name}, a {personality} character. Context: {context}"
- ❌ **Sin contexto:** "Generate a response."

#### 4. Temperatura según Uso
| Temperatura | Uso |
|-------------|-----|
| 0.7-0.8 | Descripciones, resúmenes (coherencia) |
| 0.8-0.85 | Diálogos, entradas de diario (equilibrio) |
| 0.85-0.9 | Interpretaciones de oráculo, lore (creatividad) |
| 0.9-0.95 | Mystery clues, twists (máxima creatividad) |

---

## 🧪 Testing de Prompts

### Validación de Variables

```typescript
const validation = promptService.validateVariables(
  'dialogue.standard',
  {
    npcName: 'Eldrin',
    personality: 'mysterious',
    // role falta
    context: 'forest'
  }
);

if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
  // Output: Missing variables: ['role']
}
```

### Listar Todos los Templates

```typescript
const templates = promptService.listTemplates();
console.log(templates);
// Output:
// [
//   'dialogue.greeting.firstMeeting',
//   'dialogue.greeting.recurring',
//   'dialogue.standard',
//   'dialogue.reaction',
//   'oracle.interpretation',
//   ...
// ]
```

### Metadata

```typescript
const metadata = promptService.getMetadata();
console.log(metadata);
// {
//   model: 'HuggingFaceTB/SmolLM-360M-Instruct',
//   optimizedFor: 'SmolLM-360M',
//   notes: [...],
//   guidelines: [...]
// }
```

---

## 📊 Categorías Disponibles

| Categoría | Subcategorías | Uso |
|-----------|---------------|-----|
| **dialogue** | greeting, standard, reaction, quest | NPCDialogueGenerator |
| **oracle** | interpretation | OracleSystem |
| **journal** | entry, summary | NarrativeJournal |
| **achievements** | contextDescription | AchievementSystem |
| **narrative** | sceneDescription, eventOutcome, mysteryClue | SceneManager |
| **combat** | enemyTaunt, victoryDescription | CombatEngine |
| **lore** | legendGeneration, ancientText | LoreSystem (futuro) |

---

## 🔄 Versionado

El archivo de configuración incluye versionado semántico:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-14"
}
```

**Changelog:**
- `1.0.0` (2025-01-14): Release inicial con todas las categorías

**Guía de versionado:**
- **Major** (X.0.0): Cambios incompatibles con versiones anteriores
- **Minor** (1.X.0): Nuevas categorías o templates
- **Patch** (1.0.X): Ajustes a templates existentes

---

## 🐛 Debugging

### Verificar Carga

```typescript
const service = getPromptService();
console.log('Config loaded:', service.isLoaded());
console.log('Version:', service.getVersion());
```

### Ver Prompt Construido

```typescript
const result = promptService.buildDialoguePrompt(...);
console.log('Generated prompt:', result?.prompt);
console.log('Config:', result?.config);
```

### Fallback Behavior

Si el JSON no carga o un template no existe:
```typescript
// El servicio retorna configuración fallback
{
  prompt: 'Generate a response for a fantasy RPG game.',
  config: {
    max_new_tokens: 100,
    temperature: 0.8,
    top_p: 0.9,
    repetition_penalty: 1.1
  }
}
```

---

## 🚀 Mejores Prácticas

### ✅ DO

- Mantener prompts concisos (tokens son costosos)
- Especificar longitud explícitamente ("1-2 sentences")
- Usar secciones condicionales para prompts opcionales
- Versionar cambios en el JSON
- Probar prompts antes de commit
- Documentar razones para cambios de parámetros

### ❌ DON'T

- Prompts excesivamente largos (>200 tokens)
- Asumir el modelo entiende sin contexto
- Hardcodear prompts en el código
- Cambiar múltiples prompts sin testing
- Usar temperature >0.95 sin razón específica

---

## 📚 Recursos

- [SmolLM Documentation](https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [LLM_SYSTEMS_IMPLEMENTED.md](../LLM_SYSTEMS_IMPLEMENTED.md)

---

**Última actualización:** 2025-01-14  
**Versión:** 1.0.0
