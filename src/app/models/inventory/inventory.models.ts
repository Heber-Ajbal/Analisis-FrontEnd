// src/app/models/inventory/inventory.models.ts
export interface ProductApi {
  id: number;
  documentId: string;
  code: string;
  name: string;
  description: string;
  vendorCode?: string;
  salePrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Product {
  id: number | string;
  documentId: string;
  sku: string;
  nombre: string;  
  description: string;
  categoria: string | null;
  proveedor: string | null;
  precio: number;
  stock: number;      // por ahora mock
  minimo: number;     // por ahora mock
  estado: 'activo' | 'inactivo' | 'bajo-stock'; // por ahora derivado de stock
  imagenUrl?: string | null;
}

// Mapeo desde API → vista
export function mapApiToProduct(p: ProductApi): Product {
  const precio = p.retailPrice ?? p.salePrice ?? 0;
  const stock = 0;      // TODO: reemplazar cuando el API lo exponga
  const minimo = 0;     // TODO
  const estado: Product['estado'] =
    stock <= 0 ? 'inactivo' : (stock <= minimo ? 'bajo-stock' : 'activo');

  return {
    id: p.id,
    sku: p.code,
    documentId: p.documentId,   
    nombre: p.name,
    categoria: p.type ?? null,
    proveedor: p.vendorCode ?? null,
    description: p.description,
    precio,
    stock,
    minimo,
    estado,
    imagenUrl: null, // TODO: cuando tengas media en Strapi (populate=imagen)
  };
}
