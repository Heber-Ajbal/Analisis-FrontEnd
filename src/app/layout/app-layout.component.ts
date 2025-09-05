import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

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
export class AppLayoutComponent {
  isHandset = false;
  collapsed = false;

  constructor(private bp: BreakpointObserver) {
    this.bp.observe('(max-width: 1024px)').subscribe(r => this.isHandset = r.matches);
  }

  // Menú superior (los habituales)
  items = [
    { label: 'Inicio',   icon: 'home',            path: '/home' },
    { label: 'Buscar',   icon: 'search',          path: '/revision' }, // ajusta si quieres otra ruta
    { label: 'Alertas',  icon: 'notifications',   path: '/admin'   },  // ajusta si quieres otra ruta
  ];

  // Item fijo abajo
  profile = { label: 'Perfil', icon: 'person', path: '/perfil' }; // créala o cámbiala por /login si prefieres

    toggle() { this.collapsed = !this.collapsed; }
}
