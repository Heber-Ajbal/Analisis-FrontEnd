// app.routes.ts
import { Routes } from '@angular/router';

// Features
import { LoginComponent }    from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ReviewComponent }   from './features/auth/review/review.component';
import { HomeComponent }     from './features/home/home.component';
import { AdminComponent }    from './features/admin/admin.component';
import { CatalogComponent }  from './features/catalog/catalog.component';
import { CartComponent }     from './features/cart/cart.component';
import { ProfileComponent }  from './features/profile/profile.component';

// ADMIN
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PurchaseManagementComponent } from './features/purchases/purchase-management.component';

// Guards
import { authGuard }   from './core/guards/auth.guard';
import { adminGuard }  from './core/guards/admin.guard';
import { reviewGuard } from './core/guards/review.guard';
import { guestGuard }  from './core/guards/guest.guard';

// Layout
import { AppLayoutComponent } from './layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // públicas / auth
      { path: 'login',    component: LoginComponent,    canActivate: [guestGuard] },
      { path: 'registro', component: RegisterComponent, canActivate: [guestGuard] },
      { path: 'revision', component: ReviewComponent,   canActivate: [reviewGuard] },

      // storefront
      { path: 'home',     component: HomeComponent },
      { path: 'catalogo', component: CatalogComponent },            // <- catálogo
      { path: 'buscar',   redirectTo: 'catalogo', pathMatch: 'full' }, // <- alias útil
      { path: 'carrito',  component: CartComponent },
      { path: 'perfil',   component: ProfileComponent,  canActivate: [authGuard] },

      // admin / módulos
      { path: 'admin',     component: AdminComponent,   canActivate: [adminGuard] },
      { path: 'dashboard', component: DashboardComponent },

      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventory/inventory.module').then(m => m.InventoryModule),
        // canActivate: [adminGuard],
      },
      {
        path: 'publicidad',
        loadChildren: () =>
          import('./features/advertising/advertising.module').then(m => m.AdvertisingModule),
        // canActivate: [adminGuard],
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/users/users.module').then(m => m.UsersModule),
        // canActivate: [adminGuard],
      },

      { path: 'compras', component: PurchaseManagementComponent /*, canActivate: [adminGuard]*/ },
    ],
  },

  // catch-all
  { path: '**', redirectTo: 'home' },
];
