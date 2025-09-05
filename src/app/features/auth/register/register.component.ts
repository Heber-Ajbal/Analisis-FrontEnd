import { Component,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
   templateUrl:'./register.component.html',
   styleUrls: ['./register.component.scss']
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
