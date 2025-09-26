import { Injectable, signal } from '@angular/core';
import { Product } from '../../models/inventory/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryMockService {
  private _products = signal<Product[]>([
    {
      id: '1',
      sku: 'A-001',
      nombre: 'Teclado Mecánico',
      categoria: 'Periféricos',
      proveedor: 'Logi',
      precio: 55,
      stock: 45,
      minimo: 10,
      estado: 'activo',
      description:'',
      documentId:''
    },
    {
      id: '2',
      sku: 'A-014',
      nombre: 'Mouse Inalámbrico',
      categoria: 'Periféricos',
      proveedor: 'Logi',
      precio: 25,
      stock: 33,
      minimo: 12,
      estado: 'activo',
      description:'',
      documentId:''
    },
    {
      id: '3',
      sku: 'B-203',
      nombre: 'Silla Ergonómica',
      categoria: 'Mobiliario',
      proveedor: 'Ergo',
      precio: 199,
      stock: 12,
      minimo: 8,
      estado: 'activo',
      description:'',
      documentId:''
    },
    {
      id: '4',
      sku: 'C-110',
      nombre: 'Monitor 27"',
      categoria: 'Monitores',
      proveedor: 'AOC',
      precio: 299,
      stock: 8,
      minimo: 10,
      estado: 'bajo-stock',
      description:'',
      documentId:''
    },
    {
      id: '5',
      sku: 'D-090',
      nombre: 'Hub USB-C',
      categoria: 'Accesorios',
      proveedor: 'Anker',
      precio: 39,
      stock: 67,
      minimo: 15,
      estado: 'activo',
      description:'',
      documentId:''
    },
  ]);

  products() {
    return this._products();
  }
  setProducts(v: Product[]) {
    this._products.set(v);
  }

  upsert(p: Product) {
    const list = [...this._products()];
    const idx = list.findIndex((x) => x.id === p.id);
    if (idx >= 0) list[idx] = p;
    else list.unshift({ ...p, id: crypto.randomUUID() });
    this._products.set(list);
  }
}
