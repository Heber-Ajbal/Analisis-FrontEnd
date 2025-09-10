import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule }   from '@angular/material/slider';
import { MatSelectModule }   from '@angular/material/select';
import { MatFormFieldModule }from '@angular/material/form-field';
import { MatCardModule }     from '@angular/material/card';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule }  from '@angular/material/input';

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;    // 'aceites' | 'filtros' | 'frenos' | 'motores' ...
  description: string;
  price: number;
  image?: string;
  inStock: boolean;
};

type Sort = 'relevance' | 'priceAsc' | 'priceDesc';
type PriceGroup = { min: FormControl<number>; max: FormControl<number> };
type FiltersForm = {
  q: FormControl<string>;
  categories: FormControl<string[]>;
  brands: FormControl<string[]>;
  sort: FormControl<Sort>;
  price: FormGroup<PriceGroup>;
};

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatChipsModule,
    // Material
    MatCheckboxModule,
    MatSliderModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // --- Mock de productos (cámbialo luego por tu servicio/API) ---
  allProducts: Product[] = [
    { id:'1', name:'Filtro de aceite Honda', brand:'Honda', category:'filtros', description:'Compatible con Civic 2016-2020', price:24.99, image:'https://picsum.photos/seed/oil1/800/500', inStock:true },
    { id:'2', name:'Pastillas de freno Toyota', brand:'Toyota', category:'frenos', description:'Para Corolla y Camry', price:45.50, image:'https://picsum.photos/seed/brake1/800/500', inStock:true },
    { id:'3', name:'Bujías Hyundai', brand:'Hyundai', category:'motores', description:'Set de 4 para Elantra y Tucson', price:32.75, image:'https://picsum.photos/seed/plug1/800/500', inStock:true },
    { id:'4', name:'Filtro de aire Kia', brand:'Kia', category:'filtros', description:'Para Sportage y Sorento', price:19.99, image:'https://picsum.photos/seed/air1/800/500', inStock:true },
    { id:'5', name:'Kit distribución Honda', brand:'Honda', category:'motores', description:'Para Accord y CR-V', price:129.99, image:'https://picsum.photos/seed/timing1/800/500', inStock:true },
    { id:'6', name:'Discos de freno Toyota', brand:'Toyota', category:'frenos', description:'Par delantero para RAV4', price:89.50, image:'https://picsum.photos/seed/disc1/800/500', inStock:true },
    ...Array.from({length:18}).map((_,i)=>({
      id:`x${i}`, name:`Aceite sintético 5W-30 ${i+1}L`, brand:['Castrol','Shell','Mobil'][i%3],
      category:'aceites', description:'API SN/ILSAC GF-5', price: 18 + (i%5)*3.5,
      image:`https://picsum.photos/seed/lube${i}/800/500`, inStock:true
    }))
  ];

  // --- Derivados del dataset ---
  categories = Array.from(new Set(this.allProducts.map(p => p.category)));
  brands     = Array.from(new Set(this.allProducts.map(p => p.brand))).sort();
  minPrice   = Math.floor(Math.min(...this.allProducts.map(p => p.price)));
  maxPrice   = Math.ceil(Math.max(...this.allProducts.map(p => p.price)));

  // --- Typed forms ---
  filters!: FormGroup<FiltersForm>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Crear el formulario aquí (después de tener this.fb inyectado)
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

  // --- Estado de UI ---
  loading = false;
  showFiltersMobile = false;

  // --- Resultados / paginación ---
  filtered: Product[] = [];
  paged: Product[] = [];
  total = 0;
  pageIndex = 0;
  pageSize  = 9; // 3 columnas * 3 filas
  skeletons = Array.from({ length: this.pageSize });

  //marcas
  // Búsqueda de marcas y control de "mostrar más"
brandSearch = new FormControl('', { nonNullable: true });
maxBrandsCollapsed = 12;
showAllBrands = false;

// Lista filtrada de marcas (sin scroll)
get filteredBrands(): string[] {
  const q = this.brandSearch.value.toLowerCase();
  const base = this.brands.filter(b => b.toLowerCase().includes(q));
  return this.showAllBrands ? base : base.slice(0, this.maxBrandsCollapsed);
}

// Selección de chips (usa tu FormControl<string[]> de 'brands')
onBrandChip(brand: string, selected: boolean) {
  const ctrl = this.filters.controls.brands;
  const set  = new Set(ctrl.value ?? []);
  selected ? set.add(brand) : set.delete(brand);
  ctrl.setValue(Array.from(set));
}

clearBrandsSelection() {
  this.filters.controls.brands.setValue([]);
}

clearBrandSearch() {
  this.brandSearch.setValue('');
}

  ngOnInit(): void {
    // Leer query params iniciales (q, cat)
    this.route.queryParamMap.subscribe(params => {
      const q   = params.get('q') ?? '';
      const cat = params.get('cat') ?? params.get('category');
      const categories = cat ? [cat] : (this.filters.controls.categories.value ?? []);
      this.filters.patchValue({ q, categories }, { emitEvent: false });
      this.applyFilters(true);
    });

    // Re-aplicar al cambiar filtros
    this.filters.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(resetPage = false): void {
    this.loading = true;

    const v = this.filters.getRawValue();
    const qn   = (v.q ?? '').trim().toLowerCase();
    const cats = new Set(v.categories ?? []);
    const brs  = new Set(v.brands ?? []);
    const { min, max } = v.price;

    // Filtrado
    let result = this.allProducts.filter(p => {
      const okQ   = !qn || [p.name, p.description, p.brand, p.category].some(t => t.toLowerCase().includes(qn));
      const okCat = !cats.size || cats.has(p.category);
      const okBr  = !brs.size  || brs.has(p.brand);
      const okPr  = p.price >= (min ?? this.minPrice) && p.price <= (max ?? this.maxPrice);
      return okQ && okCat && okBr && okPr;
    });

    // Orden
    if (v.sort === 'priceAsc')  result = result.sort((a,b)=> a.price - b.price);
    if (v.sort === 'priceDesc') result = result.sort((a,b)=> b.price - a.price);

    this.filtered = result;
    this.total    = result.length;

    if (resetPage) this.pageIndex = 0;
    this.slicePage();

    setTimeout(()=> this.loading = false, 120);
  }

  slicePage(): void {
    const start = this.pageIndex * this.pageSize;
    const end   = start + this.pageSize;
    this.paged  = this.filtered.slice(start, end);
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize  = e.pageSize;
    this.skeletons = Array.from({ length: this.pageSize });
    this.slicePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleBrand(brand: string, checked: boolean) {
    const ctrl = this.filters.controls.brands;
    const set  = new Set(ctrl.value ?? []);
    checked ? set.add(brand) : set.delete(brand);
    ctrl.setValue(Array.from(set));
  }

  toggleCategory(cat: string, checked: boolean) {
    const ctrl = this.filters.controls.categories;
    const set  = new Set(ctrl.value ?? []);
    checked ? set.add(cat) : set.delete(cat);
    ctrl.setValue(Array.from(set));
  }

  clearAll() {
    this.filters.reset({
      q: '',
      categories: [],
      brands: [],
      sort: 'relevance',
      price: { min: this.minPrice, max: this.maxPrice }
    } as any);
  }

  applyAndPersist() {
    const v = this.filters.getRawValue();
    const qp: any = {};
    if (v.q) qp.q = v.q;
    if (v.categories?.length) qp.cat = v.categories[0]; // ej: 1 cat principal
    this.router.navigate([], { relativeTo: this.route, queryParams: qp, queryParamsHandling: 'merge' });
    this.applyFilters(true);
  }

  addToCart(p: Product) {
    console.log('Agregar al carrito', p);
  }
}
