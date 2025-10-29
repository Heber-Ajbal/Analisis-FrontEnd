// src/app/core/services/inventory.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductApi,
  determineProductStatus,
  mapApiToProduct,
} from '../../models/inventory/inventory.models';

type InventoryItemApi = {
  id: number;
  documentId?: string;
  quantity?: number;
  stock_status?: string | null;
  last_updated?: string | null;
  vendor?: string | null;
  product?: ProductApi | null;
};

type InventoryListResponse = {
  message?: string;
  total?: number;
  data?: InventoryItemApi[];
};

type ProductsResponse = {
  data: ProductApi[];
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
};

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  // p.ej. http://localhost:1337/api  (con /api)
  private API = environment.apiBaseUrl;

  /**
   * Server-side filters (Strapi):
   * - q: busca por name o code
   * - categoria: por type
   * - page, pageSize: paginación
   */
  async list(
    opts: { q?: string; categoria?: string | null; page?: number; pageSize?: number } = {}
  ): Promise<{ rows: Product[]; total: number; page: number; pageSize: number; pageCount: number }> {
    let params = new HttpParams();

    // Búsqueda (containsi en name/code)
    if (opts.q) {
      params = params
        .set('filters[$or][0][name][$containsi]', opts.q)
        .set('filters[$or][1][code][$containsi]', opts.q);
    }

    // Filtro por categoría (type)
    if (opts.categoria) params = params.set('filters[type][$eq]', String(opts.categoria));

    // Paginación
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 25;

    params = params
      .set('pagination[page]', page)
      .set('pagination[pageSize]', pageSize)
      .set('sort', 'createdAt:desc')
      // 👇 IMPORTANTE: trae la media para poder construir imagenUrl
      .set('populate', 'referenceImage');

    const [productsRes, inventoryRes] = await Promise.all([
      firstValueFrom(this.http.get<ProductsResponse>(`${this.API}/products`, { params })),
      this.fetchInventorySnapshot(),
    ]);

    const inventoryByProduct = new Map<number, InventoryItemApi>();
    for (const item of inventoryRes.data ?? []) {
      const productId = item?.product?.id;
      if (typeof productId === 'number') {
        inventoryByProduct.set(productId, item);
      }
    }

    const rows = (productsRes.data ?? []).map((apiProduct) => {
      const base = mapApiToProduct(apiProduct);
      const productId = Number(base.id);
      const inventory = Number.isFinite(productId) ? inventoryByProduct.get(productId) : undefined;

      if (!inventory) {
        return base;
      }

      const quantity = Number(inventory.quantity ?? 0);
      const minimo = base.minimo ?? 0;
      const status = inventory.stock_status ?? null;
      const estado = this.mapStockStatusToProductStatus(status, quantity, minimo);

      return {
        ...base,
        stock: Number.isFinite(quantity) ? quantity : base.stock,
        minimo,
        estado,
        proveedor: base.proveedor ?? inventory.vendor ?? null,
        inventoryId: inventory.id,
        inventoryDocumentId: inventory.documentId ?? null,
        stockStatus: status,
        lastUpdated: inventory.last_updated ?? null,
      };
    });

    const meta = productsRes.meta?.pagination ?? { page, pageSize, pageCount: 1, total: rows.length };

    return {
      rows,
      total: meta.total,
      page: meta.page,
      pageSize: meta.pageSize,
      pageCount: meta.pageCount,
    };
  }

  private fetchInventorySnapshot(): Promise<InventoryListResponse> {
    return firstValueFrom(
      this.http.get<InventoryListResponse>(`${this.API}/bulkloadinventory/all`)
    ).catch(() => ({ data: [], total: 0 } as InventoryListResponse));
  }

  private mapStockStatusToProductStatus(
    status: string | null,
    quantity: number,
    minimo: number
  ): Product['estado'] {
    switch (status) {
      case 'in_stock':
        return 'activo';
      case 'low_stock':
        return 'bajo-stock';
      case 'out_of_stock':
      case 'no_stock':
        return 'inactivo';
      default:
        return determineProductStatus(quantity, minimo);
    }
  }

  async createInventoryRecord(entry: {
    productId: number;
    quantity: number;
    vendor?: string | null;
  }): Promise<void> {
    const quantity = Math.max(0, Math.trunc(entry.quantity ?? 0));
    const vendor = (entry.vendor ?? '').trim();

    await firstValueFrom(
      this.http.post(`${this.API}/bulkloadinventory/createOne`, {
        product: entry.productId,
        quantity,
        vendor,
      })
    );
  }

  async create(p: {
    sku: string;
    nombre: string;
    categoria: string | null;
    proveedor: string | null;
    precio: number;
    description?: string | null;
  }): Promise<Product> {
    const body = {
      data: {
        code: p.sku,
        name: p.nombre,
        vendorCode: p.proveedor ?? undefined,
        retailPrice: p.precio,
        type: p.categoria ?? undefined,
        description: p.description ?? undefined,
      },
    };

    const res = await firstValueFrom(
      this.http.post<{ data: ProductApi }>(`${this.API}/products`, body, {
        params: new HttpParams().set('populate', 'referenceImage'),
      })
    );

    return mapApiToProduct(res.data);
  }

  async update(
    id: number | string,
    p: {
      sku: string;
      nombre: string;
      categoria: string | null;
      proveedor: string | null;
      precio: number;
      description?: string | null;
    }
  ): Promise<Product> {
    const body = {
      data: {
        code: p.sku,
        name: p.nombre,
        vendorCode: p.proveedor ?? undefined,
        retailPrice: p.precio,
        type: p.categoria ?? undefined,
        description: p.description ?? undefined,
      },
    };

    const res = await firstValueFrom(
      this.http.put<{ data: ProductApi }>(`${this.API}/products/${id}`, body, {
        params: new HttpParams().set('populate', 'referenceImage'),
      })
    );

    return mapApiToProduct(res.data);
  }
}
