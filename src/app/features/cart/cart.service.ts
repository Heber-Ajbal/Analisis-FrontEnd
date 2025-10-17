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

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  private selectedShipping$ = new BehaviorSubject<ShippingOption | null>(null);
  private appliedCoupon$ = new BehaviorSubject<'AHORRA10' | null>(null);

  constructor() {}

  getCartItems() {
    return this.cartItems$.asObservable();
  }

  setCartItems(items: CartItem[]) {
    this.cartItems$.next(items);
  }

  getSelectedShipping() {
    return this.selectedShipping$.asObservable();
  }

  setSelectedShipping(shipping: ShippingOption) {
    this.selectedShipping$.next(shipping);
  }

  getAppliedCoupon() {
    return this.appliedCoupon$.asObservable();
  }

  setAppliedCoupon(coupon: 'AHORRA10' | null) {
    this.appliedCoupon$.next(coupon);
  }

  getCurrentCartState() {
    return {
      items: this.cartItems$.value,
      shipping: this.selectedShipping$.value,
      coupon: this.appliedCoupon$.value,
    };
  }
}