import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../models/users/user.model';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss'],
})
export class UserFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly usersService = inject(UsersService);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly data = inject<User | null>(MAT_DIALOG_DATA, { optional: true }) ?? null;

  readonly loading = signal(false);

  readonly form = this.fb.group({
    id: [this.data?.id ?? null],
    username: [this.data?.username ?? '', [Validators.required, Validators.maxLength(120)]],
    email: [
      this.data?.email ?? '',
      [Validators.required, Validators.email, Validators.maxLength(255)],
    ],
    password: ['', this.data ? [] : [Validators.required, Validators.minLength(6)]],
    firstName: [this.data?.firstName ?? ''],
    lastName: [this.data?.lastName ?? ''],
    role: [this.data?.roleId != null ? String(this.data.roleId) : ''],
    confirmed: [this.data?.confirmed ?? true],
    blocked: [this.data?.blocked ?? false],
  });

  get isEditMode(): boolean {
    return !!this.form.value.id;
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    const { id, password, username, email, firstName, lastName, role, confirmed, blocked } =
      this.form.value;

    const payload = {
      username: username?.trim() ?? '',
      email: email?.trim() ?? '',
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      role: role ? role : null,
      confirmed: !!confirmed,
      blocked: !!blocked,
    } as const;

    try {
      const user = id
        ? await this.usersService.update(id, {
            ...payload,
            password: password ? password : undefined,
          })
        : await this.usersService.create({
            ...payload,
            password: password ?? '',
            provider: 'local',
          });

      this.snackBar.open('Usuario guardado correctamente', 'Cerrar', {
        duration: 3000,
      });
      this.dialogRef.close(user);
    } catch (error: any) {
      const message = error?.error?.message ?? 'Error al guardar el usuario';
      this.snackBar.open(message, 'Cerrar', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
