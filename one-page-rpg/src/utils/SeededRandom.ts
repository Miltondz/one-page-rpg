/**
 * Seeded Random Number Generator
 * 
 * Implementa un generador de números aleatorios basado en seed
 * usando el algoritmo Linear Congruential Generator (LCG).
 * 
 * Esto permite adventures reproducibles: el mismo seed siempre
 * genera la misma secuencia de números "aleatorios".
 */

/**
 * Convierte un string seed en un número entero
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Clase para generación de números aleatorios basados en seed
 * 
 * Usa el algoritmo LCG (Linear Congruential Generator):
 * X(n+1) = (a * X(n) + c) mod m
 * 
 * Parámetros elegidos según Numerical Recipes:
 * - a = 1664525
 * - c = 1013904223
 * - m = 2^32
 */
export class SeededRandom {
  private state: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = Math.pow(2, 32);
  
  /**
   * Crea un nuevo generador con el seed dado
   * @param seed - String seed o número para inicializar el generador
   */
  constructor(seed: string | number) {
    if (typeof seed === 'string') {
      this.state = hashCode(seed);
    } else {
      this.state = Math.abs(seed);
    }
  }

  /**
   * Genera el siguiente número en la secuencia
   * @returns Número entre 0 y 1 (exclusivo)
   */
  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / this.m;
  }

  /**
   * Genera un entero aleatorio entre min y max (inclusivo)
   * @param min - Valor mínimo
   * @param max - Valor máximo
   * @returns Entero aleatorio en el rango [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Genera un número flotante entre min y max
   * @param min - Valor mínimo
   * @param max - Valor máximo
   * @returns Float aleatorio en el rango [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Retorna true con la probabilidad dada
   * @param probability - Probabilidad entre 0 y 1
   * @returns true si el roll es exitoso
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Selecciona un elemento aleatorio de un array
   * @param array - Array del cual seleccionar
   * @returns Elemento aleatorio del array
   */
  pick<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }

  /**
   * Mezcla un array usando el algoritmo Fisher-Yates
   * @param array - Array a mezclar (se modifica in-place)
   * @returns El array mezclado
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Genera un roll de dados estándar
   * @param sides - Número de caras del dado
   * @param count - Número de dados a lanzar
   * @returns Suma de los dados
   */
  rollDice(sides: number, count: number = 1): number {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += this.nextInt(1, sides);
    }
    return total;
  }

  /**
   * Roll de 2d6 específico para este juego
   * @returns Objeto con el roll total y los dados individuales
   */
  roll2d6(): { total: number; die1: number; die2: number } {
    const die1 = this.nextInt(1, 6);
    const die2 = this.nextInt(1, 6);
    return {
      total: die1 + die2,
      die1,
      die2,
    };
  }
  
  /**
   * Alias para roll2d6() (compatibilidad)
   */
  roll(): { total: number; die1: number; die2: number } {
    return this.roll2d6();
  }
  
  /**
   * Alias para pick() (compatibilidad)
   */
  choice<T>(array: T[]): T {
    return this.pick(array);
  }

  /**
   * Selecciona elementos ponderados según sus pesos
   * @param items - Array de items con pesos
   * @returns Item seleccionado
   */
  weightedPick<T>(items: Array<{ item: T; weight: number }>): T {
    const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);
    let random = this.nextFloat(0, totalWeight);
    
    for (const { item, weight } of items) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }
    
    // Fallback (no debería llegar aquí)
    return items[items.length - 1].item;
  }

  /**
   * Genera un UUID v4 basado en el seed
   * Útil para IDs únicos pero reproducibles
   */
  uuid(): string {
    const hex = '0123456789abcdef';
    let uuid = '';
    
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        uuid += '4'; // Version 4
      } else if (i === 19) {
        uuid += hex[this.nextInt(8, 11)]; // Variant bits
      } else {
        uuid += hex[this.nextInt(0, 15)];
      }
    }
    
    return uuid;
  }

  /**
   * Resetea el generador al seed original
   * @param seed - Nuevo seed
   */
  reset(seed: string | number): void {
    if (typeof seed === 'string') {
      this.state = hashCode(seed);
    } else {
      this.state = Math.abs(seed);
    }
  }

  /**
   * Obtiene el estado actual del generador
   * Útil para serialización
   */
  getState(): number {
    return this.state;
  }

  /**
   * Restaura el generador a un estado previo
   * Útil para deserialización
   */
  setState(state: number): void {
    this.state = state;
  }
}

/**
 * Crea un seed aleatorio basado en timestamp
 * Útil para nuevas adventures
 */
export function generateRandomSeed(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random}`;
}

/**
 * Valida si un seed es válido
 */
export function isValidSeed(seed: string): boolean {
  return seed.length > 0 && seed.length < 1000;
}

/**
 * Instancia global del generador (se puede sobrescribir)
 */
let globalRng: SeededRandom | null = null;

/**
 * Obtiene o crea la instancia global del RNG
 */
export function getGlobalRng(): SeededRandom {
  if (!globalRng) {
    globalRng = new SeededRandom(generateRandomSeed());
  }
  return globalRng;
}

/**
 * Establece el RNG global con un nuevo seed
 */
export function setGlobalRng(seed: string | number): SeededRandom {
  globalRng = new SeededRandom(seed);
  return globalRng;
}

/**
 * Resetea el RNG global
 */
export function resetGlobalRng(): void {
  globalRng = null;
}

export default SeededRandom;
