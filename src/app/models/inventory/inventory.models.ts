// ============================================================================
// INVENTORY MODELS
// Product data structures and API mapping utilities
// ============================================================================

import { environment } from '../../../environments/environment';

// ============================================================================
// RAW API TYPES (Strapi)
// ============================================================================

/**
 * Raw product data structure from Strapi API
 * Puede venir aplanado (legacy) o dentro de `attributes` (Strapi v4)
 */
export interface ProductApi {
  readonly id: number;
  readonly documentId?: string;
  code?: string;
  name?: string;
  description?: string | null;
  vendorCode?: string | null;
  salePrice?: number | string | null;
  wholesalePrice?: number | string | null;
  retailPrice?: number | string | null;
  type?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  attributes?: ProductApiAttributes;
}

export interface ProductApiAttributes {
  documentId?: string;
  code?: string;
  name?: string;
  description?: string | null;
  vendorCode?: string | null;
  salePrice?: number | string | null;
  wholesalePrice?: number | string | null;
  retailPrice?: number | string | null;
  type?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;

  /** Media field en Strapi */
  referenceImage?: {
    data?: {
      id: number;
      attributes: {
        url: string; // puede venir relativo, ej. "/uploads/xxx.jpg"
        // ...otros metadatos de Strapi (mime, size, width, height, etc.)
      };
    } | null;
  };
}

// ============================================================================
// UI MODEL
// ============================================================================

/** Product status types */
export type ProductStatus = 'activo' | 'inactivo' | 'bajo-stock';

/** Transformed product model for UI consumption */
export interface Product {
  readonly id: number | string;
  readonly documentId: string;
  sku: string;
  nombre: string;
  description: string;
  categoria: string | null;
  proveedor: string | null;
  precio: number;
  stock: number;
  minimo: number;
  estado: ProductStatus;
  imagenUrl?: string | null; // URL absoluta
  /** Identificador del registro de inventario asociado (Strapi) */
  inventoryId?: number | string;
  /** DocumentId del registro de inventario asociado */
  inventoryDocumentId?: string | null;
  /** Estado crudo devuelto por el API de inventario (p. ej. `in_stock`) */
  stockStatus?: string | null;
  /** Fecha de última actualización del inventario */
  lastUpdated?: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_STOCK = 0;
const DEFAULT_MIN_STOCK = 0;
const DEFAULT_PRICE = 0;

// ============================================================================
// HELPERS
// ============================================================================

/** Convierte una URL relativa de Strapi en absoluta usando environment.apiBaseUrl */
function absUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  // environment.apiBaseUrl suele ser "http://localhost:1337/api"
  const base = (environment.apiBaseUrl || '').replace(/\/api\/?$/, '');
  return url.startsWith('http') ? url : `${base}${url}`;
}

/** Asegura un número desde posibles strings en Strapi */
function toNumber(n: number | string | null | undefined, fallback = 0): number {
  const v = typeof n === 'string' ? Number(n) : n;
  return Number.isFinite(v as number) ? (v as number) : fallback;
}

// ============================================================================
// MAPPER FUNCTIONS
// ============================================================================

/**
 * Determina el estado según stock/mínimo.
 */
export const determineProductStatus = (stock: number, minimo: number): ProductStatus => {
  if (stock <= 0) return 'inactivo';
  if (stock <= minimo) return 'bajo-stock';
  return 'activo';
};

/**
 * Extrae el mejor precio disponible.
 * Prioridad: retailPrice > salePrice > DEFAULT_PRICE
 */
const extractPrice = (src: ProductApiAttributes & ProductApi): number => {
  return toNumber(src.retailPrice, toNumber(src.salePrice, DEFAULT_PRICE));
};

/** Devuelve una vista unificada mezclando el nodo raíz con `attributes` */
const getPrimarySource = (apiProduct: ProductApi): ProductApiAttributes & ProductApi => {
  const attrs = apiProduct.attributes ?? {};
  return { ...apiProduct, ...attrs };
};

/**
 * Maps API product data to internal Product model
 */
export function mapApiToProduct(apiProduct: ProductApi): Product {
  const src = getPrimarySource(apiProduct);

  // Imagen desde media `referenceImage`
  const relative = src.referenceImage?.data?.attributes?.url ?? null;
  const imagenUrl = absUrl(relative) ?? null;

  const precio = extractPrice(src);
  const stock = DEFAULT_STOCK;       // TODO: integrar con endpoint real de stock
  const minimo = DEFAULT_MIN_STOCK;  // TODO: integrar configuración real
  const estado = determineProductStatus(stock, minimo);

  return {
    id: apiProduct.id,
    documentId: src.documentId ?? String(apiProduct.id),
    sku: src.code ?? '',
    nombre: src.name ?? '',
    description: src.description ?? '',
    categoria: src.type ?? null,
    proveedor: src.vendorCode ?? null,
    precio,
    stock,
    minimo,
    estado,
    imagenUrl, // 👈 ahora sí mapeado desde Strapi
    inventoryId: undefined,
    inventoryDocumentId: undefined,
    stockStatus: null,
    lastUpdated: null,
  };
}

/** Mapea un arreglo de productos */
export function mapApiToProducts(apiProducts: ProductApi[]): Product[] {
  return apiProducts.map(mapApiToProduct);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isLowStock(product: Product): boolean {
  return product.estado === 'bajo-stock';
}
export function isInactive(product: Product): boolean {
  return product.estado === 'inactivo';
}
export function isAvailable(product: Product): boolean {
  return product.estado === 'activo' && product.stock > 0;
}
