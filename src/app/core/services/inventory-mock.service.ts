import { Injectable, signal } from '@angular/core';
import { Product, StockMovement } from '../../models/inventory/inventory.models';


@Injectable({ providedIn: 'root' })
export class InventoryMockService {
private _products = signal<Product[]>([
{ id: '1', sku: 'A-001', nombre: 'Teclado Mecánico', categoria: 'Periféricos', proveedor: 'Logi', precio: 55, stock: 45, minimo: 10, estado: 'activo', actualizado: new Date().toISOString() },
{ id: '2', sku: 'A-014', nombre: 'Mouse Inalámbrico', categoria: 'Periféricos', proveedor: 'Logi', precio: 25, stock: 33, minimo: 12, estado: 'activo', actualizado: new Date().toISOString() },
{ id: '3', sku: 'B-203', nombre: 'Silla Ergonómica', categoria: 'Mobiliario', proveedor: 'Ergo', precio: 199, stock: 12, minimo: 8, estado: 'activo', actualizado: new Date().toISOString() },
{ id: '4', sku: 'C-110', nombre: 'Monitor 27"', categoria: 'Monitores', proveedor: 'AOC', precio: 299, stock: 8, minimo: 10, estado: 'bajo-stock', actualizado: new Date().toISOString() },
{ id: '5', sku: 'D-090', nombre: 'Hub USB-C', categoria: 'Accesorios', proveedor: 'Anker', precio: 39, stock: 67, minimo: 15, estado: 'activo', actualizado: new Date().toISOString() },
]);


products() { return this._products(); }
setProducts(v: Product[]) { this._products.set(v); }


upsert(p: Product) {
const list = [...this._products()];
const idx = list.findIndex(x => x.id === p.id);
if (idx >= 0) list[idx] = p; else list.unshift({ ...p, id: crypto.randomUUID() });
this._products.set(list);
}


remove(ids: string[]) {
this._products.set(this._products().filter(p => !ids.includes(p.id)));
}


mockMovements(productId: string): StockMovement[] {
return [
{ id: 'm1', productId, tipo: 'entrada', cantidad: 10, referencia: 'OC-1203', fecha: new Date().toISOString() },
{ id: 'm2', productId, tipo: 'salida', cantidad: 3, referencia: 'FAC-9912', fecha: new Date().toISOString() },
{ id: 'm3', productId, tipo: 'ajuste', cantidad: -1, referencia: 'AJ-01', fecha: new Date().toISOString() },
];
}
}