import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  compatibility: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  cost: number;
}

export interface AddToCartPayload {
  id: string;
  name: string;
  brand?: string | null;
  price: number;
  image?: string | null;
  quantity?: number;
  stock?: number;
  compatibility?: string | null;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
const DEFAULT_COMPATIBILITY = 'Compatible con la mayoría de modelos';
const DEFAULT_STOCK = 10;

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly CART_KEY = 'app:cart-items';
  private readonly SHIPPING_KEY = 'app:cart-shipping';
  private readonly COUPON_KEY = 'app:cart-coupon';

  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  private selectedShipping$ = new BehaviorSubject<ShippingOption | null>(null);
  private appliedCoupon$ = new BehaviorSubject<'AHORRA10' | null>(null);

  constructor() {
    this.restoreState();
  }

  private get storage(): Storage | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }

  private restoreState(): void {
    const storage = this.storage;
    if (!storage) {
      return;
    }

    const rawItems = storage.getItem(this.CART_KEY);
    if (rawItems) {
      try {
        const parsed = JSON.parse(rawItems) as CartItem[];
        if (Array.isArray(parsed)) {
          this.cartItems$.next(parsed);
        }
      } catch {
        storage.removeItem(this.CART_KEY);
      }
    }

    const rawShipping = storage.getItem(this.SHIPPING_KEY);
    if (rawShipping) {
      try {
        const parsed = JSON.parse(rawShipping) as ShippingOption | null;
        this.selectedShipping$.next(parsed ?? null);
      } catch {
        storage.removeItem(this.SHIPPING_KEY);
      }
    }

    const rawCoupon = storage.getItem(this.COUPON_KEY);
    if (rawCoupon) {
      try {
        const parsed = JSON.parse(rawCoupon) as 'AHORRA10' | null;
        this.appliedCoupon$.next(parsed ?? null);
      } catch {
        storage.removeItem(this.COUPON_KEY);
      }
    }
  }

  private persistCartItems(items: CartItem[]): void {
    const storage = this.storage;
    if (!storage) return;
    storage.setItem(this.CART_KEY, JSON.stringify(items));
  }

  private persistShipping(shipping: ShippingOption | null): void {
    const storage = this.storage;
    if (!storage) return;
    if (shipping) storage.setItem(this.SHIPPING_KEY, JSON.stringify(shipping));
    else storage.removeItem(this.SHIPPING_KEY);
  }

  private persistCoupon(coupon: 'AHORRA10' | null): void {
    const storage = this.storage;
    if (!storage) return;
    if (coupon) storage.setItem(this.COUPON_KEY, JSON.stringify(coupon));
    else storage.removeItem(this.COUPON_KEY);
  }

  getCartItems() {
    return this.cartItems$.asObservable();
  }

  getCartItemsSnapshot(): CartItem[] {
    return this.cartItems$.value;
  }

  setCartItems(items: CartItem[]) {
    this.cartItems$.next(items);
    this.persistCartItems(items);
  }

  getSelectedShipping() {
    return this.selectedShipping$.asObservable();
  }

  setSelectedShipping(shipping: ShippingOption | null) {
    this.selectedShipping$.next(shipping);
    this.persistShipping(shipping);
  }

  getAppliedCoupon() {
    return this.appliedCoupon$.asObservable();
  }

  setAppliedCoupon(coupon: 'AHORRA10' | null) {
    this.appliedCoupon$.next(coupon);
    this.persistCoupon(coupon);
  }

  addItem(payload: AddToCartPayload): void {
    const items = [...this.cartItems$.value];
    const index = items.findIndex((item) => item.id === payload.id);
    const quantityToAdd = Math.max(payload.quantity ?? 1, 1);

    if (index >= 0) {
      const current = items[index];
      const maxStock = payload.stock ?? current.stock ?? DEFAULT_STOCK;
      const newQuantity = Math.min(current.quantity + quantityToAdd, maxStock);
      items[index] = {
        ...current,
        quantity: newQuantity,
        stock: maxStock,
      };
    } else {
      const stock = payload.stock ?? DEFAULT_STOCK;
      items.push({
        id: payload.id,
        name: payload.name,
        brand: payload.brand ?? 'Genérico',
        price: payload.price,
        quantity: Math.min(quantityToAdd, stock),
        stock,
        image: payload.image ?? DEFAULT_IMAGE,
        compatibility: payload.compatibility ?? DEFAULT_COMPATIBILITY,
      });
    }

    this.setCartItems(items);
  }

  changeItemQuantity(itemId: string, delta: number): void {
    if (!delta) return;

    const items = this.cartItems$.value.map((item) => {
      if (item.id !== itemId) return item;
      const stock = item.stock ?? DEFAULT_STOCK;
      const nextQuantity = Math.min(Math.max(item.quantity + delta, 1), stock);
      return { ...item, quantity: nextQuantity };
    });

    this.setCartItems(items);
  }

  removeItem(itemId: string): void {
    const items = this.cartItems$.value.filter((item) => item.id !== itemId);
    this.setCartItems(items);
  }

  clearCart(): void {
    this.setCartItems([]);
    this.setAppliedCoupon(null);
  }

  getCurrentCartState() {
    return {
      items: this.cartItems$.value,
      shipping: this.selectedShipping$.value,
      coupon: this.appliedCoupon$.value,
    };
  }
}
