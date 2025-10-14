/**
 * Efectos inmediatos de una decisión
 */
export interface ImmediateEffects {
  /** Establecer flags del mundo */
  setWorldFlag?: Record<string, boolean | string | number>;

  /** Añadir item al inventario */
  addItem?: string;

  /** Remover item del inventario */
  removeItem?: string;

  /** Añadir oro */
  addGold?: number;

  /** Cambiar relación con NPC */
  changeRelationship?: {
    npcId: string;
    value: number;
  };

  /** Cambiar reputación con facción */
  changeFactionReputation?: {
    factionId: string;
    value: number;
  };

  /** Curar heridas */
  healWounds?: number;

  /** Añadir fatiga */
  addFatigue?: number;

  /** Efectos especiales */
  special?: string;
}

/**
 * Consecuencias a largo plazo
 */
export interface LongTermConsequences {
  /** Rama de historia que se desbloquea */
  storyBranch?: string;

  /** Misiones que se vuelven disponibles */
  questsAvailable?: string[];

  /** Cambios en facciones */
  factionEffects?: Record<string, number>;

  /** Variantes de ending disponibles */
  endingVariants?: string[];

  /** Flags que afectan eventos futuros */
  futureFlags?: Record<string, boolean | string>;
}

/**
 * Opción de una decisión crítica
 */
export interface DecisionChoice {
  /** ID de la opción */
  id: string;

  /** Texto de la opción */
  text: string;

  /** Mecánica requerida (tirada) */
  mechanic?: {
    attribute: string;
    difficulty: number;
  };

  /** Efectos inmediatos al elegir */
  immediateEffects: ImmediateEffects;

  /** Consecuencias a largo plazo */
  longTermConsequences?: LongTermConsequences;

  /** Efectos si la mecánica tiene éxito */
  onSuccess?: ImmediateEffects;

  /** Efectos si la mecánica falla */
  onFailure?: ImmediateEffects;
}

/**
 * Decisión crítica en la historia
 */
export interface CriticalDecision {
  /** ID único de la decisión */
  id: string;

  /** Acto en el que ocurre */
  act: number;

  /** Descripción de la situación */
  situation: string;

  /** Opciones disponibles */
  choices: DecisionChoice[];

  /** Si ya fue tomada */
  isResolved: boolean;

  /** ID de la opción elegida */
  chosenChoiceId?: string;

  /** Timestamp de la decisión */
  resolvedAt?: number;
}

/**
 * Rama de historia alternativa
 */
export interface StoryBranch {
  /** ID de la rama */
  id: string;

  /** Nombre de la rama */
  name: string;

  /** Descripción */
  description: string;

  /** Misiones disponibles en esta rama */
  questsAvailable: string[];

  /** Efectos en facciones */
  factionEffects: Record<string, number>;

  /** Variantes de ending posibles */
  endingVariants: string[];
}
