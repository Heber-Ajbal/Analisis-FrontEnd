// src/app/core/services/inventory.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductApi,
  mapApiToProduct,
  mapApiToProducts,
} from '../../models/inventory/inventory.models';

type ProductsResponse = {
  data: ProductApi[];
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
};

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private API = environment.apiBaseUrl; // p.ej. http://localhost:1337

  /**
   * Obtiene todos los productos. La paginación y los filtros se manejan en el frontend.
   */
  async list(): Promise<Product[]> {
    const pageSize = 100;
    let page = 1;
    let pageCount = 1;
    const buffer: ProductApi[] = [];

    do {
      const params = new HttpParams()
        .set('pagination[page]', String(page))
        .set('pagination[pageSize]', String(pageSize))
        .set('sort', 'createdAt:desc');

      const res = await firstValueFrom(
        this.http.get<ProductsResponse>(`${this.API}/products`, { params })
      );

      const rows = res.data ?? [];
      buffer.push(...rows);

      const pagination = res.meta?.pagination;
      if (pagination) {
        pageCount = Math.max(pagination.pageCount ?? pageCount, page);
      }

      if (!pagination && rows.length < pageSize) {
        break;
      }

      page += 1;
    } while (page <= pageCount);

    return mapApiToProducts(buffer);
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
