import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

type Category = { label: string; icon: string; slug: string };
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  inStock: boolean;
  badge?: 'Nuevo' | 'Promo' | 'Top';
};
type Store = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
  ],
})
export class HomeComponent implements OnInit {
  // --- UI state ---
  query = new FormControl('');
  usingLocation = false;
  userCoords: { lat: number; lng: number } | null = null;
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  // --- Catálogo / mock data ---
  categories: Category[] = [
    { label: 'Aceites', icon: 'oil_barrel', slug: 'aceites' },
    { label: 'Filtros', icon: 'filter_alt', slug: 'filtros' },
    { label: 'Frenos', icon: 'safety_check', slug: 'frenos' },
    { label: 'Baterías', icon: 'battery_charging_full', slug: 'baterias' },
    { label: 'Llantas', icon: 'trip_origin', slug: 'llantas' },
    { label: 'Motos', icon: 'two_wheeler', slug: 'motos' },
  ];

  promotions = [
    {
      title: 'Semana del Lubricante',
      subtitle: 'Hasta 30% OFF en marcas seleccionadas',
      image: 'https://img.freepik.com/fotos-premium/mecanico-automoviles-llena-aceite-motor-lubricante-fresco-garaje-automoviles-mantenimiento-automovil_41043-473.jpg',
      cta: 'Ver ofertas',
      qp: { promo: 'lubricantes' }, // <- query params
    },
    {
      title: 'Frenos seguros',
      subtitle: 'Kits de pastillas + discos',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw7atwOLr404KCYCMh9iLPpxoMgNIJD1UeR94OU2Wwt4azEF3TYCA9dZacZIIvW6PJ3yA&usqp=CAU',
      cta: 'Comprar ahora',
      qp: { cat: 'frenos' }, // <- query params
    },
  ];

  featured: Product[] = [
    {
      id: 'p1',
      name: 'Aceite sintético 5W-30 4L',
      price: 29.9,
      image: 'https://cdn.kemik.gt/2020/10/SUPERLITE-EUROL-5W-30-4L-1000X1000-1.jpg',
      rating: 4.6,
      category: 'aceites',
      inStock: true,
      badge: 'Top',
    },
    {
      id: 'p2',
      name: 'Filtro de aire universal',
      price: 14.5,
      image: 'https://m.media-amazon.com/images/I/61qBPfVuS4L.jpg',
      rating: 4.2,
      category: 'filtros',
      inStock: true,
      badge: 'Promo',
    },
    {
      id: 'p3',
      name: 'Pastillas de freno delanteras',
      price: 24.0,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81hewmtgV8L._AC_UL495_SR435,495_.jpg',
      rating: 4.8,
      category: 'frenos',
      inStock: true,
      badge: 'Nuevo',
    },
    {
      id: 'p4',
      name: 'Batería 12V 60Ah',
      price: 95.0,
      image: 'https://cdn.kemik.gt/2021/07/0986A00365-1000X1000-2.jpg',
      rating: 4.4,
      category: 'baterias',
      inStock: true,
    },
  ];

  stores: Store[] = [
    { id: 's1', name: 'Autopartes Centro', address: 'Av. Principal 123', lat: 4.651, lng: -74.061 },
    { id: 's2', name: 'Lubricantes Norte', address: 'Calle 80 #20-30', lat: 4.688, lng: -74.074 },
    { id: 's3', name: 'Moto Parts', address: 'Cra 15 #45-10', lat: 4.654, lng: -74.06 },
  ];

  nearby: Array<Store & { distanceKm: number }> = [];

  ngOnInit(): void {
    // Precargar resultados "cerca" si no hay ubicación
    this.nearby = this.stores.map((s) => ({ ...s, distanceKm: NaN }));
  }

  // Buscar -> /catalogo?q=...
  onSearch() {
    const q = (this.query.value ?? '').trim();
    this.router.navigate(['/catalogo'], { queryParams: q ? { q } : {} });
  }

  get filteredFeatured(): Product[] {
    const q = (this.query.value ?? '').trim().toLowerCase();
    if (!q) return this.featured;
    return this.featured.filter((p) =>
      [p.name, p.category].some((t) => t.toLowerCase().includes(q))
    );
  }

  useMyLocation(): void {
    if (!navigator.geolocation) return;
    this.usingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.nearby = this.stores
          .map((s) => ({
            ...s,
            distanceKm: this.haversineKm(this.userCoords!.lat, this.userCoords!.lng, s.lat, s.lng),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm);
        this.usingLocation = false;
      },
      () => {
        this.usingLocation = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  addToCart(p: Product) {
    // TODO: integrar con tu CartService real
    console.log('Añadido al carrito', p);
  }

  price(n: number) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n);
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // 0.1 km
  }

  stars(rating: number): number[] {
    return Array.from({ length: Math.round(rating) });
  }
}
