/**
 * Atributos principales del juego
 */
export type AttributeType = 'FUE' | 'AGI' | 'SAB' | 'SUE';

/**
 * Objeto de atributos con valores numéricos
 */
export interface Attributes {
  FUE: number; // Fuerza: Para combate cuerpo a cuerpo, forzar objetos
  AGI: number; // Agilidad: Para esquivar, sigilo, movimiento
  SAB: number; // Sabiduría: Para magia, detectar, recordar
  SUE: number; // Suerte: Para encontrar, oportunidades, azar
}

/**
 * Alias para PlayerAttributes (mismo que Attributes)
 */
export type PlayerAttributes = Attributes;

/**
 * Atributos base para inicio del personaje
 */
export const INITIAL_ATTRIBUTE_POINTS = 6;
export const MAX_ATTRIBUTE_VALUE = 3;
export const MIN_ATTRIBUTE_VALUE = 0;
