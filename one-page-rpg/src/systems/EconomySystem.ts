/**
 * Economy System - Sistema de economía y comercio
 */

import type { Merchant, Transaction, TransactionResult } from '../types/merchant';
import type { Item } from '../types';
import type { GameCatalog } from '../types/catalog';

export class EconomySystem {
  private merchants: Map<string, Merchant> = new Map();
  private catalog: GameCatalog;
  private transactions: Transaction[] = [];

  constructor(catalog: GameCatalog) {
    this.catalog = catalog;
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
  calculateBuyPrice(itemId: string, merchantId: string, reputation: number = 0): number {
    const item = this.catalog.items[itemId];
    const merchant = this.merchants.get(merchantId);
    
    if (!item || !merchant) return 0;

    let price = item.value * merchant.priceModifier;

    // Aplicar descuento por reputación
    if (merchant.reputationDiscount && reputation > 0) {
      const discount = reputation * merchant.reputationDiscount.discountPerPoint;
      price *= (1 - Math.min(discount, 0.5)); // Max 50% descuento
    }

    return Math.ceil(price);
  }

  /**
   * Calcula el precio de venta de un item
   */
  calculateSellPrice(itemId: string, merchantId: string): number {
    const item = this.catalog.items[itemId];
    const merchant = this.merchants.get(merchantId);
    
    if (!item || !merchant) return 0;

    // Los comerciantes compran al 50% del valor base
    return Math.floor(item.value * 0.5);
  }

  /**
   * Procesa una compra
   */
  buyItem(
    itemId: string,
    merchantId: string,
    playerGold: number,
    reputation: number = 0
  ): TransactionResult {
    const merchant = this.merchants.get(merchantId);
    const item = this.catalog.items[itemId];

    if (!merchant) return { success: false, message: 'Comerciante no encontrado' };
    if (!item) return { success: false, message: 'Item no encontrado' };
    if (!merchant.sellsItems.includes(itemId)) {
      return { success: false, message: 'Este comerciante no vende este item' };
    }

    const price = this.calculateBuyPrice(itemId, merchantId, reputation);

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
  sellItem(itemId: string, merchantId: string): TransactionResult {
    const merchant = this.merchants.get(merchantId);
    const item = this.catalog.items[itemId];

    if (!merchant) return { success: false, message: 'Comerciante no encontrado' };
    if (!item) return { success: false, message: 'Item no encontrado' };

    // Verificar si el comerciante compra este tipo de item
    if (merchant.buysItemTypes && !merchant.buysItemTypes.includes(item.type)) {
      return { success: false, message: 'Este comerciante no compra este tipo de item' };
    }

    const price = this.calculateSellPrice(itemId, merchantId);

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
}

export default EconomySystem;
