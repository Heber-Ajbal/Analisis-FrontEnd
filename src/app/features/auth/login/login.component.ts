import { Component,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
    RouterLink
  ],
  templateUrl:'./login.component.html',
  styleUrls: ['./login.component.scss']
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
      pass:  ['', [Validators.required]],
    } );
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
