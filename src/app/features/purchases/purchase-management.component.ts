// src/app/features/purchases/purchase-management.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';

import {
  PaymentStatus,
  Purchase,
  PurchaseItem,
  PurchaseStatus,
  PurchaseTimelineEntry,
} from '../../models/purchases/purchase.models';
import { PurchasesService } from '../../core/services/purchases.service';

interface SummaryCard {
  label: string;
  value: string;
  helper?: string;
  icon: string;
  tone: 'primary' | 'success' | 'warning' | 'muted';
}

const STATUS_TRANSITIONS: Record<PurchaseStatus, PurchaseStatus[]> = {
  borrador: ['ordenado', 'cancelado'],
  ordenado: ['en-transito', 'cancelado'],
  'en-transito': ['recibido'],
  recibido: [],
  cancelado: [],
};

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  borrador: 'Borrador',
  ordenado: 'Ordenado',
  'en-transito': 'En tránsito',
  recibido: 'Recibido',
  cancelado: 'Cancelado',
};

const STATUS_CLASS: Record<PurchaseStatus, string> = {
  borrador: 'chip-neutral',
  ordenado: 'chip-info',
  'en-transito': 'chip-warning',
  recibido: 'chip-success',
  cancelado: 'chip-danger',
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente de pago',
  parcial: 'Pago parcial',
  pagado: 'Pagado',
};

const PAYMENT_CLASS: Record<PaymentStatus, string> = {
  pendiente: 'chip-warning',
  parcial: 'chip-info',
  pagado: 'chip-success',
};

@Component({
  selector: 'app-purchase-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressBarModule,
    MatListModule,
  ],
  templateUrl: './purchase-management.component.html',
  styleUrls: ['./purchase-management.component.scss'],
})
export class PurchaseManagementComponent implements OnInit {
  private purchasesService = inject(PurchasesService);

  loading = signal(true);
  purchases = signal<Purchase[]>([]);

  search = signal('');
  statusFilter = signal<PurchaseStatus | 'todos'>('todos');
  supplierFilter = signal<string | 'todos'>('todos');
  periodFilter = signal<'30' | '90' | '365' | 'all'>('30');

  selectedId = signal<string | null>(null);

  readonly statusOptions = [
    { value: 'todos' as const, label: 'Todos los estados' },
    { value: 'borrador' as const, label: STATUS_LABELS['borrador'] },
    { value: 'ordenado' as const, label: STATUS_LABELS['ordenado'] },
    { value: 'en-transito' as const, label: STATUS_LABELS['en-transito'] },
    { value: 'recibido' as const, label: STATUS_LABELS['recibido'] },
    { value: 'cancelado' as const, label: STATUS_LABELS['cancelado'] },
  ];

  readonly periodOptions = [
    { value: '30' as const, label: 'Últimos 30 días' },
    { value: '90' as const, label: 'Últimos 90 días' },
    { value: '365' as const, label: 'Últimos 12 meses' },
    { value: 'all' as const, label: 'Todo el historial' },
  ];

  suppliers = computed(() => {
    const set = new Set(this.purchases().map((purchase) => purchase.proveedor));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  filtered = computed(() => {
    const text = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const supplier = this.supplierFilter();
    const period = this.periodFilter();

    const now = new Date();
    let fromDate: Date | null = null;
    if (period !== 'all') {
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - Number(period));
    }

    return this.purchases()
      .filter((purchase) => {
        if (text) {
          const haystack = `${purchase.folio} ${purchase.proveedor} ${purchase.id}`.toLowerCase();
          if (!haystack.includes(text)) {
            return false;
          }
        }

        if (status !== 'todos' && purchase.estado !== status) {
          return false;
        }

        if (supplier !== 'todos' && purchase.proveedor !== supplier) {
          return false;
        }

        if (fromDate) {
          const purchaseDate = new Date(purchase.fecha);
          if (purchaseDate < fromDate) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  });

  summaryCards = computed<SummaryCard[]>(() => {
    const rows = this.purchases();
    const active = rows.filter((purchase) =>
      purchase.estado === 'ordenado' || purchase.estado === 'en-transito'
    );

    const pendingAmount = rows
      .filter((purchase) => purchase.estado !== 'cancelado')
      .reduce((acc, purchase) => acc + this.getPendingValue(purchase), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const receivedThisMonth = rows
      .filter((purchase) => {
        if (purchase.estado !== 'recibido') {
          return false;
        }
        const updated = new Date(purchase.updatedAt);
        return updated.getMonth() === currentMonth && updated.getFullYear() === currentYear;
      })
      .reduce((acc, purchase) => acc + purchase.total, 0);

    const draftCount = rows.filter((purchase) => purchase.estado === 'borrador').length;

    const suppliers = new Set(rows.map((purchase) => purchase.proveedor));

    return [
      {
        label: 'Órdenes activas',
        value: `${active.length}`,
        helper: 'En tránsito o pendientes de confirmación',
        icon: 'local_shipping',
        tone: 'primary',
      },
      {
        label: 'Pendiente por recibir',
        value: this.formatCurrency(pendingAmount),
        helper: 'Valor estimado de unidades faltantes',
        icon: 'inventory_2',
        tone: 'warning',
      },
      {
        label: 'Recibido este mes',
        value: this.formatCurrency(receivedThisMonth),
        helper: 'Total ingresado al inventario',
        icon: 'assignment_turned_in',
        tone: 'success',
      },
      {
        label: 'Borradores activos',
        value: `${draftCount}`,
        helper: `${suppliers.size} proveedores en seguimiento`,
        icon: 'edit_note',
        tone: 'muted',
      },
    ];
  });

  selected = computed(() => {
    const currentId = this.selectedId();
    if (!currentId) {
      return null;
    }
    return this.filtered().find((purchase) => purchase.id === currentId) ?? null;
  });

  nextStatuses = computed(() => {
    const selection = this.selected();
    if (!selection) {
      return [];
    }
    return STATUS_TRANSITIONS[selection.estado];
  });

  constructor() {
    effect(() => {
      const rows = this.filtered();
      const currentId = this.selectedId();
      if (rows.length === 0) {
        if (currentId !== null) {
          this.selectedId.set(null);
        }
        return;
      }

      const stillVisible = currentId && rows.some((purchase) => purchase.id === currentId);
      if (!stillVisible) {
        this.selectedId.set(rows[0].id);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.fetchPurchases();
  }

  async fetchPurchases(): Promise<void> {
    this.loading.set(true);
    try {
      const rows = await this.purchasesService.list();
      this.purchases.set(rows);
    } finally {
      this.loading.set(false);
    }
  }

  refresh(): void {
    this.fetchPurchases();
  }

  selectPurchase(purchase: Purchase): void {
    this.selectedId.set(purchase.id);
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('todos');
    this.supplierFilter.set('todos');
    this.periodFilter.set('30');
  }

  supplierLabel(supplier: string): string {
    return supplier;
  }

  formatCurrency(value: number, currency = 'GTQ'): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  }

  getStatusLabel(status: PurchaseStatus): string {
    return STATUS_LABELS[status];
  }

  getStatusClass(status: PurchaseStatus): string {
    return STATUS_CLASS[status];
  }

  getPaymentLabel(status: PaymentStatus): string {
    return PAYMENT_LABELS[status];
  }

  getPaymentClass(status: PaymentStatus): string {
    return PAYMENT_CLASS[status];
  }

  getReceivedPercentage(purchase: Purchase): number {
    const totalRequested = purchase.items.reduce((acc, item) => acc + item.cantidad, 0);
    if (totalRequested === 0) {
      return 0;
    }
    const totalReceived = purchase.items.reduce((acc, item) => acc + item.recibido, 0);
    return Math.round((totalReceived / totalRequested) * 100);
  }

  getPendingUnits(item: PurchaseItem): number {
    return Math.max(item.cantidad - item.recibido, 0);
  }

  getPendingValue(purchase: Purchase): number {
    return purchase.items.reduce((acc, item) => {
      const pendingUnits = this.getPendingUnits(item);
      return acc + pendingUnits * item.costoUnitario;
    }, 0);
  }

  getItemTotal(item: PurchaseItem): number {
    return item.cantidad * item.costoUnitario;
  }

  trackByPurchase(_: number, purchase: Purchase): string {
    return purchase.id;
  }

  trackByItem(_: number, item: PurchaseItem): string {
    return item.sku;
  }

  trackBySummary(_: number, card: SummaryCard): string {
    return card.label;
  }

  trackByTimeline(_: number, step: PurchaseTimelineEntry): string {
    return `${step.estado}-${step.fecha}`;
  }

  async updateStatus(status: PurchaseStatus): Promise<void> {
    const selection = this.selected();
    if (!selection) {
      return;
    }

    const updated = await this.purchasesService.updateStatus(selection.id, status);
    if (!updated) {
      return;
    }

    this.purchases.update((current) =>
      current.map((purchase) => (purchase.id === updated.id ? updated : purchase))
    );
    this.selectedId.set(updated.id);
  }
}
