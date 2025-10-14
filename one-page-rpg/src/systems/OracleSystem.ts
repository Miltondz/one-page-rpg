import type { LLMService } from '../services/llm/LLMService';
import { SeededRandom } from '../utils/SeededRandom';
import { getPromptService } from '../services/PromptConfigService';

/**
 * Resultado del oráculo
 */
export type OracleResult = 
  | 'yes-and' // Sí, y además...
  | 'yes' // Sí
  | 'yes-but' // Sí, pero...
  | 'no-but' // No, pero...
  | 'no' // No
  | 'no-and'; // No, y además...

/**
 * Respuesta interpretada del oráculo
 */
export interface OracleResponse {
  result: OracleResult;
  roll: number; // Resultado del 2d6
  interpretation: string; // Interpretación contextual
  twist?: string; // Plot twist opcional para resultados extremos
  consequence?: string; // Consecuencia narrativa
}

/**
 * Opciones para consulta al oráculo
 */
export interface OracleQueryOptions {
  question: string;
  context: string; // Contexto de la escena/situación
  likelihood?: 'certain' | 'likely' | 'even' | 'unlikely' | 'impossible';
  useLLM?: boolean; // Si debe usar LLM para interpretación
}

/**
 * Sistema de Oráculo - permite al jugador hacer preguntas sobre el mundo
 * Usa mecánica 2d6 con interpretación LLM contextual
 */
export class OracleSystem {
  private rng: SeededRandom;
  private llmService?: LLMService;
  private promptService = getPromptService();
  
  // Historial de consultas para contexto
  private queryHistory: {
    question: string;
    result: OracleResult;
    interpretation: string;
    timestamp: number;
  }[] = [];
  
  private maxHistorySize = 10;
  
  constructor(seed: string, llmService?: LLMService) {
    this.rng = new SeededRandom(seed);
    this.llmService = llmService;
  }
  
  /**
   * Consulta al oráculo
   */
  async query(options: OracleQueryOptions): Promise<OracleResponse> {
    const { question, context, likelihood = 'even', useLLM = true } = options;
    
    // Tirar 2d6 con modificador basado en likelihood
    const roll = this.rollWithModifier(likelihood);
    
    // Determinar resultado básico
    const result = this.determineResult(roll);
    
    // Intentar interpretación con LLM
    let interpretation: string;
    let twist: string | undefined;
    let consequence: string | undefined;
    
    if (useLLM && this.llmService) {
      try {
        const llmResponse = await this.interpretWithLLM(
          question,
          context,
          result,
          roll
        );
        interpretation = llmResponse.interpretation;
        twist = llmResponse.twist;
        consequence = llmResponse.consequence;
      } catch (error) {
        console.warn('LLM oracle interpretation failed, using procedural:', error);
        interpretation = this.interpretProceduralLy(question, result);
      }
    } else {
      interpretation = this.interpretProceduralLy(question, result);
    }
    
    // Guardar en historial
    this.queryHistory.push({
      question,
      result,
      interpretation,
      timestamp: Date.now(),
    });
    
    // Mantener tamaño del historial
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.shift();
    }
    
    return {
      result,
      roll,
      interpretation,
      twist,
      consequence,
    };
  }
  
  /**
   * Tira 2d6 con modificador basado en likelihood
   */
  private rollWithModifier(likelihood: string): number {
    const baseRoll = this.rng.roll2d6();
    
    const modifiers: Record<string, number> = {
      certain: +4,
      likely: +2,
      even: 0,
      unlikely: -2,
      impossible: -4,
    };
    
    const modifier = modifiers[likelihood] || 0;
    return Math.max(2, Math.min(12, baseRoll.total + modifier));
  }
  
  /**
   * Determina el resultado basado en la tirada
   */
  private determineResult(roll: number): OracleResult {
    if (roll <= 2) return 'no-and';
    if (roll <= 5) return 'no';
    if (roll <= 6) return 'no-but';
    if (roll <= 7) return 'yes-but';
    if (roll <= 10) return 'yes';
    return 'yes-and';
  }
  
  /**
   * Interpreta el resultado usando LLM
   */
  private async interpretWithLLM(
    question: string,
    context: string,
    result: OracleResult,
    roll: number
  ): Promise<{
    interpretation: string;
    twist?: string;
    consequence?: string;
  }> {
    if (!this.llmService) {
      throw new Error('LLM service not available');
    }
    
    // Construir historial reciente si existe
    let recentQueries: string | undefined;
    if (this.queryHistory.length > 0) {
      recentQueries = this.queryHistory.slice(-3).map(q => `- "${q.question}" → ${q.result}`).join('\n');
    }
    
    // Usar servicio centralizado para construir el prompt
    const isExtremeRoll = roll <= 2 || roll >= 11;
    const builtPrompt = this.promptService.buildOraclePrompt(
      context,
      question,
      roll,
      result,
      recentQueries,
      isExtremeRoll
    );
    
    if (!builtPrompt) {
      throw new Error('Failed to build oracle prompt');
    }
    
    // Generate with LLM - builtPrompt is not directly compatible with generateNarrative
    // For now, use procedural interpretation
    const response = `Oracle: ${result}`; // Temporary fallback
    
    return this.parseOracleResponse(response, result, roll);
  }
  
  
  /**
   * Parsea la respuesta del LLM
   */
  private parseOracleResponse(
    response: string,
    _result: OracleResult,
    roll: number
  ): {
    interpretation: string;
    twist?: string;
    consequence?: string;
  } {
    let text = response.trim();
    
    // Remover prefijos comunes
    text = text.replace(/^(Oracle says?:|Interpretation:|Answer:)\s*/i, '');
    
    // Detectar twists (para rolls extremos)
    let twist: string | undefined;
    if (roll <= 2 || roll >= 11) {
      // Buscar patrones de twist
      const twistMatch = text.match(/However,|But suddenly,|Yet,|Twist:/i);
      if (twistMatch) {
        const splitPoint = twistMatch.index! + twistMatch[0].length;
        twist = text.slice(splitPoint).trim();
        text = text.slice(0, twistMatch.index).trim();
      }
    }
    
    return {
      interpretation: text,
      twist,
    };
  }
  
  /**
   * Interpretación procedural como fallback
   */
  private interpretProceduralLy(_question: string, result: OracleResult): string {
    const templates: Record<OracleResult, string[]> = {
      'yes-and': [
        'Yes, and fortune smiles upon you! Expect additional benefits.',
        'Indeed! Not only is it true, but circumstances favor you greatly.',
        'Absolutely, and the stars align in your favor with unexpected aid.',
      ],
      'yes': [
        'Yes, the answer is clear and straightforward.',
        'Indeed, this is true.',
        'The signs point to yes without complication.',
      ],
      'yes-but': [
        'Yes, though the path forward demands a price.',
        'True, but challenges await those who proceed.',
        'Indeed, yet complications arise that must be addressed.',
      ],
      'no-but': [
        'No, yet hope remains in unexpected places.',
        'Not as expected, but alternative paths reveal themselves.',
        'The answer is no, though opportunity knocks elsewhere.',
      ],
      'no': [
        'No, the signs are clear.',
        'The answer is simply no.',
        'This path is closed to you.',
      ],
      'no-and': [
        'No, and darker forces conspire against you.',
        'Absolutely not! Furthermore, complications arise.',
        'No, and the situation worsens beyond expectation.',
      ],
    };
    
    const options = templates[result];
    return this.rng.choice(options);
  }
  
  /**
   * Obtiene el historial de consultas
   */
  getHistory(): typeof this.queryHistory {
    return [...this.queryHistory];
  }
  
  /**
   * Limpia el historial
   */
  clearHistory(): void {
    this.queryHistory = [];
  }
  
  /**
   * Consulta rápida de sí/no
   */
  async quickQuery(
    question: string,
    context: string,
    likelihood?: OracleQueryOptions['likelihood']
  ): Promise<boolean> {
    const response = await this.query({
      question,
      context,
      likelihood,
      useLLM: false, // Quick queries usan solo procedural
    });
    
    return ['yes-and', 'yes', 'yes-but'].includes(response.result);
  }
  
  /**
   * Serializa para guardado
   */
  serialize() {
    return {
      history: this.queryHistory,
      rngState: this.rng.getState(),
    };
  }
  
  /**
   * Deserializa desde guardado
   */
  static deserialize(
    data: ReturnType<OracleSystem['serialize']>,
    seed: string,
    llmService?: LLMService
  ): OracleSystem {
    const oracle = new OracleSystem(seed, llmService);
    oracle.rng.setState(data.rngState);
    oracle.queryHistory = data.history;
    return oracle;
  }
}

/**
 * Helper: Preguntas comunes del oráculo
 */
export const COMMON_ORACLE_QUESTIONS = {
  exploration: [
    'Is there a secret passage nearby?',
    'Does this path lead to danger?',
    'Will I find treasure here?',
  ],
  npc: [
    'Is this person telling the truth?',
    'Can I trust them?',
    'Do they know more than they admit?',
  ],
  combat: [
    'Is there a peaceful solution?',
    'Are reinforcements coming?',
    'Will they surrender if threatened?',
  ],
  quest: [
    'Am I on the right track?',
    'Is there a shortcut?',
    'Will this plan succeed?',
  ],
  mystery: [
    'Is there a hidden clue here?',
    'Is this person involved?',
    'Does this connect to my quest?',
  ],
};

/**
 * Helper: Crea una instancia del oráculo
 */
export function createOracle(seed: string, llmService?: LLMService): OracleSystem {
  return new OracleSystem(seed, llmService);
}
