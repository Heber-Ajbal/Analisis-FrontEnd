// ============================================================================
// INVENTORY MODELS
// Product data structures and API mapping utilities
// ============================================================================

/**
 * Raw product data structure from Strapi API
 * @interface ProductApi
 */
export interface ProductApi {
  readonly id: number;
  readonly documentId: string;
  code: string;
  name: string;
  description?: string | null;
  vendorCode?: string;
  salePrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/**
 * Product status types
 */
export type ProductStatus = 'activo' | 'inactivo' | 'bajo-stock';

/**
 * Transformed product model for UI consumption
 * @interface Product
 */
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
  imagenUrl?: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_STOCK = 0;
const DEFAULT_MIN_STOCK = 0;
const DEFAULT_PRICE = 0;

// ============================================================================
// MAPPER FUNCTIONS
// ============================================================================

/**
 * Determines product status based on stock levels
 * @param stock - Current stock level
 * @param minimo - Minimum stock threshold
 * @returns Product status
 */
const determineProductStatus = (stock: number, minimo: number): ProductStatus => {
  if (stock <= 0) return 'inactivo';
  if (stock <= minimo) return 'bajo-stock';
  return 'activo';
};

/**
 * Extracts the best available price from API data
 * Priority: retailPrice > salePrice > default
 * @param apiProduct - Product data from API
 * @returns Best available price
 */
const extractPrice = (apiProduct: ProductApi): number => {
  return apiProduct.retailPrice ?? apiProduct.salePrice ?? DEFAULT_PRICE;
};

/**
 * Maps API product data to internal Product model
 * @param apiProduct - Raw product data from Strapi API
 * @returns Transformed product for UI
 * 
 * @example
 * const product = mapApiToProduct(apiData);
 * console.log(product.estado); // 'activo' | 'inactivo' | 'bajo-stock'
 */
export function mapApiToProduct(apiProduct: ProductApi): Product {
  const precio = extractPrice(apiProduct);
  const stock = DEFAULT_STOCK; // TODO: Connect to real stock endpoint
  const minimo = DEFAULT_MIN_STOCK; // TODO: Connect to minimum stock configuration
  const estado = determineProductStatus(stock, minimo);

  return {
    id: apiProduct.id,
    documentId: apiProduct.documentId,
    sku: apiProduct.code,
    nombre: apiProduct.name,
    description: apiProduct.description ?? '',
    categoria: apiProduct.type ?? null,
    proveedor: apiProduct.vendorCode ?? null,
    precio,
    stock,
    minimo,
    estado,
    imagenUrl: null, // TODO: Add populate=imagen in Strapi query
  };
}

/**
 * Maps multiple API products to internal Product models
 * @param apiProducts - Array of raw product data
 * @returns Array of transformed products
 */
export function mapApiToProducts(apiProducts: ProductApi[]): Product[] {
  return apiProducts.map(mapApiToProduct);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Checks if a product is low on stock
 * @param product - Product to check
 * @returns True if product stock is at or below minimum
 */
export function isLowStock(product: Product): boolean {
  return product.estado === 'bajo-stock';
}

/**
 * Checks if a product is inactive
 * @param product - Product to check
 * @returns True if product is inactive
 */
export function isInactive(product: Product): boolean {
  return product.estado === 'inactivo';
}

/**
 * Checks if a product is available for sale
 * @param product - Product to check
 * @returns True if product has stock and is active
 */
export function isAvailable(product: Product): boolean {
  return product.estado === 'activo' && product.stock > 0;
}