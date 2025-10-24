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
   * Obtiene todos los productos. La paginación y los filtros se manejan en el frontend.
   */
  async list(): Promise<Product[]> {
    const params = new HttpParams()
      .set('pagination[page]', '1')
      .set('pagination[pageSize]', '-1')
      .set('sort', 'createdAt:desc');

    const res = await firstValueFrom(
      this.http.get<ProductsResponse>(`${this.API}/products`, { params })
    );

    return (res.data ?? []).map(mapApiToProduct);
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
