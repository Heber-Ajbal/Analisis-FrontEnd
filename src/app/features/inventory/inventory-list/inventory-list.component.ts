import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';


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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxChange } from '@angular/material/checkbox';


import { InventoryMockService } from '../../../core/services/inventory-mock.service';
import { Product } from '../../../models/inventory/inventory.models';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';
import { StockMovementsDrawerComponent } from '../stock-movements-drawer/stock-movements-drawer.component';

@Component({
selector: 'app-inventory-list',
standalone: true,
imports: [
CommonModule, FormsModule, ReactiveFormsModule,
MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule,
MatCardModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatSelectModule,
MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, MatTooltipModule,
MatDialogModule, MatSidenavModule, MatDividerModule,
ProductFormDialogComponent, StockMovementsDrawerComponent,
],
templateUrl: './inventory-list.component.html',
styleUrls: ['./inventory-list.component.scss']
})

export class InventoryListComponent {
// Datos
source = signal<Product[]>([]);
constructor(private inv: InventoryMockService, private fb: FormBuilder, private dialog: MatDialog) {
this.source.set(inv.products());
}


// Filtros y búsqueda
q = signal('');
categoria = signal<string | null>(null);
estado = signal<string | null>(null);


// Selección
selected = signal<Set<string>>(new Set());
toggleSel(id: string) {
const s = new Set(this.selected());
if (s.has(id)) s.delete(id); else s.add(id);
this.selected.set(s);
}
selectAll(ids: string[]) {
this.selected.set(new Set(ids));
}
clearSel() { this.selected.set(new Set()); }


// Lista filtrada/ordenada (simple, client-side)
rows = computed(() => {
const term = this.q().toLowerCase();
const cat = this.categoria();
const est = this.estado();
return this.source().filter(p =>
(!term || (p.nombre+ p.sku + p.categoria + (p.proveedor||'')).toLowerCase().includes(term)) &&
(!cat || p.categoria === cat) &&
(!est || p.estado === est)
);
});

categorias = computed(() => Array.from(new Set(this.source().map(p => p.categoria))));


// Acciones
openNew() {
this.dialog.open(ProductFormDialogComponent, { width: '720px', data: null });
}
openEdit(p: Product) {
this.dialog.open(ProductFormDialogComponent, { width: '720px', data: p });
}
openMoves(p: Product) {
this.dialog.open(StockMovementsDrawerComponent, { panelClass: 'drawer-panel', data: p, width: '520px' });
}

toggleSelectAll(ev: MatCheckboxChange) {
  if (ev.checked) {
    const ids = this.rows().map(p => p.id); // <- ya no usamos arrow en el template
    this.selectAll(ids);
  } else {
    this.clearSel();
  }
}

removeSelected() {
const ids = Array.from(this.selected());
this.inv.remove(ids);
this.source.set(this.inv.products());
this.clearSel();
}
exportCSV() { /* mock */ alert('Export CSV (mock)'); }
importCSV() { /* mock */ alert('Import CSV (mock)'); }
}