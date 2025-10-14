import type { AttributeType } from './attributes';

/**
 * Tipo de item
 */
export type ItemType = 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'QUEST_ITEM' | 'MISC';

/**
 * Rareza de un item
 */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

/**
 * Mecánica de un item
 */
export interface ItemMechanic {
  /** Tipo de mecánica */
  type: 'EQUIPMENT_BONUS' | 'CONSUMABLE_EFFECT';

  /** Atributo afectado */
  attribute?: AttributeType;

  /** Valor del bono/efecto */
  value?: number;

  /** Contexto donde aplica */
  context?: 'COMBAT' | 'EXPLORATION' | 'DIALOGUE' | 'ALL';

  /** Efecto del consumible */
  effect?: 'RESTORE_WOUNDS' | 'REMOVE_STATUS' | 'APPLY_STATUS' | 'APPLY_BUFF';

  /** ID del status aplicado */
  statusId?: string;

  /** Duración del efecto (turnos o horas) */
  duration?: number;

  /** Poder del efecto */
  power?: number;
}

/**
 * Definición de un item
 */
export interface Item {
  /** ID único del item */
  id: string;

  /** Nombre del item */
  name: string;

  /** Tipo de item */
  type: ItemType;

  /** Subtipo (sword, staff, etc.) */
  subtype?: string;

  /** Descripción del item */
  description: string;

  /** Valor en oro */
  value: number;

  /** Rareza */
  rarity: ItemRarity;

  /** Mecánica del item */
  mechanic?: ItemMechanic;

  /** Si es equipable */
  isEquippable: boolean;

  /** Si es consumible */
  isConsumable: boolean;

  /** Si es un item de quest */
  isQuestItem: boolean;

  /** Quest asociada (si es quest item) */
  questId?: string;

  /** Requisitos para usar */
  requirements?: {
    level?: number;
    attributes?: Partial<Record<AttributeType, number>>;
  };

  /** Máximo en el inventario */
  maxStack?: number;
}

/**
 * Item en el inventario del jugador
 */
export interface InventoryItem {
  /** ID del item */
  itemId: string;

  /** Cantidad */
  quantity: number;

  /** Si está equipado */
  isEquipped: boolean;
}

/**
 * Efecto de estado (buff/debuff)
 */
export interface StatusEffect {
  /** ID del efecto */
  id: string;

  /** Nombre del efecto */
  name: string;

  /** Tipo */
  type: 'BUFF' | 'DEBUFF';

  /** Descripción mecánica */
  description: string;

  /** Mecánica del efecto */
  mechanic?: {
    type: 'DAMAGE_OVER_TIME' | 'MODIFIER' | 'SPECIAL';
    damage?: number;
    attribute?: AttributeType | 'wounds' | 'fatigue';
    interval?: 'end_of_turn' | 'start_of_turn';
    modifier?: number;
  };

  /** Duración en turnos */
  durationTurns?: number;

  /** Icono o emoji */
  icon?: string;
}
