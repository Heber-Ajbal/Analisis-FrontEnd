// src/app/features/inventory/inventory-list/inventory-list.component.ts
import { Component, computed, effect, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
    MatSidenavModule,
    MatDividerModule,
    MatProgressBarModule,
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
  estado = signal<string | null>(null);    // de momento SIN USO real (no viene del API)

  // Tabla
  displayedColumns = ['sku', 'nombre', 'precio', 'stock', 'estado', 'acciones'];
  skeletonRows = Array.from({ length: 6 });

  private inv = inject(InventoryService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    // carga inicial
    this.fetch();

    // recarga al cambiar q/categoria/página/tamaño
    effect(() => {
      this.q();
      this.categoria();
      this.page();
      this.pageSize();
      this.fetch();
    });
  }

  async fetch() {
    this.loading.set(true);
    try {
      const res = await this.inv.list({
        q: this.q() || undefined,
        categoria: this.categoria(),
        page: this.page(),
        pageSize: this.pageSize(),
      });
      this.source.set(res.rows);
      this.total.set(res.total);
      this.page.set(res.page);
      this.pageSize.set(res.pageSize);
    } finally {
      this.loading.set(false);
    }
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

  // Paginación (MatPaginator usa base 0)
  onPage(e: PageEvent) {
    this.page.set(e.pageIndex + 1);
    this.pageSize.set(e.pageSize);
  }

  // Filtros
  resetFilters() {
    this.q.set('');
    this.categoria.set(null);
    this.estado.set(null);
    this.page.set(1);
  }

  // UI helpers
  badgeClass(e: Product) {
    return {
      'badge': true,
      'badge--ok': e.estado === 'activo',
      'badge--warn': e.estado === 'bajo-stock',
      'badge--muted': e.estado === 'inactivo',
    };
  }

  stockPct(e: Product): number {
    const min = Math.max(1, Number((e as any).minimo) || 1);
    const cur = Math.max(0, Number((e as any).stock) || 0);
    // 0% al 0, 100% cuando duplica el mínimo (ajustable)
    const pct = (cur / (min * 2)) * 100;
    return Math.max(4, Math.min(100, Math.round(pct)));
  }

  statusFor(e: Product): 'ok' | 'warn' | 'off' {
    if (e.estado === 'inactivo') return 'off';
    if ((e as any).stock <= (e as any).minimo) return 'warn';
    return 'ok';
  }

  // Acciones
  openNew() {
    const ref = this.dialog.open(ProductFormDialogComponent, { width: '720px', data: null });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.fetch();
    });
  }

  openEdit(p: Product) {
    const ref = this.dialog.open(ProductFormDialogComponent, { width: '720px', data: p });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.fetch();
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
