// src/app/features/inventory/product-form-dialog/product-form-dialog.component.ts
import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Product } from '../../../models/inventory/inventory.models';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './product-form-dialog.component.html',
  styleUrls: ['./product-form-dialog.component.scss'],
})
export class ProductFormDialogComponent {
  // inyecciones con `inject()` para usarlas en el ctor
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private inv = inject(InventoryService);
  private ref = inject(MatDialogRef<ProductFormDialogComponent>);

  form!: FormGroup;
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Product | null) {
    // 👉 aquí data ya está disponible: inicializa el form en el ctor
    this.form = this.fb.group({
      id:        [data?.id ?? null],
      documentId: [data?.documentId],
      inventoryId: [data?.inventoryId ?? null],
      sku:       [data?.sku ?? '', [Validators.required, Validators.maxLength(32)]],
      nombre:    [data?.nombre ?? '', [Validators.required, Validators.maxLength(120)]],
      categoria: [data?.categoria ?? null],
      proveedor: [data?.proveedor ?? null],
      precio:    [data?.precio ?? 0, [Validators.required, Validators.min(0)]],
      description: [data?.description ?? ''],
      imagenUrl: [data?.imagenUrl ?? null], // solo UI
      stock:     [data?.stock ?? 0, [Validators.min(0)]],
      minimo:    [data?.minimo ?? 0],       // solo UI por ahora
      estado:    [data?.estado ?? 'activo'], // solo UI por ahora
      adjustmentAction: ['add'],
      adjustmentQuantity: [0, [Validators.min(0)]],
    });
  }

  async save() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const v = this.form.value;

    try {
      const payload = {
        sku: v.sku!,
        nombre: v.nombre!,
        categoria: v.categoria ?? null,
        proveedor: v.proveedor ?? null,
        precio: Number(v.precio ?? 0),
        description: v['description'] ?? null
      };

      const isEdit = Boolean(v.id);
      const result = isEdit
        ? await this.inv.update(v.documentId, payload)
        : await this.inv.create(payload);

      if (!isEdit) {
        const quantity = Number(v.stock ?? 0);
        if (Number.isFinite(quantity)) {
          const productId = Number(result.id);
          if (Number.isNaN(productId)) {
            throw new Error('No fue posible obtener el identificador del producto.');
          }

          await this.inv.createInventoryRecord({
            productId,
            quantity,
            vendor: v.proveedor ?? null,
          });
        }
      } else {
        const inventoryId = v.inventoryId ?? this.data?.inventoryId ?? null;
        const quantity = Number(v.adjustmentQuantity ?? 0);
        const action = v.adjustmentAction === 'remove' ? 'remove' : 'add';

        if (Number.isFinite(quantity) && quantity > 0) {
          if (inventoryId != null) {
            await this.inv.adjustInventoryRecord(inventoryId, {
              quantity,
              action,
            });
          } else if (action === 'add') {
            const productId = Number(result.id ?? v.id ?? this.data?.id);

            if (!Number.isFinite(productId)) {
              throw new Error('No fue posible obtener el identificador del producto.');
            }

            await this.inv.createInventoryRecord({
              productId,
              quantity,
              vendor: v.proveedor ?? this.data?.proveedor ?? null,
            });
          }
        }
      }

      this.snack.open('Producto guardado', 'OK', { duration: 2000 });
      this.ref.close(result);
    } catch (e: any) {
      this.snack.open(e?.error?.message ?? 'Error al guardar', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  close() { this.ref.close(); }
}
