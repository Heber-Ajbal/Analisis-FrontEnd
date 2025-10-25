import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    LayoutModule,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatRippleModule
  ],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {

  collapsed = false;                 // rail (72px) cuando true
  private destroy$ = new Subject<void>();

  private bp = inject(BreakpointObserver);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** true en móviles */
  isHandset$: Observable<boolean> = this.bp
    .observe([Breakpoints.Handset])
    .pipe(
      map(state => state.matches),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

  ngOnInit(): void {
    // Colapsar automáticamente en pantallas pequeñas
    this.bp.observe(['(max-width: 1024px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ matches }) => this.collapsed = matches);
  }

  toggle() { this.collapsed = !this.collapsed; }

  get loggedIn() { return this.auth.isLoggedIn(); }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
  }
}
