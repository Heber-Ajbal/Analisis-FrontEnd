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

import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../models/users/user.model';

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
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly displayedColumns = ['username', 'email', 'fullName', 'provider', 'timestamps'];

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

  onQueryChange(value: string): void {
    this.query.set(value);
  }

  trackById(_: number, user: User): number {
    return user.id;
  }
}
