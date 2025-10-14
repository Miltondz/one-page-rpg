/**
 * Economy System - Sistema de economía y comercio
 */

import type { Merchant, Transaction, TransactionResult } from '../types/merchant';
import type { GameCatalog } from '../types/catalog';
import { ReputationSystem } from './ReputationSystem';
import type { Reputation } from '../types';
import type { NPCMemory } from './NPCMemorySystem';

export class EconomySystem {
  private merchants: Map<string, Merchant> = new Map();
  private catalog: GameCatalog;
  private transactions: Transaction[] = [];
  private reputationSystem: ReputationSystem;

  constructor(catalog: GameCatalog) {
    this.catalog = catalog;
    this.reputationSystem = new ReputationSystem();
  }

  /**
   * Registra un comerciante
   */
  registerMerchant(merchant: Merchant): void {
    this.merchants.set(merchant.id, merchant);
  }

  /**
   * Calcula el precio de compra de un item
   */
  calculateBuyPrice(
    itemId: string,
    merchantId: string,
    factionReputation: Reputation,
    npcMemory?: NPCMemory
  ): number {
    const item = this.catalog.items[itemId];
    const merchant = this.merchants.get(merchantId);
    
    if (!item || !merchant) return 0;

    let price = item.value * merchant.priceModifier;

    // Aplicar modificadores de reputación usando ReputationSystem
    if (merchant.reputationDiscount?.faction) {
      const modifiers = this.reputationSystem.getPriceModifiers(
        merchant.reputationDiscount.faction as any,
        factionReputation,
        npcMemory
      );
      price *= modifiers.buyModifier;
    }

    return Math.ceil(price);
  }

  /**
   * Calcula el precio de venta de un item
   */
  calculateSellPrice(
    itemId: string,
    merchantId: string,
    factionReputation: Reputation,
    npcMemory?: NPCMemory
  ): number {
    const item = this.catalog.items[itemId];
    const merchant = this.merchants.get(merchantId);
    
    if (!item || !merchant) return 0;

    // Precio base: comerciantes compran al 50% del valor
    let price = item.value * 0.5;

    // Aplicar modificadores de reputación usando ReputationSystem
    if (merchant.reputationDiscount?.faction) {
      const modifiers = this.reputationSystem.getPriceModifiers(
        merchant.reputationDiscount.faction as any,
        factionReputation,
        npcMemory
      );
      price *= modifiers.sellModifier;
    }

    return Math.floor(price);
  }

  /**
   * Procesa una compra
   */
  buyItem(
    itemId: string,
    merchantId: string,
    playerGold: number,
    factionReputation: Reputation,
    npcMemory?: NPCMemory
  ): TransactionResult {
    const merchant = this.merchants.get(merchantId);
    const item = this.catalog.items[itemId];

    if (!merchant) return { success: false, message: 'Comerciante no encontrado' };
    if (!item) return { success: false, message: 'Item no encontrado' };
    if (!merchant.sellsItems.includes(itemId)) {
      return { success: false, message: 'Este comerciante no vende este item' };
    }

    const price = this.calculateBuyPrice(itemId, merchantId, factionReputation, npcMemory);

    if (playerGold < price) {
      return { success: false, message: 'No tienes suficiente oro' };
    }

    const transaction: Transaction = {
      type: 'buy',
      itemId,
      quantity: 1,
      pricePerUnit: price,
      totalPrice: price,
      merchantId,
      timestamp: Date.now(),
    };

    this.transactions.push(transaction);

    return {
      success: true,
      message: `Compraste ${item.name} por ${price} oro`,
      transaction,
    };
  }

  /**
   * Procesa una venta
   */
  sellItem(
    itemId: string,
    merchantId: string,
    factionReputation: Reputation,
    npcMemory?: NPCMemory
  ): TransactionResult {
    const merchant = this.merchants.get(merchantId);
    const item = this.catalog.items[itemId];

    if (!merchant) return { success: false, message: 'Comerciante no encontrado' };
    if (!item) return { success: false, message: 'Item no encontrado' };

    // Verificar si el comerciante compra este tipo de item
    if (merchant.buysItemTypes && !merchant.buysItemTypes.includes(item.type)) {
      return { success: false, message: 'Este comerciante no compra este tipo de item' };
    }

    const price = this.calculateSellPrice(itemId, merchantId, factionReputation, npcMemory);

    if (merchant.gold < price) {
      return { success: false, message: 'El comerciante no tiene suficiente oro' };
    }

    const transaction: Transaction = {
      type: 'sell',
      itemId,
      quantity: 1,
      pricePerUnit: price,
      totalPrice: price,
      merchantId,
      timestamp: Date.now(),
    };

    this.transactions.push(transaction);
    merchant.gold -= price;

    return {
      success: true,
      message: `Vendiste ${item.name} por ${price} oro`,
      transaction,
    };
  }

  getMerchant(merchantId: string): Merchant | undefined {
    return this.merchants.get(merchantId);
  }

  getTransactionHistory(): Transaction[] {
    return [...this.transactions];
  }

  /**
   * Obtener el sistema de reputación subyacente
   */
  getReputationSystem(): ReputationSystem {
    return this.reputationSystem;
  }

  /**
   * Verificar si el mercader aceptará comerciar
   * basado en reputación y memoria de NPC
   */
  willMerchantTrade(
    merchantId: string,
    factionReputation: Reputation,
    npcMemory?: NPCMemory
  ): { willTrade: boolean; reason?: string } {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) {
      return { willTrade: false, reason: 'Comerciante no encontrado' };
    }

    // Si el mercader no tiene faccion asignada, siempre comercia
    if (!merchant.reputationDiscount?.faction) {
      return { willTrade: true };
    }

    // Calcular actitud basada en reputación
    // Crear un NPC temporal para usar el sistema de reputación
    const tempNPC = {
      id: merchantId,
      name: merchant.name,
      archetype: 'merchant' as const,
      race: 'human',
      relationship: 0,
      location: merchant.location,
      mood: 'neutral' as const,
      knowledge: [],
      questsGiven: [],
      interactions: [],
      isAlive: true,
      isMet: true,
      faction: merchant.reputationDiscount.faction as any,
      role: 'merchant',
    };

    const attitude = this.reputationSystem.calculateNPCAttitude(
      tempNPC,
      factionReputation,
      npcMemory
    );

    const willTrade = this.reputationSystem.willTrade(attitude, 'merchant');

    if (!willTrade) {
      return {
        willTrade: false,
        reason: attitude === 'hostile'
          ? `${merchant.name} se niega a comerciar contigo debido a tu reputación.`
          : `${merchant.name} no confía en ti lo suficiente para comerciar.`,
      };
    }

    return { willTrade: true };
  }
}

export default EconomySystem;
