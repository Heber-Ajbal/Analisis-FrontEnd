// src/app/core/services/inventory.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductApi, mapApiToProduct } from '../../models/inventory/inventory.models';

type ProductsResponse = {
  data: ProductApi[];
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
};

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private API = environment.apiBaseUrl; // p.ej. http://localhost:1337

  /**
   * Server-side filters (Strapi):
   * - q: busca por name o code
   * - categoria: por type
   * - page, pageSize: paginación
   */
  async list(opts: { q?: string; categoria?: string | null; page?: number; pageSize?: number } = {})
  : Promise<{ rows: Product[]; total: number; page: number; pageSize: number; pageCount: number }> {
    let params = new HttpParams();

    // Búsqueda (containsi en name/code)
    if (opts.q) {
      params = params
        .set('filters[$or][0][name][$containsi]', opts.q)
        .set('filters[$or][1][code][$containsi]', opts.q);
    }

    // Filtro por categoría (type)
    if (opts.categoria) params = params.set('filters[type][$eq]', opts.categoria);

    // Paginación
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 25;
    params = params
      .set('pagination[page]', page)
      .set('pagination[pageSize]', pageSize)
      .set('sort', 'createdAt:desc');

    const res = await firstValueFrom(
      this.http.get<ProductsResponse>(`${this.API}/products`)
    );

    const rows = (res.data ?? []).map(mapApiToProduct);
    const meta = res.meta?.pagination ?? { page, pageSize, pageCount: 1, total: rows.length };

    return { rows, total: meta.total, page: meta.page, pageSize: meta.pageSize, pageCount: meta.pageCount };
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
      }
    };
    const res = await firstValueFrom(
      this.http.post<{ data: ProductApi }>(`${this.API}/products`, body)
    );
    return mapApiToProduct(res.data);
  }

  async update(id: number | string, p: {
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
      }
    };
    const res = await firstValueFrom(
      this.http.put<{ data: ProductApi }>(`${this.API}/products/${id}`, body)
    );
    return mapApiToProduct(res.data);
  }
}