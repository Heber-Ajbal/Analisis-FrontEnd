import { Routes } from '@angular/router';

// Features
import { LoginComponent }    from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ReviewComponent }   from './features/auth/review/review.component';
import { HomeComponent }     from './features/home/home.component';
import { AdminComponent }    from './features/admin/admin.component';

// Guards
import { authGuard }   from './core/guards/auth.guard';
import { adminGuard }  from './core/guards/admin.guard';
import { reviewGuard } from './core/guards/review.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login',    component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

  { path: 'revision', component: ReviewComponent, canActivate: [reviewGuard] },
  { path: 'home',     component: HomeComponent,   canActivate: [authGuard] },
  { path: 'admin',    component: AdminComponent,  canActivate: [adminGuard] },
];
