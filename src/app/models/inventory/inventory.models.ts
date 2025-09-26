export interface Product {
id: string;
sku: string;
nombre: string;
categoria: string;
proveedor?: string;
precio: number;
stock: number;
minimo: number;
estado: 'activo' | 'inactivo' | 'bajo-stock';
imagenUrl?: string;
actualizado: string; // ISO date
}


export interface StockMovement {
id: string;
productId: string;
tipo: 'entrada' | 'salida' | 'ajuste';
cantidad: number;
referencia?: string;
fecha: string; // ISO
}