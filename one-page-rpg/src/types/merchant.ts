/**
 * Merchant Types - Tipos para el sistema de comercio
 */

// Types for merchant system

/**
 * Tipo de comerciante
 */
export type MerchantType = 
  | 'general' // Tienda general
  | 'blacksmith' // Herrero (armas/armaduras)
  | 'alchemist' // Alquimista (pociones)
  | 'magic_shop' // Tienda de magia
  | 'fence' // Perista (items robados)
  | 'tavern'; // Taberna (comida/bebida)

/**
 * Definición de un comerciante
 */
export interface Merchant {
  id: string;
  name: string;
  type: MerchantType;
  description: string;
  location: string;
  
  /** Items que vende (IDs) */
  sellsItems: string[];
  
  /** Items que compra (tipos o IDs específicos) */
  buysItemTypes?: string[];
  
  /** Modificador de precios (1.0 = precio base, 1.5 = 50% más caro) */
  priceModifier: number;
  
  /** Descuento por reputación (faction y descuento por punto) */
  reputationDiscount?: {
    faction: string;
    discountPerPoint: number; // ej: 0.02 = 2% por punto
  };
  
  /** Oro disponible del comerciante */
  gold: number;
  
  /** Restock de inventario (en minutos de juego) */
  restockTime?: number;
  
  /** Última vez que restockeó */
  lastRestock?: number;
}

/**
 * Transacción de compra/venta
 */
export interface Transaction {
  type: 'buy' | 'sell';
  itemId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  merchantId: string;
  timestamp: number;
}

/**
 * Resultado de una transacción
 */
export interface TransactionResult {
  success: boolean;
  message: string;
  transaction?: Transaction;
}
