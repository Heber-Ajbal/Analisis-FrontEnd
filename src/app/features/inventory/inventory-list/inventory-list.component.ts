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
  total = signal(0);
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

  ngOnInit() {
    // recarga al cambiar q/categoria/página
    effect(() => {
      const q = this.q();
      const categoria = this.categoria();
      const page = this.page();
      const pageSize = this.pageSize();

      void this.fetch({ q, categoria, page, pageSize });
    });
  }

  async fetch({
    q,
    categoria,
    page,
    pageSize,
  }: {
    q: string;
    categoria: string | null;
    page: number;
    pageSize: number;
  }) {
    const currentRequest = ++this.requestId;
    this.loading.set(true);
    try {
      const res = await this.inv.list({
        q: q || undefined,
        categoria,
        page,
        pageSize,
      });
      if (currentRequest !== this.requestId) return;

      this.source.set(res.rows);
      this.total.set(res.total);
      if (this.page() !== res.page) this.page.set(res.page);
      if (this.pageSize() !== res.pageSize) this.pageSize.set(res.pageSize);
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
    void this.fetch({
      q: this.q(),
      categoria: this.categoria(),
      page: this.page(),
      pageSize: this.pageSize(),
    });
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

  // Computados para la tabla (client-side ya NO filtra, solo refleja 'source')
  rows = computed(() => this.source());
  categorias = computed(() => {
    const set = new Set(
      this.source()
        .map((p) => p.categoria)
        .filter(Boolean) as string[]
    );
    return Array.from(set);
  });

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
