import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InventoryService } from '../../core/services/inventory.service';
import { Product as InventoryProduct } from '../../models/inventory/inventory.models';
import { CartService } from '../cart/cart.service';

type Sort = 'relevance' | 'priceAsc' | 'priceDesc';
type PriceGroup = { min: FormControl<number>; max: FormControl<number> };
type FiltersForm = {
  q: FormControl<string>;
  categories: FormControl<string[]>;
  brands: FormControl<string[]>;
  sort: FormControl<Sort>;
  price: FormGroup<PriceGroup>;
};

interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  inStock: boolean;
}

const PLACEHOLDER_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoNdNAZA1LdVWNmBBzxXCqLUodt3FVsQsXVw&s',
  'https://neumarket.com.mx/cdn/shop/files/pilot-sport-ps3_23_1_1_1_20_1200x1200.jpg?v=1716688653',
  'https://euromoys.gt/wp-content/uploads/2024/06/BUJE-MULETA-BMW-F21-F20-F30-F31-31126855743-20940496.jpg',
  'https://images.rewise.ai/processed/legos/m/74a4d9e7_fusible1.png',
  'https://www.pgfilters.com/wp-content/uploads/2023/02/What-is-the-Oil-Filters-Primary-Job_-1000x675-1.jpg',
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  allProducts: CatalogProduct[] = [];

  categories: string[] = [];
  brands: string[] = [];
  minPrice = 0;
  maxPrice = 0;

  filters!: FormGroup<FiltersForm>;

  loading = false;
  error: string | null = null;
  showFiltersMobile = false;

  filtered: CatalogProduct[] = [];
  paged: CatalogProduct[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 9;
  skeletons = Array.from({ length: this.pageSize });

  brandSearch = new FormControl('', { nonNullable: true });
  maxBrandsCollapsed = 12;
  showAllBrands = false;

  private fallbackStockMap = new Map<string, number>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventory: InventoryService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    this.filters = this.fb.group<FiltersForm>({
      q: this.fb.control('', { nonNullable: true }),
      categories: this.fb.control<string[]>([], { nonNullable: true }),
      brands: this.fb.control<string[]>([], { nonNullable: true }),
      sort: this.fb.control<Sort>('relevance', { nonNullable: true }),
      price: this.fb.group<PriceGroup>({
        min: this.fb.control(this.minPrice, { nonNullable: true }),
        max: this.fb.control(this.maxPrice, { nonNullable: true }),
      }),
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      const cat = params.get('cat') ?? params.get('category');
      const categories = cat ? [cat] : (this.filters.controls.categories.value ?? []);
      this.filters.patchValue({ q, categories }, { emitEvent: false });
      this.applyFilters(true);
    });

    this.filters.valueChanges.subscribe(() => this.applyFilters());

    void this.loadProducts();
  }

  get filteredBrands(): string[] {
    const q = this.brandSearch.value.trim().toLowerCase();
    const base = this.brands.filter((b) => b.toLowerCase().includes(q));
    return this.showAllBrands ? base : base.slice(0, this.maxBrandsCollapsed);
  }

  onBrandChip(brand: string, selected: boolean) {
    const ctrl = this.filters.controls.brands;
    const set = new Set(ctrl.value ?? []);
    selected ? set.add(brand) : set.delete(brand);
    ctrl.setValue(Array.from(set));
  }

  clearBrandsSelection() {
    this.filters.controls.brands.setValue([]);
  }

  clearBrandSearch() {
    this.brandSearch.setValue('');
  }

  async loadProducts(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const { rows } = await this.inventory.list({ pageSize: 200 });
      this.allProducts = rows.map((product) => this.mapToCatalogProduct(product));
      this.refreshMetadata();
      this.applyFilters(true);
    } catch (err) {
      console.error('Error al cargar el catálogo', err);
      this.error = 'No fue posible cargar el catálogo. Intenta de nuevo más tarde.';
      this.allProducts = [];
      this.filtered = [];
      this.paged = [];
      this.total = 0;
      this.loading = false;
    }
  }

  private mapToCatalogProduct(product: InventoryProduct): CatalogProduct {
    const fallbackId = product.documentId ?? `product-${product.id ?? Date.now()}`;
    const id = String(product.id ?? fallbackId);
    const name = product.nombre || 'Producto sin nombre';
    const brand = (product.proveedor || 'Genérico').trim();
    const category = (product.categoria || 'otros').trim().toLowerCase();
    const description = product.description || 'Sin descripción disponible.';
    const price = Number.isFinite(product.precio) ? Number(product.precio) : 0;
    const hasBackendStock = typeof product.stock === 'number' && product.stock > 0;
    const stock = hasBackendStock ? product.stock : this.getFallbackStock(id);
    const status = hasBackendStock ? product.estado ?? 'activo' : 'activo';
    const inStock = status !== 'inactivo' && stock > 0;
    const image = product.imagenUrl || this.getPlaceholderImage(id);

    return {
      id,
      name,
      brand,
      category,
      description,
      price,
      image,
      stock,
      inStock,
    };
  }

  private getPlaceholderImage(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const index = hash % PLACEHOLDER_IMAGES.length;
    return PLACEHOLDER_IMAGES[index];
  }

  private getFallbackStock(seed: string): number {
    const existing = this.fallbackStockMap.get(seed);
    if (existing !== undefined) {
      return existing;
    }

    const usedValues = new Set(this.fallbackStockMap.values());
    let attempts = 0;
    let generated = 0;

    do {
      generated = Math.floor(Math.random() * 20) + 5; // 5 - 24 unidades
      attempts += 1;
      if (!usedValues.has(generated) || attempts > 10) {
        break;
      }
    } while (true);

    this.fallbackStockMap.set(seed, generated);
    return generated;
  }

  private refreshMetadata(): void {
    this.categories = Array.from(new Set(this.allProducts.map((p) => p.category))).sort();
    this.brands = Array.from(new Set(this.allProducts.map((p) => p.brand))).sort();

    if (this.allProducts.length) {
      this.minPrice = Math.floor(Math.min(...this.allProducts.map((p) => p.price)));
      this.maxPrice = Math.ceil(Math.max(...this.allProducts.map((p) => p.price)));
    } else {
      this.minPrice = 0;
      this.maxPrice = 0;
    }

    this.filters.controls.price.patchValue(
      { min: this.minPrice, max: this.maxPrice },
      { emitEvent: false }
    );
    this.skeletons = Array.from({ length: this.pageSize });
  }

  applyFilters(resetPage = false): void {
    if (!this.allProducts.length) {
      this.filtered = [];
      this.paged = [];
      this.total = 0;
      this.loading = false;
      return;
    }

    this.loading = true;

    const v = this.filters.getRawValue();
    const qn = (v.q ?? '').trim().toLowerCase();
    const cats = new Set(v.categories ?? []);
    const brs = new Set(v.brands ?? []);
    const { min, max } = v.price;

    let result = this.allProducts.filter((p) => {
      const okQ =
        !qn ||
        [p.name, p.description, p.brand, p.category].some((t) =>
          t.toLowerCase().includes(qn)
        );
      const okCat = !cats.size || cats.has(p.category);
      const okBr = !brs.size || brs.has(p.brand);
      const okPr = p.price >= (min ?? this.minPrice) && p.price <= (max ?? this.maxPrice);
      return okQ && okCat && okBr && okPr;
    });

    if (v.sort === 'priceAsc') result = [...result].sort((a, b) => a.price - b.price);
    if (v.sort === 'priceDesc') result = [...result].sort((a, b) => b.price - a.price);

    this.filtered = result;
    this.total = result.length;

    if (resetPage) this.pageIndex = 0;
    this.slicePage();

    setTimeout(() => (this.loading = false), 120);
  }

  slicePage(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paged = this.filtered.slice(start, end);
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.skeletons = Array.from({ length: this.pageSize });
    this.slicePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleBrand(brand: string, checked: boolean) {
    const ctrl = this.filters.controls.brands;
    const set = new Set(ctrl.value ?? []);
    checked ? set.add(brand) : set.delete(brand);
    ctrl.setValue(Array.from(set));
  }

  toggleCategory(cat: string, checked: boolean) {
    const ctrl = this.filters.controls.categories;
    const set = new Set(ctrl.value ?? []);
    checked ? set.add(cat) : set.delete(cat);
    ctrl.setValue(Array.from(set));
  }

  clearAll() {
    this.filters.reset({
      q: '',
      categories: [],
      brands: [],
      sort: 'relevance',
      price: { min: this.minPrice, max: this.maxPrice },
    } as any);
    this.brandSearch.setValue('');
  }

  applyAndPersist() {
    const v = this.filters.getRawValue();
    const qp: any = {};
    if (v.q) qp.q = v.q;
    if (v.categories?.length) qp.cat = v.categories[0];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qp,
      queryParamsHandling: 'merge',
    });
    this.applyFilters(true);
  }

  addToCart(product: CatalogProduct) {
    if (!product.inStock) {
      this.snackBar.open('Este producto no está disponible actualmente.', undefined, {
        duration: 2500,
      });
      return;
    }

    this.cartService.addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      stock: product.stock,
      compatibility: product.category,
    });

    const snackRef = this.snackBar.open(`${product.name} agregado al carrito`, 'Ver carrito', {
      duration: 3000,
    });

    snackRef.onAction().subscribe(() => this.router.navigate(['/carrito']));
  }
}
