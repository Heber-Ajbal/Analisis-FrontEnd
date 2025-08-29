import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen grid place-items-center p-6"
         style="background:linear-gradient(135deg,var(--mat-sys-surface) 0%, var(--mat-sys-surface-container-high) 100%);">
      <div class="w-full max-w-md rounded-2xl border border-white/10 p-6 md:p-8"
           style="background: var(--mat-sys-surface-container-highest); color: var(--mat-sys-on-surface);">

        <h1 class="text-2xl font-bold mb-1">Inicio de sesión</h1>
        <p class="mb-6" style="color:var(--mat-sys-on-surface-variant);">
          Ingresa con tu cuenta. ¿Nuevo?
          <a routerLink="/registro" style="color:var(--mat-sys-primary)">Crear cuenta</a>
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="grid gap-3">
          <mat-form-field appearance="fill">
            <mat-label>Correo</mat-label>
            <input matInput type="email" formControlName="email" placeholder="nombre@correo.com" />
            <mat-error *ngIf="form.get('email')?.hasError('required')">El correo es obligatorio</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Formato de correo inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Contraseña</mat-label>
            <input matInput [type]="hide ? 'password' : 'text'" formControlName="pass" placeholder="••••••" />
            <button mat-icon-button matSuffix type="button" (click)="hide = !hide" aria-label="Mostrar/ocultar contraseña">
              <mat-icon>{{ hide ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('pass')?.hasError('required')">La contraseña es obligatoria</mat-error>
            <mat-error *ngIf="form.get('pass')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
          </mat-form-field>

          <button mat-flat-button color="primary" class="mt-1" [disabled]="form.invalid || loading">
            <mat-icon>login</mat-icon>&nbsp; Entrar
          </button>
        </form>

        <div class="mt-4 flex items-center gap-2" *ngIf="loading">
          <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
          <span style="color:var(--mat-sys-on-surface-variant);">Validando…</span>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  hide = true;
  loading = false;

  // Declaramos la propiedad y la inicializamos en el constructor
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pass:  ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const { email, pass } = this.form.value as { email: string; pass: string };

    try {
      const status = this.auth.login(email, pass); // mock front
      if (status === 'needs_review') {
        this.router.navigateByUrl('/revision');
      } else {
        this.router.navigateByUrl(this.auth.isAdmin() ? '/admin' : '/home');
      }
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Credenciales inválidas', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }
}
