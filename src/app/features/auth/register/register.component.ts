import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
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
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../../environments/environment';


@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule,
    RecaptchaModule
  ],
   templateUrl:'./register.component.html',
   styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  hide1 = true;
  hide2 = true;
  loading = false;
  tabIndex = 0;
  readonly siteKey = environment.recaptchaSiteKey;

  @ViewChild('clienteCaptchaRef') clienteCaptcha?: RecaptchaComponent;
  @ViewChild('empresaCaptchaRef') empresaCaptcha?: RecaptchaComponent;

  clienteForm!: FormGroup;
  empresaForm!: FormGroup;

  constructor(private fb: FormBuilder, private snack: MatSnackBar, private router: Router) {
    this.clienteForm = this.fb.group({
      name:  ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pass:  ['', [Validators.required, Validators.minLength(6)]],
      captcha: ['', Validators.required]
    });

    this.empresaForm = this.fb.group({
      company:   ['', Validators.required],
      rtu:       ['', Validators.required],
      adminName: ['', Validators.required],
      dpi:       ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      pass:      ['', [Validators.required, Validators.minLength(6)]],
      captcha:   ['', Validators.required]
    });
  }

  registrarCliente() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.snack.open('Cliente registrado (front). Continúa con login.', 'OK', { duration: 2200 });
      this.router.navigateByUrl('/login');
      this.clienteForm.reset();
      this.clienteCaptcha?.reset();
    }, 800);
  }

  registrarEmpresa() {
    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.snack.open('Empresa enviada a revisión (front).', 'OK', { duration: 2200 });
      this.router.navigateByUrl('/revision');
      this.empresaForm.reset();
      this.empresaCaptcha?.reset();
    }, 800);
  }
}
