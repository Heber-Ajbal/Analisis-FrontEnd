// src/app/core/services/purchases.service.ts
import { Injectable, signal } from '@angular/core';
import {
  Purchase,
  PurchaseStatus,
  PurchaseTimelineEntry,
  clonePurchase,
} from '../../models/purchases/purchase.models';

interface StatusUpdateOptions {
  nota?: string;
  fecha?: string;
}

@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private data = signal<Purchase[]>(MOCK_PURCHASES.map((purchase) => clonePurchase(purchase)));

  async list(): Promise<Purchase[]> {
    const snapshot = this.data().map((purchase) => clonePurchase(purchase));
    // Simula una llamada a API para mantener coherencia con el resto de servicios
    return new Promise((resolve) => setTimeout(() => resolve(snapshot), 120));
  }

  async getById(id: string): Promise<Purchase | null> {
    const found = this.data().find((purchase) => purchase.id === id);
    return new Promise((resolve) =>
      setTimeout(() => resolve(found ? clonePurchase(found) : null), 80)
    );
  }

  async updateStatus(id: string, estado: PurchaseStatus, opts: StatusUpdateOptions = {}) {
    const nowIso = opts.fecha ?? new Date().toISOString();

    this.data.update((current) =>
      current.map((purchase) => {
        if (purchase.id !== id) {
          return purchase;
        }

        const nextTimeline: PurchaseTimelineEntry[] = [
          ...purchase.timeline,
          { estado, fecha: nowIso, descripcion: opts.nota },
        ];

        return {
          ...purchase,
          estado,
          updatedAt: nowIso,
          timeline: nextTimeline,
        };
      })
    );

    const updated = this.data().find((purchase) => purchase.id === id);
    return updated ? clonePurchase(updated) : null;
  }

  getSuppliers(): string[] {
    const suppliers = new Set(this.data().map((purchase) => purchase.proveedor));
    return Array.from(suppliers).sort((a, b) => a.localeCompare(b));
  }
}

const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'PO-24001',
    folio: 'PO-24001',
    proveedor: 'Motorparts Guatemala',
    warehouse: 'Bodega Central',
    moneda: 'GTQ',
    total: 18650,
    estado: 'en-transito',
    pagoEstado: 'parcial',
    metodoPago: 'credito',
    fecha: '2024-02-02T09:00:00Z',
    llegadaEstimada: '2024-02-09T15:00:00Z',
    notas: 'Solicitar inspección de piezas al recibirlas.',
    createdBy: 'María Flores',
    updatedAt: '2024-02-05T14:20:00Z',
    items: [
      {
        sku: 'FREN-8401',
        nombre: 'Kit de frenos cerámicos',
        categoria: 'Frenos',
        cantidad: 24,
        recibido: 0,
        costoUnitario: 345,
        fechaEsperada: '2024-02-08T00:00:00Z',
      },
      {
        sku: 'AMOR-2230',
        nombre: 'Amortiguador trasero',
        categoria: 'Suspensión',
        cantidad: 32,
        recibido: 12,
        costoUnitario: 410,
        fechaEsperada: '2024-02-10T00:00:00Z',
      },
      {
        sku: 'ACEI-9981',
        nombre: 'Aceite sintético 5W-30',
        categoria: 'Lubricantes',
        cantidad: 180,
        recibido: 0,
        costoUnitario: 68,
        fechaEsperada: '2024-02-09T00:00:00Z',
      },
    ],
    timeline: [
      { estado: 'borrador', fecha: '2024-02-01T12:10:00Z', descripcion: 'Solicitud inicial creada.' },
      { estado: 'ordenado', fecha: '2024-02-01T16:45:00Z', descripcion: 'Orden enviada al proveedor.' },
      { estado: 'en-transito', fecha: '2024-02-05T14:20:00Z', descripcion: 'Proveedor despachó la orden.' },
    ],
    documentos: [
      { tipo: 'Orden de compra', referencia: 'PO-24001.pdf' },
      { tipo: 'Factura proforma', referencia: 'FP-5521.pdf' },
    ],
  },
  {
    id: 'PO-24002',
    folio: 'PO-24002',
    proveedor: 'Distribuidora Andina',
    warehouse: 'Bodega Zona 5',
    moneda: 'GTQ',
    total: 9450,
    estado: 'ordenado',
    pagoEstado: 'pendiente',
    metodoPago: 'transferencia',
    fecha: '2024-02-06T10:30:00Z',
    llegadaEstimada: '2024-02-17T00:00:00Z',
    notas: 'Confirmar compatibilidad de piezas con línea Hyundai.',
    createdBy: 'Luis Pérez',
    updatedAt: '2024-02-06T10:30:00Z',
    items: [
      {
        sku: 'BUJI-4420',
        nombre: 'Juego de bujías platino',
        categoria: 'Motor',
        cantidad: 60,
        recibido: 0,
        costoUnitario: 95,
        fechaEsperada: '2024-02-16T00:00:00Z',
      },
      {
        sku: 'FILT-7722',
        nombre: 'Filtro de aire premium',
        categoria: 'Filtros',
        cantidad: 40,
        recibido: 0,
        costoUnitario: 68,
        fechaEsperada: '2024-02-17T00:00:00Z',
      },
    ],
    timeline: [
      { estado: 'borrador', fecha: '2024-02-05T08:15:00Z', descripcion: 'Requisición creada desde ventas.' },
      { estado: 'ordenado', fecha: '2024-02-06T10:30:00Z', descripcion: 'Compra aprobada y enviada.' },
    ],
    documentos: [{ tipo: 'Orden de compra', referencia: 'PO-24002.pdf' }],
  },
  {
    id: 'PO-23988',
    folio: 'PO-23988',
    proveedor: 'Repuestos Express',
    warehouse: 'Bodega Central',
    moneda: 'GTQ',
    total: 7240,
    estado: 'recibido',
    pagoEstado: 'pagado',
    metodoPago: 'contado',
    fecha: '2024-01-18T14:40:00Z',
    llegadaEstimada: '2024-01-23T00:00:00Z',
    notas: 'Todo recibido sin incidencias.',
    createdBy: 'María Flores',
    updatedAt: '2024-01-22T09:05:00Z',
    items: [
      {
        sku: 'BALA-8820',
        nombre: 'Banda de distribución',
        categoria: 'Motor',
        cantidad: 18,
        recibido: 18,
        costoUnitario: 210,
        fechaEsperada: '2024-01-22T00:00:00Z',
      },
      {
        sku: 'BATE-3309',
        nombre: 'Batería AGM 70Ah',
        categoria: 'Eléctrico',
        cantidad: 10,
        recibido: 10,
        costoUnitario: 320,
        fechaEsperada: '2024-01-22T00:00:00Z',
      },
    ],
    timeline: [
      { estado: 'borrador', fecha: '2024-01-15T09:00:00Z' },
      { estado: 'ordenado', fecha: '2024-01-15T11:20:00Z' },
      { estado: 'en-transito', fecha: '2024-01-20T08:00:00Z' },
      { estado: 'recibido', fecha: '2024-01-22T09:05:00Z', descripcion: 'Mercadería ingresada a inventario.' },
    ],
    documentos: [
      { tipo: 'Orden de compra', referencia: 'PO-23988.pdf' },
      { tipo: 'Factura', referencia: 'FE-8872.pdf' },
    ],
  },
  {
    id: 'PO-23994',
    folio: 'PO-23994',
    proveedor: 'Partes y Más',
    warehouse: 'Bodega Occidente',
    moneda: 'GTQ',
    total: 5120,
    estado: 'cancelado',
    pagoEstado: 'pendiente',
    metodoPago: 'transferencia',
    fecha: '2024-01-25T12:15:00Z',
    llegadaEstimada: '2024-02-02T00:00:00Z',
    notas: 'Proveedor sin disponibilidad. Orden cancelada.',
    createdBy: 'Luis Pérez',
    updatedAt: '2024-01-26T10:00:00Z',
    items: [
      {
        sku: 'FARO-7120',
        nombre: 'Faros LED alta luminosidad',
        categoria: 'Iluminación',
        cantidad: 20,
        recibido: 0,
        costoUnitario: 256,
        fechaEsperada: '2024-02-02T00:00:00Z',
      },
    ],
    timeline: [
      { estado: 'borrador', fecha: '2024-01-24T16:00:00Z' },
      { estado: 'ordenado', fecha: '2024-01-25T12:15:00Z' },
      { estado: 'cancelado', fecha: '2024-01-26T10:00:00Z', descripcion: 'Proveedor notificó falta de stock.' },
    ],
    documentos: [{ tipo: 'Orden de compra', referencia: 'PO-23994.pdf' }],
  },
  {
    id: 'PO-24005',
    folio: 'PO-24005',
    proveedor: 'Global Autoparts',
    warehouse: 'Bodega Central',
    moneda: 'USD',
    total: 12680,
    estado: 'borrador',
    pagoEstado: 'pendiente',
    metodoPago: 'credito',
    fecha: '2024-02-12T08:30:00Z',
    llegadaEstimada: '2024-02-25T00:00:00Z',
    notas: 'Revisar lista de precios antes de enviar orden definitiva.',
    createdBy: 'María Flores',
    updatedAt: '2024-02-12T08:30:00Z',
    items: [
      {
        sku: 'DISCO-6611',
        nombre: 'Disco de freno ventilado',
        categoria: 'Frenos',
        cantidad: 40,
        recibido: 0,
        costoUnitario: 180,
        fechaEsperada: '2024-02-24T00:00:00Z',
      },
      {
        sku: 'SENS-4218',
        nombre: 'Sensor ABS trasero',
        categoria: 'Eléctrico',
        cantidad: 35,
        recibido: 0,
        costoUnitario: 145,
        fechaEsperada: '2024-02-25T00:00:00Z',
      },
    ],
    timeline: [
      { estado: 'borrador', fecha: '2024-02-12T08:30:00Z', descripcion: 'Solicitud creada desde inventario.' },
    ],
    documentos: [],
  },
];
