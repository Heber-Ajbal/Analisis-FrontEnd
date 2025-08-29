import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
  <div class="min-h-screen grid place-items-center p-6"
       style="background:linear-gradient(135deg,var(--mat-sys-surface) 0%, var(--mat-sys-surface-container-high) 100%);">
    <div class="w-full max-w-3xl rounded-2xl border border-white/10 p-6 md:p-8"
         style="background: var(--mat-sys-surface-container-highest); color: var(--mat-sys-on-surface);">

      <h1 class="text-2xl font-bold mb-1">Crear cuenta</h1>
      <p class="mb-4" style="color:var(--mat-sys-on-surface-variant);">
        Elige el tipo de usuario y completa tus datos.
      </p>

      <mat-tab-group [(selectedIndex)]="tabIndex">
        <!-- CLIENTE -->
        <mat-tab label="Cliente">
          <form class="grid gap-3 mt-4" [formGroup]="clienteForm" (ngSubmit)="registrarCliente()">
            <div class="grid md:grid-cols-2 gap-3">
              <mat-form-field appearance="fill">
                <mat-label>Nombres</mat-label>
                <input matInput formControlName="name" placeholder="Juan Pérez">
                <mat-error *ngIf="clienteForm.get('name')?.hasError('required')">Campo obligatorio</mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="phone" placeholder="+502 5555 5555">
                <mat-error *ngIf="clienteForm.get('phone')?.hasError('required')">Campo obligatorio</mat-error>
              </mat-form-field>
            </div>

            <div class="grid md:grid-cols-2 gap-3">
              <mat-form-field appearance="fill">
                <mat-label>Correo</mat-label>
                <input matInput type="email" formControlName="email" placeholder="cliente@correo.com">
                <mat-error *ngIf="clienteForm.get('email')?.hasError('required')">Campo obligatorio</mat-error>
                <mat-error *ngIf="clienteForm.get('email')?.hasError('email')">Correo inválido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Contraseña</mat-label>
                <input matInput [type]="hide1 ? 'password' : 'text'" formControlName="pass" placeholder="••••••">
                <button mat-icon-button matSuffix type="button" (click)="hide1 = !hide1">
                  <mat-icon>{{ hide1 ? 'visibility' : 'visibility_off' }}</mat-icon>
                </button>
                <mat-error *ngIf="clienteForm.get('pass')?.hasError('required')">Campo obligatorio</mat-error>
                <mat-error *ngIf="clienteForm.get('pass')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
              </mat-form-field>
            </div>

            <div class="flex gap-2">
              <button mat-flat-button color="primary" [disabled]="clienteForm.invalid || loading">
                Crear cuenta
              </button>
              <a class="mat-button" routerLink="/login">Ya tengo cuenta</a>
            </div>
          </form>
        </mat-tab>

        <!-- EMPRESA -->
        <mat-tab label="Empresa">
          <form class="grid gap-3 mt-4" [formGroup]="empresaForm" (ngSubmit)="registrarEmpresa()">
            <div class="grid md:grid-cols-2 gap-3">
              <mat-form-field appearance="fill">
                <mat-label>Empresa</mat-label>
                <input matInput formControlName="company" placeholder="Mi Empresa S.A.">
                <mat-error *ngIf="empresaForm.get('company')?.hasError('required')">Campo obligatorio</mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>NIT / RTU</mat-label>
                <input matInput formControlName="rtu" placeholder="XXXXXXXXX">
                <mat-error *ngIf="empresaForm.get('rtu')?.hasError('required')">Campo obligatorio</mat-error>
              </mat-form-field>
            </div>

            <div class="grid md:grid-cols-2 gap-3">
              <mat-form-field appearance="fill">
                <mat-label>Administrador – Nombre</mat-label>
                <input matInput formControlName="adminName" placeholder="Ana Gómez">
                <mat-error *ngIf="empresaForm.get('adminName')?.hasError('required')">Campo obligatorio</mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Administrador – DPI</mat-label>
                <input matInput formControlName="dpi" placeholder="1234567890101">
                <mat-error *ngIf="empresaForm.get('dpi')?.hasError('required')">Campo obligatorio</mat-error>
              </mat-form-field>
            </div>

            <div class="grid md:grid-cols-2 gap-3">
              <mat-form-field appearance="fill">
                <mat-label>Correo</mat-label>
                <input matInput type="email" formControlName="email" placeholder="admin@empresa.com">
                <mat-error *ngIf="empresaForm.get('email')?.hasError('required')">Campo obligatorio</mat-error>
                <mat-error *ngIf="empresaForm.get('email')?.hasError('email')">Correo inválido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Contraseña</mat-label>
                <input matInput [type]="hide2 ? 'password' : 'text'" formControlName="pass" placeholder="••••••">
                <button mat-icon-button matSuffix type="button" (click)="hide2 = !hide2">
                  <mat-icon>{{ hide2 ? 'visibility' : 'visibility_off' }}</mat-icon>
                </button>
                <mat-error *ngIf="empresaForm.get('pass')?.hasError('required')">Campo obligatorio</mat-error>
                <mat-error *ngIf="empresaForm.get('pass')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
              </mat-form-field>
            </div>

            <div class="text-sm" style="color:var(--mat-sys-on-surface-variant);">
              Al enviar, la cuenta de empresa pasa a <b>revisión manual</b>.
            </div>

            <div class="flex gap-2">
              <button mat-stroked-button color="primary" [disabled]="empresaForm.invalid || loading">
                Enviar a revisión
              </button>
              <a class="mat-button" routerLink="/login">Cancelar</a>
            </div>
          </form>
        </mat-tab>
      </mat-tab-group>

      <div class="mt-4 flex items-center gap-2" *ngIf="loading">
        <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
        <span style="color:var(--mat-sys-on-surface-variant);">Procesando…</span>
      </div>
    </div>
  </div>
  `
})
export class RegisterComponent {
  hide1 = true;
  hide2 = true;
  loading = false;
  tabIndex = 0;

  clienteForm!: FormGroup;
  empresaForm!: FormGroup;

  constructor(private fb: FormBuilder, private snack: MatSnackBar, private router: Router) {
    this.clienteForm = this.fb.group({
      name:  ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pass:  ['', [Validators.required, Validators.minLength(6)]],
    });

    this.empresaForm = this.fb.group({
      company:   ['', Validators.required],
      rtu:       ['', Validators.required],
      adminName: ['', Validators.required],
      dpi:       ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      pass:      ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  registrarCliente() {
    if (this.clienteForm.invalid) return;
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.snack.open('Cliente registrado (front). Continúa con login.', 'OK', { duration: 2200 });
      this.router.navigateByUrl('/login');
    }, 800);
  }

  registrarEmpresa() {
    if (this.empresaForm.invalid) return;
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.snack.open('Empresa enviada a revisión (front).', 'OK', { duration: 2200 });
      this.router.navigateByUrl('/revision');
    }, 800);
  }
}
