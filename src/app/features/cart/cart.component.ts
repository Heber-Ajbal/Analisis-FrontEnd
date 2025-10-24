import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartItem, CartService, ShippingOption } from './cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
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
export class CartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  cartItems: CartItem[] = [];

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

  paymentForm: FormGroup;
  showPaymentForm = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      cardName: ['', [Validators.required, Validators.minLength(3)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    });
  }

  ngOnInit() {
    this.cartService
      .getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.cartItems = items;
      });

    this.cartService
      .getSelectedShipping()
      .pipe(takeUntil(this.destroy$))
      .subscribe((shipping) => {
        if (shipping) {
          this.selectedShipping = shipping;
        }
      });

    this.cartService
      .getAppliedCoupon()
      .pipe(takeUntil(this.destroy$))
      .subscribe((coupon) => {
        this.appliedCoupon = coupon;
        if (coupon) {
          this.couponCode = coupon;
          this.couponMessage = 'Cupón AHORRA10 aplicado · -10% sobre los productos (hasta Q50).';
          this.couponSuccess = true;
        } else {
          this.couponSuccess = false;
          if (!this.couponCode) {
            this.couponMessage = 'Ingresa un código para aplicar un descuento.';
          }
        }
      });

    const state = this.cartService.getCurrentCartState();
    if (!state.shipping) {
      this.cartService.setSelectedShipping(this.selectedShipping);
    } else {
      this.selectedShipping = state.shipping;
    }

    if (state.coupon) {
      this.cartService.setAppliedCoupon(state.coupon);
    }
  }

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
    this.cartService.changeItemQuantity(itemId, delta);
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  selectShipping(option: ShippingOption): void {
    this.selectedShipping = option;
    this.cartService.setSelectedShipping(option);
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
      this.cartService.setAppliedCoupon('AHORRA10');
    } else {
      this.appliedCoupon = null;
      this.couponMessage = 'Cupón no reconocido. Verifica el código e inténtalo de nuevo.';
      this.couponSuccess = false;
      this.cartService.setAppliedCoupon(null);
    }
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.cartItems = [];
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponMessage = 'Ingresa un código para aplicar un descuento.';
    this.couponSuccess = false;
  }

  proceedToCheckout(): void {
    // Guardar estado actual en el servicio
    this.cartService.setCartItems(this.cartItems);
    this.cartService.setSelectedShipping(this.selectedShipping);
    this.cartService.setAppliedCoupon(this.appliedCoupon);

    // Mostrar formulario de pago
    this.showPaymentForm = true;
  }

  cancelPayment(): void {
    this.showPaymentForm = false;
    this.paymentForm.reset();
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach((key) => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.paymentForm.value;
    const orderData = {
      items: this.cartItems,
      shipping: this.selectedShipping,
      coupon: this.appliedCoupon,
      subtotal: this.subtotal,
      discount: this.discount,
      shippingCost: this.shippingCost,
      total: this.total,
      paymentInfo: formData,
      orderDate: new Date(),
    };

    console.log('Orden procesada:', orderData);

    // Aquí iría la llamada al backend para procesar el pago
    // this.checkoutService.processOrder(orderData).subscribe(...)

    // Por ahora, mostrar confirmación y limpiar
    alert(`✓ Pago procesado exitosamente!\nTotal: Q${this.total.toFixed(2)}`);
    this.clearCart();
    this.showPaymentForm = false;
    this.paymentForm.reset();
    this.router.navigate(['/catalogo']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['email']) {
      return 'Email no válido';
    }
    if (control.errors['pattern']) {
      if (fieldName === 'phone') return 'Debe ser 8 dígitos';
      if (fieldName === 'postalCode') return 'Debe ser 5 dígitos';
      if (fieldName === 'cardNumber') return 'Debe ser 16 dígitos';
      if (fieldName === 'expiryDate') return 'Formato: MM/AA';
      if (fieldName === 'cvv') return 'Debe ser 3 dígitos';
    }
    return '';
  }

  trackById(_: number, item: CartItem): string {
    return item.id;
  }
}