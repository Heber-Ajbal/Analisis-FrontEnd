import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/users/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  loading = false;
  error: string | null = null;
  user: User | null = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    void this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    const userId = this.authService.currentUserId;
    if (!userId) {
      this.user = null;
      this.error = 'No se encontró información de la sesión. Inicia sesión nuevamente.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      this.user = await this.usersService.findById(userId);
    } catch (err) {
      console.error('Error al cargar el perfil', err);
      this.user = null;
      this.error = 'No fue posible cargar tu perfil. Intenta nuevamente en unos momentos.';
    } finally {
      this.loading = false;
    }
  }

  get displayName(): string {
    if (!this.user) {
      return 'Usuario';
    }
    return this.user.fullName || this.user.username || this.user.email || 'Usuario';
  }

  get displayInitials(): string {
    const name = this.displayName.trim();
    if (!name) {
      return 'U';
    }
    const parts = name.split(/\s+/).slice(0, 2);
    const initials = parts.map((part) => part.charAt(0).toUpperCase()).join('');
    return initials || name.charAt(0).toUpperCase() || 'U';
  }

  get accountStatusLabel(): string {
    if (!this.user) return '';
    if (this.user.blocked) return 'Bloqueado';
    if (this.user.confirmed) return 'Confirmado';
    return 'Pendiente de confirmación';
  }
}
