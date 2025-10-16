// src/app/models/purchases/purchase.models.ts

export type PurchaseStatus =
  | 'borrador'
  | 'ordenado'
  | 'en-transito'
  | 'recibido'
  | 'cancelado';

export type PaymentStatus = 'pendiente' | 'parcial' | 'pagado';

export interface PurchaseItem {
  sku: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  recibido: number;
  costoUnitario: number;
  fechaEsperada?: string;
}

export interface PurchaseTimelineEntry {
  estado: PurchaseStatus;
  fecha: string;
  descripcion?: string;
}

export interface PurchaseDocument {
  tipo: string;
  referencia: string;
  url?: string;
}

export interface Purchase {
  id: string;
  folio: string;
  proveedor: string;
  warehouse: string;
  moneda: string;
  total: number;
  estado: PurchaseStatus;
  pagoEstado: PaymentStatus;
  metodoPago: 'contado' | 'credito' | 'transferencia';
  fecha: string;
  llegadaEstimada?: string;
  notas?: string;
  createdBy: string;
  updatedAt: string;
  items: PurchaseItem[];
  timeline: PurchaseTimelineEntry[];
  documentos?: PurchaseDocument[];
}

export function clonePurchase(p: Purchase): Purchase {
  return {
    ...p,
    items: p.items.map((item) => ({ ...item })),
    timeline: p.timeline.map((step) => ({ ...step })),
    documentos: p.documentos?.map((doc) => ({ ...doc })),
  };
}
