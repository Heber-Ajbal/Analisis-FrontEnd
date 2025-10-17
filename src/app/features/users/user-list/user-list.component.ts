import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../models/users/user.model';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'username',
    'email',
    'fullName',
    'provider',
    'timestamps',
    'actions',
  ];

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly query = signal('');

  readonly filteredUsers = computed(() => {
    const search = this.query().trim().toLowerCase();
    if (!search) {
      return this.users();
    }
    return this.users().filter((user) =>
      [user.username, user.email, user.fullName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  });

  get queryValue(): string {
    return this.query();
  }

  set queryValue(value: string) {
    this.onQueryChange(value);
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  async fetchUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const users = await this.usersService.list();
      this.users.set(users);
    } finally {
      this.loading.set(false);
    }
  }

  async openCreateDialog(): Promise<void> {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '520px',
      disableClose: true,
      data: null,
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      this.upsertUser(result);
    }
  }

  async openEditDialog(user: User): Promise<void> {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '520px',
      disableClose: true,
      data: user,
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      this.upsertUser(result);
    }
  }

  private upsertUser(user: User): void {
    const current = this.users();
    const index = current.findIndex((item) => item.id === user.id);
    const updated = [...current];

    if (index >= 0) {
      updated[index] = user;
    } else {
      updated.unshift(user);
    }

    this.users.set(updated);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
  }

  trackById(_: number, user: User): number {
    return user.id;
  }
}
