// src/app/features/inventory/inventory-list/inventory-list.component.ts
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InventoryService } from '../../../core/services/inventory.service';
import { Product } from '../../../models/inventory/inventory.models';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';
import { StockMovementsDrawerComponent } from '../stock-movements-drawer/stock-movements-drawer.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
})
export class InventoryListComponent implements OnInit {
  // Datos
  source = signal<Product[]>([]);
  page = signal(1);
  pageSize = signal(25);
  loading = signal(false);

  // Filtros y búsqueda
  q = signal('');
  categoria = signal<string | null>(null); // mapea a 'type' del API
  estado = signal<string | null>(null); // de momento SIN USO real (no viene del API)

  private inv = inject(InventoryService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  private requestId = 0;

  filteredRows = computed(() => {
    const term = this.q().trim().toLowerCase();
    const categoria = this.categoria();

    return this.source().filter((product) => {
      const matchesCategoria = !categoria || product.categoria === categoria;
      const matchesTerm =
        !term ||
        product.sku.toLowerCase().includes(term) ||
        product.nombre.toLowerCase().includes(term);
      return matchesCategoria && matchesTerm;
    });
  });

  total = computed(() => this.filteredRows().length);

  rows = computed(() => {
    const page = this.page();
    const pageSize = this.pageSize();
    const start = (page - 1) * pageSize;
    return this.filteredRows().slice(start, start + pageSize);
  });

  categorias = computed(() => {
    const set = new Set(
      this.source()
        .map((p) => p.categoria)
        .filter(Boolean) as string[]
    );
    return Array.from(set);
  });

  ngOnInit() {
    effect(() => {
      const total = this.total();
      const pageSize = this.pageSize();
      const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1);
      const currentPage = this.page();
      if (currentPage > maxPage) {
        this.page.set(maxPage);
      }
    });

    void this.fetch();
  }

  async fetch() {
    const currentRequest = ++this.requestId;
    this.loading.set(true);
    try {
      const rows = await this.inv.list();
      if (currentRequest !== this.requestId) return;

      this.source.set(rows);
      this.page.set(1);
    } catch (e: any) {
      this.snack.open(e?.error?.message ?? 'No se pudo cargar el inventario', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      if (currentRequest === this.requestId) {
        this.loading.set(false);
      }
    }
  }

  private refresh() {
    void this.fetch();
  }

  onSearch(value: string) {
    this.q.set(value.trim());
    this.page.set(1);
  }

  onCategoria(value: string | null) {
    this.categoria.set(value || null);
    this.page.set(1);
  }

  resetFilters() {
    this.q.set('');
    this.categoria.set(null);
    this.page.set(1);
  }

  onPage(event: PageEvent) {
    const newPage = event.pageIndex + 1;
    if (this.page() !== newPage) this.page.set(newPage);
    if (this.pageSize() !== event.pageSize) this.pageSize.set(event.pageSize);
  }

  // Acciones (de momento sin API reales para CRUD)
  openNew() {
    const ref = this.dialog.open(ProductFormDialogComponent, { width: '720px', data: null });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.refresh();
    });
  }
  openEdit(p: Product) {
    const ref = this.dialog.open(ProductFormDialogComponent, { width: '720px', data: p });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.refresh();
    });
  }
  openMoves(p: Product) {
    this.dialog.open(StockMovementsDrawerComponent, {
      panelClass: 'drawer-panel',
      data: p,
      width: '520px',
    });
  }

}
