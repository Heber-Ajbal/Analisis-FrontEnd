// src/app/features/inventory/inventory-adjust-dialog/inventory-adjust-dialog.component.ts
import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Product } from '../../../models/inventory/inventory.models';
import { InventoryService } from '../../../core/services/inventory.service';

type InventoryAdjustDialogData = {
  product: Product;
  action?: 'add' | 'remove';
};

@Component({
  selector: 'app-inventory-adjust-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './inventory-adjust-dialog.component.html',
  styleUrls: ['./inventory-adjust-dialog.component.scss'],
})
export class InventoryAdjustDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<InventoryAdjustDialogComponent>);
  private snack = inject(MatSnackBar);
  private inv = inject(InventoryService);

  form = this.fb.group({
    action: ['add' as 'add' | 'remove'],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  product: Product;
  hasInventory: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) data: InventoryAdjustDialogData) {
    this.product = data.product;
    this.hasInventory = data.product.inventoryId != null;

    if (data.action) {
      this.form.patchValue({ action: data.action });
    }

    if (!this.hasInventory) {
      // Si no hay inventario previo solo permitimos sumar
      this.form.get('action')?.setValue('add');
      this.form.get('action')?.disable();
    }
  }

  async submit() {
    if (this.form.invalid) return;

    const quantity = Number(this.form.value.quantity ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.snack.open('Ingresa una cantidad válida', 'Cerrar', { duration: 2500 });
      return;
    }

    const actionControl = this.form.get('action');
    const action = (actionControl?.value ?? 'add') === 'remove' ? 'remove' : 'add';

    try {
      if (this.hasInventory) {
        await this.inv.adjustInventoryRecord(this.product.inventoryId!, {
          quantity,
          action,
        });
      } else {
        if (action !== 'add') {
          throw new Error('No existe inventario para retirar.');
        }

        const productId = Number(this.product.id);
        if (!Number.isFinite(productId)) {
          throw new Error('No fue posible determinar el producto.');
        }

        await this.inv.createInventoryRecord({
          productId,
          quantity,
          vendor: this.product.proveedor ?? null,
        });
      }

      this.snack.open('Inventario actualizado', 'OK', { duration: 2000 });
      this.ref.close(true);
    } catch (e: any) {
      this.snack.open(e?.error?.message ?? e?.message ?? 'No se pudo actualizar', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  cancel() {
    this.ref.close(false);
  }
}
