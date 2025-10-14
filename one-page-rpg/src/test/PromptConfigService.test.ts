import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PromptConfigService } from '../services/PromptConfigService';

// Mock config para pruebas
const mockConfig = {
  version: '1.0.0',
  lastUpdated: '2025-01-14',
  description: 'Test config',
  global: {
    systemContext: 'You are a test assistant.',
    constraints: {
      maxLength: 'Keep responses short.',
      tone: 'Be friendly.',
    },
  },
  dialogue: {
    greeting: {
      firstMeeting: {
        template: 'You are {npcName}, a {personality} character. Context: {context}. Generate a greeting.',
        variables: ['npcName', 'personality', 'context'],
        config: {
          max_new_tokens: 100,
          temperature: 0.8,
          top_p: 0.9,
        },
      },
      recurring: {
        template: 'You are {npcName}. Memory: {memoryContext}. Context: {context}. Generate a greeting.',
        variables: ['npcName', 'memoryContext', 'context'],
        config: {
          max_new_tokens: 120,
          temperature: 0.8,
          top_p: 0.9,
        },
      },
    },
    standard: {
      template: 'You are {npcName}, a {personality} character. Role: {role}. {memorySection}Context: {context}. Generate dialogue.',
      variables: ['npcName', 'personality', 'role', 'memorySection', 'context'],
      conditionalSections: {
        memorySection: {
          withMemory: 'Memory: {memoryContext}. ',
          withoutMemory: 'First meeting. ',
        },
      },
      config: {
        max_new_tokens: 150,
        temperature: 0.8,
        top_p: 0.9,
      },
    },
  },
  oracle: {
    interpretation: {
      template: 'Context: {context}. Question: {question}. Roll: {roll}. Result: {resultExplanation}. {historySection}Interpret.',
      variables: ['context', 'question', 'roll', 'resultExplanation', 'historySection'],
      conditionalSections: {
        historySection: {
          withHistory: 'History: {recentQueries}. ',
          withoutHistory: '',
        },
      },
      config: {
        max_new_tokens: 120,
        temperature: 0.9,
        top_p: 0.95,
      },
    },
    resultExplanations: {
      'yes-and': 'Yes, and more',
      'yes': 'Yes',
      'no': 'No',
    },
  },
  journal: {
    entry: {
      template: 'Event: {event}. Context: {context}. Category: {category}. Write a journal entry.',
      variables: ['event', 'context', 'category'],
      config: {
        max_new_tokens: 100,
        temperature: 0.85,
        top_p: 0.92,
      },
    },
  },
  fallbackSettings: {
    description: 'Default fallback',
    config: {
      max_new_tokens: 100,
      temperature: 0.8,
      top_p: 0.9,
      repetition_penalty: 1.1,
    },
  },
};

describe('PromptConfigService', () => {
  let service: PromptConfigService;

  beforeEach(async () => {
    // Mock fetch para devolver config
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConfig,
    } as Response);

    service = new PromptConfigService();
    await service.loadConfig();
  });

  describe('loadConfig', () => {
    it('debe cargar la configuración correctamente', async () => {
      expect(service.isLoaded()).toBe(true);
      expect(service.getVersion()).toBe('1.0.0');
    });

    it('debe lanzar error si falla la carga', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      const newService = new PromptConfigService();
      await expect(newService.loadConfig()).rejects.toThrow();
    });
  });

  describe('getTemplate', () => {
    it('debe obtener un template por ruta', () => {
      const template = service.getTemplate('dialogue.greeting.firstMeeting');
      expect(template).toBeDefined();
      expect(template?.template).toContain('You are {npcName}');
      expect(template?.variables).toContain('npcName');
    });

    it('debe devolver null para ruta inexistente', () => {
      const template = service.getTemplate('nonexistent.path');
      expect(template).toBeNull();
    });
  });

  describe('buildPrompt', () => {
    it('debe construir un prompt básico', () => {
      const result = service.buildPrompt('dialogue.greeting.firstMeeting', {
        npcName: 'John',
        personality: 'friendly',
        context: 'tavern',
      });

      expect(result).toBeDefined();
      expect(result?.prompt).toContain('John');
      expect(result?.prompt).toContain('friendly');
      expect(result?.prompt).toContain('tavern');
      expect(result?.config.max_new_tokens).toBe(100);
    });

    it('debe manejar secciones condicionales', () => {
      const resultWithMemory = service.buildPrompt(
        'dialogue.standard',
        {
          npcName: 'Alice',
          personality: 'mysterious',
          role: 'merchant',
          context: 'shop',
          memoryContext: 'We met before',
        },
        {
          memorySection: true,
        }
      );

      expect(resultWithMemory?.prompt).toContain('Memory: We met before');

      const resultWithoutMemory = service.buildPrompt(
        'dialogue.standard',
        {
          npcName: 'Alice',
          personality: 'mysterious',
          role: 'merchant',
          context: 'shop',
        },
        {
          memorySection: false,
        }
      );

      expect(resultWithoutMemory?.prompt).toContain('First meeting');
    });

    it('debe devolver fallback si template no existe', () => {
      const result = service.buildPrompt('nonexistent.template', {});
      expect(result).toBeDefined();
      expect(result?.config.temperature).toBe(0.8);
    });
  });

  describe('buildDialoguePrompt', () => {
    it('debe construir un prompt de diálogo', () => {
      const result = service.buildDialoguePrompt(
        'Bob',
        'grumpy',
        'guard',
        'city gates',
        {
          playerAction: 'asks about the city',
          tone: 'hostile',
        }
      );

      expect(result).toBeDefined();
      expect(result?.prompt).toContain('Bob');
      expect(result?.prompt).toContain('grumpy');
      expect(result?.prompt).toContain('guard');
      expect(result?.prompt).toContain('city gates');
    });
  });

  describe('buildOraclePrompt', () => {
    it('debe construir un prompt de oráculo', () => {
      const result = service.buildOraclePrompt(
        'dark forest',
        'Will I survive?',
        10,
        'yes',
        'Previous queries...',
        false
      );

      expect(result).toBeDefined();
      expect(result?.prompt).toContain('dark forest');
      expect(result?.prompt).toContain('Will I survive?');
      expect(result?.prompt).toContain('10');
    });

    it('debe usar explicación del resultado desde config', () => {
      const result = service.buildOraclePrompt(
        'dungeon',
        'Is there treasure?',
        12,
        'yes-and',
        undefined,
        true
      );

      expect(result?.prompt).toContain('Yes, and more');
    });
  });

  describe('buildDynamicPrompt', () => {
    it('debe construir un prompt dinámico', () => {
      const result = service.buildDynamicPrompt(
        'Describe this scene',
        {
          location: 'haunted castle',
          weather: 'stormy',
          timeOfDay: 'midnight',
        },
        {
          maxTokens: 150,
          temperature: 0.9,
        }
      );

      expect(result).toBeDefined();
      expect(result.prompt).toContain('You are a test assistant');
      expect(result.prompt).toContain('Location: haunted castle');
      expect(result.prompt).toContain('Weather: stormy');
      expect(result.prompt).toContain('Describe this scene');
      expect(result.config.max_new_tokens).toBe(150);
      expect(result.config.temperature).toBe(0.9);
    });

    it('debe excluir valores undefined/null/empty del contexto', () => {
      const result = service.buildDynamicPrompt(
        'Generate text',
        {
          validKey: 'value',
          undefinedKey: undefined,
          nullKey: null,
          emptyKey: '',
        }
      );

      // El servicio formatea las claves (camelCase -> Title Case)
      expect(result.prompt).toContain('Valid Key: value');
      expect(result.prompt).not.toContain('Undefined Key');
      expect(result.prompt).not.toContain('Null Key');
      expect(result.prompt).not.toContain('Empty Key');
    });

    it('debe incluir constraints por defecto', () => {
      const result = service.buildDynamicPrompt('Test instruction', {});
      expect(result.prompt).toContain('Keep responses short');
      expect(result.prompt).toContain('Be friendly');
    });

    it('debe permitir deshabilitar system context y constraints', () => {
      const result = service.buildDynamicPrompt(
        'Test instruction',
        {},
        {
          includeSystemContext: false,
          includeConstraints: false,
        }
      );

      expect(result.prompt).not.toContain('You are a test assistant');
      expect(result.prompt).not.toContain('Keep responses short');
    });
  });

  describe('validateVariables', () => {
    it('debe validar que todas las variables estén presentes', () => {
      const validation = service.validateVariables('dialogue.greeting.firstMeeting', {
        npcName: 'John',
        personality: 'friendly',
        context: 'tavern',
      });

      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    it('debe detectar variables faltantes', () => {
      const validation = service.validateVariables('dialogue.greeting.firstMeeting', {
        npcName: 'John',
      });

      expect(validation.valid).toBe(false);
      expect(validation.missing).toContain('personality');
      expect(validation.missing).toContain('context');
    });
  });

  describe('listTemplates', () => {
    it('debe listar todos los templates disponibles', () => {
      const templates = service.listTemplates();
      expect(templates).toContain('dialogue.greeting.firstMeeting');
      expect(templates).toContain('dialogue.greeting.recurring');
      expect(templates).toContain('dialogue.standard');
      expect(templates).toContain('oracle.interpretation');
      expect(templates).toContain('journal.entry');
    });
  });

  describe('getSystemContext', () => {
    it('debe obtener el contexto global del sistema', () => {
      const context = service.getSystemContext();
      expect(context).toBe('You are a test assistant.');
    });
  });

  describe('getGlobalConstraints', () => {
    it('debe obtener las constraints globales', () => {
      const constraints = service.getGlobalConstraints();
      expect(constraints).toContain('Keep responses short');
      expect(constraints).toContain('Be friendly');
    });
  });
});
