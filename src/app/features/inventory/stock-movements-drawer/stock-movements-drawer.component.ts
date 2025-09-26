import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InventoryMockService } from '../../../core/services/inventory-mock.service';
import { Product, StockMovement } from '../../../models/inventory/inventory.models';

@Component({
  selector: 'app-stock-movements-drawer',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './stock-movements-drawer.component.html'
})
export class StockMovementsDrawerComponent {
  moves = signal<StockMovement[]>([]);
  constructor(@Inject(MAT_DIALOG_DATA) public data: Product, private inv: InventoryMockService) {
    this.moves.set(inv.mockMovements(data.id));
  }
}
