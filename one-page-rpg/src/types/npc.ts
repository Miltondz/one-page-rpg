/**
 * Arquetipo de NPC
 */
export type NPCArchetype = 
  | 'mentor'
  | 'ally'
  | 'antagonist'
  | 'merchant'
  | 'quest_giver'
  | 'thug'
  | 'crime_boss'
  | 'hermit'
  | 'fanatic'
  | 'civilian';

/**
 * Estado de ánimo del NPC
 */
export type NPCMood = 'friendly' | 'neutral' | 'suspicious' | 'hostile' | 'afraid';

/**
 * Interacción registrada con un NPC
 */
export interface NPCInteraction {
  /** Timestamp de la interacción */
  timestamp: number;

  /** Acción del jugador */
  action: string;

  /** Resultado de la interacción */
  outcome: string;

  /** Cambio en la relación */
  relationshipChange: number;
}

/**
 * NPC del juego con memoria
 */
export interface NPC {
  /** ID único del NPC */
  id: string;

  /** Nombre del NPC */
  name: string;

  /** Arquetipo del NPC */
  archetype: NPCArchetype;

  /** Raza del NPC */
  race: string;

  /** Relación actual con el jugador (-100 a +100) */
  relationship: number;

  /** Localización actual del NPC */
  location: string;

  /** Estado de ánimo actual */
  mood: NPCMood;

  /** Conocimientos que posee el NPC */
  knowledge: string[];

  /** IDs de misiones que puede dar */
  questsGiven: string[];

  /** Historial de interacciones con el jugador */
  interactions: NPCInteraction[];

  /** Si el NPC está vivo */
  isAlive: boolean;

  /** Si el NPC ha sido conocido por el jugador */
  isMet: boolean;
}

/**
 * Opción de diálogo
 */
export interface DialogueOption {
  /** ID de la opción */
  id: string;

  /** Texto de la opción */
  text: string;

  /** Condición para mostrar esta opción */
  condition?: {
    type: 'relationship' | 'flag' | 'item' | 'quest';
    value: string | number;
    operator?: 'gt' | 'lt' | 'eq' | 'has';
  };

  /** Consecuencias de elegir esta opción */
  consequences?: {
    relationshipChange?: number;
    setFlag?: Record<string, boolean | string>;
    addItem?: string;
    removeItem?: string;
    startQuest?: string;
  };
}

/**
 * Nodo de diálogo
 */
export interface DialogueNode {
  /** ID del nodo */
  id: string;

  /** Texto que dice el NPC */
  text: string;

  /** Opciones de respuesta disponibles */
  options: DialogueOption[];

  /** Si este nodo termina el diálogo */
  isEnd: boolean;
}
