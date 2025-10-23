import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecaptchaComponent } from '../../../shared/recaptcha/recaptcha.component';
import { resolveRecaptchaSiteKey } from '../../../shared/recaptcha/site-key-resolver';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterLink,
    RecaptchaComponent
  ],
  templateUrl:'./login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  hide = true;
  loading = false;
  readonly siteKey = resolveRecaptchaSiteKey();

  @ViewChild('captchaRef') captchaRef?: RecaptchaComponent;

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
      pass:  ['', [Validators.required]],
      captcha: ['', [Validators.required]]
    } );
  }

  async submit() {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { email, pass, captcha } = this.form.value as { email: string; pass: string; captcha: string };

    try {
      await this.auth.login(email, pass, captcha); // guarda el JWT
      this.router.navigateByUrl('/dashboard'); // navega a donde quieras
    } catch (e: any) {
      this.snack.open(e?.error?.message ?? e?.message ?? 'Credenciales inválidas', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
      this.form.get('captcha')?.reset();
      this.captchaRef?.reset();
    }
  }
}
