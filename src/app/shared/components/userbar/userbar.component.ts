import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-userbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex items-center gap-3">
      <!-- Si hay usuario, muéstralo -->
      <ng-container *ngIf="auth.isLoggedIn as u; else guest">
        <button class="btn-ghost" (click)="logout()">Salir</button>
      </ng-container>

      <!-- Si NO hay usuario -->
      <ng-template #guest>
        <span class="text-white/50 text-sm">Invitado</span>
        <a class="btn-ghost" routerLink="/login">Login</a>
      </ng-template>
    </div>
  `
})
export class UserbarComponent {
  constructor(public auth: AuthService) {}
  logout() { this.auth.logout(); location.href = '/login'; }
}
