import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InventoryMockService } from '../../../core/services/inventory-mock.service';
import { Product } from '../../../models/inventory/inventory.models';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './product-form-dialog.component.html'
})
export class ProductFormDialogComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inv: InventoryMockService,
    private ref: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.form = this.fb.group({
      id: [''],
      sku: ['', Validators.required],
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      proveedor: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      minimo: [0, [Validators.required, Validators.min(0)]],
      estado: ['activo', Validators.required],
      imagenUrl: ['']
    });

    if (data) this.form.patchValue(data);
  }

  save() {
    const v = this.form.getRawValue() as Product;
    v.actualizado = new Date().toISOString();
    if (!v.id) v.id = crypto.randomUUID();
    this.inv.upsert(v);
    this.ref.close(true);
  }
}
