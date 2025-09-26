import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

// Charts (usa una de estas 2 líneas según tu versión)
import { BaseChartDirective } from 'ng2-charts';      // ✅ standalone (moderno)
// import { NgChartsModule } from 'ng2-charts';       // ✅ alternativa con módulo

import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    // Material
    MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule,
    MatCardModule, MatDividerModule, MatTableModule, MatChipsModule,
    // Charts
    BaseChartDirective, // o NgChartsModule si usas módulo
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  // Filtro mock
  rango = signal<'7d'|'30d'|'ytd'|'12m'>('30d');

  // KPIs
  kpis = [
    { label: 'Productos',    value: 248,  icon: 'inventory_2' },
    { label: 'Stock total',  value: 5120, icon: 'warehouse' },
    { label: 'Ventas (mes)', value: 842,  icon: 'trending_up' },
    { label: 'Bajo stock',   value: 12,   icon: 'warning' },
  ];

  // === Gráfica 1: Línea (ventas) ===
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // clave para altura controlada por CSS
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    elements: { line: { tension: 0.35, borderWidth: 2 }, point: { radius: 3 } },
    layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
  };
  lineChartData: ChartConfiguration['data'] = {
    labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    datasets: [
      { data: [12,19,14,22,30,28,35,40,38,42,45,50], label: 'Ventas (k)', fill: true }
    ]
  };

  // === Gráfica 2: Mixta (barras + línea) con doble eje ===
  mixChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: true } },
    scales: {
      x: { stacked: false, grid: { display: false } },
      y:  { beginAtZero: true, stacked: false },
      y1: { position: 'right', grid: { drawOnChartArea: false } }
    }
  };
  mixChartData: ChartConfiguration['data'] = {
    labels: ['Cat A','Cat B','Cat C','Cat D','Cat E'],
    datasets: [
      { type: 'bar',  label: 'Existencias',  data: [1200, 800, 430, 980, 610], borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.6 },
      { type: 'line', label: 'Rotación (%)', data: [12, 18, 9, 15, 11], yAxisID: 'y1', fill: false, borderWidth: 2, pointRadius: 3 }
    ]
  };

  // === Gráfica 3: Dona (categorías) ===
  doughnutType: ChartType = 'doughnut';
  doughnutOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };
  doughnutData: ChartConfiguration['data'] = {
    labels: ['Periféricos', 'Sillas', 'Monitores', 'Almacenamiento', 'Cables'],
    datasets: [{ data: [35, 10, 15, 25, 15] }]
  };

  // Tablas (mock)
  displayedColumns = ['sku','nombre','stock'];
  topProductos = [
    { sku: 'A-001', nombre: 'Teclado Mecánico',  stock: 45 },
    { sku: 'A-014', nombre: 'Mouse Inalámbrico', stock: 33 },
    { sku: 'B-203', nombre: 'Silla Ergonómica',  stock: 12 },
    { sku: 'C-110', nombre: 'Monitor 27\"',      stock: 8 },
    { sku: 'D-090', nombre: 'Hub USB-C',         stock: 67 },
  ];

  displayedColumnsPend = ['sku','nombre','minimo','actual'];
  pendientes = [
    { sku: 'Z-777', nombre: 'Papel Fotográfico', minimo: 20, actual: 7 },
    { sku: 'X-321', nombre: 'Cables HDMI',       minimo: 40, actual: 15 },
    { sku: 'M-009', nombre: 'SSD 1TB',           minimo: 10, actual: 3 },
  ];
}
