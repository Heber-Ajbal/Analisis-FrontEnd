import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  compatibility: string;
}

interface ShippingOption {
  id: string;
  label: string;
  description: string;
  cost: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  cartItems: CartItem[] = [
    {
      id: 'oil-filter-honda',
      name: 'Filtro de aceite original',
      brand: 'Honda',
      price: 249,
      quantity: 1,
      stock: 6,
      image: 'https://images.unsplash.com/photo-1523924836167-327e0b1ad3d0?auto=format&fit=crop&w=900&q=80',
      compatibility: 'Civic 2016-2020 · HR-V 2017-2022',
    },
    {
      id: 'brake-pads-toyota',
      name: 'Pastillas de freno cerámicas',
      brand: 'Toyota',
      price: 545,
      quantity: 2,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1580130857273-263566ae5d8b?auto=format&fit=crop&w=900&q=80',
      compatibility: 'Corolla 2014-2019 · Camry 2015-2020',
    },
    {
      id: 'spark-plugs-hyundai',
      name: 'Juego de bujías platino',
      brand: 'Hyundai',
      price: 365,
      quantity: 1,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
      compatibility: 'Elantra 2017-2022 · Tucson 2018-2023',
    },
  ];

  shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      label: 'Envío estándar',
      description: 'Entrega en 3-5 días hábiles',
      cost: 35,
    },
    {
      id: 'express',
      label: 'Entrega express',
      description: 'Entrega al siguiente día hábil',
      cost: 95,
    },
    {
      id: 'pickup',
      label: 'Recoger en tienda',
      description: 'Disponible en bodegas zona 9',
      cost: 0,
    },
  ];

  selectedShipping = this.shippingOptions[0];
  couponCode = '';
  appliedCoupon: 'AHORRA10' | null = null;
  couponMessage = 'Ingresa un código para aplicar un descuento.';
  couponSuccess = false;

  get subtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  get discount(): number {
    if (this.appliedCoupon === 'AHORRA10') {
      return Math.min(this.subtotal * 0.1, 50);
    }
    return 0;
  }

  get shippingCost(): number {
    return this.selectedShipping.cost;
  }

  get total(): number {
    return Math.max(this.subtotal - this.discount + this.shippingCost, 0);
  }

  get totalUnits(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  updateQuantity(itemId: string, delta: number): void {
    this.cartItems = this.cartItems.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      const nextQuantity = Math.min(Math.max(item.quantity + delta, 1), item.stock);
      return { ...item, quantity: nextQuantity };
    });
  }

  removeItem(itemId: string): void {
    this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
  }

  selectShipping(option: ShippingOption): void {
    this.selectedShipping = option;
  }

  applyCoupon(): void {
    const normalized = this.couponCode.trim().toUpperCase();

    if (!normalized) {
      this.appliedCoupon = null;
      this.couponMessage = 'Ingresa un código para aplicar un descuento.';
      this.couponSuccess = false;
      return;
    }

    if (normalized === 'AHORRA10') {
      this.appliedCoupon = 'AHORRA10';
      this.couponCode = normalized;
      this.couponMessage = 'Cupón AHORRA10 aplicado · -10% sobre los productos (hasta Q50).';
      this.couponSuccess = true;
    } else {
      this.appliedCoupon = null;
      this.couponMessage = 'Cupón no reconocido. Verifica el código e inténtalo de nuevo.';
      this.couponSuccess = false;
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.appliedCoupon = null;
  }

  trackById(_: number, item: CartItem): string {
    return item.id;
  }
}
